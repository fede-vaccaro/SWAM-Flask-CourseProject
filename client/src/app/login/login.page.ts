import { Component, OnInit } from '@angular/core';
import { LoginService } from '../services/login.service';
import { Router } from '@angular/router';
import { User } from '../models/user';
import { first } from 'rxjs/operators';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  loadingUser: boolean = true
  username: string
  password: string

  constructor(
    public toastController: ToastController,
    private loginService: LoginService,
    private router: Router,
  ) { }

  ngOnInit() { }

  login() {
    const user: User = { username: this.username, password: this.password }
    this.loginService.login(user).pipe(first()).subscribe(a => {
      this.clearForm()
      this.router.navigateByUrl('tabs/status')
    },
      err => console.log(err.error))
  }

  signin() {
    const user: User = { username: this.username, password: this.password }
    this.loginService.signin(user).pipe(first()).subscribe(user => {
      this.clearForm()
      this.presentToast(`Success! You are now signed is as: ${user.username}`)
    },
      err => {
        this.clearForm()
        this.presentToast(`An error occurred!`)
      })
  }

  clearForm() {
    this.username = null
    this.password = null
  }

  async presentToast(message: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000,
      position: "middle",
    });
    toast.present();
  }

}
