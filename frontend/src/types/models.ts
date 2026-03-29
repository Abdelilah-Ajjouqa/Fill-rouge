export interface Hall {
  _id?: string;
  name: string;
  type: string;
  capacity: number;
}

export interface Gym {
  _id: string;
  name: string;
  address: string;
  phone: string;
  logo?: string;
  isActive: boolean;
  halls?: Hall[];
  createdAt?: string;
  updatedAt?: string;
}

export type GymRef = Pick<Gym, '_id' | 'name'>;

export interface ScheduleSlot {
  day: string;
  startTime: string;
  endTime: string;
}

export interface CoachRef {
  _id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
}

export interface Activity {
  _id: string;
  gymId: string | GymRef;
  hallId: string;
  name: string;
  coach: CoachRef | string;
  monthlyPrice: number;
  maxCapacity: number;
  schedule?: ScheduleSlot[];
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Member {
  _id: string;
  gymId?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | number;
  dateOfBirth?: string;
  photo?: string;
  medicalCertificate?: string;
  createdAt?: string;
  updatedAt?: string;
}
