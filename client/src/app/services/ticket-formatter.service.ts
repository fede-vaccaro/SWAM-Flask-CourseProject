import { Injectable } from '@angular/core';
import { Ticket } from '../models/ticket';
import { Product } from '../models/product';

type ArrayPdfTicket = {
  "str": string
};
@Injectable({
  providedIn: 'root'
})
export class TicketFormatterService {
  constructor() { }

  formatPdfTicket(arrayPdfTicket) {
    let ticket: Ticket = {
      products: [],
      timestamp: undefined,
    }

    let productArray: string[] = []
    let priceArray: number[] = []

    let firstProductIndex: number
    let lastProductIndex: number
    let rightProductLimit: number
    let leftPriceLimit: number
    let rightPriceLimit: number

    let pdfTicket: ArrayPdfTicket[] = arrayPdfTicket.items

    pdfTicket.forEach((element, index) => {
      //Set limit
      if (element.str.includes("IVA") && element.str.includes("EURO")) {
        firstProductIndex = ++index
        rightProductLimit = element.str.indexOf("IVA")
        leftPriceLimit = element.str.indexOf("EURO") - 2
        rightPriceLimit = element.str.length
      }
      if (element.str.includes("TOTALE") && element.str.includes("EURO"))
        lastProductIndex = --index
    });


    //Parse value
    for (let index = firstProductIndex; index <= lastProductIndex; index++) {
      productArray.push(pdfTicket[index].str.slice(0, rightProductLimit).trim())
      priceArray.push(parseFloat(pdfTicket[index].str.slice(leftPriceLimit, rightPriceLimit).replace(",", ".")))
    }

    let prods: Product[] = new Array<Product>()

    //Clean from invalid and sales
    for (let index = 0; index < productArray.length; index++) {

      if (productArray[index].includes("SCONTO")) {
        priceArray[index - 1] -= priceArray[index]
        productArray.splice(index, 1)
        priceArray.splice(index, 1)
      }
    }

    //Final insert
    for (let index = 0; index < productArray.length; index++)
      ticket.products.push(
        {
          name: productArray[index],
          price: priceArray[index],
          quantity: 1,
          participants: []
        })

    ticket.totalPrice = 0
    for (let index = 0; index < ticket.products.length; index++) {
      if (typeof ticket.products[index].price === "number")
        ticket.totalPrice += ticket.products[index].price
      else
        ticket.products.splice(index--, 1)
    }

    ticket.products.forEach((product) => {
      let indexOfDuplicateProduct = prods.findIndex(prod => prod.name === product.name)
      if (indexOfDuplicateProduct !== -1) {
        prods[indexOfDuplicateProduct].quantity += 1
      } else {
        prods.push(product)
      }
    })
    ticket.timestamp = Date.now()
    ticket.products = prods
    ticket.paidPrice = 0

    return ticket
  }
}
