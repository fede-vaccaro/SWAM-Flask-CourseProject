import { Pipe, PipeTransform } from '@angular/core';
import { DebtTicket } from '../models/ticket';

@Pipe({
  name: 'debtTicket'
})
export class DebtTicketPipe implements PipeTransform {

  constructor() { }

  transform(dbDebtTickets): DebtTicket[] {
    let debtTickets: DebtTicket[] = []
    dbDebtTickets.forEach(dbDebtTicket => {
      debtTickets.push(
        {
          id: dbDebtTicket.id,
          market: 'Generic',
          owner: dbDebtTicket.userFrom,
          products: dbDebtTicket.ticket.items,
          timestamp: dbDebtTicket.ticket.timestamp,
          totalPrice: dbDebtTicket.totalPrice,
          paidPrice: dbDebtTicket.paidPrice,
          participant: dbDebtTicket.userTo,
        }
      )
    });
    return debtTickets;
  }

}

