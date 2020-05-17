import { Injectable, NgZone, EventEmitter, Output } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { auth } from 'firebase';
import { User } from '../models/user';
import { GoogleLoggedUserPipe } from '../pipe/google-logged-user.pipe';
import { UserRepositoryService } from '../repositories/user-repository.service';
import { first, map } from 'rxjs/operators';
import { UserFriendsRepositoryService } from '../repositories/user-friends-repository.service';
import { Observable, BehaviorSubject } from 'rxjs';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
@Injectable({
  providedIn: 'root'
})
export class LoginService {
  currentUserSubject: BehaviorSubject<User>;
  currentUser: Observable<User>;

  googleProvider: auth.GoogleAuthProvider
  loadingUser = new EventEmitter<boolean>()

  constructor(
    private http: HttpClient,
    private angularFireAuth: AngularFireAuth,
    private router: Router,
    private ngZone: NgZone,
    private userRepository: UserRepositoryService,
    private userFriendRepository: UserFriendsRepositoryService,
    private googleLoggedUserPipe: GoogleLoggedUserPipe,
  ) {
    this.googleLoggedUserPipe = new GoogleLoggedUserPipe()

    this.currentUserSubject = new BehaviorSubject<User>(JSON.parse(localStorage.getItem('currentUser')));
    this.currentUser = this.currentUserSubject.asObservable();
  }

  login(user: User) {
    return this.http.post<any>(`${environment.serverUrl}/auth`, user)
      .pipe(
        map(user => {
          console.log(user)
          // store user details and jwt token in local storage to keep user logged in between page refreshes
          localStorage.setItem('currentUser', JSON.stringify(user));
          this.currentUserSubject.next(user);
          return user;
        })
      )
  }

  logout() {
    // remove user from local storage to log user out
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  async getLoggedUser(): Promise<User> {
    return this.currentUserSubject.value
  }

  getUser() {
    return this.currentUserSubject.value
  }

  test() {
    this.http.get(`${environment.serverUrl}/users`).pipe(
      map(user => {
        console.log(user)
      })).toPromise()
  }
}
