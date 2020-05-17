import { Component, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { Router } from '@angular/router';
import { IonSlides, PopoverController } from '@ionic/angular';
import { Observable } from 'rxjs';
import { User } from '../../../models/user';
import { UserFriends } from '../../../models/user-friends';
import { LoginService } from '../../../services/login.service';
import { UserFriendsService } from '../../../services/user-friends.service';
import { FriendSlideComponent } from './friend-slide/friend-slide.component';
import { PayPopoverComponent } from './pay-popover/pay-popover.component';

@Component({
    selector: 'app-friend-tickets',
    templateUrl: './friend-tickets.component.html',
    styleUrls: ['./friend-tickets.component.scss'],
})
export class FriendTicketsComponent implements OnInit {

    private loggedUser: User;
    private userFriends: UserFriends;
    private userFriendsObs: Observable<UserFriends>;

    private slideOpts = {
        initialSlide: 0,
        speed: 400,
    };
    private startingUserIndex: any;
    private selectedFriend: User;

    private total = 0.0;

    displayedDebt: string;
    displayedCredit: string;
    displayedTotal: string;

    @ViewChildren('friendSlide') slideList: QueryList<FriendSlideComponent>;
    @ViewChild(IonSlides, { static: false }) slides: IonSlides;

    private debt: number;
    private credit: number;


    constructor(private router: Router, private loginService: LoginService, private userFriendsService: UserFriendsService, private popoverController: PopoverController) {
        this.startingUserIndex = router.getCurrentNavigation().extras.state ? router.getCurrentNavigation().extras.state.friendIndex : 0;
        this.slideOpts.initialSlide = this.startingUserIndex;
    }


    async ngOnInit() {
        try {
            let userFriends = await this.userFriendsService.getUserFriends();
            if (userFriends !== undefined) {
                this.userFriends = userFriends;
            } else {
                this.userFriends = { friends: [] };
            }
        } catch (e) {
            this.router.navigateByUrl('tabs/status');
        }
    }

    getInfoFromCurrentSlide() {
        this.slides.getActiveIndex().then(i => {
            const friendSlideComponent = this.slideList.toArray()[i];
            this.selectedFriend = friendSlideComponent.getFriend();
            console.log(this.selectedFriend);

            friendSlideComponent.debtCreditTotalSubject.subscribe(dct => {
                this.total = dct.credit - dct.debt;
                this.debt = dct.debt;
                this.credit = dct.credit;

                this.displayedDebt = dct.debt.toFixed(2);
                this.displayedCredit = dct.credit.toFixed(2);
                this.displayedTotal = (dct.credit - dct.debt).toFixed(2);
            });
        });
    }

    async presentPopover(ev: any) {
        const popover = await this.popoverController.create({
            component: PayPopoverComponent,
            event: ev,
            componentProps: { total: this.total, debt: this.debt, credit: this.credit, friend: this.selectedFriend },
            translucent: true,
        });
        return await popover.present();
    }


}
