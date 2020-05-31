import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { User } from '../models/user';
import { UserFriends } from '../models/user-friends';
import { UserFriendsRepositoryService } from '../repositories/user-friends-repository.service';
import { UserRepositoryService } from '../repositories/user-repository.service';
import { first, map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { UserFriendsPipe } from '../pipe/user-friends.pipe';
import { LoginService } from './login.service';

@Injectable({
  providedIn: 'root'
})
export class UserFriendsService {

  constructor(
    private http: HttpClient,
    private userFriendsRepositoryService: UserFriendsRepositoryService,
    private userRepositoryService: UserRepositoryService,
    private userFriendsPipe: UserFriendsPipe,
    private loginService: LoginService,
  ) {
  }

  getUserFriends(): Observable<UserFriends> {
    const loggedUser: User = this.loginService.getLoggedUser()
    return this.http.get(`${environment.serverUrl}/users`)
      .pipe(map(userFriends => this.userFriendsPipe.transform(userFriends, loggedUser)))
  }

  async addFriend(userId: string, friendId: string, userFriends: UserFriends) {
    // let friend: User = await this.userRepositoryService.getUser(friendId)
    // let user: User = await this.userRepositoryService.getUser(userId)
    // let friendUserFriends = await this.getUserFriends().pipe(first()).toPromise()
    // userFriends.friends.push(friend)
    // friendUserFriends.friends.push(user)
    // this.userFriendsRepositoryService.updateUserFriends(userId, userFriends)
    // this.userFriendsRepositoryService.updateUserFriends(friendId, friendUserFriends)
  }

  async removeFriend(userId: string, friend: User, userFriends: UserFriends) {
    let index = userFriends.friends.findIndex(f => f.email === friend.email)
    userFriends.friends.splice(index, 1)
    this.userFriendsRepositoryService.updateUserFriends(userId, userFriends)
  }

  async searchFriend(friendId: string): Promise<User> {
    return await this.userRepositoryService.getUser(friendId)
  }
}
