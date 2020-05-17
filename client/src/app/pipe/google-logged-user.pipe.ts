import { Pipe, PipeTransform, Injectable } from '@angular/core';
import { User } from '../models/user';

@Pipe({
  name: 'loggedUser'
})
export class GoogleLoggedUserPipe implements PipeTransform {

  transform(loggedUser: firebase.User): User {
    let user: User = {
      name: loggedUser.displayName,
      email: loggedUser.email,
      photoUrl: loggedUser.photoURL,
    }
    return user
  }

}
