/* tslint:disable */
/* eslint-disable */

import type { AxiosPromise, AxiosRequestConfig } from 'axios';
import { BaseAPI } from '../base';
import type {
  StaffLeaveServiceUpdateStaffLeaveRequest,
  V1CreateStaffLeaveRequest,
  V1DeleteStaffLeaveReply,
  V1ListStaffLeaveReply,
  V1ListStaffLeaveRequest,
  V1StaffLeave,
  V1UpdateStaffLeaveStatusRequest,
} from '../models';

export interface StaffLeaveServiceApiStaffLeaveServiceCreateStaffLeaveRequest {
  readonly body: V1CreateStaffLeaveRequest;
}

export interface StaffLeaveServiceApiStaffLeaveServiceDeleteStaffLeaveRequest {
  readonly id: string;
}

export interface StaffLeaveServiceApiStaffLeaveServiceDownloadStaffLeaveAttachmentRequest {
  readonly id: string;
}

export interface StaffLeaveServiceApiStaffLeaveServiceGetStaffLeaveRequest {
  readonly id: string;
}

export interface StaffLeaveServiceApiStaffLeaveServiceListStaffLeave2Request {
  readonly body: V1ListStaffLeaveRequest;
}

export interface StaffLeaveServiceApiStaffLeaveServiceUpdateStaffLeaveRequest {
  readonly leaveId: string;
  readonly body: StaffLeaveServiceUpdateStaffLeaveRequest;
}

export interface StaffLeaveServiceApiStaffLeaveServiceUpdateStaffLeave2Request {
  readonly leaveId: string;
  readonly body: StaffLeaveServiceUpdateStaffLeaveRequest;
}

export interface StaffLeaveServiceApiStaffLeaveServiceUpdateStaffLeaveStatusRequest {
  readonly id: string;
  readonly body: V1UpdateStaffLeaveStatusRequest;
}

export class StaffLeaveServiceApi extends BaseAPI {
  private request<T>(
    method: AxiosRequestConfig['method'],
    url: string,
    data?: unknown,
    options: AxiosRequestConfig = {},
  ): AxiosPromise<T> {
    return this.axios.request<T>({
      ...options,
      method,
      url: `${this.basePath}${url}`,
      data,
    });
  }

  public staffLeaveServiceCreateStaffLeave(
    requestParameters: StaffLeaveServiceApiStaffLeaveServiceCreateStaffLeaveRequest,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1StaffLeave>(
      'POST',
      '/v1/school/staff/leave',
      requestParameters.body,
      options,
    );
  }

  public staffLeaveServiceDeleteStaffLeave(
    requestParameters: StaffLeaveServiceApiStaffLeaveServiceDeleteStaffLeaveRequest,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1DeleteStaffLeaveReply>(
      'DELETE',
      `/v1/school/staff/leave/${encodeURIComponent(String(requestParameters.id))}`,
      undefined,
      options,
    );
  }

  public staffLeaveServiceDownloadStaffLeaveAttachment(
    requestParameters: StaffLeaveServiceApiStaffLeaveServiceDownloadStaffLeaveAttachmentRequest,
    options?: AxiosRequestConfig,
  ) {
    return this.request<Blob>(
      'GET',
      `/v1/school/staff/leave/${encodeURIComponent(String(requestParameters.id))}/download`,
      undefined,
      { ...options, responseType: 'blob' },
    );
  }

  public staffLeaveServiceGetStaffLeave(
    requestParameters: StaffLeaveServiceApiStaffLeaveServiceGetStaffLeaveRequest,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1StaffLeave>(
      'GET',
      `/v1/school/staff/leave/${encodeURIComponent(String(requestParameters.id))}`,
      undefined,
      options,
    );
  }

  public staffLeaveServiceListStaffLeave2(
    requestParameters: StaffLeaveServiceApiStaffLeaveServiceListStaffLeave2Request,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1ListStaffLeaveReply>(
      'POST',
      '/v1/school/staff/leave/list',
      requestParameters.body,
      options,
    );
  }

  public staffLeaveServiceUpdateStaffLeave(
    requestParameters: StaffLeaveServiceApiStaffLeaveServiceUpdateStaffLeaveRequest,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1StaffLeave>(
      'PUT',
      `/v1/school/staff/leave/${encodeURIComponent(String(requestParameters.leaveId))}`,
      requestParameters.body,
      options,
    );
  }

  public staffLeaveServiceUpdateStaffLeave2(
    requestParameters: StaffLeaveServiceApiStaffLeaveServiceUpdateStaffLeave2Request,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1StaffLeave>(
      'PATCH',
      `/v1/school/staff/leave/${encodeURIComponent(String(requestParameters.leaveId))}`,
      requestParameters.body,
      options,
    );
  }

  public staffLeaveServiceUpdateStaffLeaveStatus(
    requestParameters: StaffLeaveServiceApiStaffLeaveServiceUpdateStaffLeaveStatusRequest,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1StaffLeave>(
      'POST',
      `/v1/school/staff/leave/${encodeURIComponent(String(requestParameters.id))}/status`,
      requestParameters.body,
      options,
    );
  }
}
