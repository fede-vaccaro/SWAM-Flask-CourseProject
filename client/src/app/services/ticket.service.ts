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
            return this.http.post(`${environment.serverUrl}/tickets`, { items: ticket.products }).pipe(first()).toPromise()
        return this.http.patch(`${environment.serverUrl}/ticket/${ticket.id}`, { items: ticket.products }).pipe(first()).toPromise()
    }

    getTicketsOfLoggedUser(): Observable<Ticket[]> {
        return this.http.get(`${environment.serverUrl}/tickets`)
            .pipe(first(), map(tickets => this.loggedUserTicketPipe.transform(tickets)))
    }

    getPassedTicketsOfLoggedUser(): Promise<Observable<Ticket[]>> {
        return this.loginService.getLoggedUser()
            .then(loggedUser => {
                return this.ticketRepositoryService.getPassedTicketsOf(loggedUser);
            });
    }

    getDebtTicketsOf(user: User): Promise<Observable<DebtTicket[]>> {
        return this.loginService.getLoggedUser()
            .then(loggedUser => {
                return this.ticketRepositoryService.getDebtTicketsOf(loggedUser, user);
            });
    }

    getCreditTicketsFrom(user: User): Observable<DebtTicket[]> {
        return this.http.get(`${environment.serverUrl}/credit/${user.id}`)
            .pipe(first(), map(debtsTicket => this.debtTicketPipe.transform(debtsTicket)))
    }

    async getPaidTicketsOfLoggedUser(): Promise<DebtTicket[]> {
        const loggedUser: User = await this.loginService.getLoggedUser();
        const loggedUserFriends: UserFriends = await this.userFriendsService.getUserFriends().toPromise()
        return await Promise.all(
            loggedUserFriends.friends.map(
                async friend => {
                    return await this.ticketRepositoryService.getPaidDebtTicketsOf(loggedUser, friend).pipe(first()).toPromise();
                })).then(paidTicketFriend => {
                    return [].concat.apply([], paidTicketFriend) as DebtTicket[];
                });
    }

    async getPartialTicketsOfLoggedUser(): Promise<DebtTicket[]> {
        const loggedUser: User = await this.loginService.getLoggedUser();
        return await this.ticketRepositoryService.getDebtTicketsOf(loggedUser, loggedUser).pipe(first()).toPromise();
    }

    async payAllDebtTicketTo(receivingUser: User) {
        // first pay all ticket to
        const ticketsByFriendObs: Observable<DebtTicket[]> = await this.getDebtTicketsOf(receivingUser);
        const ticketsByFriend = await ticketsByFriendObs.pipe(first()).toPromise();


        while (ticketsByFriend.length !== 0) {
            const debtTicket = ticketsByFriend.pop();
            this.ticketRepositoryService.savePaidDebtTicket(debtTicket);
            this.ticketRepositoryService.deleteDebtTicket(debtTicket);
        }


        // then pay all ticket from receivingUser to payer, if any
        const ticketByPayerObs: Observable<DebtTicket[]> = await this.getCreditTicketsFrom(receivingUser);
        const ticketByPayer = await ticketByPayerObs.pipe(first()).toPromise();

        while (ticketByPayer.length !== 0) {
            const debtTicket = ticketByPayer.pop();
            this.ticketRepositoryService.savePaidDebtTicket(debtTicket);
            this.ticketRepositoryService.deleteDebtTicket(debtTicket);
        }

        const loggedUser = await this.loginService.getLoggedUser();
    }

    async payDebtTicket(debtTicket: DebtTicket, paidPrice: number) {
        const ticket = await this.ticketRepositoryService.getTicketOf(debtTicket.owner, debtTicket.timestamp.toString());
        ticket.paidPrice += paidPrice;
        if (debtTicket.paidPrice === debtTicket.totalPrice) {
            this.ticketRepositoryService.savePaidDebtTicket(debtTicket);
            this.ticketRepositoryService.deleteDebtTicket(debtTicket);
        } else {
            this.ticketRepositoryService.saveDebtTicket(debtTicket);
        }

        if (ticket.paidPrice === ticket.totalPrice) {
            this.ticketRepositoryService.saveOwnerPassedTicket(ticket);
            this.ticketRepositoryService.deleteTicket(ticket);
        } else {
            this.ticketRepositoryService.updateTicket(ticket);
        }
    }

    async paySingleDebtTicket(debtTicket: DebtTicket) {
        this.ticketRepositoryService.savePaidDebtTicket(debtTicket);
        this.ticketRepositoryService.deleteDebtTicket(debtTicket);
    }
}
