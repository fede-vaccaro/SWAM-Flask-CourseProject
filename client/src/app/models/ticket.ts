import { User } from './user';
import { Product, DebtProduct } from './product';

export class Ticket {
    id?: string;
    timestamp?: number;
    owner?: User;
    products?: Product[];
    participants?: User[];
    market?: string;
    totalPrice?: number;
    paidPrice?: number;
}

export class DebtTicket {
    id?: string;
    timestamp?: number;
    owner?: User;
    products: DebtProduct[];
    participant: User;
    market?: string;
    totalPrice?: number;
    paidPrice?: number;
}
