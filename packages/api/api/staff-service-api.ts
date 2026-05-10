/* tslint:disable */
/* eslint-disable */

import type { AxiosPromise, AxiosRequestConfig } from 'axios';
import { BaseAPI } from '../base';
import type {
  StaffServiceUpdateStaffRequest,
  V1CreateStaffRequest,
  V1DeleteStaffReply,
  V1ListStaffReply,
  V1ListStaffRequest,
  V1ListStaffRoleReply,
  V1Staff,
} from '../models';

export interface StaffServiceApiStaffServiceCreateStaffRequest {
  readonly body: V1CreateStaffRequest;
}

export interface StaffServiceApiStaffServiceDeleteStaffRequest {
  readonly id: string;
}

export interface StaffServiceApiStaffServiceGetStaffRequest {
  readonly id: string;
}

export interface StaffServiceApiStaffServiceListStaff2Request {
  readonly body: V1ListStaffRequest;
}

export interface StaffServiceApiStaffServiceUpdateStaffRequest {
  readonly staffId: string;
  readonly body: StaffServiceUpdateStaffRequest;
}

export interface StaffServiceApiStaffServiceUpdateStaff2Request {
  readonly staffId: string;
  readonly body: StaffServiceUpdateStaffRequest;
}

export class StaffServiceApi extends BaseAPI {
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

  public staffServiceCreateStaff(
    requestParameters: StaffServiceApiStaffServiceCreateStaffRequest,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1Staff>('POST', '/v1/school/staff', requestParameters.body, options);
  }

  public staffServiceDeleteStaff(
    requestParameters: StaffServiceApiStaffServiceDeleteStaffRequest,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1DeleteStaffReply>(
      'DELETE',
      `/v1/school/staff/${encodeURIComponent(String(requestParameters.id))}`,
      undefined,
      options,
    );
  }

  public staffServiceGetStaff(
    requestParameters: StaffServiceApiStaffServiceGetStaffRequest,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1Staff>(
      'GET',
      `/v1/school/staff/${encodeURIComponent(String(requestParameters.id))}`,
      undefined,
      options,
    );
  }

  public staffServiceListStaff2(
    requestParameters: StaffServiceApiStaffServiceListStaff2Request,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1ListStaffReply>(
      'POST',
      '/v1/school/staff/list',
      requestParameters.body,
      options,
    );
  }

  public staffServiceListStaff(options?: AxiosRequestConfig) {
    return this.request<V1ListStaffReply>('GET', '/v1/school/staff', undefined, options);
  }

  public staffServiceListStaffRole(options?: AxiosRequestConfig) {
    return this.request<V1ListStaffRoleReply>('GET', '/v1/school/staff/roles', undefined, options);
  }

  public staffServiceUpdateStaff(
    requestParameters: StaffServiceApiStaffServiceUpdateStaffRequest,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1Staff>(
      'PUT',
      `/v1/school/staff/${encodeURIComponent(String(requestParameters.staffId))}`,
      requestParameters.body,
      options,
    );
  }

  public staffServiceUpdateStaff2(
    requestParameters: StaffServiceApiStaffServiceUpdateStaff2Request,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1Staff>(
      'PATCH',
      `/v1/school/staff/${encodeURIComponent(String(requestParameters.staffId))}`,
      requestParameters.body,
      options,
    );
  }
}
