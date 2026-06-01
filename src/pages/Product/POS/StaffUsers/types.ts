export type StaffVisibilityValue = string | number | boolean;

export type StaffVisibility = Record<string, Record<string, StaffVisibilityValue>>;

export type StaffRole = {
  id?: string;
  name?: string;
};

export type StaffBranch = {
  id?: string;
  name?: string;
};

export type StaffUser = {
  id: string;
  name?: string;
  email?: string;
  role?: string;
  business_id?: string;
  branch_id?: string;
  active_branch_id?: string;
  visibility?: StaffVisibility;
  branch?: StaffBranch;
  roles?: StaffRole[];
  created_at?: string;
  updated_at?: string;
  extra?: Record<string, unknown>;
};

export type StaffUserRequest = {
  name: string;
  email: string;
  password?: string;
  branch_id?: string;
  visibility: StaffVisibility;
};

export type StaffUsersReply = {
  message?: string;
  data?: StaffUser[];
};

export type StaffUserReply = {
  message?: string;
  data?: StaffUser;
};

export type StaffMessageReply = {
  message?: string;
};
