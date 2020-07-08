import os
from webapp import create_app
from sqlalchemy import event
from sqlalchemy.engine import Engine

env = os.environ.get('WEBAPP_ENV', 'dev')
app = create_app('config.%sConfig' % env.capitalize())

from webapp import create_app, db, migrate
from webapp.api.models import User, Ticket, Item


@app.shell_context_processor
def make_shell_context():
    return dict(app=app, db=db, User=User, Ticket=Ticket, Item=Item, migrate=migrate)

@event.listens_for(Engine, "connect")
def set_sqlite_pragma(dbapi_connection, connection_record):
    cursor = dbapi_connection.cursor()
    cursor.execute("PRAGMA foreign_keys=ON")
    cursor.close()

if __name__ == '__main__':
    app.run()
