import { request } from '@umijs/max';
import type { RetailBookingListReply, RetailBookingRecord, RetailBookingRequest } from './types';

const bookingBase = '/v1/retail/bookings';

export async function listRetailBookings(params: Record<string, any>) {
  return request<RetailBookingListReply>(bookingBase, { params });
}

export async function getRetailBooking(id: string) {
  return request<RetailBookingRecord>(`${bookingBase}/${encodeURIComponent(id)}`);
}

export async function createRetailBooking(data: RetailBookingRequest) {
  return request<RetailBookingRecord>(bookingBase, {
    method: 'POST',
    data,
  });
}

export async function updateRetailBooking(id: string, data: RetailBookingRequest) {
  return request<RetailBookingRecord>(`${bookingBase}/${encodeURIComponent(id)}`, {
    method: 'PUT',
    data,
  });
}

export async function deleteRetailBooking(id: string) {
  return request<{ id: string }>(`${bookingBase}/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
}
