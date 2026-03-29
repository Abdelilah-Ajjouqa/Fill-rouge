import { BadRequestException } from '@nestjs/common';
import { MembersController } from './members.controller';
import { UserRole } from '../users/schemas/user.schema';

describe('MembersController', () => {
  let controller: MembersController;
  let membersService: {
    create: jest.Mock;
    findAll: jest.Mock;
    findByCoach: jest.Mock;
  };

  beforeEach(() => {
    membersService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findByCoach: jest.fn(),
    };

    controller = new MembersController(membersService as any);
  });

  it('throws when super admin creates without gymId', () => {
    const req = { user: { role: UserRole.SUPER_ADMIN } } as any;
    const dto = {
      firstName: 'A',
      lastName: 'B',
      email: 'member@test.com',
      password: 'secret',
    } as any;

    expect(() => controller.create(req, dto)).toThrow(BadRequestException);
  });

  it('creates member with gymId from dto for super admin', () => {
    const req = { user: { role: UserRole.SUPER_ADMIN } } as any;
    const dto = {
      firstName: 'A',
      lastName: 'B',
      email: 'member@test.com',
      password: 'secret',
      gymId: 'gym-id',
    } as any;

    controller.create(req, dto);

    expect(membersService.create).toHaveBeenCalledWith(dto, 'gym-id');
  });

  it('findAll for coach uses findByCoach', () => {
    const req = {
      user: { role: UserRole.COACH, userId: 'coach-id', gymId: 'gym-id' },
    } as any;

    controller.findAll(req);

    expect(membersService.findByCoach).toHaveBeenCalledWith(
      'coach-id',
      'gym-id',
    );
  });
});
