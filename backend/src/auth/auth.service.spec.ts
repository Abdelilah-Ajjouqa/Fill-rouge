import { AuthService } from './auth.service';
import { UserRole } from '../users/schemas/user.schema';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: { findOne: jest.Mock; findByEmail: jest.Mock };
  let membersService: { findById: jest.Mock; findByEmail: jest.Mock };

  beforeEach(() => {
    usersService = {
      findOne: jest.fn(),
      findByEmail: jest.fn(),
    };
    membersService = {
      findById: jest.fn(),
      findByEmail: jest.fn(),
    };

    service = new AuthService(
      usersService as any,
      membersService as any,
      {} as any,
    );
  });

  it('returns member profile with role', async () => {
    const memberDoc = {
      toObject: () => ({ _id: 'member-id', email: 'member@test.com' }),
    };

    membersService.findById.mockResolvedValue(memberDoc);

    const result = await service.getProfile('member-id', UserRole.MEMBER);

    expect(result).toEqual({
      _id: 'member-id',
      email: 'member@test.com',
      role: UserRole.MEMBER,
    });
  });

  it('returns user profile for non-member role', async () => {
    usersService.findOne.mockResolvedValue({ _id: 'user-id' });

    const result = await service.getProfile('user-id', UserRole.ADMIN);

    expect(usersService.findOne).toHaveBeenCalledWith('user-id');
    expect(result).toEqual({ _id: 'user-id' });
  });
});
