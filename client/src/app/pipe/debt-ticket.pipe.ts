import { Pipe, PipeTransform } from '@angular/core';
import { DebtTicket } from '../models/ticket';

@Pipe({
  name: 'debitTicket'
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
          products: dbDebtTicket.ticketRef.items,
          timestamp: dbDebtTicket.ticketRef.timestamp,
          totalPrice: dbDebtTicket.totalPrice,
          participant: dbDebtTicket.userTo,
        }
      )
    });

    return debtTickets;
  }

}

