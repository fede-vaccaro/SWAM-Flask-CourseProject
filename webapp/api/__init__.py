from flask_jwt_extended import JWTManager
from flask_restful import Api
from flask import Blueprint

from .controllers import *

blueprint_api = Blueprint(
    'api',
    __name__,
    url_prefix='/api'
)
rest_api = Api(blueprint_api)
jwt = JWTManager()

def create_module(app):
    app.config['PROPAGATE_EXCEPTIONS'] = True

    app.register_blueprint(blueprint_api)
    rest_api.init_app(app)
    jwt.init_app(app)

    rest_api.add_resource(AuthenticationAPI, AuthenticationAPI.resource_path)
    rest_api.add_resource(UserListAPI, UserListAPI.resource_path)
    rest_api.add_resource(UserAPI, UserAPI.resource_path, endpoint='userapi')
    rest_api.add_resource(TicketAPI, TicketAPI.resource_path)

