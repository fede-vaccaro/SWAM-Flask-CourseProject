import unittest
from unittest import mock

from injector import inject

from .. import create_app, db, bcrypt
from ..api.models import User, Ticket, Item, Accounting
from ..api.services import UserServiceBase, TicketService
from . import controllers as ctl
import json

class FlaskAppTest(unittest.TestCase):
    content_type = {'Content-Type': 'application/json'}

    def _get_token_and_add_user(self, username='test', password='pw'):
        user = self._add_user(username, password)

        response = self.client.post('api' + ctl.AuthenticationAPI.resource_path, headers=self.content_type,
                                    data=self.encoder.encode({'username': username, 'password': password}))

        json_response = json.loads(response.data)
        return json_response['token'], user

    def setUp(self):
        app = create_app('config.TestConfig')
        self.client = app.test_client()
        db.app = app

        db.drop_all()
        db.create_all()

    def tearDown(self):
        db.session.remove()

    @staticmethod
    def _add_user(name='user', password='pw'):
        user = User(username=name)
        user.set_password(password)

        db.session.add(user)
        db.session.commit()

        return user

    @staticmethod
    def _generate_test_ticket(buyer: User, participant: User):
        ticket = Ticket()

        item1 = Item(name='item1', quantity=1, price=5.0)
        item1.participants.append(buyer)
        item1.participants.append(participant)

        item2 = Item(name='item2', quantity=2, price=2.0)
        item2.participants.append(participant)

        item3 = Item(name='item3', quantity=3, price=3.0)
        item3.participants.append(buyer)

        # total price = 5.0*1/2 + 2.0*2/1 = 2.5 + 4.0 = 6.5
        # the last item is just for the buyer!
        accounting = Accounting(userFrom=buyer, userTo=participant, totalPrice=6.5, paidPrice=0.0)

        ticket.items.append(item1)
        ticket.items.append(item2)
        ticket.items.append(item3)

        ticket.accountings.append(accounting)
        ticket.buyer = buyer

        return ticket, [item1, item2, item3], [accounting]


class TestTicketService(FlaskAppTest):
    ticket_service = TicketService(user_service=UserServiceBase())

    def test_generate_tickets_and_accountings(self):
        user_buyer = self._add_user(name='buyer')
        user_participant = self._add_user(name='participant')

        new_ticket, item_list, accounting_list = self._generate_test_ticket(buyer=user_buyer,
                                                                            participant=user_participant)
        with mock.patch.object(self.ticket_service.user_service, 'get_logged_user', return_value=user_buyer):
            generated_item_list, generated_accounting_list = self.ticket_service._generate_items_and_accountings(
                [item.to_dict() for item in item_list])

        self.assertListEqual(generated_item_list, item_list)

        self.assertEqual(generated_accounting_list.__len__(), 1)
        self.assertEqual(generated_accounting_list[0].totalPrice, accounting_list[0].totalPrice)
        self.assertEqual(generated_accounting_list[0].userTo, accounting_list[0].userTo)
        self.assertEqual(generated_accounting_list[0].userFrom, accounting_list[0].userFrom)

    def test_add_ticket(self):
        user_buyer = self._add_user(name='buyer')
        user_participant = self._add_user(name='participant')
        ticket, item_list, accounting_list = self._generate_test_ticket(buyer=user_buyer,
                                                                        participant=user_participant)
        with mock.patch.object(self.ticket_service.user_service, 'get_logged_user', return_value=user_buyer):
            added_ticket_id = self.ticket_service.add_ticket([item.to_dict() for item in item_list]).id

        # retrieve ticket from db
        retrieved_ticket = Ticket.query.get(added_ticket_id)
        self.assertListEqual(ticket.items.all(), retrieved_ticket.items.all())
        self.assertListEqual(ticket.accountings, retrieved_ticket.accountings)

    def test_delete_ticket(self):
        user_buyer = self._add_user(name='buyer')
        user_participant = self._add_user(name='participant')

        ticket, item_list, accounting_list = self._generate_test_ticket(buyer=user_buyer,
                                                                        participant=user_participant)
        db.session.add(ticket)
        db.session.commit()

        self.ticket_service.delete_ticket(ticket)

        retrieved = Ticket.query.get(ticket.id)
        self.assertIsNone(retrieved)

    def test_update_ticket_when_nothing_is_paid(self):
        user_buyer = self._add_user(name='buyer')
        user_participant = self._add_user(name='participant')

        ticket, item_list, accounting_list = self._generate_test_ticket(buyer=user_buyer,
                                                                        participant=user_participant)
        db.session.add(ticket)
        db.session.commit()

        new_item1 = Item(**{'name': 'new_item1',
                            'price': 10.0,
                            'quantity': 1,
                            })
        new_item1.add_participants(user_buyer, user_participant)

        new_item2 = Item(**{'name': 'new_item1',
                            'price': 2.0,
                            'quantity': 2,
                            })
        new_item2.add_participants(user_buyer, user_participant)

        with mock.patch.object(self.ticket_service.user_service, 'get_logged_user', return_value=user_buyer):
            updated_ticket = self.ticket_service.update_ticket(ticket, [new_item1.to_dict(), new_item2.to_dict()])

        self.assertListEqual(updated_ticket.items.all(), [new_item1, new_item2])

        self.assertEqual(updated_ticket.accountings.__len__(), 1)
        self.assertEqual(updated_ticket.accountings[0].paidPrice, 0.0)
        self.assertEqual(updated_ticket.accountings[0].totalPrice, 10.0 * 1 / 2.0 + 2.0 * 2 / 2)
        self.assertEqual(updated_ticket.accountings[0].userFrom, user_buyer)
        self.assertEqual(updated_ticket.accountings[0].userTo, user_participant)

    def test_update_ticket_when_something_is_paid_and_there_is_a_refund(self):
        user_buyer = self._add_user(name='buyer')
        user_participant = self._add_user(name='participant')

        ticket, item_list, accounting_list = self._generate_test_ticket(buyer=user_buyer,
                                                                        participant=user_participant)

        accounting = ticket.accountings[0]

        # assuming something has been paid
        accounting.paidPrice = 3.0

        db.session.add(ticket)
        db.session.commit()

        # user buyer now is modifying the item with his own ownership
        new_item1 = Item(**{'name': 'item1',
                            'price': 10.0,
                            'quantity': 1,
                            })
        new_item1.add_participants(user_buyer)

        with mock.patch.object(self.ticket_service.user_service, 'get_logged_user', return_value=user_buyer):
            updated_ticket = self.ticket_service.update_ticket(ticket, [new_item1.to_dict()])

        self.assertEqual(updated_ticket.accountings.__len__(), 0)

        # search for the refund receipt
        refund_accounting = Accounting.query.filter_by(user_from=user_participant.id).first()
        self.assertIsNotNone(refund_accounting)
        self.assertEqual(refund_accounting.paidPrice, 0.0)
        self.assertEqual(refund_accounting.totalPrice, 3.0)
        self.assertEqual(refund_accounting.user_to, user_buyer.id)

    def test_get_tickets_of_logged_user(self):
        user_1 = self._add_user(name='buyer')
        user_2 = self._add_user(name='participant')

        ticket, _, _ = self._generate_test_ticket(buyer=user_1,
                                                  participant=user_2)
        ticket_2, _, _ = self._generate_test_ticket(buyer=user_2,
                                                    participant=user_1)

        db.session.add(ticket)
        db.session.add(ticket_2)
        db.session.commit()

        with mock.patch.object(self.ticket_service.user_service, 'get_logged_user', return_value=user_1):
            logged_user_tickets = self.ticket_service.get_logged_user_tickets()

        self.assertListEqual(logged_user_tickets, [ticket])

