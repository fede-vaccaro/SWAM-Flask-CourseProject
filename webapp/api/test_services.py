import unittest
from unittest import mock

from webapp import create_app, db, bcrypt
from webapp.api.models import User, Ticket, Item, Accounting
from webapp.api.services import UserService, TicketService


class FlaskAppTest(unittest.TestCase):

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

        accounting = Accounting(user_from=buyer.id, user_to=participant.id, totalPrice=
        item1.price / 2.0 * item1.quantity +
        item2.price * item2.quantity
                                )

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
