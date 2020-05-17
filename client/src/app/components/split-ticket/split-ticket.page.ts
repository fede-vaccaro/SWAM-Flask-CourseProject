import { Component, OnInit, ViewChild, DoCheck } from '@angular/core';
import { Product } from 'src/app/models/product';
import { Ticket } from 'src/app/models/ticket';
import { Router } from '@angular/router';
import { plainToClass } from 'class-transformer';
import { User } from 'src/app/models/user';
import {IonSelect, NavController, ToastController} from '@ionic/angular';
import { TicketService } from 'src/app/services/ticket.service';

@Component({
  selector: 'app-split-ticket',
  templateUrl: './split-ticket.page.html',
  styleUrls: ['./split-ticket.page.scss'],
})
export class SplitTicketPage implements OnInit {
  participants: User[]

  user: User
  ticket: Ticket = { products: [] }
  newProduct: Product;

  @ViewChild('mySelect', { static: true }) selectRef: IonSelect;



  constructor(
    private router: Router,
    private ticketService: TicketService,
    public toastController: ToastController,
    private navController: NavController,
  ) {
    this.newProduct = new Product()
  }

  ngOnInit() {
    try {
      this.ticket = plainToClass(Ticket, this.router.getCurrentNavigation().extras.state.ticket);
      this.participants = this.ticket.participants;
    } catch (error) {
    }
  }

  productIsReady(): boolean {
    return this.newProduct.name !== (undefined && '') && this.newProduct.price !== (undefined && '');
  }

  addProduct() {
    try {
      if (this.newProduct.quantity === undefined || null)
        this.newProduct.quantity = 1
      let newProduct = plainToClass(Product, this.newProduct);
      newProduct.participants = [];
      this.ticket.products.push(newProduct);
      this.ticket.totalPrice += newProduct.price * newProduct.quantity
      this.newProduct = new Product();
    } catch {
      console.log('ERROR');
    }
  }

  deleteProduct(index: number, $event) {
    this.ticket.totalPrice -= this.ticket.products[index].price * this.ticket.products[index].quantity
    this.ticket.products.splice(index, 1);
  }

  addParticipant(product: Product, event) {
    let user: User = event.target.value[0] as User;
    product.participants.push(user);
  }


  async saveTicket() {
    let productIndex: number = this.findProductThatNotContainParticipants()
    if (productIndex === -1)
      try {
        this.ticketService.save(this.ticket)
        this.presentToast("Saved correctly").then(
          () => {
            this.navController.back();
            // this.router.navigate(['tabs/status']);
          }
        )
      } catch (error) {
        console.log(error)
        await this.presentToast("Error while saving")
        await this.presentToast(error)
      }
    else {
      let message = "Item: '" + this.ticket.products[productIndex].name + "' not contain participants"
      this.presentToast(message)
    }
  }

  async presentToast(message: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000,
      position: "middle",
    });
    toast.present();
  }

  findProductThatNotContainParticipants(): number {
    return this.ticket.products.findIndex(product => product.participants.length === 0)
  }
}
