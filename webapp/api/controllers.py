from flask import Blueprint


api_blueprints = Blueprint(
    'api',
    __name__,
    url_prefix='/api'
)


@api_blueprints.route('/')
def home():
    return '<h1>Hello World!</h1>'
