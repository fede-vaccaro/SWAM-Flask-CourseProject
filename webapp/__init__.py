from flask import Flask
from flask_migrate import Migrate
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()
migrate = Migrate()


def create_app(object_name):
    app = Flask(__name__)
    app.config.from_object(object_name)

    from .api.controllers import api_blueprints

    db.init_app(app)
    migrate.init_app(app, db)

    app.register_blueprint(api_blueprints)

    return app
