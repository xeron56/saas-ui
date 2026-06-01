export type AccountProfile = {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
  image?: string;
  role?: string;
  created_at?: string;
  createdAt?: string;
};

export type AccountProfileReply = {
  message?: string;
  data?: AccountProfile;
};

export type AccountProfileUpdate = {
  name: string;
  email: string;
  phone?: string;
  image?: string;
  current_password?: string;
  password?: string;
  password_confirmation?: string;
};
