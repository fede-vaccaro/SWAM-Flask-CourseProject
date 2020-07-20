from datetime import datetime

from .. import db, bcrypt


class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer(), primary_key=True)
    username = db.Column(db.String(255), unique=True)
    password = db.Column(db.String(255))

    def __repr__(self):
        return "<User '{}'>".format(self.username)

    def set_password(self, password):
        self.password = bcrypt.generate_password_hash(password)

    def check_password(self, password):
        try:
            return bcrypt.check_password_hash(self.password, password)
        except:
            return False


class Ticket(db.Model):
    __tablename__ = 'tickets'
    id = db.Column(db.Integer(), primary_key=True)
    timestamp = db.Column(db.DateTime(), default=datetime.now)

    buyer_id = db.Column(db.Integer(), db.ForeignKey('users.id'), nullable=False)

    buyer = db.relationship('User', backref='tickets', foreign_keys=buyer_id)
    items = db.relationship('Item', backref='ticket', lazy='dynamic', cascade='all, delete-orphan',
                            passive_deletes=True)
    accountings = db.relationship('Accounting', backref='ticket', lazy='select', cascade='all, '
                                                                                         'delete-orphan',
                                  passive_deletes=True)

    def __repr__(self):
        return "<Ticket '{}'>".format(self.timestamp)


class Accounting(db.Model):
    __tablename__ = 'accountings'
    id = db.Column(db.Integer, primary_key=True)
    paidPrice = db.Column(db.Float, default=0.0)
    totalPrice = db.Column(db.Float)
    ticket_id = db.Column(db.Integer, db.ForeignKey('tickets.id', ondelete='CASCADE'), nullable=False)

    user_from = db.Column(db.Integer(), db.ForeignKey('users.id'), nullable=False)
    user_to = db.Column(db.Integer(), db.ForeignKey('users.id'), nullable=False)

    userTo = db.relationship('User', foreign_keys=user_to)
    userFrom = db.relationship('User', foreign_keys=user_from)

    def __init__(self, **kwargs):
        super(Accounting, self).__init__(**kwargs)
        self.paidPrice = 0.0

    def __repr__(self):
        return "<Accounting paidPrice: '{}', totalPrice: '{}', userFrom: '{}', userTo: '{}'".format(
            self.paidPrice,
            self.totalPrice, self.userFrom,
            self.userTo)

    def __hash__(self):
        return self.__repr__().__hash__()

    def __eq__(self, other):
        return self.__hash__() == other.__hash__()


class Item(db.Model):
    __tablename__ = 'items'
    id = db.Column(db.Integer(), primary_key=True)
    name = db.Column(db.String(255))
    price = db.Column(db.Float(), nullable=False)
    quantity = db.Column(db.Integer(), default=1)

    ticket_id = db.Column(db.Integer(), db.ForeignKey('tickets.id', ondelete='CASCADE'))
    participants = db.relationship('User',
                                   secondary='users_items',
                                   lazy='select',
                                   cascade='all, delete',
                                   passive_deletes=True,
                                   )

    def add_participants(self, *participants):
        for participant in participants:
            self.participants.append(participant)

    def __eq__(self, other):
        return (self.name == other.name and
                self.price == other.price and
                self.quantity == other.quantity and
                set(self.participants) == set(other.participants))

    def __hash__(self):
        return self.__repr__().__hash__()

    def __repr__(self):
        return "<Item '{}'; Price: {}, Quantity: {}, Participants: {}>".format(self.name, self.price, self.quantity,
                                                                               self.participants)

    def to_dict(self):
        item_dict = {'name': self.name}

        try:
            item_dict['quantity'] = self.quantity
        except:
            pass

        item_dict['price'] = self.price
        item_dict['participants'] = [{'username': u.username} for u in self.participants]
        return item_dict


items_users = db.Table('users_items',
                       db.Column('id', db.Integer, primary_key=True),
                       db.Column('items_id', db.Integer, db.ForeignKey('items.id', ondelete='CASCADE')),
                       db.Column('users_id', db.Integer, db.ForeignKey('users.id', ondelete='CASCADE')),
                       db.UniqueConstraint('items_id', 'users_id', name='UC_items_id_users_id'),
                       )
