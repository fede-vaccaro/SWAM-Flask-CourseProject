import { Pipe, PipeTransform } from '@angular/core';
import { UserFriends } from '../models/user-friends';

@Pipe({
  name: 'userFriends'
})
export class UserFriendsPipe implements PipeTransform {
  photoUrl: string = 'https://www.ilpost.it/wp-content/uploads/2019/05/pulp-fiction.jpg'
  transform(userFriendArray: any[]): any {
    let userFriends: UserFriends = { friends: [] }
    userFriendArray.forEach(user => userFriends.friends.push({ username: user.username, photoUrl: this.photoUrl }))
    return userFriends;
  }

}
