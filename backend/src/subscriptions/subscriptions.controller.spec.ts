import { SubscriptionsController } from './subscriptions.controller';
import { UserRole } from '../users/schemas/user.schema';

describe('SubscriptionsController', () => {
  let controller: SubscriptionsController;
  let subscriptionsService: {
    findByMember: jest.Mock;
    findAll: jest.Mock;
  };

  beforeEach(() => {
    subscriptionsService = {
      findByMember: jest.fn(),
      findAll: jest.fn(),
    };

    controller = new SubscriptionsController(subscriptionsService as any);
  });

  it('findMySubscriptions uses member identity', () => {
    const req = {
      user: { role: UserRole.MEMBER, userId: 'member-id', gymId: 'gym-id' },
    } as any;

    controller.findMySubscriptions(req);

    expect(subscriptionsService.findByMember).toHaveBeenCalledWith(
      'member-id',
      'gym-id',
    );
  });

  it('findAll for super admin uses query gymId', () => {
    const req = { user: { role: UserRole.SUPER_ADMIN } } as any;

    controller.findAll(req, 'gym-id');

    expect(subscriptionsService.findAll).toHaveBeenCalledWith('gym-id');
  });
});
