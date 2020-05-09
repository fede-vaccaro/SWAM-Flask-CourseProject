from flask import jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from flask_restful import Resource, fields, marshal_with, reqparse
from sqlalchemy.exc import IntegrityError
from werkzeug import exceptions as exc

from . import status
from .models import User, Item
from .services import UserService, TicketService
from .. import db

user_fields = {
    User.id.key: fields.Integer(),
    User.username.key: fields.String(),
    'uri': fields.Url(endpoint='api.userapi', absolute=True)
}


def noAuth():
    raise exc.BadRequest('Missing authentication header.')


class UserListAPI(Resource):
    resource_path = '/users/'

    @jwt_required
    @marshal_with(user_fields)
    def get(self):
        return User.query.all(), status.HTTP_200_OK

    @marshal_with(user_fields)
    def post(self):
        parser = reqparse.RequestParser()
        parser.add_argument(User.username.key, type=str, required=True, help='You have to include the username!')
        parser.add_argument(User.password.key, type=str, required=True, help='You have to include the password!')

        args = parser.parse_args()

        username = args[User.username.key]
        password = args[User.password.key]

        new_user = User(username=username)
        new_user.set_password(password)

        try:
            db.session.add(new_user)
            db.session.commit()
        except IntegrityError as error:
            db.session.rollback()

            if User.query.filter_by(username=username).first() is not None:
                raise exc.BadRequest('Username {} already existent.'.format(username))

            error = str(error.orig) + " for parameters" + str(error.params)
            print("An error occurred with the DB.", error)
            raise exc.InternalServerError(str(error.orig))

        return new_user, status.HTTP_200_OK


class AuthenticationAPI(Resource):
    resource_path = '/auth'

    def post(self):
        parser = reqparse.RequestParser()
        parser.add_argument(User.username.key, type=str, required=True, help='Username missing')
        parser.add_argument(User.password.key, type=str, required=True, help='Password missing')

        args = parser.parse_args()

        username = args[User.username.key]
        password = args[User.password.key]

        user = UserService.authenticate(username, password)
        if user:
            access_token = create_access_token(identity=user.id)
            response = jsonify({'token': access_token, 'user': user.id})
            response.status_code = status.HTTP_200_OK
            return response
        else:
            raise exc.BadRequest('Wrong email or password.')


class UserAPI(Resource):
    resource_path = '/users/<int:id>'

    def get(self):
        pass

item_fields = {
    'name':fields.String(),
}

def print_item(item):
    for key in item.keys():
        print('k: {}, v: {}'.format(key, item[key]))

class TicketAPI(Resource):
    resource_path = '/tickets/'

    @jwt_required
    def post(self):
        parser = reqparse.RequestParser()
        parser.add_argument('items', type=dict, action='append', required=True, help="Can't insert empty receipt!")

        args = parser.parse_args()

        items = args['items']

        TicketService.save_ticket(items)



