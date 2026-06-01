export type PasswordResetReply = {
  message?: string;
  change_password_token?: string;
};

export type SendResetCodeRequest = {
  email: string;
};

export type VerifyResetCodeRequest = {
  email: string;
  code: string;
};

export type PasswordResetRequest = {
  email: string;
  password: string;
  confirm_password: string;
  change_password_token?: string;
  token?: string;
  reset_token?: string;
  code?: string;
};
