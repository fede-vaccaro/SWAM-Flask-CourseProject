import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { User } from '../models/user';
import { HttpClientModule, HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class UserRepositoryService {
  usersCollection: AngularFirestoreCollection<User>
  userDoc: AngularFirestoreDocument<User>
  users: Observable<User[]>

  constructor(
    private firestore: AngularFirestore,
    private http: HttpClient,
  ) {
    this.usersCollection = this.firestore.collection(environment.firebaseDB.users) as AngularFirestoreCollection<User>

    this.users = this.usersCollection.snapshotChanges().pipe(
      map(actions => actions.map(a => {
        const data = a.payload.doc.data() as User
        const id = a.payload.doc.id
        return { id, ...data }
      }))
    )
  }

  async addUser(user: User) {
    await this.usersCollection.doc(user.email).set(user);
  }

  getUsers(): Observable<User[]> {
    this.http.get('')
    return this.usersCollection.valueChanges();
  }

  async getUser(id: string): Promise<User> {
    return await (await this.firestore.collection(environment.firebaseDB.users).doc(id).ref.get()).data() as User
  }

  async userExists(id: string): Promise<boolean> {
    return (await this.firestore.collection(environment.firebaseDB.users).doc(id).ref.get()).exists
  }

  updateUser(user: User) {
    this.userDoc = this.firestore.doc(`${environment.firebaseDB.users}&${user.id}`)
    this.userDoc.update(user)
  }

  deleteUser(user: User) {
    this.userDoc = this.firestore.doc(`${environment.firebaseDB.users}&${user.id}`)
    this.userDoc.delete()
  }
}