class TestUserService(FlaskAppTest):
    password = 'pw'

    user_service = UserServiceBase()

    def test_add_user(self):
        name = 'user'

        new_user = self.user_service.add_user(name, self.password)

        retrieved_user = User.query.get(new_user.id)

        self.assertIsNotNone(retrieved_user)
        self.assertEqual(retrieved_user.username, name)
        self.assertTrue(bcrypt.check_password_hash(retrieved_user.password, self.password))

    def test_authenticate(self):
        user = self._add_user(password=self.password)

        authenticated_user = self.user_service.authenticate(user.username, self.password)
        self.assertEqual(user, authenticated_user)

    def test_authenticate_user_not_found(self):
        self._add_user()

        authenticated_user = self.user_service.authenticate('not_existent_user', 'pw')
        self.assertIsNone(authenticated_user)

    def test_authenticate_wrong_password(self):
        user = self._add_user()

        authenticated_user = self.user_service.authenticate(user.username, "mistakes")
        self.assertIsNone(authenticated_user)

    def test_remove_user(self):
        user = self._add_user(password=self.password)
        user_2 = self._add_user(name='user2', password='pw')

        # user has a ticket
        ticket_user = Ticket()
        ticket_user.buyer = user

        db.session.add(ticket_user)

        # he participate to another ticket
        ticket_user2 = Ticket()
        ticket_user2.buyer = user_2


        item = Item(price=1.0, quantity=1, name='testItem', ticket=ticket_user2)
        item.add_participants(user, user_2)

        accounting = Accounting(userFrom=user_2, userTo=user, totalPrice=0.5, ticket=ticket_user2)

        db.session.add(ticket_user2)
        db.session.commit()

        user_id = user.id
        user2_id = user_2.id
        ticket_user_id = ticket_user.id
        ticket_user2_id = ticket_user2.id
        accounting_id = accounting.id

        db.session.expunge_all()


        def get_logged_user():
            return user

        # fast mocking
        db.session.add(user)
        self.user_service.get_logged_user = get_logged_user

        outcome = self.user_service.delete()

        self.assertIsNone(User.query.get(user_id))
        self.assertIsNone(Ticket.query.get(ticket_user_id))
        self.assertIsNotNone(Ticket.query.get(ticket_user2_id))
        self.assertIsNotNone(Ticket.query.get(user2_id))
        self.assertIsNone(Accounting.query.get(accounting_id))
        self.assertTrue(outcome)

        # refresh item
        db.session.add(item)

        self.assertNotIn(user, item.participants)



if __name__ == '__main__':
    unittest.main()
