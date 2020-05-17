import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { UserRepositoryService } from '../repositories/user-repository.service';
import { LoginService } from '../services/login.service';
import { LoginPage } from './login.page';
import { UserFriendsRepositoryService } from '../repositories/user-friends-repository.service';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild([{ path: '', component: LoginPage }]),
  ],
  declarations: [
    LoginPage,
  ],
  providers: [
    UserRepositoryService,
    UserFriendsRepositoryService,
    LoginService,
  ],
})
export class LoginPageModule { }
