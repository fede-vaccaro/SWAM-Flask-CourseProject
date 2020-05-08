from flask_restful import Resource, fields, marshal_with

from . import status
from .models import User

user_fields = {
    User.id.key: fields.Integer(),
    User.email.key: fields.String(),
}


class UserListAPI(Resource):
    @marshal_with(user_fields)
    def get(self):
        return User.query.all(), status.HTTP_200_OK


class UserAPI(Resource):
    @marshal_with(user_fields)
    def get(self, id):
        return User.query.get(id), status.HTTP_200_OK
