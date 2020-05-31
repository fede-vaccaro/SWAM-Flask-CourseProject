import { Pipe, PipeTransform } from '@angular/core';
import { DebtTicket, DebtTicketFirebase } from '../models/ticket';

@Pipe({
  name: 'firebaseDebtTicket'
})
export class FirebaseDebtTicketPipe implements PipeTransform {

  transform(ticket: DebtTicket): DebtTicketFirebase {
    const firebaseTicket: DebtTicketFirebase = {
      id: ticket.id,
      owner: ticket.owner,
      timestamp: ticket.timestamp,
      participant: ticket.participant,
      products: ticket.products.map((obj) => { return Object.assign({}, obj) }),
      market: ticket.market,
      totalPrice: ticket.totalPrice,
      paidPrice: ticket.paidPrice,
    }
    return firebaseTicket;
  }
}
