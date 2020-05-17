import { Injectable } from '@angular/core';
import * as PDFJS from 'pdfjs-dist';

@Injectable({
  providedIn: 'root'
})
export class PdfToTextService {
  constructor() { }

  getPageText = async (pdf, pageNo: number) => {
    const page = await pdf.getPage(pageNo);
    const tokenizedText = await page.getTextContent();
    return tokenizedText;
    const pageText = tokenizedText.items.map(token => token.str).join("");
    return pageText;
  };

  async getPDFText(source) {
    const app = this
    let fileReader = new FileReader()

    let toUint8Array = new Promise((res, rej) => {
      fileReader.onload = async function () {
        let encodedPdf: any = fileReader.result//TODO any???
        let uint8Array: Uint8Array = new Uint8Array(encodedPdf);
        res(uint8Array)
      }
      fileReader.readAsArrayBuffer(source)
    })

    let uint8Array = await toUint8Array
    let pdf = await PDFJS.getDocument(uint8Array).promise
    let convertedPdf: string = await app.getPageText(pdf, 1)
    return convertedPdf
  };
}

