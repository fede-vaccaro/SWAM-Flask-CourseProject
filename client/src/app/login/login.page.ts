import { Component, OnInit } from '@angular/core';
import { LoginService } from '../services/login.service';
import { Router } from '@angular/router';
import { User } from '../models/user';
import { first } from 'rxjs/operators';

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

  clearForm() {
    this.username = null
    this.password = null
  }

  test(){
    this.loginService.test()
  }

}
