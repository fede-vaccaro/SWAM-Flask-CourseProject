import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { IonSelect, PopoverController } from '@ionic/angular';
import { Product } from 'src/app/models/product';
import { User } from 'src/app/models/user';
import { ParticipantsPopoverComponent } from './participants-popover/participants-popover.component';

@Component({
  selector: 'app-ticket-product',
  templateUrl: './ticket-product.component.html',
  styleUrls: ['./ticket-product.component.scss'],
})
export class TicketProductComponent implements OnInit {

  constructor(private popoverController: PopoverController) {
  }

  @ViewChild('mySelect', { static: false }) selectRef: IonSelect;

  @Input()
  product: Product = new Product()
  @Input()
  participants: User[]

  @Output()
  deleteProductChange = new EventEmitter<boolean>()

  @Input()
  viewMode = false;

  selected: boolean = false

  ngOnInit() {
  }

  openSelect() {
    this.selectRef.open();
  }

  compareUser = (user1: User, users: User[]) => {
    if (Array.isArray(users)) {
      return users.findIndex(user => user.id === user1.id) !== -1
    }
  };

  select() {
    this.selected = this.selected ? false : true
  }

  deleteProduct() {
    this.deleteProductChange.emit(true)
  }



  async presentPopover(ev: any, participants: User[]) {
    const popover = await this.popoverController.create({
      component: ParticipantsPopoverComponent,
      event: ev,
      componentProps: { participantList: participants },
      translucent: true
    });
    return await popover.present();
  }



}
