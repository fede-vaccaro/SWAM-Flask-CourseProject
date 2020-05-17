import {Component, OnInit} from '@angular/core';
import {InboxMessage} from '../../../models/inbox-message';
import {Observable} from 'rxjs';
import {MessagesRepositoryService} from '../../../repositories/messages-repository.service';
import {PopoverController} from '@ionic/angular';

@Component({
    selector: 'app-notification-popover',
    templateUrl: './notification-popover.component.html',
    styleUrls: ['./notification-popover.component.scss'],
})
export class NotificationPopoverComponent implements OnInit {

    messagesObs: Observable<InboxMessage[]>;
    messages: InboxMessage[];

    constructor(private messagesRepositoryService: MessagesRepositoryService, private popoverController: PopoverController) {
    }

    ngOnInit() {
        this.messagesRepositoryService.retrieveLoggedUserInbox().then(obs => {
            this.messagesObs = obs;
            this.messagesObs.subscribe(messagesArray => {
                this.messages = messagesArray.reverse();
                // messagesArray.forEach(m => this.messagesRepositoryService.setMessageAsDisplayed(m));
            });
        });

    }

    ionViewWillLeave() {
        if (this.messages !== undefined) {
            this.messages.forEach(m => this.messagesRepositoryService.setMessageAsDisplayed(m));
        }
    }

    delete(message: InboxMessage) {
        this.messagesRepositoryService.deleteMessageOfReceiver(message);
    }
}
