from datetime import datetime

from .. import db


class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer(), primary_key=True)
    email = db.Column(db.String(255), unique=True)
    password = db.Column(db.String(255))

    tickets = db.relationship('Ticket', backref='users', lazy='dynamic')

    def __repr__(self):
        return "<User '{}'>".format(self.email)


class Ticket(db.Model):
    __tablename__ = 'tickets'
    id = db.Column(db.Integer(), primary_key=True)
    timestamp = db.Column(db.DateTime(), default=datetime.now)
    price = db.Column(db.Float())
    user_id = db.Column(db.Integer(), db.ForeignKey('users.id'))
    items = db.relationship('Item', backref='tickets', lazy='dynamic')

    def __repr__(self):
        return "<Ticket '{}'>".format(self.timestamp)


class Item(db.Model):
    __tablename__ = 'items'
    id = db.Column(db.Integer(), primary_key=True)
    name = db.Column(db.String(255))
    price = db.Column(db.Float(), default=0.0)
    quantity = db.Column(db.Integer(), default=1)

    ticket = db.Column(db.Integer(), db.ForeignKey('tickets.id'))
    participants = db.relationship('User',
                                   secondary='user_items',
                                   backref=db.backref('items', lazy='dynamic')
                                   )

    def __repr__(self):
        return "<Item '{}'; Price: {}, Quantity: {}>".format(self.name, self.price, self.quantity)


items = db.Table('user_items',
                 db.Column('user_id', db.Integer, db.ForeignKey('users.id')),
                 db.Column('items_id', db.Integer, db.ForeignKey('items.id'))
                 )
