from flask_jwt_extended import get_jwt_identity

from .models import User, Item, Ticket, Accounting
from .. import db


class TicketService:
    @staticmethod
    def save_ticket(items):
        ticket = Ticket()
        accountings = {}

        for item in items:
            new_item = Item()
            new_item.name = item['name']

            try:
                new_item.quantity = item['quantity']
            except:
                pass

            try:
                new_item.price = float(item['price'])
            except:
                new_item.price = 3.0

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

            ticket.items.append(new_item)

        current_user = User.query.get(get_jwt_identity())

        for participant in accountings.keys():
            print(participant)
            new_accounting = Accounting()

            new_accounting.user_from = current_user.id
            new_accounting.user_to = participant.id
            new_accounting.totalPrice = accountings[participant]

            if participant != current_user:
                ticket.accountings.append(new_accounting)

        db.session.add(ticket)
        db.session.commit()

        return ticket

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
