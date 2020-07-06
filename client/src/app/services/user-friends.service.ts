import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { User } from '../models/user';
import { UserFriends } from '../models/user-friends';
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
    private userFriendsPipe: UserFriendsPipe,
    private loginService: LoginService,
  ) {
  }

  getUserFriends(): Observable<UserFriends> {
    const loggedUser: User = this.loginService.getLoggedUser()
    return this.http.get(`${environment.serverUrl}/users`)
      .pipe(map(userFriends => this.userFriendsPipe.transform(userFriends, loggedUser)))
  }
}
