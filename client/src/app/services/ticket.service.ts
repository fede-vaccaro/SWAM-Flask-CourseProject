import {Injectable} from '@angular/core';
import {Ticket, DebtTicket} from '../models/ticket';
import {TicketRepositoryService} from '../repositories/ticket-repository.service';
import {environment} from 'src/environments/environment';
import {User} from '../models/user';
import {LoginService} from './login.service';
import {Observable} from 'rxjs';
import {UserFriendsService} from './user-friends.service';
import {first, takeLast} from 'rxjs/operators';
import {UserFriends} from '../models/user-friends';
import {tick} from '@angular/core/testing';
import {MessagesRepositoryService} from '../repositories/messages-repository.service';
import {InboxMessage} from '../models/inbox-message';

@Injectable({
    providedIn: 'root'
})
export class TicketService {

    constructor(
        private ticketRepositoryService: TicketRepositoryService,
        private loginService: LoginService,
        private userFriendsService: UserFriendsService,
        private messagesRepositoryService: MessagesRepositoryService,
    ) {
    }

    private initializeDebtTickets(ticket: Ticket): Map<string, DebtTicket> {
        const debtTicket: Map<string, DebtTicket> = new Map<string, DebtTicket>();

        ticket.participants.forEach(participant => debtTicket.set(participant.email, {
            id: ticket.id,
            timestamp: ticket.timestamp,
            owner: ticket.owner,
            market: ticket.market,
            participant,
            products: [],
            totalPrice: 0,
            paidPrice: 0,
        }));

        return debtTicket;
    }

    private split(ticket: Ticket, debtTicket: Map<string, DebtTicket>) {
        ticket.products.forEach(product => {
            const participantPrice = product.price / product.participants.length;

            product.participants.forEach(participant => {
                const participantDebtTicket: DebtTicket = debtTicket.get(participant.email);
                participantDebtTicket.products.push({
                    name: product.name,
                    price: participantPrice,
                    quantity: product.quantity,
                });
                participantDebtTicket.totalPrice += product.quantity * participantPrice;
            });
        });
        return debtTicket;
    }

    save(ticket: Ticket) {
        let debtTickets: Map<string, DebtTicket> = this.initializeDebtTickets(ticket);
        debtTickets = this.split(ticket, debtTickets);

        this.ticketRepositoryService.saveOwnerTicket(ticket);

        debtTickets.forEach(debtTicket => {
            this.ticketRepositoryService.saveDebtTicket(debtTicket);
            if(debtTicket.participant.email !== debtTicket.owner.email) {
                const content = 'You have a new debt ticket for the amount of ' + debtTicket.totalPrice.toFixed(2) + '€';
                this.messagesRepositoryService.sendMessageFromLoggedUser(debtTicket.participant, content);
            }
        });
    }

    getTicketsOfLoggedUser(): Promise<Observable<Ticket[]>> {
        return this.loginService.getLoggedUser()
            .then(loggedUser => {
                return this.ticketRepositoryService.getActiveTicketsOf(loggedUser);
            });
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

    getCreditTicketsFrom(user: User): Promise<Observable<DebtTicket[]>> {
        return this.loginService.getLoggedUser()
            .then(loggedUser => {
                return this.ticketRepositoryService.getDebtTicketsOf(user, loggedUser);
            });
    }

    async getPaidTicketsOfLoggedUser(): Promise<DebtTicket[]> {
        const loggedUser: User = await this.loginService.getLoggedUser();
        const loggedUserFriends: UserFriends = await this.userFriendsService.getUserFriends(loggedUser.email).pipe(first()).toPromise();
        return await Promise.all(
            loggedUserFriends.friends.map(
                async friend => {
                    return await this.ticketRepositoryService.getPaidDebtTicketsOf(loggedUser, friend).pipe(first()).toPromise();
                })).then(paidTicketFriend => {
            return [].concat.apply([], paidTicketFriend) as DebtTicket[];
        });
    }

    async getPartialTicketsOfLoggedUser(): Promise<DebtTicket[]>{
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
