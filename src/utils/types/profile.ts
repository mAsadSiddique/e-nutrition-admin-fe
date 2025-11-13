export type TLoginDetails = {
  email: string;
  password: string;
};

export type TForgotPasswordRequest = {
  email: string;
};

export type TResetPassword = {
  password: string;
  confirmPassword: string;
  email: string;
  code: string;
};

export type TChangePassword = {
  oldPassword: string;
  password: string;
  confirmPassword: string;
};

// user login profile...
type Role = "Super" | "Admin" | "User";

export type TUser = {
  id: string;
  email: string;
  password: string;
  isEmailVerified: boolean;
  isTwoFaEnable: boolean;
  isBlocked: boolean;
  age: number;
  firstName: string;
  lastName: string;
  role: Role;
  createdAt: string;
  address: string;
  updatedAt: string;
};
