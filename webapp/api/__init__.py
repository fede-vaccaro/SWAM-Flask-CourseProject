from flask_restful import Api
from flask import Blueprint

from .controllers import *

blueprint_api = Blueprint(
    'api',
    __name__,
    url_prefix='/api'
)
rest_api = Api(blueprint_api)

def create_module(app):


    rest_api.add_resource(UserListAPI, '/users/')
    rest_api.add_resource(UserAPI, '/users/<int:id>')

    app.register_blueprint(blueprint_api)
    rest_api.init_app(app)
