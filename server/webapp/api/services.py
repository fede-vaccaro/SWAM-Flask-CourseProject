from flask_jwt_extended import get_jwt_identity
from injector import inject
from sqlalchemy import and_

from .exceptions import TicketInputError
from .models import User, Item, Ticket, Accounting
from .. import db

from .db_utils import transactional
from abc import abstractmethod


class UserServiceBase:
    @abstractmethod
    def get_logged_user(self):
        raise NotImplementedError

    def authenticate(self, username, password):
        user = User.query.filter_by(username=username).first()
        if not user:
            return None
        # Do the passwords match
        if not user.check_password(password):
            return None
        return user

    @transactional
    def delete(self):
        logged_user = self.get_logged_user()

        # delete all the tickets he has
        Ticket.query.filter_by(buyer_id=logged_user.id).delete()

        # delete all the accounting where he is "userTo"
        Accounting.query.filter_by(user_to=logged_user.id).delete()

        # delete himself from being participant
        items = Item.query.filter(Item.participants.any(User.id == logged_user.id)).all()

        for item in items:
            item.participants.remove(logged_user)

        db.session.delete(logged_user)

        db.session.commit()
        return True

    def add_user(self, username, password):
        new_user = User(username=username)
        new_user.set_password(password)

        db.session.add(new_user)
        db.session.commit()

        return new_user


class UserServiceREST(UserServiceBase):
    def get_logged_user(self):
        return User.query.get(get_jwt_identity())


class TicketService:
    @inject
    def __init__(self, user_service: UserServiceBase):
        self.user_service = user_service

    @transactional
    def add_ticket(self, item_dicts):
        ticket = Ticket()

        (
            new_items_list,
            accountings_list,
        ) = self._generate_items_and_accountings(item_dicts)

        for new_item in new_items_list:
            ticket.items.append(new_item)

        for accounting in accountings_list:
            ticket.accountings.append(accounting)

        ticket.buyer_id = self.user_service.get_logged_user().id

        db.session.add(ticket)
        db.session.commit()

        return ticket

    @transactional
    def update_ticket(self, ticket, items):
        if ticket is not None:
            items, new_accountings = self._generate_items_and_accountings(
                items
            )
            # remove all previous items and add the new ones
            for item in ticket.items:
                item.participants = []
            ticket.items = []

            # set new items to the in-update ticket
            for item in items:
                item.ticket = ticket

            # transform new_accountings from list to Map, from accounting.user_to to accounting
            new_accountings_dict = {}
            for accounting in new_accountings:
                new_accountings_dict[accounting.userTo] = accounting

            # transform old_accountings (ticket.accountings) to Map
            old_accountings_dict = {}
            for accounting in ticket.accountings:
                old_accountings_dict[accounting.userTo] = accounting

            # set the old paidPrice to the new_accountings
            for user in new_accountings_dict.keys():
                if user in old_accountings_dict.keys():
                    new_accountings_dict[user].paidPrice = old_accountings_dict[
                        user
                    ].paidPrice

            # check if any old accountings no more exists
            # eventually, it creates a new accounting with totalPrice equal to 0 while conserving paidPrice
            for user in old_accountings_dict.keys():
                if (
                        user not in new_accountings_dict.keys()
                        and old_accountings_dict[user].paidPrice > 0.0
                ):
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

                    refund_ticket.buyer = user

                    refund = Item(
                        name="Refund ticket update",
                        price=accounting.paidPrice - accounting.totalPrice,
                    )
                    refund.participants.append(self.user_service.get_logged_user())

                    refund_accounting = Accounting(
                        totalPrice=refund.price,
                        userFrom=user,
                        userTo=self.user_service.get_logged_user(),
                    )

                    refund_ticket.items.append(refund)
                    refund_ticket.accountings.append(refund_accounting)

                    db.session.add(refund_ticket)

                    # delete accountings from the updating ticket
                    del new_accountings_dict[user]

            # remove all the old accountings and add the new ones
            # Accounting.query.filter_by(ticket=ticket).delete()
            for accounting in ticket.accountings:
                ticket.accountings.remove(accounting)

            for user in new_accountings_dict.keys():
                ticket.accountings.append(new_accountings_dict[user])

            db.session.add(ticket)
            db.session.commit()

            return ticket

    def _generate_items_and_accountings(self, item_dicts):
        accountings = {}
        new_item_list = []
        for item in item_dicts:
            new_item = Item()
            try:
                new_item.name = item["name"]
            except:
                raise TicketInputError("One item has no name.")

            try:
                new_item.quantity = int(item["quantity"])
            except:
                new_item.quantity = 1

            try:
                new_item.price = float(item["price"])
            except:
                raise TicketInputError("Item {} has no price specified.".format(item))

            n_participants = len(item["participants"])
            if n_participants == 0:
                raise TicketInputError("Item {} has no participants.".format(item))
            price_pro_capite = new_item.price * new_item.quantity / n_participants

            # set participants
            for participant_name in item["participants"]:
                participant = User.query.filter_by(
                    username=participant_name["username"]
                ).first()
                if participant is not None:
                    new_item.participants.append(participant)
                    if participant in accountings.keys():
                        accountings[participant] += price_pro_capite
                    else:
                        accountings[participant] = price_pro_capite
                else:
                    raise TicketInputError(
                        "User '{}' does not exist.".format(participant_name)
                    )

            new_item_list.append(new_item)

        new_accountings_list = []
        current_user = self.user_service.get_logged_user()
        for participant in accountings.keys():
            new_accounting = Accounting()

            new_accounting.userFrom = current_user
            new_accounting.userTo = participant
            new_accounting.totalPrice = accountings[participant]

            if participant != current_user:
                new_accountings_list.append(new_accounting)

        return new_item_list, new_accountings_list

    @transactional
    def get_logged_user_tickets(self):
        current_user = self.user_service.get_logged_user()
        tickets = Ticket.query.filter_by(buyer=current_user).order_by(Ticket.timestamp).all()
        return tickets

    @transactional
    def delete_ticket(self, ticket):
        db.session.delete(ticket)
        db.session.commit()


