from flask import jsonify, request
from flask_jwt_extended import create_access_token, jwt_required
from flask_restful import Resource, marshal_with, reqparse
from sqlalchemy.exc import SQLAlchemyError
from werkzeug import exceptions as exc

from . import fields as fields
from . import status
from .models import User, Ticket
from .services import UserService, TicketService, AccountingService
from .. import db


def noAuth():
    raise exc.BadRequest('Missing authentication header.')


class UsersAPI(Resource):
    resource_path = '/users'

    @jwt_required
    @marshal_with(fields.user_fields)
    def get(self):
        return User.query.all(), status.HTTP_200_OK

    @marshal_with(fields.user_fields)
    def post(self):
        parser = reqparse.RequestParser()
        parser.add_argument(User.username.key, type=str, required=True, help='You have to include the username!')
        parser.add_argument(User.password.key, type=str, required=True, help='You have to include the password!')

        args = parser.parse_args()

        username = args[User.username.key]
        password = args[User.password.key]

        try:
            new_user = UserService.add_user(username, password)
        except SQLAlchemyError as error:
            db.session.rollback()

            if User.query.filter_by(username=username).first() is not None:
                raise exc.BadRequest('Username {} already existent.'.format(username))

            error = str(error.orig) + " for parameters" + str(error.params)
            print("An error occurred with the DB.", error)
            raise exc.InternalServerError(str(error))

        return new_user, status.HTTP_201_CREATED


class AuthenticationAPI(Resource):
    resource_path = '/auth'

    def post(self):
        if not request.content_type == 'application/json':
            response = jsonify(message="Content Type is not 'application/json'")
            response.status_code = status.HTTP_400_BAD_REQUEST
            return response

        parser = reqparse.RequestParser()
        parser.add_argument(User.username.key, type=str, required=True, help='Username missing')
        parser.add_argument(User.password.key, type=str, required=True, help='Password missing')

        args = parser.parse_args()

        username = args[User.username.key]
        password = args[User.password.key]

        user = UserService.authenticate(username, password)
        if user:
            access_token = create_access_token(identity=user.id)
            response = jsonify({"token": access_token, "user": user.id, "username": user.username})
            response.status_code = status.HTTP_200_OK
            return response
        else:
            raise exc.BadRequest('Wrong email or password.')


class UserAPI(Resource):
    resource_path = '/user/<int:id>'

    @jwt_required
    def get(self):
        pass


class TicketsAPI(Resource):
    resource_path = '/tickets'

    @jwt_required
    @marshal_with(fields.ticket_fields)
    def post(self):
        parser = reqparse.RequestParser()
        parser.add_argument('items', type=dict, action='append', required=True,
                            help="Can't insert a ticket with no items!")

        args = parser.parse_args()

        items = args['items']

        try:
            new_ticket = TicketService.add_ticket(items)
        except SQLAlchemyError as error:
            db.session.rollback()
            error = str(error.orig) + " for parameters" + str(error.params)
            print("An error occurred with the DB.", error)
            raise exc.InternalServerError(str(error))

        return new_ticket, status.HTTP_201_CREATED

    @jwt_required
    @marshal_with(fields.ticket_fields)
    def get(self):
        tickets = TicketService.get_logged_user_tickets()
        return tickets


class DebtsAPI(Resource):
    resource_path = '/debts'

    @jwt_required
    @marshal_with(fields.accounting_fields)
    def get(self):
        accountings = AccountingService.get_all_debts_accountings()
        return accountings


class CreditsAPI(Resource):
    resource_path = '/credits'

    @jwt_required
    @marshal_with(fields.accounting_fields)
    def get(self):
        accountings = AccountingService.get_all_credits_accountings()
        return accountings


class DebtAPI(Resource):
    resource_path = "/debt/<int:id>"

    @jwt_required
    @marshal_with(fields.accounting_fields)
    def get(self, id):
        accountings = AccountingService.get_debt_accountings_of(id)
        print(accountings)
        return accountings


class CreditAPI(Resource):
    resource_path = "/credit/<int:id>"

    @jwt_required
    @marshal_with(fields.accounting_fields)
    def get(self, id):
        accountings = AccountingService.get_credit_accountings_of(id)
        return accountings


class PayDebtAPI(Resource):
    resource_path = "/pay-debt/<int:id>"

    @jwt_required
    @marshal_with(fields.accounting_fields)
    def get(self, id):
        accounting = AccountingService.pay_debt_accounting(id)
        return accounting


class PayAllDebtsAPI(Resource):
    resource_path = "/pay-debts/<int:id>"

    @jwt_required
    @marshal_with(fields.accounting_fields)
    def get(self, id):
        accounting = AccountingService.pay_all_debts_accounting_to(id)
        return accounting


class CreditPaidAPI(Resource):
    resource_path = "/credit-paid/<int:id>"

    @jwt_required
    @marshal_with(fields.accounting_fields)
    def get(self, id):
        accounting = AccountingService.mark_credit_accounting_paid(id)
        return accounting


class TicketAPI(Resource):
    resource_path = '/tickets/<int:id>'

    @marshal_with(fields.ticket_fields)
    @jwt_required
    def get(self, id):
        ticket = Ticket.query.get(id)

        if not ticket:
            raise exc.NotFound

        for accounting in ticket.accountings:
            user_id = UserService.get_logged_user().id
            if user_id == accounting.user_from or user_id == accounting.user_to:
                return ticket, status.HTTP_200_OK
        raise exc.Unauthorized

    @marshal_with(fields.ticket_fields)
    @jwt_required
    def patch(self, id):
        ticket = Ticket.query.get(id)
        if not ticket:
            raise exc.NotFound

        parser = reqparse.RequestParser()
        parser.add_argument('items', type=dict, action='append', required=True, help="Can't insert empty receipt!")

        args = parser.parse_args()

        items = args['items']

        updated_ticket = TicketService.update_ticket(ticket, items)
        return updated_ticket, status.HTTP_201_CREATED

    @jwt_required
    def delete(self, id):
        ticket = Ticket.query.get(id)

        if not ticket:
            raise exc.NotFound

        for accounting in ticket.accountings:
            user_id = UserService.get_logged_user().id
            if user_id == accounting.user_from:
                TicketService.delete_ticket(ticket)
                return status.HTTP_200_OK
        raise exc.Unauthorized
