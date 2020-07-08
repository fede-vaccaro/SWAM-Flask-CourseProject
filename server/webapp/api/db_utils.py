from sqlalchemy.exc import SQLAlchemyError
from .exceptions import ApplicationDBError
from .. import db


def transactional(commands):
    def annotation(*args):
        try:
            return_value = commands(*args)
            if return_value is not None:
                return return_value
        except SQLAlchemyError as exc:
            db.session.rollback()

            error = str(exc.orig) + " for parameters" + str(exc.params)
            print("An error occurred with the DB.", error)

            raise ApplicationDBError

    return annotation
