import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { environment } from '../../../../environments/environment'

@Component({
  selector: 'app-select-market',
  templateUrl: './select-market.component.html',
  styleUrls: ['./select-market.component.scss'],
})
export class SelectMarketComponent implements OnInit {
  @Input()
  market: string
  @Output()
  marketChanged = new EventEmitter<string>()

  markets: Market[] = environment.markets

  constructor() { }

  ngOnInit() { }

  updateMarket(market: Market): void {
    this.market = market.name
    this.marketChanged.emit(this.market)
  }

  isSelected(market: Market): boolean {
    return this.market === market.name
  }
}

declare interface Market {
  name: string,
  icon: string,
}
