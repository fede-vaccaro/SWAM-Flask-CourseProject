from werkzeug import exceptions as exc

from . import status


class TicketInputError(exc.HTTPException):
    def __init__(self, description):
        super(TicketInputError, self).__init__()

        self.code = status.HTTP_400_BAD_REQUEST
        self.description = description


class ApplicationDBError(exc.HTTPException):
    def __init__(self):
        super(ApplicationDBError, self).__init__()

        self.code = status.HTTP_500_INTERNAL_SERVER_ERROR
        self.description = "Some error occurred with the DB."
