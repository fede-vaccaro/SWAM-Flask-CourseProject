import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { LoginService } from 'src/app/services/login.service';
import { UserFriendsService } from 'src/app/services/user-friends.service';
import { AddFriendsPopoverComponent } from './friends-list/add-friends-popover/add-friends-popover.component';
import { FriendsListComponent } from './friends-list/friends-list.component';
import { ProfilePage } from './profile.page';
import { TicketPreviewComponent } from 'src/app/components/ticket-preview/ticket-preview.component';
import { RetrieveTicketService } from 'src/app/services/retrieve-ticket.service';
import { TicketHistoryComponent } from './ticket-history/ticket-history.component';
import { SplitTicketPage } from '../../components/split-ticket/split-ticket.page';
import { TicketProductComponent } from 'src/app/components/split-ticket/ticket-product/ticket-product.component';
import { PaidTicketComponent } from './paid-ticket/paid-ticket.component';
import { ExpandableComponent } from '../status/expandable/expandable.component';
import { MyTicketComponent } from './my-ticket/my-ticket.component';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    RouterModule.forChild([{ path: '', component: ProfilePage }])
  ],
  declarations: [
    ProfilePage,
    FriendsListComponent,
    AddFriendsPopoverComponent,
    TicketHistoryComponent,
    TicketPreviewComponent,
    SplitTicketPage,
    TicketProductComponent,
    PaidTicketComponent,
    MyTicketComponent,
    ExpandableComponent,
  ],
  providers: [
    UserFriendsService,
    LoginService,
    RetrieveTicketService,
  ]
})
export class ProfilePageModule { }
