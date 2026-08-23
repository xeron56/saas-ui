export type RetailTableStatus = 'active' | 'inactive' | 'occupied' | 'reserved';

export type RetailTableRecord = {
  id: string;
  slack?: string;
  table_number: string;
  occupant_capacity: number;
  no_of_occupants?: number;
  waiter_user_id?: string;
  branch_id?: string;
  status: RetailTableStatus;
  active: boolean;
  notes?: string;
  created_at?: string;
  updated_at?: string;
};

export type RetailTableRequest = {
  table_number: string;
  occupant_capacity: number;
  waiter_user_id?: string;
  branch_id?: string;
  status?: RetailTableStatus;
  notes?: string;
};

export type RetailTableListReply = {
  total_size?: number;
  filter_size?: number;
  items?: RetailTableRecord[];
  data?: RetailTableRecord[];
};
