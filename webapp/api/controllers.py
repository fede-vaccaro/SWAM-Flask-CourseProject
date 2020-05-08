from flask_restful import Resource, fields, marshal_with, reqparse
from sqlalchemy.exc import SQLAlchemyError

from . import status
from .models import User
from .. import db

user_fields = {
    User.id.key: fields.Integer(),
    User.email.key: fields.String(),
    'uri': fields.Url(endpoint='api.userapi', absolute=True)
}


class UserListAPI(Resource):
    @marshal_with(user_fields)
    def get(self):
        return User.query.all(), status.HTTP_200_OK

    @marshal_with(user_fields)
    def post(self):
        parser = reqparse.RequestParser()
        parser.add_argument(User.email.key, type=str, required=True, help='You have to include the email!')
        parser.add_argument(User.password.key, type=str, required=True, help='You have to include the password!')

        args = parser.parse_args()

        email = args['email']
        password = args['password']

        new_user = User(email=email, password=password)

        try:
            db.session.add(new_user)
            db.session.commit()
        except SQLAlchemyError as error:
            db.session.rollback()
            print(str(error.orig) + " for parameters" + str(error.params))

        return new_user, status.HTTP_200_OK


class UserAPI(Resource):
    @marshal_with(user_fields)
    def get(self, id):
        return User.query.get(id), status.HTTP_200_OK