class AccountingService:

    @inject
    def __init__(self, user_service: UserServiceBase):
        self.user_service = user_service

    def get_all_debts_accountings(self):
        logged_user = self.user_service.get_logged_user()

        return Accounting.query.filter_by(user_to=logged_user.id).all()

    def get_all_credits_accountings(self):
        logged_user = self.user_service.get_logged_user()
        return Accounting.query.filter_by(user_from=logged_user.id).all()

    def get_logged_user_yourself_accountings(self):
        logged_user = self.user_service.get_logged_user()
        return Accounting.query.filter_by(user_from=logged_user.id, user_to=logged_user.id).all()

    def _filter_non_owned_items(self, user_id, ticket: Ticket):
        user = User.query.get(user_id)
        ticket.items = ticket.items.filter(Item.participants.any(User.id == user.id))

    def get_debt_accountings_of(self, id):
        logged_user = self.user_service.get_logged_user()
        accountings = Accounting.query.filter_by(
            user_from=id, user_to=logged_user.id
        ).filter(Accounting.paidPrice < Accounting.totalPrice).all()
        for accounting in accountings:
            self._filter_non_owned_items(id, accounting.ticket)
        return accountings

    def get_paid_debt_accountings(self):
        logged_user = self.user_service.get_logged_user()
        accountings = Accounting.query.filter(
            Accounting.user_to == logged_user.id, 0.0 < Accounting.paidPrice
        ).all()
        return accountings

    def get_credit_accountings_of(self, id):
        logged_user = self.user_service.get_logged_user()
        accountings = Accounting.query.filter_by(
            user_from=logged_user.id, user_to=id
        ).filter(Accounting.paidPrice < Accounting.totalPrice).all()
        for accounting in accountings:
            self._filter_non_owned_items(id, accounting.ticket)
        return accountings

    @transactional
    def pay_debt_accounting(self, id):
        logged_user = self.user_service.get_logged_user()
        accounting_to_pay = Accounting.query.filter_by(
            id=id, user_to=logged_user.id
        ).first()
        accounting_to_pay.paidPrice = accounting_to_pay.totalPrice
        db.session.commit()

    @transactional
    def pay_all_debts_accounting_to(self, id):
        logged_user = self.user_service.get_logged_user()
        debts = Accounting.query.filter_by(user_from=id, user_to=logged_user.id).all()
        credits = Accounting.query.filter_by(user_from=logged_user.id, user_to=id).all()
        accountings = debts + credits
        for accounting in accountings:
            accounting.paidPrice = accounting.totalPrice

        db.session.commit()

    @transactional
    def mark_credit_accounting_paid(self, id):
        logged_user = self.user_service.get_logged_user()
        accounting_to_pay = Accounting.query.filter_by(
            id=id, user_from=logged_user.id
        ).first()
        accounting_to_pay.paidPrice = accounting_to_pay.totalPrice
        db.session.commit()
