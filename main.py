from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from config import DevConfig

app = Flask(__name__)
app.config.from_object(DevConfig)
db = SQLAlchemy(app)
migrate = Migrate(app, db)

@app.route('/')
def home():
    return '<h1>Hello World!</h1>'


if __name__ == '__main__':
    app.run()
