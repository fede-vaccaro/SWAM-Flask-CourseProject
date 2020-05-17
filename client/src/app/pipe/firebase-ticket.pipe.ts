import { Pipe, PipeTransform } from '@angular/core';
import { Ticket, TicketFirebase } from '../models/ticket';

@Pipe({
  name: 'firebaseTicket'
})
export class FirebaseTicketPipe implements PipeTransform {

  transform(ticket: Ticket): TicketFirebase {
    const firebaseTicket: TicketFirebase = {
      id: ticket.id,
      owner: ticket.owner,
      timestamp: ticket.timestamp,
      participants: ticket.participants.map((obj) => { return Object.assign({}, obj) }),
      products: ticket.products.map((obj) => { return Object.assign({}, obj) }),
      market: ticket.market,
      totalPrice: ticket.totalPrice,
      paidPrice: ticket.paidPrice,
    }
    return firebaseTicket;
  }

}
