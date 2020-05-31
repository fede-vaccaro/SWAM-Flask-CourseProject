import {Component, OnInit} from '@angular/core';
import {NavParams, PopoverController} from '@ionic/angular';
import { User } from 'src/app/models/user';

@Component({
    selector: 'app-participants-popover',
    templateUrl: './participants-popover.component.html',
    styleUrls: ['./participants-popover.component.scss'],
})
export class ParticipantsPopoverComponent implements OnInit {

    participants: User[];

    constructor(private navParams: NavParams) {
        this.participants = this.navParams.get('participantList');
    }

    ngOnInit() {

    }

}
