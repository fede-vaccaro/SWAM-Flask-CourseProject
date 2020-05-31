import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PopoverController } from '@ionic/angular';
import { Observable } from 'rxjs';
import { User } from 'src/app/models/user';
import { UserFriends } from 'src/app/models/user-friends';
import { UserFriendsService } from 'src/app/services/user-friends.service';
import { InboxMessage } from '../../models/inbox-message';
import { DebtTicket } from '../../models/ticket';
import { MessagesRepositoryService } from '../../repositories/messages-repository.service';
import { LoginService } from '../../services/login.service';
import { TicketService } from '../../services/ticket.service';
import { NotificationPopoverComponent } from './notification-popover/notification-popover.component';


@Component({
    selector: 'app-status',
    templateUrl: './status.page.html',
    styleUrls: ['./status.page.scss'],
})

export class StatusPage {
    userFriendsObs: Observable<UserFriends>;
    userFriends: UserFriends;

    debts = {};
    credits = {};
    total = {};

    noFriends = false;
    user: User;

    newMessages = 0;

    private ticketsByFriendObs: Observable<DebtTicket[]>;
    private ticketsByMeObs: Observable<DebtTicket[]>;
    //private inboxMessagesObs: Observable<InboxMessage[]>;


    constructor(private userFriendsService: UserFriendsService,
        private ticketService: TicketService,
        private loginService: LoginService,
        private router: Router,
        private popoverController: PopoverController,
        private messagesRepositoryService: MessagesRepositoryService) {
    }

    updateTotals(user: User) {
        this.total[user.email] = 0.0;
        this.total[user.email] -= parseFloat(this.debts[user.email]);
        this.total[user.email] += parseFloat(this.credits[user.email]);
        this.total[user.email] = this.total[user.email].toFixed(2);
    }

    async ionViewWillEnter() {
        this.user = this.loginService.getLoggedUser();
        this.userFriendsObs = this.userFriendsService.getUserFriends();
        this.userFriendsObs.subscribe(userFriends => {
                this.userFriends = userFriends;
                for (const user of this.userFriends.friends) {
                    this.ticketsByFriendObs = this.ticketService.getDebtTicketsOf(user);
                    this.ticketsByFriendObs.subscribe(tArr => {
                        this.debts[user.email] = 0.0;
                        tArr.forEach(t => this.debts[user.email] += (t.totalPrice - t.paidPrice));
                        this.debts[user.email] = this.debts[user.email].toFixed(2);

                        this.updateTotals(user);
                    });

                    this.ticketsByMeObs = this.ticketService.getCreditTicketsFrom(user);
                    this.ticketsByMeObs.subscribe(tArr => {
                        this.credits[user.email] = 0.0;

                        tArr.forEach(t => this.credits[user.email] += (t.totalPrice - t.paidPrice));
                        this.credits[user.email] = this.credits[user.email].toFixed(2);

                        this.updateTotals(user);
                    });

                }
                this.noFriends = this.userFriends.friends.length === 0;
        });
        // this.inboxMessagesObs = await this.messagesRepositoryService.retrieveLoggedUserInbox();
        // this.inboxMessagesObs.subscribe(mArr => {
        //     this.newMessages = 0;
        //     mArr.forEach(m => (this.newMessages += (m.displayed ? 0 : 1)));
        // });
    }

    goToFriendTickets(friend: User) {
        console.log(friend);
        this.router.navigateByUrl('tabs/status/friend-tickets', { state: { friend: friend } });
    }

    async presentNotificationPopover(ev: any) {
        const popover = await this.popoverController.create({
            component: NotificationPopoverComponent,
            event: ev,
            translucent: true,
        });

        return popover.present();
    }

}