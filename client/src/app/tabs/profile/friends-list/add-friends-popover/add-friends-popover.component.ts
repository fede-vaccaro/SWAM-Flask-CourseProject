import { Component, OnInit } from '@angular/core';
import { NavParams, PopoverController } from '@ionic/angular';
import { User } from 'src/app/models/user';
import { UserFriendsService } from 'src/app/services/user-friends.service';

@Component({
  selector: 'app-add-friends-popover',
  templateUrl: './add-friends-popover.component.html',
  styleUrls: ['./add-friends-popover.component.scss'],
})
export class AddFriendsPopoverComponent implements OnInit {
  userId: string
  user: User = new User()
  showErrorMessage: boolean
  constructor(
    private userFriendsService: UserFriendsService,
    private popoverController: PopoverController,
  ) { }

  ngOnInit() {
  }

  async searchUser() {
    this.user = await this.userFriendsService.searchFriend(this.userId.toLowerCase())
    if (this.user) {
      this.popoverController.dismiss(this.user)
    }
  }

}
