import {Injectable} from '@angular/core';
import {User} from '../models/user';
import {LoginService} from './login.service';
import {TicketService} from './ticket.service';

@Injectable({
    providedIn: 'root'
})
export class AccountingService {
    private loggedUser: Promise<User>;

    constructor(loginService: LoginService, ticketService: TicketService) {
        this.loggedUser = loginService.getLoggedUser();
    }

    getAccountingWithUser(friend: User) {

    }
}
