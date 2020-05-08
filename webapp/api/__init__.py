from flask_restful import Api

from .controllers import *

rest_api = Api()


def create_module(app):
    rest_api.add_resource(UserListAPI, '/api/user')
    rest_api.add_resource(UserAPI, '/api/user/<int:id>')
    rest_api.init_app(app)
