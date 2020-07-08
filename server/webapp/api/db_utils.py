from sqlalchemy.exc import SQLAlchemyError
from .exceptions import ApplicationDBError
from .. import db


def transactional(commands):
    def annotation(*args):
        try:
            commands(*args)
        except SQLAlchemyError as exc:
            db.session.rollback()

            error = str(exc.orig) + " for parameters" + str(exc.params)
            print("An error occurred with the DB.", error)

            raise ApplicationDBError

    return annotation
