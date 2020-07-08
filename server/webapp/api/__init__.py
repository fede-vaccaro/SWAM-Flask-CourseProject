from flask_jwt_extended import JWTManager
from flask_restful import Api
from flask import Blueprint
from .controllers import AuthenticationAPI, UsersAPI, UserAPI, MyTicketAPI, TicketsAPI, TicketAPI, DebtsAPI, DebtAPI, \
    DebtPaidAPI, CreditsAPI, CreditAPI, PayDebtAPI, CreditPaidAPI, PayAllDebtsAPI
from flask_injector import FlaskInjector

blueprint_api = Blueprint(
    'api',
    __name__,
    url_prefix='/api'
)

from .dependencies import configure

rest_api = Api(blueprint_api)
jwt = JWTManager()


def create_module(app):
    app.config['PROPAGATE_EXCEPTIONS'] = True

    app.register_blueprint(blueprint_api)
    rest_api.init_app(app)
    jwt.init_app(app)

    rest_api.add_resource(AuthenticationAPI, AuthenticationAPI.resource_path)
    rest_api.add_resource(UsersAPI, UsersAPI.resource_path)
    rest_api.add_resource(UserAPI, UserAPI.resource_path, endpoint='userapi')
    rest_api.add_resource(MyTicketAPI, MyTicketAPI.resource_path)
    rest_api.add_resource(TicketsAPI, TicketsAPI.resource_path)
    rest_api.add_resource(TicketAPI, TicketAPI.resource_path, endpoint='ticketapi')
    rest_api.add_resource(DebtsAPI, DebtsAPI.resource_path)
    rest_api.add_resource(DebtAPI, DebtAPI.resource_path)
    rest_api.add_resource(DebtPaidAPI, DebtPaidAPI.resource_path)
    rest_api.add_resource(PayDebtAPI, PayDebtAPI.resource_path)
    rest_api.add_resource(PayAllDebtsAPI, PayAllDebtsAPI.resource_path)
    rest_api.add_resource(CreditPaidAPI, CreditPaidAPI.resource_path)
    rest_api.add_resource(CreditAPI, CreditAPI.resource_path)

    FlaskInjector(app, modules=[configure])

