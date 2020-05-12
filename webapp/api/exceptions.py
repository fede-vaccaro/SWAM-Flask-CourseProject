from werkzeug import exceptions as exc

from webapp.api import status


class TicketInputError(exc.HTTPException):
    def __init__(self, description):
        super(TicketInputError, self).__init__()

        self.code = status.HTTP_400_BAD_REQUEST
        self.description = description