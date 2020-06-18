from flask_restful import fields

from .models import User, Item, Ticket, Accounting

user_fields = {
    User.id.key: fields.Integer(),
    User.username.key: fields.String(),
    # 'uri': fields.Url(endpoint='api.userapi', absolute=True)
}

item_fields = {
    Item.name.key: fields.String(),
    Item.quantity.key: fields.Integer(),
    Item.price.key: fields.Float(),
    'participants': fields.List(fields.Nested(user_fields))
}

small_ticket_fields = {
    Ticket.id.key: fields.Integer(),
    Ticket.timestamp.key: fields.DateTime(),
    'uri': fields.Url(endpoint='api.ticketapi', absolute=True)
}

small_items_ticket_fields = {
    Ticket.id.key: fields.Integer(),
    Ticket.timestamp.key: fields.DateTime(),
    'items': fields.List(fields.Nested(item_fields)),
}

small_accounting_fields = {
    Accounting.id.key: fields.Integer(),
    Accounting.totalPrice.key: fields.Float(),
    Accounting.paidPrice.key: fields.Float(),
    'userFrom': fields.Nested(user_fields),
    'userTo': fields.Nested(user_fields)
}

accounting_fields = {
    Accounting.id.key: fields.Integer(),
    Accounting.totalPrice.key: fields.Float(),
    Accounting.paidPrice.key: fields.Float(),
    'ticketRef': fields.Nested(small_items_ticket_fields),
    'userFrom': fields.Nested(user_fields),
    'userTo': fields.Nested(user_fields),
}

ticket_fields = {
    Ticket.id.key: fields.Integer(),
    Ticket.timestamp.key: fields.DateTime(),
    'items': fields.List(fields.Nested(item_fields)),
    'accountings': fields.List(fields.Nested(small_accounting_fields))
}


