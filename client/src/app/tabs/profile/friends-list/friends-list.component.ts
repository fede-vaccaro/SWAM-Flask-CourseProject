import { Component, OnInit } from '@angular/core';
import { PopoverController, ToastController } from '@ionic/angular';
import { Observable } from 'rxjs';
import { User } from 'src/app/models/user';
import { UserFriends } from 'src/app/models/user-friends';
import { UserFriendsService } from 'src/app/services/user-friends.service';
import { AddFriendsPopoverComponent } from './add-friends-popover/add-friends-popover.component';
import { LoginService } from '../../../services/login.service';

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
    private popoverController: PopoverController,
    public toastController: ToastController,
  ) {
  }

  async ngOnInit() {
    this.userFriends = await this.userFriendsService.getUserFriends()
  }

  remove(friend: User) {
    this.userFriendsService.removeFriend(this.loggedUserEmail, friend, this.userFriends)
  }

  async add(ev: any) {
    const popover = await this.popoverController.create({
      component: AddFriendsPopoverComponent,
      event: ev,
      componentProps: { friend: undefined },
      cssClass: 'popover_class',
    });

    popover.present().then(() =>
      popover.onDidDismiss().then(async data => {
        let newFriend = data.data as User
        if (this.userFriends.friends === undefined || this.userFriends.friends.findIndex(friend => friend.email === newFriend.email) === -1) {
          await this.presentToast("Added correctly")
          await this.userFriendsService.addFriend(this.loggedUserEmail, newFriend.email, this.userFriends)
        } else {
          await this.presentToast("Can't add this user")
        }

      })
    )
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
