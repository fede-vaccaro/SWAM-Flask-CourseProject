from flask_jwt_extended import get_jwt_identity

from .exceptions import TicketInputError
from .models import User, Item, Ticket, Accounting
from .. import db


class TicketService:
    @staticmethod
    def add_ticket(item_dicts):
        ticket = Ticket()

        new_items_list, accountings_list = TicketService._generate_items_and_accountings(item_dicts)

        for new_item in new_items_list:
            ticket.items.append(new_item)

        for accounting in accountings_list:
            ticket.accountings.append(accounting)

        db.session.add(ticket)
        db.session.commit()

        return ticket

    @staticmethod
    def update_ticket(ticket, items):
        if ticket is not None:
            items, new_accountings = TicketService._generate_items_and_accountings(items)

            # remove all previous items and add the new ones
            Item.query.filter_by(ticket=ticket.id).delete()
            for item in items:
                ticket.items.append(item)

            # transform new_accountings from list to Map, from accounting.user_to to accounting
            new_accountings_dict = {}
            for accounting in new_accountings:
                new_accountings_dict[accounting.user_to] = accounting

            # transform old_accountings (ticket.accountings) to Map
            old_accountings_dict = {}
            for accounting in ticket.accountings:
                old_accountings_dict[accounting.user_to] = accounting

            # set the old paidPrice to the new_accountings
            for user in new_accountings_dict.keys():
                if user in old_accountings_dict.keys():
                    new_accountings_dict[user].paidPrice = old_accountings_dict[user].paidPrice

                    # check if any old accountings no more exists
            # eventually, it creates a new accounting with totalPrice equal to 0 while conserving paidPrice
            for user in old_accountings_dict.keys():
                if user not in new_accountings_dict.keys() and old_accountings_dict[user].paidPrice > 0.0:
                    # transfer the old accounting to the new map
                    accounting = old_accountings_dict[user]
                    accounting.totalPrice = 0.0

                    new_accountings_dict[user] = accounting

            # eventually create some "Refund ticket"
            user_lists = list(new_accountings_dict.keys())
            for user in user_lists:
                accounting = new_accountings_dict[user]

                # if an user paid more than if he had to
                if accounting.totalPrice < accounting.paidPrice:
                    refund_ticket = Ticket()

                    refund = Item(name="Refund ticket update", price=accounting.paidPrice - accounting.totalPrice)
                    refund.participants.append(UserService.get_logged_user())

                    refund_accounting = Accounting(totalPrice=refund.price, user_from=user, user_to=UserService.get_logged_user().id)

                    refund_ticket.items.append(refund)
                    refund_ticket.accountings.append(refund_accounting)

                    db.session.add(refund_ticket)

                    # delete accountings from the updating ticket
                    del new_accountings_dict[user]

            # remove all the old accountings and add the new ones
            Accounting.query.filter_by(ticket=ticket.id).delete()
            for user in new_accountings_dict.keys():
                ticket.accountings.append(new_accountings_dict[user])

            db.session.add(ticket)
            db.session.commit()

            return ticket

    @staticmethod
    def _generate_items_and_accountings(item_dicts):
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


            n_participants = len(item['participants'])
            if n_participants == 0:
                raise TicketInputError("Item {} has no participants.".format(item))
            price_pro_capite = new_item.price / n_participants

            # set participants
            for participant_name in item['participants']:
                participant = User.query.filter_by(username=participant_name).first()
                if participant is not None:
                    new_item.participants.append(participant)
                    if participant in accountings.keys():
                        accountings[participant] += price_pro_capite
                    else:
                        accountings[participant] = price_pro_capite
                else:
                    raise TicketInputError("User '{}' does not exist.".format(participant_name))

            new_item_list.append(new_item)

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

        return new_item_list, new_accountings_list

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
    def get_all_debts_accountings():
        logged_user = UserService.get_logged_user()
        return Accounting.query.filter_by(user_to=logged_user.id).all()

    @staticmethod
    def get_all_credits_accountings():
        logged_user = UserService.get_logged_user()
        return Accounting.query.filter_by(user_from=logged_user.id).all()
