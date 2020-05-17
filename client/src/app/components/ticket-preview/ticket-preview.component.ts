import { Component, OnInit, Input } from '@angular/core';
import { Ticket } from 'src/app/models/ticket';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-ticket-preview',
  templateUrl: './ticket-preview.component.html',
  styleUrls: ['./ticket-preview.component.scss'],
})
export class TicketPreviewComponent implements OnInit {
  @Input()
  ticket: Ticket
  markets = environment.markets

  constructor() { }

  ngOnInit() {
  }

  getMarketIcon(market: string): string {
    return this.markets.find(market => market.name === this.ticket.market).icon
  }

  getDate(date: string) {
    return new Date(date).toISOString()
  }
}
