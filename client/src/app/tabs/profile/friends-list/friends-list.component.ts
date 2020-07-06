import { Component, OnInit } from '@angular/core';
import { PopoverController, ToastController } from '@ionic/angular';
import { Observable } from 'rxjs';
import { User } from 'src/app/models/user';
import { UserFriends } from 'src/app/models/user-friends';
import { UserFriendsService } from 'src/app/services/user-friends.service';
import {LoginService} from '../../../services/login.service';

@Component({
  selector: 'app-friends-list',
  templateUrl: './friends-list.component.html',
  styleUrls: ['./friends-list.component.scss'],
})
export class FriendsListComponent implements OnInit {
  userFriendsObs: Observable<UserFriends>
  userFriends: UserFriends
  loggedUserEmail: string
  constructor(
    private userFriendsService: UserFriendsService,
    private loginService: LoginService,
    public toastController: ToastController,
  ) {
  }

  async ngOnInit() {
    this.loggedUserEmail = await (await this.loginService.getLoggedUser()).email
    this.userFriendsObs = this.userFriendsService.getUserFriends()
    this.userFriendsObs.subscribe(userFriends => {
      this.userFriends = userFriends
    })
  }
}