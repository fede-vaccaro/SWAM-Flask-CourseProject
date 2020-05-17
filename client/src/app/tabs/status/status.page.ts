import {Component, OnInit, ViewChild} from '@angular/core';
import {User} from 'src/app/models/user';
import {UserFriendsService} from 'src/app/services/user-friends.service';
import {AccountingService} from '../../services/accounting.service';
import {UserFriends} from 'src/app/models/user-friends';
import {Observable} from 'rxjs';
import {LoginService} from '../../services/login.service';
import {Router} from '@angular/router';
import {IonSlides, PopoverController} from '@ionic/angular';
import {TicketService} from '../../services/ticket.service';
import {DebtTicket} from '../../models/ticket';
import {NotificationService} from '../../services/notification.service';
import {PayPopoverComponent} from './friend-tickets/pay-popover/pay-popover.component';
import {NotificationPopoverComponent} from './notification-popover/notification-popover.component';
import {InboxMessage} from '../../models/inbox-message';
import {MessagesRepositoryService} from '../../repositories/messages-repository.service';


@Component({
    selector: 'app-status',
    templateUrl: './status.page.html',
    styleUrls: ['./status.page.scss'],
})

export class StatusPage implements OnInit {
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
    private inboxMessagesObs: Observable<InboxMessage[]>;


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

    async ngOnInit() {
        // federico.vaccaro@stud.unifi.it
        // palazzolo1995@gmail.com
        // this.user = {name: 'PALAZZOLO', email: 'palazzolo1995@gmail.com'};// await this.loginService.getLoggedUser();
        this.user = await this.loginService.getLoggedUser();
        this.userFriendsObs = this.userFriendsService.getUserFriends(this.user.email);
        this.userFriendsObs.subscribe(async userFriends => {
            if (userFriends !== undefined) {
                this.userFriends = userFriends;
                for (const user of this.userFriends.friends) {


                    this.ticketsByFriendObs = await this.ticketService.getDebtTicketsOf(user);
                    this.ticketsByFriendObs.subscribe(tArr => {
                        this.debts[user.email] = 0.0;

                        tArr.forEach(t => this.debts[user.email] += (t.totalPrice - t.paidPrice));
                        this.debts[user.email] = this.debts[user.email].toFixed(2);

                        this.updateTotals(user);
                    });

                    this.ticketsByMeObs = await this.ticketService.getCreditTicketsFrom(user);
                    this.ticketsByMeObs.subscribe(tArr => {
                        this.credits[user.email] = 0.0;

                        tArr.forEach(t => this.credits[user.email] += (t.totalPrice - t.paidPrice));
                        this.credits[user.email] = this.credits[user.email].toFixed(2);

                        this.updateTotals(user);
                    });

                }
                this.noFriends = this.userFriends.friends.length === 0;
            }
        });
        this.inboxMessagesObs = await this.messagesRepositoryService.retrieveLoggedUserInbox();
        this.inboxMessagesObs.subscribe(mArr => {
            this.newMessages = 0;
            mArr.forEach(m => (this.newMessages += (m.displayed ? 0 : 1)));
        });
    }

    goToFriendTicket(index) {
        this.router.navigateByUrl('tabs/status/friend-tickets', {state: {friendIndex: index}});
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
