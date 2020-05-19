import { HttpClient } from '@angular/common/http';
import { EventEmitter, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { auth } from 'firebase';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { User } from '../models/user';

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
    private router: Router,
  ) {
    this.currentUserSubject = new BehaviorSubject<User>(JSON.parse(localStorage.getItem('currentUser')));
    this.currentUser = this.currentUserSubject.asObservable();
  }

  login(user: User) {
    return this.http.post<any>(`${environment.serverUrl}/auth`, user)
      .pipe(
        map(user => {
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

  async getLoggedUser(): Promise<User> {//TODO remove this
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
