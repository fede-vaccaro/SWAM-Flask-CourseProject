from flask_jwt_extended import get_jwt_identity

from .models import User, Item, Ticket, Accounting
from .. import db


class TicketService:
    @staticmethod
    def add_ticket(item_dicts):
        ticket = Ticket()

        accountings_dict, new_item_list = TicketService._generate_items_and_accountings_dict(item_dicts)
        new_accountings_list = TicketService._generate_accountings(accountings_dict)

        for new_item in new_item_list:
            ticket.items.append(new_item)

        for accounting in new_accountings_list:
            ticket.accountings.append(accounting)

        db.session.add(ticket)
        db.session.commit()

        return ticket

    @staticmethod
    def _generate_accountings(accountings):
        new_accountings_list = []
        current_user = User.query.get(get_jwt_identity())
        for participant in accountings.keys():
            print(participant)
            new_accounting = Accounting()

            new_accounting.user_from = current_user.id
            new_accounting.user_to = participant.id
            new_accounting.totalPrice = accountings[participant]

            if participant != current_user:
                new_accountings_list.append(new_accounting)
        return new_accountings_list

    @staticmethod
    def _generate_items_and_accountings_dict(item_dicts):
        accountings = {}
        new_item_list = []
        for item in item_dicts:
            new_item = Item()
            new_item.name = item['name']

            try:
                new_item.quantity = item['quantity']
            except:
                pass

            try:
                new_item.price = float(item['price'])
            except:
                new_item.price = 1.0

            price_pro_capite = new_item.price / len(item['participants'])

            # set participants
            for participant_name in item['participants']:
                participant = User.query.filter_by(username=participant_name).first()
                if participant is not None:
                    new_item.participants.append(participant)
                    if participant in accountings.keys():
                        accountings[participant] += price_pro_capite
                    else:
                        accountings[participant] = price_pro_capite

            new_item_list.append(new_item)
        return accountings, new_item_list

    @staticmethod
    def update_ticket(ticked_id, items):
        pass

    @staticmethod
    def get_logged_user_tickets():
        current_user = User.query.get(get_jwt_identity())
        accountings = Accounting.query.filter_by(user_from=current_user.id).all()
        ticket_set = set()
        for accounting in accountings:
            ticket_set.add(accounting.ticket)
        tickets = Ticket.query.filter(Ticket.id.in_(ticket_set)).order_by(Ticket.timestamp.desc()).all()
        return tickets

    @staticmethod
    def delete_ticket(ticket):
        db.session.delete(ticket)
        db.session.commit()


class UserService:

    @staticmethod
    def authenticate(username, password):
        user = User.query.filter_by(username=username).first()
        if not user:
            return None
        # Do the passwords match
        if not user.check_password(password):
            return None
        return user

    @staticmethod
    def get_logged_user():
        return User.query.get(get_jwt_identity())

    @staticmethod
    def add_user(username, password):
        new_user = User(username=username)
        new_user.set_password(password)

        db.session.add(new_user)
        db.session.commit()

        return new_user


class AccountingService:

    @staticmethod
    def get_all_debt_accountings():
        logged_user = UserService.get_logged_user()
        return Accounting.query.filter_by(user_to=logged_user.id).all()

    @staticmethod
    def get_all_credit_accountings():
        logged_user = UserService.get_logged_user()
        return Accounting.query.filter_by(user_from=logged_user.id).all()
