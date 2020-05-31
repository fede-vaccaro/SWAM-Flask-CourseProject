import { LoggedUserTicketPipe } from './logged-user-ticket.pipe';

describe('LoggedUserTicketPipe', () => {
  it('create an instance', () => {
    const pipe = new LoggedUserTicketPipe();
    expect(pipe).toBeTruthy();
  });
});
