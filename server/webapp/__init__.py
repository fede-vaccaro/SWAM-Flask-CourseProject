from flask import Flask
from flask_bcrypt import Bcrypt
from flask_migrate import Migrate
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS

db = SQLAlchemy()
migrate = Migrate()
bcrypt = Bcrypt()

def create_app(object_name):
    app = Flask(__name__)
    app.config.from_object(object_name)
    cors = CORS(app)

    cors.init_app(app)
    bcrypt.init_app(app)
    db.init_app(app)
    migrate.init_app(app, db)


    from .api import create_module as api_create_module

    api_create_module(app)

    return app
