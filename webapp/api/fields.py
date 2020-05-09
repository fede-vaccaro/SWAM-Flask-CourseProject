from .models import User, Item, Ticket
from flask_restful import fields

user_fields = {
    User.id.key: fields.Integer(),
    User.username.key: fields.String(),
    'uri': fields.Url(endpoint='api.userapi', absolute=True)
}

item_fields = {
    Item.name.key: fields.String(),
    Item.quantity.key: fields.Integer(),
    Item.price.key: fields.Float(),
    'participants': fields.List(fields.Nested(user_fields))
}

ticket_fields = {
    Ticket.id.key: fields.Integer(),
    Ticket.timestamp.key: fields.DateTime(),
    'items': fields.List(fields.Nested(item_fields))
}