import { UserFriendsPipe } from './user-friends.pipe';

describe('UserFriendsPipe', () => {
  it('create an instance', () => {
    const pipe = new UserFriendsPipe();
    expect(pipe).toBeTruthy();
  });
});
