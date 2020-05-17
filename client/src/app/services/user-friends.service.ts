import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { User } from '../models/user';
import { UserFriends } from '../models/user-friends';
import { UserFriendsRepositoryService } from '../repositories/user-friends-repository.service';
import { UserRepositoryService } from '../repositories/user-repository.service';
import { first } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class UserFriendsService {

  constructor(
    private userFriendsRepositoryService: UserFriendsRepositoryService,
    private userRepositoryService: UserRepositoryService,
  ) {
  }

  getUserFriends(userId: string): Observable<UserFriends> {
    return this.userFriendsRepositoryService.getUserFriends(userId)
  }

  async addFriend(userId: string, friendId: string, userFriends: UserFriends) {
    let friend: User = await this.userRepositoryService.getUser(friendId)
    let user: User = await this.userRepositoryService.getUser(userId)
    let friendUserFriends = await this.getUserFriends(friendId).pipe(first()).toPromise()
    userFriends.friends.push(friend)
    friendUserFriends.friends.push(user)
    this.userFriendsRepositoryService.updateUserFriends(userId, userFriends)
    this.userFriendsRepositoryService.updateUserFriends(friendId, friendUserFriends)
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
