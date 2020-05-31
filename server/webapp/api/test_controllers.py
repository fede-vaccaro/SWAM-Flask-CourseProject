import json

from . import controllers as ctl, status
from .models import User, Item
from .test_services import FlaskAppTest
from .. import db


class APITest(FlaskAppTest):
    encoder = json.encoder.JSONEncoder()

    @staticmethod
    def get_auth_dict(token):
        return {'Authorization': 'Bearer {}'.format(token)}

    @staticmethod
    def get_message(response):
        return json.loads(response.data)['message']


class TestUsersAPI(APITest):

    def test_UsersList_post(self):
        user = 'user'
        password = 'password'

        response = self.post_user_and_get_response(password, user)

        json_response = json.loads(response.data)

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(json_response['username'], user)

    def test_UsersList_post_but_username_already_exists(self):
        username = 'test'
        super()._add_user(name=username)

        password = 'password'

        response = self.post_user_and_get_response(password, username)

        json_response = json.loads(response.data)

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(json_response['message'], 'Username {} already existent.'.format(username))

    def test_UsersList_post_db_exception_is_handled(self):
        username = 'test'
        password = 'password'

        user = User(username=username)
        user.set_password(password)

        db.session.add(user)

        response = self.post_user_and_get_response(password, username)

        json_response = json.loads(response.data)
        self.assertEqual(response.status_code, status.HTTP_500_INTERNAL_SERVER_ERROR)

    def post_user_and_get_response(self, password, username):
        data = {'username': username,
                'password': password}
        encoded = self.encoder.encode(data)
        response = self.client.post('api' + ctl.UserListAPI.resource_path, headers=self.content_type, data=encoded)
        return response

    def test_UsersList_get_all(self):
        usernames = ['user1', 'user2']
        for name in usernames:
            super()._add_user(name=name)

        requesting_user_name = 'test'
        token, _ = super()._get_token_and_add_user(username=requesting_user_name)
        usernames += [requesting_user_name]

        auth_header = {'Authorization': 'Bearer {}'.format(token)}

        response = self.client.get('api' + ctl.UserListAPI.resource_path,
                                   headers=dict(self.content_type, **auth_header))

        json_response = json.loads(response.data)

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        retrieved_usernames = set([user['username'] for user in json_response])
        self.assertSetEqual(retrieved_usernames, set(usernames))


