import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { IonSlides, ToastController } from '@ionic/angular';
import { Subject } from 'rxjs';
import { first } from 'rxjs/operators';
import { Ticket } from 'src/app/models/ticket';
import { User } from 'src/app/models/user';
import { CameraScanService } from 'src/app/services/camera-scan.service';
import { LoginService } from 'src/app/services/login.service';
import { PdfToTextService } from 'src/app/services/pdf-to-text.service';
import { TicketFormatterService } from 'src/app/services/ticket-formatter.service';

@Component({
  selector: 'app-import-ticket',
  templateUrl: 'import-ticket.page.html',
  styleUrls: ['import-ticket.page.scss']
})
export class ImportTicketPage {
  market: string
  marketObs: Subject<string> = new Subject()
  method: string
  methodObs: Subject<string> = new Subject()
  participants: User[]

  constructor(
    private loginService: LoginService,
    private pdfToTextService: PdfToTextService,
    private ticketFormatterService: TicketFormatterService,
    private router: Router,
    public toastController: ToastController,
    private cameraScanService: CameraScanService,
  ) {
    this.participants = new Array<User>()
  }

  ionViewWillEnter() {
    this.slides.slideTo(0)
    this.market = null
    this.method = null
    this.participants = []
    this.marketObs = new Subject()
    this.methodObs = new Subject()
    this.marketObs.pipe(first((market) => market !== undefined)).subscribe(market => {
      this.market = market
      this.slides.slideNext()
    })
    this.methodObs.pipe(first((method) => method !== undefined)).subscribe(method => {
      this.method = method
      this.slides.slideNext()
    })
  }



  @ViewChild(IonSlides, { static: false }) slides: IonSlides;
  slidePrev() {
    this.slides.slidePrev();
  }
  slideNext() {
    this.slides.slideNext();
  }

  importTicket() {
    let ticket: Ticket = {
      products: [],
      totalPrice: 0,
      paidPrice: 0,
      timestamp: Date.now(),
    }
    if (this.method === "manual")
      this.navigateToSplitTicket(ticket)

    if (this.method === "camera") {
      this.presentToast("Attend... scanning ticket...", 99999999)
      this.cameraScanService.scanFromPhoto().then(scannedTicket => {
        ticket.products = scannedTicket.products
        this.toastController.dismiss()
        this.navigateToSplitTicket(ticket)
      })
    }

    //await this.router.navigateByUrl('tabs/ticket/camera')
  }

  async readPdf($event) {
    let arrayPdfTicket = await this.pdfToTextService.getPDFText($event.target.files[0])
    if (await this.verifyMarketTicketValidity(arrayPdfTicket)) {
      let ticket: Ticket = this.ticketFormatterService.formatPdfTicket(arrayPdfTicket)
      await this.navigateToSplitTicket(ticket)
    }
  }

  async navigateToSplitTicket(ticket: Ticket) {
    this.loginService.getLoggedUser().then(owner => {
      ticket.owner = owner
      ticket.market = this.market
      ticket.participants = this.participants
      ticket.timestamp = Date.now()
      this.router.navigateByUrl("tabs/ticket/split", { state: { ticket: ticket } });
    })
  }

  hasMarketMethodAndParticipantsSelected() {
    return this.market !== (undefined && "") && this.method !== (undefined && "") && this.participants.length !== 0
  }

  hasMarketAndMethodSelected() {
    return this.market !== (undefined && "") && this.method !== (undefined && "")
  }

  async verifyMarketTicketValidity(arrayTicket) {
    let a: string = arrayTicket.items[4].str
    if (!a.toLowerCase().includes(this.market.toLowerCase())) {
      await this.presentToast("This is not " + this.market + " pdf ticket")
      return false
    }
    return true
  }

  async presentToast(message: string, duration: number = 2000) {
    const toast = await this.toastController.create({
      message: message,
      position: "middle",
      duration: duration,
    });
    toast.present();
  }

  slideOpts = {
    initialSlide: 0,
    speed: 300,
  };
}
