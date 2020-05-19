import { Pipe, PipeTransform } from '@angular/core';
import { UserFriends } from '../models/user-friends';
import { User } from '../models/user';

@Pipe({
  name: 'userFriends'
})
export class UserFriendsPipe implements PipeTransform {
  photoUrl: string = 'https://www.ilpost.it/wp-content/uploads/2019/05/pulp-fiction.jpg'
  transform(userFriendArray: any): UserFriends {
    let friends: User[] = []
    userFriendArray.forEach(user => friends.push({ username: user.username, photoUrl: this.photoUrl, id: user.id }))
    return { friends: friends };
  }

}