class TestTicketsAPI(APITest):

    def setUp(self):
        super().setUp()
        participant_name = 'participant'
        owner_name = 'owner'

        self.token, self.buyer = self._get_token_and_add_user(owner_name)

        self.participant = super()._add_user(participant_name)

    def test_post_ticket(self):
        ticket, items, accountings = super()._generate_test_ticket(participant=self.participant, buyer=self.buyer)
        items_dict_list = {'items': [item.to_dict() for item in items]}
        encoded_items_list = self.encoder.encode(items_dict_list)
        auth_header = super().get_auth_dict(self.token)

        headers = dict(self.content_type, **auth_header)

        response = self.client.post('api' + ctl.TicketsAPI.resource_path, headers=headers,
                                    data=encoded_items_list)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_post_ticket_whene_there_are_no_items(self):
        items_dict_list = []
        encoded_items_list = self.encoder.encode(items_dict_list)
        auth_header = super().get_auth_dict(self.token)

        headers = dict(self.content_type, **auth_header)

        response = self.client.post('api' + ctl.TicketsAPI.resource_path, headers=headers,
                                    data=encoded_items_list)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_post_ticket_when_one_item_has_a_missing_field(self):
        _, items, _ = super()._generate_test_ticket(participant=self.participant, buyer=self.buyer)

        no_participant_item = Item(name='new_item', quantity=1, price=5.0)
        items += [no_participant_item]
        items_dict_list = {'items': [item.to_dict() for item in items]}
        encoded_items_list = self.encoder.encode(items_dict_list)

        auth_header = super().get_auth_dict(self.token)

        headers = dict(self.content_type, **auth_header)

        response = self.client.post('api' + ctl.TicketsAPI.resource_path, headers=headers,
                                    data=encoded_items_list)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_get_logged_user_tickets(self):
        ticket1, _, _ = super()._generate_test_ticket(participant=self.participant, buyer=self.buyer)
        ticket2, _, _ = super()._generate_test_ticket(participant=self.participant, buyer=self.buyer)
        ticket3, _, _ = super()._generate_test_ticket(participant=self.buyer, buyer=self.participant)

        db.session.add(ticket1)
        db.session.add(ticket2)
        db.session.add(ticket3)

        db.session.commit()

        response = self.client.get('api' + ctl.TicketsAPI.resource_path,
                                   headers=dict(self.content_type, **self.get_auth_dict(self.token)))

        json_response = json.loads(response.data)
        retrieved_ticket_ids = set([ticket['id'] for ticket in json_response])

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertSetEqual(retrieved_ticket_ids, {ticket1.id, ticket2.id})

    def test_get_ticket(self):
        ticket, _, _ = self._generate_test_ticket(self.buyer, self.participant)
        db.session.add(ticket)
        db.session.commit()

        response = self.client.get('api' + '/tickets/' + str(ticket.id),
                                   headers=dict(self.content_type, **self.get_auth_dict(self.token)))
        json_response = json.loads(response.data)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(json_response['id'], ticket.id)

    def test_ticket_not_found(self):
        missing_ticket_id = 1  # random number, the db is empty!

        response = self.client.get('api' + '/tickets/' + str(missing_ticket_id),
                                   headers=dict(self.content_type, **self.get_auth_dict(self.token)))
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_get_ticket_return_unauthorized_when_requesting_user_is_not_a_participant(self):
        # the user who is requesting (identified by the token), is unauthorized, since is not the buyer or a participant

        other_buyer = super()._add_user('other_buyer')

        ticket, _, _ = self._generate_test_ticket(other_buyer, self.participant)
        db.session.add(ticket)
        db.session.commit()

        response = self.client.get('api' + '/tickets/' + str(ticket.id),
                                   headers=dict(self.content_type, **self.get_auth_dict(self.token)))

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_patch_ticket(self):
        ticket, _, _ = self._generate_test_ticket(self.buyer, self.participant)
        db.session.add(ticket)
        db.session.commit()

        new_item_1 = Item(name='new_item_1', quantity=2, price=3.0)
        new_item_1.participants.append(self.participant)

        new_item_2 = Item(name='new_item_2', quantity=2, price=3.0)
        new_item_2.participants.append(self.participant)

        encoded_items_list = self.encoder.encode({'items': [new_item_1.to_dict(), new_item_2.to_dict()]})

        auth_header = super().get_auth_dict(self.token)

        headers = dict(self.content_type, **auth_header)

        response = self.client.patch('api' + '/tickets/' + str(ticket.id), headers=headers,
                                    data=encoded_items_list)

        json_response = json.loads(response.data)

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(json_response['id'], ticket.id)

    def test_delete_ticket(self):
        ticket, _, _ = self._generate_test_ticket(self.buyer, self.participant)
        db.session.add(ticket)
        db.session.commit()
        auth_header = super().get_auth_dict(self.token)

        headers = dict(self.content_type, **auth_header)

        response = self.client.delete('api' + '/tickets/' + str(ticket.id), headers=headers)

        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_delete_ticket_when_unauthorized(self):
        other_buyer = super()._add_user('other_buyer')

        ticket, _, _ = self._generate_test_ticket(other_buyer, self.participant)
        db.session.add(ticket)
        db.session.commit()
        auth_header = super().get_auth_dict(self.token)

        headers = dict(self.content_type, **auth_header)

        response = self.client.delete('api' + '/tickets/' + str(ticket.id), headers=headers)

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_delete_ticket_when_not_found(self):
        ticket_id = 1 # fake ticket id, as before

        auth_header = super().get_auth_dict(self.token)

        headers = dict(self.content_type, **auth_header)

        response = self.client.delete('api' + '/tickets/' + str(ticket_id), headers=headers)

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

