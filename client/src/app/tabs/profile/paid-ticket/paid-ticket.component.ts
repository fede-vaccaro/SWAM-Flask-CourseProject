import { Component, OnInit } from '@angular/core';
import { DebtTicket } from 'src/app/models/ticket';
import { TicketService } from 'src/app/services/ticket.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-paid-ticket',
  templateUrl: './paid-ticket.component.html',
  styleUrls: ['./paid-ticket.component.scss'],
})
export class PaidTicketComponent implements OnInit {

  paidTicketObs: Observable<DebtTicket[]>
  paidTickets: DebtTicket[]
  selectedTicketTimestamp: number

  constructor(
    private ticketService: TicketService
  ) { }

  async ngOnInit() {
    this.paidTicketObs = this.ticketService.getPaidTickets()
    this.paidTicketObs.subscribe(paidTickets => this.paidTickets = paidTickets)
  }

  getDate(date: string) {
    return new Date(date).toISOString()
  }

  getArray(object: any) {
    return Array.from([object])
  }

  selectTicket(ticket: DebtTicket) {
    if (this.selectedTicketTimestamp === ticket.timestamp)
      this.selectedTicketTimestamp = 0
    else
      this.selectedTicketTimestamp = ticket.timestamp
  }
}
