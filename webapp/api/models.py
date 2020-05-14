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

    items = db.relationship('Item', backref='tickets', lazy='dynamic', cascade='save-update, delete')
    accountings = db.relationship('Accounting', backref='accountings', lazy='dynamic', cascade='save-update, delete')

    def __repr__(self):
        return "<Ticket '{}'>".format(self.timestamp)


class Accounting(db.Model):
    __tablename__ = 'accountings'
    id = db.Column(db.Integer, primary_key=True)
    paidPrice = db.Column(db.Float, default=0.0)
    totalPrice = db.Column(db.Float)
    ticket = db.Column(db.Integer, db.ForeignKey('tickets.id'))

    user_from = db.Column(db.Integer(), db.ForeignKey('users.id'))
    user_to = db.Column(db.Integer(), db.ForeignKey('users.id'))

    userTo = db.relationship('User', backref='user_to', foreign_keys=user_to)
    userFrom = db.relationship('User', backref='user_from', foreign_keys=user_from)
    ticketRef = db.relationship('Ticket', backref='ticket', foreign_keys=ticket)

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

    ticket = db.Column(db.Integer(), db.ForeignKey('tickets.id'))
    participants = db.relationship('User',
                                   secondary='user_items',
                                   backref=db.backref('items', lazy='dynamic')
                                   )

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
        item_dict['participants'] = [u.username for u in self.participants]
        return item_dict


items = db.Table('user_items',
                 db.Column('user_id', db.Integer, db.ForeignKey('users.id')),
                 db.Column('items_id', db.Integer, db.ForeignKey('items.id'))
                 )
