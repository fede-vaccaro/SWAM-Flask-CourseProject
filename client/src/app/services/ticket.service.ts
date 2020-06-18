import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { first, map } from 'rxjs/operators';
import { DebtTicket, Ticket } from '../models/ticket';
import { User } from '../models/user';
import { UserFriends } from '../models/user-friends';
import { MessagesRepositoryService } from '../repositories/messages-repository.service';
import { TicketRepositoryService } from '../repositories/ticket-repository.service';
import { LoginService } from './login.service';
import { UserFriendsService } from './user-friends.service';
import { environment } from 'src/environments/environment';
import { LoggedUserTicketPipe } from '../pipe/logged-user-ticket.pipe';
import { DebtTicketPipe } from '../pipe/debt-ticket.pipe';

@Injectable({
    providedIn: 'root'
})
export class TicketService {

    constructor(
        private http: HttpClient,
        private loggedUserTicketPipe: LoggedUserTicketPipe,
        private debtTicketPipe: DebtTicketPipe,
        private ticketRepositoryService: TicketRepositoryService,
        private loginService: LoginService,
        private userFriendsService: UserFriendsService,
    ) { }

    async save(ticket: Ticket) {
        if (ticket.id === undefined)
            return await this.http.post(`${environment.serverUrl}/tickets`, { items: ticket.products }).pipe(first()).toPromise()
        return await this.http.patch(`${environment.serverUrl}/ticket/${ticket.id}`, { items: ticket.products }).pipe(first()).toPromise()
    }

    getTicketsOfLoggedUser(): Observable<Ticket[]> {
        return this.http.get(`${environment.serverUrl}/tickets`)
            .pipe(first(), map(tickets => this.loggedUserTicketPipe.transform(tickets)))
    }

    getPassedTicketsOfLoggedUser(): Observable<Ticket[]> {
        let loggedUser = this.loginService.getLoggedUser()
        return this.ticketRepositoryService.getPassedTicketsOf(loggedUser);
    }

    getDebtTicketsOf(user: User): Observable<DebtTicket[]> {
        return this.http.get(`${environment.serverUrl}/debt/${user.id}`)
            .pipe(map(debtsTicket => this.debtTicketPipe.transform(debtsTicket)))
    }

    getCreditTicketsFrom(user: User): Observable<DebtTicket[]> {
        return this.http.get(`${environment.serverUrl}/credit/${user.id}`)
            .pipe(map(debtsTicket => this.debtTicketPipe.transform(debtsTicket)))
    }

    getPaidTickets(): Observable<DebtTicket[]> {
        return this.http.get(`${environment.serverUrl}/debt-paid`)
            .pipe(map(debtsTicket => this.debtTicketPipe.transform(debtsTicket)))
    }

    getPartialTicketsOfLoggedUser(): Observable<DebtTicket[]> {
        return this.http.get(`${environment.serverUrl}/my-ticket`)
            .pipe(map(debtsTicket => this.debtTicketPipe.transform(debtsTicket)))
    }

    async payAllDebtTicketTo(receivingUser: User) {
        return await this.http.get(`${environment.serverUrl}/pay-debts/${receivingUser.id}`)
            .pipe(first()).toPromise()
    }

    async paySingleDebtTicket(debtTicket: DebtTicket) {
        const loggedUser: User = this.loginService.getLoggedUser()
        if (debtTicket.owner.username === loggedUser.username)
            return await this.http.get(`${environment.serverUrl}/credit-paid/${debtTicket.id}`)
                .pipe(first()).toPromise()
        else
            return await this.http.get(`${environment.serverUrl}/pay-debt/${debtTicket.id}`)
                .pipe(first()).toPromise()
    }
}
