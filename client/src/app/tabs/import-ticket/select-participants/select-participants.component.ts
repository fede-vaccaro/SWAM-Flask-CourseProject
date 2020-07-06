
import { Component, OnInit, Input } from '@angular/core';
import { User } from 'src/app/models/user';
import { UserFriendsService } from 'src/app/services/user-friends.service';
import { UserFriends } from 'src/app/models/user-friends';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-select-participants',
  templateUrl: './select-participants.component.html',
  styleUrls: ['./select-participants.component.scss'],
})
export class SelectParticipantsComponent implements OnInit {
  userFriendsObs: Observable<UserFriends>
  userFriends: UserFriends
  @Input()
  participants: User[]

  constructor(
    private userFriendsService: UserFriendsService,
  ) {
  }

  async  ngOnInit() {
    this.userFriendsObs = this.userFriendsService.getUserFriends()
    this.userFriendsObs.subscribe(userFriends => {
      this.userFriends = userFriends
    })
  }

  updateParticipants(user: User) {
    let index: number = this.participants.indexOf(user)
    if (index === -1)
      this.participants.push(user)
    else
      this.participants.splice(index, 1)
  }

  isSelected(user: User): boolean {
    return this.participants.includes(user)
  }

}