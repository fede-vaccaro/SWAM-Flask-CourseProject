import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { Ticket } from 'src/app/models/ticket';
import { LoginService } from 'src/app/services/login.service';
import { TicketService } from 'src/app/services/ticket.service';

@Component({
  selector: 'app-ticket-history',
  templateUrl: './ticket-history.component.html',
  styleUrls: ['./ticket-history.component.scss'],
})
export class TicketHistoryComponent implements OnInit {

  ticketStatus: string
  ticketHistoryObs: Observable<Ticket[]>
  passedTicketHistoryObs: Observable<Ticket[]>
  ticketHistory: Ticket[]
  passedTicketHistory: Ticket[]

  constructor(
    private router: Router,
    private ticketService: TicketService,
  ) {
    this.ticketStatus = "active"
  }

  async ngOnInit() {
    this.ticketHistoryObs = await this.ticketService.getTicketsOfLoggedUser()
    this.passedTicketHistoryObs = await this.ticketService.getPassedTicketsOfLoggedUser()
    this.ticketHistoryObs.subscribe(ticketHistory => this.ticketHistory = ticketHistory)
    this.passedTicketHistoryObs.subscribe(passedTicketHistory => this.passedTicketHistory = passedTicketHistory)
  }

  viewTicket(ticket: Ticket) {
    this.router.navigateByUrl("tabs/profile/show-ticket", { state: { ticket: ticket } });
  }

  statusChanged(status: string) {
    this.ticketStatus = status
  }

}
