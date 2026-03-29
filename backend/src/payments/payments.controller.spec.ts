import { PaymentsController } from './payments.controller';
import { UserRole } from '../users/schemas/user.schema';

describe('PaymentsController', () => {
  let controller: PaymentsController;
  let paymentsService: {
    findByMember: jest.Mock;
  };

  beforeEach(() => {
    paymentsService = {
      findByMember: jest.fn(),
    };

    controller = new PaymentsController(paymentsService as any);
  });

  it('findMyPayments uses member identity', () => {
    const req = {
      user: { role: UserRole.MEMBER, userId: 'member-id', gymId: 'gym-id' },
    } as any;

    controller.findMyPayments(req);

    expect(paymentsService.findByMember).toHaveBeenCalledWith(
      'member-id',
      'gym-id',
    );
  });
});
