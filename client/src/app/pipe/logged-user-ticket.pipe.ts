import { Pipe, PipeTransform } from '@angular/core';
import { Ticket } from '../models/ticket';
import { LoginService } from '../services/login.service';
import { User } from '../models/user';

@Pipe({
  name: 'loggedUserTicket'
})
export class LoggedUserTicketPipe implements PipeTransform {

  constructor(private readonly loginService: LoginService) { }

  transform(dbTickets): Ticket[] {
    let tickets: Ticket[] = []
    dbTickets.forEach(dbTicket => {
      if (dbTicket.accountings.length !== 0)
        tickets.push(
          {
            id: dbTicket.id,
            market: 'Generic',
            owner: this.loginService.getLoggedUser(),
            products: dbTicket.items,
            timestamp: dbTicket.timestamp,
            totalPrice: dbTicket.items.reduce((i, j) => i + j.price * j.quantity, 0),
            participants: [dbTicket.accountings[0].userFrom].concat(dbTicket.accountings.map(acc => acc.userTo)),
          }
        )
    });

    return tickets;
  }

}
