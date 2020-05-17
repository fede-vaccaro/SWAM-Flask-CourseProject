import {User} from './user';

export class InboxMessage{
    id?: string;
    from: string;
    to: string;
    content: string;
    displayed: boolean;
}
