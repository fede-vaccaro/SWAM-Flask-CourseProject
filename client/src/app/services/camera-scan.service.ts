import { Injectable } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { Camera, PictureSourceType } from '@ionic-native/camera/ngx'
import { ActionSheetController, ToastController } from '@ionic/angular';
import * as Tesseract from 'tesseract.js'
import { Ticket } from 'src/app/models/ticket';
import { of } from 'rxjs';
import { first } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class CameraScanService {

  selectedPhoto: string
  scannedPhotoText: string
  scannedArray: string[] = []
  attend: boolean = false

  constructor(
    private actionSheetCtrl: ActionSheetController,
    private camera: Camera,
    public toastController: ToastController,
  ) { }

  ngOnInit() { }

  ionViewWillLeave() {
    this.toastController.dismiss()
  }

  scanFromPhoto(): Promise<Ticket> {
    return this.getPhoto(this.camera.PictureSourceType.CAMERA)
      .then(imageData =>
        `data:image/jpeg;base64,${imageData}`)
      .then(selectedPhoto => this.scanPhoto(selectedPhoto))
      .then(scannedArray => {
        return this.formatItems(scannedArray)
      })
  }

  async selectPhoto() {
    let actionSheet: HTMLIonActionSheetElement = await this.actionSheetCtrl.create({
      buttons: [
        {
          text: 'Use library',
          handler: () => {
            this.getPhoto(this.camera.PictureSourceType.PHOTOLIBRARY)
          }
        },
        {
          text: 'Take photo',
          handler: () => {
            this.getPhoto(this.camera.PictureSourceType.CAMERA)
          }
        },
        {
          text: 'Cancel',
          role: 'cancel'
        }
      ]
    })
    actionSheet.present()
  }

  scanPhoto(selectedPhoto) {
    this.attend = true
    let scannedArray: string[] = []
    return Tesseract.recognize(selectedPhoto).then(result => {
      result.data.lines.forEach(line => scannedArray.push(line.text))
      this.attend = false
      return scannedArray
    })
  }

  formatItems(a): Ticket {
    let ticket: Ticket = {
      products: []
    }
    let product
    let price
    a.forEach(element => {
      product = element.slice(0, element.length - 5)
      price = parseFloat(element.slice(element.length - 5, element.length).replace(',', '.'))
      if (!isNaN(price))
        ticket.products.push({
          name: product,
          price: price,
          quantity: 1,
          participants: []
        })
    });
    return ticket
  }

  async getPhoto(sourceType: PictureSourceType) {
    return await this.camera.getPicture({
      quality: 100,
      destinationType: this.camera.DestinationType.DATA_URL,
      sourceType: sourceType,
      allowEdit: true,
      saveToPhotoAlbum: false,
      correctOrientation: true,
    })
  }
}
