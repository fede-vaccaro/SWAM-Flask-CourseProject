import unittest
from unittest import mock

from webapp import create_app, db, bcrypt
from webapp.api.models import User, Ticket, Item, Accounting
from webapp.api.services import UserService, TicketService
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
        db.create_all()

    def tearDown(self):
        db.session.remove()
        db.drop_all()

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
        accounting = Accounting(user_from=buyer.id, user_to=participant.id, totalPrice=6.5)

        ticket.items.append(item1)
        ticket.items.append(item2)
        ticket.items.append(item3)

        ticket.accountings.append(accounting)

        return ticket, [item1, item2, item3], [accounting]


class TestTicketService(FlaskAppTest):

    def test_generate_tickets_and_accountings(self):
        user_buyer = self._add_user(name='buyer')
        user_participant = self._add_user(name='participant')

        new_ticket, item_list, accounting_list = self._generate_test_ticket(buyer=user_buyer,
                                                                            participant=user_participant)
        with mock.patch.object(UserService, 'get_logged_user', return_value=user_buyer):
            generated_item_list, generated_accounting_list = TicketService._generate_items_and_accountings(
                [item.to_dict() for item in item_list])

        self.assertListEqual(generated_item_list, item_list)

        self.assertEqual(generated_accounting_list.__len__(), 1)
        self.assertEqual(generated_accounting_list[0].totalPrice, accounting_list[0].totalPrice)
        self.assertEqual(generated_accounting_list[0].user_to, accounting_list[0].user_to)
        self.assertEqual(generated_accounting_list[0].user_from, accounting_list[0].user_from)

    def test_add_ticket(self):
        user_buyer = self._add_user(name='buyer')
        user_participant = self._add_user(name='participant')
        ticket, item_list, accounting_list = self._generate_test_ticket(buyer=user_buyer,
                                                                        participant=user_participant)
        with mock.patch.object(UserService, 'get_logged_user', return_value=user_buyer):
            added_ticket_id = TicketService.add_ticket([item.to_dict() for item in item_list]).id

        # retrieve ticket from db
        retrieved_ticket = Ticket.query.get(added_ticket_id)
        self.assertListEqual(ticket.items.all(), retrieved_ticket.items.all())
        self.assertListEqual(ticket.accountings.all(), retrieved_ticket.accountings.all())

    def test_delete_ticket(self):
        user_buyer = self._add_user(name='buyer')
        user_participant = self._add_user(name='participant')

        ticket, item_list, accounting_list = self._generate_test_ticket(buyer=user_buyer,
                                                                        participant=user_participant)
        db.session.add(ticket)
        db.session.commit()

        TicketService.delete_ticket(ticket)

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

        with mock.patch.object(UserService, 'get_logged_user', return_value=user_buyer):
            updated_ticket = TicketService.update_ticket(ticket, [new_item1.to_dict(), new_item2.to_dict()])

        self.assertListEqual(updated_ticket.items.all(), [new_item1, new_item2])

        self.assertEqual(updated_ticket.accountings.all().__len__(), 1)
        self.assertEqual(updated_ticket.accountings.all()[0].paidPrice, 0.0)
        self.assertEqual(updated_ticket.accountings.all()[0].totalPrice, 10.0 * 1 / 2.0 + 2.0 * 2 / 2)
        self.assertEqual(updated_ticket.accountings.all()[0].user_from, user_buyer.id)
        self.assertEqual(updated_ticket.accountings.all()[0].user_to, user_participant.id)

    def test_update_ticket_when_something_is_paid_and_there_is_a_refund(self):
        user_buyer = self._add_user(name='buyer')
        user_participant = self._add_user(name='participant')

        ticket, item_list, accounting_list = self._generate_test_ticket(buyer=user_buyer,
                                                                        participant=user_participant)

        accounting = ticket.accountings.all()[0]

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

        with mock.patch.object(UserService, 'get_logged_user', return_value=user_buyer):
            updated_ticket = TicketService.update_ticket(ticket, [new_item1.to_dict()])

        self.assertEqual(updated_ticket.accountings.all().__len__(), 0)

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

        with mock.patch.object(UserService, 'get_logged_user', return_value=user_1):
            logged_user_tickets = TicketService.get_logged_user_tickets()

        self.assertListEqual(logged_user_tickets, [ticket])

class TestUserService(FlaskAppTest):
    password = 'pw'

    def test_add_user(self):
        name = 'user'

        new_user = UserService.add_user(name, self.password)

        retrieved_user = User.query.get(new_user.id)

        self.assertIsNotNone(retrieved_user)
        self.assertEqual(retrieved_user.username, name)
        self.assertTrue(bcrypt.check_password_hash(retrieved_user.password, self.password))

    def test_authenticate(self):
        user = self._add_user(password=self.password)

        authenticated_user = UserService.authenticate(user.username, self.password)
        self.assertEqual(user, authenticated_user)

    def test_authenticate_user_not_found(self):
        self._add_user()

        authenticated_user = UserService.authenticate('not_existent_user', 'pw')
        self.assertIsNone(authenticated_user)

    def test_authenticate_wrong_password(self):
        user = self._add_user()

        authenticated_user = UserService.authenticate(user.username, "mistakes")
        self.assertIsNone(authenticated_user)


if __name__ == '__main__':
    unittest.main()
