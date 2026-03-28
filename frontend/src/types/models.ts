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
