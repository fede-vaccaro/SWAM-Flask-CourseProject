import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { User } from 'src/app/models/user';
import { LoginService } from 'src/app/services/login.service';
import { TicketService } from 'src/app/services/ticket.service';
import { toggleDarkTheme } from 'src/util/utils';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-profile',
  templateUrl: 'profile.page.html',
  styleUrls: ['profile.page.scss']
})
export class ProfilePage {
  user: User = {
    username: "",
    photoUrl: "",
  }

  checked: boolean

  constructor(
    private router: Router,
    private loginService: LoginService,
    private ticketService: TicketService,
    public toastController: ToastController,
  ) {
  }

  ionViewWillEnter() {
    this.checked = localStorage.getItem('enableDark') === 'true'
    this.user = this.loginService.getLoggedUser()
  }

  logout() {
    this.loginService.logout()
  }

  async remove() {
    const isRemoved: boolean = await this.loginService.remove().toPromise()
    if (isRemoved) {
      this.presentToast('Account deleted!').then(() => this.logout())
    }
  }

  goToAddFriends() {
    this.router.navigateByUrl('tabs/profile/friends-list')
  }

  goToTicketHistory() {
    this.router.navigateByUrl('tabs/profile/ticket-history')
  }

  goToMyTicket() {
    this.router.navigateByUrl('tabs/profile/my-ticket')
  }

  goToPaidTicket() {
    this.router.navigateByUrl('tabs/profile/paid-ticket')
  }

  enableDark($event) {
    toggleDarkTheme($event.detail.checked)
    localStorage.setItem('enableDark', $event.detail.checked)
  }

  async presentToast(message: string, duration: number = 2000) {
    const toast = await this.toastController.create({
      message: message,
      position: "middle",
      duration: duration,
    });
    toast.present();
  }
}
