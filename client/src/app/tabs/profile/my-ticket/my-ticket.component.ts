import { Component, OnInit } from '@angular/core';
import { DebtTicket } from 'src/app/models/ticket';
import { TicketService } from 'src/app/services/ticket.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-my-ticket',
  templateUrl: './my-ticket.component.html',
  styleUrls: ['./my-ticket.component.scss'],
})
export class MyTicketComponent implements OnInit {

  myTicketsObs: Observable<DebtTicket[]>
  myTickets: DebtTicket[]
  selectedTicketTimestamp: number

  constructor(
    private ticketService: TicketService
  ) { }

  async ngOnInit() {
    this.myTicketsObs = this.ticketService.getPartialTicketsOfLoggedUser()
    this.myTicketsObs.subscribe(myTickets => this.myTickets = myTickets)
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
