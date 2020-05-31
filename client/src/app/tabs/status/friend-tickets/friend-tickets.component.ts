import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { IonSegment, IonSlides, PopoverController } from '@ionic/angular';
import { User } from '../../../models/user';
import { LoginService } from '../../../services/login.service';
import { UserFriendsService } from '../../../services/user-friends.service';
import { FriendSlideComponent } from './friend-slide/friend-slide.component';
import { PayPopoverComponent } from './pay-popover/pay-popover.component';



@Component({
    selector: 'app-friend-tickets',
    templateUrl: './friend-tickets.component.html',
    styleUrls: ['./friend-tickets.component.scss'],
})
export class FriendTicketsComponent implements AfterViewInit {

    constructor(private router: Router, private loginService: LoginService, private userFriendsService: UserFriendsService, private popoverController: PopoverController) {
    }

    private loggedUser: User;

    private slideOpts = {
        initialSlide: 0,
        speed: 400,
        onlyExternal: false,
    };
    private friend: User;

    private total = 0.0;

    displayedDebt: string;
    displayedCredit: string;
    displayedTotal: string;

    @ViewChild('friendSlide') friendSlide: FriendSlideComponent;
    @ViewChild('slides') slides: IonSlides;
    @ViewChild(IonSegment) segment: IonSegment;


    private debt: number;
    private credit: number;
    hideArrows = true;

    didInit = false;


    async ngAfterViewInit() {
        try {
            this.friend = this.router.getCurrentNavigation().extras.state.friend;
        } catch (e) {
            this.router.navigateByUrl('tabs/status');
        }

        this.loggedUser = this.loginService.getLoggedUser();
        this.didInit = true;
    }

    async changeSlideFromSegment(ev: any) {
        const where = parseInt(ev.detail.value, 10);
        console.log('Going with segment to ', where);
        await this.slides.slideTo(where);
    }

    changeSegmentFromSlide(ev: any) {
        let currentIndex: string;
        this.slides.getActiveIndex().then(i => {
            currentIndex = i.toString();
            console.log('Going with slide to: ', currentIndex);
            console.log(this.segment);
            this.segment.value = currentIndex;
        });
    }

    ionViewDidEnter() {
        this.getInfoFromCurrentSlide();
    }

    getInfoFromCurrentSlide() {
        const friendSlideComponent = this.friendSlide;

        if (this.friend) {
            friendSlideComponent.debtCreditTotalSubject.subscribe(dct => {
                this.total = dct.credit - dct.debt;
                this.debt = dct.debt;
                this.credit = dct.credit;

                this.displayedDebt = dct.debt.toFixed(2);
                this.displayedCredit = dct.credit.toFixed(2);
                this.displayedTotal = (dct.credit - dct.debt).toFixed(2);
            });
        }
    }

    async presentPopover(ev: any) {
        const popover = await this.popoverController.create({
            component: PayPopoverComponent,
            event: ev,
            componentProps: { total: this.total, debt: this.debt, credit: this.credit, friend: this.friend, parent: this, friendSlide: this.friendSlide },
            translucent: true,
        });
        return await popover.present();
    }


}