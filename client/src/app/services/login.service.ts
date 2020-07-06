import { HttpClient } from '@angular/common/http';
import { EventEmitter, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, first } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { User } from '../models/user';

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  currentUserSubject: BehaviorSubject<User>;
  currentUser: Observable<User>;

  loadingUser = new EventEmitter<boolean>()

  constructor(
    private http: HttpClient,
    private router: Router,
  ) {
    this.currentUserSubject = new BehaviorSubject<User>(JSON.parse(localStorage.getItem('currentUser')));
    this.currentUser = this.currentUserSubject.asObservable();
  }

  signin(user: User) {
    return this.http.post<any>(`${environment.serverUrl}/users`, user)
      .pipe(first())
  }

  login(user: User) {
    return this.http.post<any>(`${environment.serverUrl}/auth`, user)
      .pipe(
        map(user => {
          // store user details and jwt token in local storage to keep user logged in between page refreshes
          console.log(user);
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

  getLoggedUser(): User {
    return JSON.parse(localStorage.getItem('currentUser')) as User
  }

  getUser() {
    return this.currentUserSubject.value
  }

}
