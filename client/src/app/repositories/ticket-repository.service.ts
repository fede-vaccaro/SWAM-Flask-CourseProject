import { Injectable } from '@angular/core';
import { Ticket, DebtTicket } from '../models/ticket';
import { FirebaseTicketPipe } from '../pipe/firebase-ticket.pipe';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFirestoreCollection, AngularFirestoreDocument } from '@angular/fire/firestore/public_api';
import { environment } from 'src/environments/environment';
import { User } from '../models/user';
import { FirebaseDebtTicketPipe } from '../pipe/firebase-debt-ticket.pipe';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TicketRepositoryService {
  ticketCollection: AngularFirestoreCollection<Ticket>;
  ticketDebtCollection: AngularFirestoreCollection<DebtTicket>;
  paidTicketDebtCollection: AngularFirestoreCollection<DebtTicket>;

  constructor(
    private firestore: AngularFirestore,
    private firebaseTicketPipe: FirebaseTicketPipe,
    private firebaseDebtTicketPipe: FirebaseDebtTicketPipe,
  ) {
    this.ticketCollection = this.firestore.collection(environment.firebaseDB.ticket_history) as AngularFirestoreCollection<Ticket>;
    this.ticketDebtCollection = this.firestore.collection(environment.firebaseDB.debt_ticket) as AngularFirestoreCollection<DebtTicket>;
    this.paidTicketDebtCollection = this.firestore.collection(environment.firebaseDB.paid_debt_ticket) as AngularFirestoreCollection<DebtTicket>;
  }

  saveOwnerTicket(ticket: Ticket) {
    const firebaseTicket = this.firebaseTicketPipe.transform(ticket);
    this.ticketCollection.doc(ticket.owner.email).collection(environment.firebaseDB.owner_ticket).doc(ticket.timestamp.toString()).set(firebaseTicket).catch(error => {
      throw new Error(error);
    });
  }

  saveOwnerPassedTicket(ticket: Ticket) {
    const firebaseTicket = this.firebaseTicketPipe.transform(ticket);
    this.ticketCollection.doc(ticket.owner.email).collection(environment.firebaseDB.owner_passed_ticket).doc(ticket.timestamp.toString()).set(firebaseTicket).catch(error => {
      throw new Error(error);
    });
  }

  saveDebtTicket(ticket: DebtTicket) {
    const firebaseTicket = this.firebaseDebtTicketPipe.transform(ticket);
    this.ticketDebtCollection.doc(ticket.participant.email).collection(ticket.owner.email).doc(ticket.timestamp.toString()).set(firebaseTicket).catch(error => {
      throw new Error(error);
    });
  }

  savePaidDebtTicket(ticket: DebtTicket) {
    const firebaseTicket = this.firebaseDebtTicketPipe.transform(ticket);
    this.paidTicketDebtCollection.doc(ticket.participant.email).collection(ticket.owner.email).doc(ticket.timestamp.toString()).set(firebaseTicket).catch(error => {
      throw new Error(error);
    });
  }


  getDebtTicketsOf(debtor: User, owner: User): Observable<DebtTicket[]> {
    let debtTickets: AngularFirestoreCollection<DebtTicket> = this.ticketDebtCollection.doc(debtor.email).collection(owner.email) as AngularFirestoreCollection<DebtTicket>
    return debtTickets.valueChanges()
  }

  getPaidDebtTicketsOf(debtor: User, owner: User): Observable<DebtTicket[]> {
    let debtTickets: AngularFirestoreCollection<DebtTicket> = this.paidTicketDebtCollection.doc(debtor.email).collection(owner.email) as AngularFirestoreCollection<DebtTicket>
    return debtTickets.valueChanges()
  }

  getActiveTicketsOf(owner: User): Observable<Ticket[]> {
    let activeTickets: AngularFirestoreCollection<Ticket> = this.ticketCollection.doc(owner.email).collection(environment.firebaseDB.owner_ticket) as AngularFirestoreCollection<Ticket>
    return activeTickets.valueChanges()
  }

  getPassedTicketsOf(owner: User): Observable<Ticket[]> {
    let activeTickets: AngularFirestoreCollection<Ticket> = this.ticketCollection.doc(owner.email).collection(environment.firebaseDB.owner_passed_ticket) as AngularFirestoreCollection<Ticket>
    return activeTickets.valueChanges()
  }

  async getTicketOf(owner: User, ticketId: string): Promise<Ticket> {
    return await (await this.ticketCollection.doc(owner.email).collection(environment.firebaseDB.owner_ticket).doc(ticketId).ref.get()).data() as Ticket
  }

  updateTicket(ticket: Ticket) {
    let ticketDoc = this.ticketCollection.doc(ticket.owner.email).collection(environment.firebaseDB.owner_ticket).doc(ticket.timestamp.toString())
    ticketDoc.update(ticket)
  }

  updateDebtTicket(debtTicket: DebtTicket) {
    let debtTicketDoc = this.ticketCollection.doc(debtTicket.owner.email).collection(environment.firebaseDB.owner_ticket).doc(debtTicket.timestamp.toString())
    debtTicketDoc.update(debtTicket)
  }

  deleteTicket(ticket: Ticket) {
    let ticketDoc = this.ticketCollection.doc(ticket.owner.email).collection(environment.firebaseDB.owner_ticket).doc(ticket.timestamp.toString())
    ticketDoc.delete()
  }

  deleteDebtTicket(ticket: DebtTicket) {
    let savedDebtTicket = this.ticketDebtCollection.doc(ticket.participant.email).collection(ticket.owner.email).doc(ticket.timestamp.toString())
    savedDebtTicket.delete()
  }
}
