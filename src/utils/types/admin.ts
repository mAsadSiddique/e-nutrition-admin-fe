export type TAddAdminDetails = {
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  gender?: string;
  age?: number;
  phoneNumber?: string;
  address?: string;
};

export type TEditAdmin = {
  firstName: string;
  lastName: string;
  role: string;
  gender?: string;
  age?: number;
  phoneNumber?: string;
  address?: string;
};

export type TAdminProfileUpdate = {
  firstName: string;
  lastName: string;
  email: string;
  gender?: string;
  age?: number;
  phoneNumber?: string;
  address?: string;
};
