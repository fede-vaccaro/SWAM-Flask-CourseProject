from .services import *

from flask_injector import request
from injector import Binder


def configure(binder: Binder):
    binder.bind(interface=UserServiceBase, to=UserServiceREST, scope=request)
    binder.bind(interface=TicketService, to=TicketService, scope=request)
    binder.bind(interface=AccountingService, to=AccountingService, scope=request)
