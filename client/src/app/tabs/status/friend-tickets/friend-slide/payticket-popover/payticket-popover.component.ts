import { Component, OnInit } from '@angular/core';
import { NavParams, PopoverController } from '@ionic/angular';
import { DebtTicket } from '../../../../../models/ticket';
import { User } from '../../../../../models/user';
import { TicketService } from '../../../../../services/ticket.service';

@Component({
    selector: 'app-payticket-popover',
    templateUrl: './payticket-popover.component.html',
    styleUrls: ['./payticket-popover.component.scss'],
})
export class PayticketPopoverComponent{

    showSpinner = false;
    showSuccess = false;

    debtSelected: boolean;

    private ticket: DebtTicket;
    private friend: User;
    private parent

    constructor(private navParams: NavParams, private popoverController: PopoverController, private ticketService: TicketService) {
        this.ticket = navParams.get('ticket');
        this.friend = navParams.get('friend');
        this.debtSelected = navParams.get('debtSelected');
    }

    pay() {
        this.showSpinner = true;
        this.showSpinner = false;
        this.showSuccess = true;
        this.ticketService.paySingleDebtTicket(this.ticket);

        // send notification
        // const ticketDate = new Date(this.ticket.timestamp);
        // let content: string;
        // if (this.debtSelected) {
        //     content = 'The ticket ' + ticketDate.getDate() + '/' + ticketDate.getMonth() + '/' + ticketDate.getFullYear() + ' has been paid for ' + this.ticket.totalPrice + '€';
        // } else {
        //     content = 'The ticket ' + ticketDate.getDate() + '/' + ticketDate.getMonth() + '/' + ticketDate.getFullYear() + ' has been marked as paid, for ' + this.ticket.totalPrice + '€';
        // }
        //this.messagesRepositoryService.sendMessageFromLoggedUser(this.friend, content);
        this.parent.popoverController.dismiss()
        this.parent.ngOnInit()
    }
}
