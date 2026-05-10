/* tslint:disable */
/* eslint-disable */

import type { AxiosPromise, AxiosRequestConfig } from 'axios';
import { BaseAPI } from '../base';
import type {
  StaffLeaveTypeServiceUpdateStaffLeaveTypeRequest,
  V1CreateStaffLeaveTypeRequest,
  V1DeleteStaffLeaveTypeReply,
  V1ListStaffLeaveTypeReply,
  V1ListStaffLeaveTypeRequest,
  V1StaffLeaveType,
} from '../models';

export interface StaffLeaveTypeServiceApiStaffLeaveTypeServiceCreateStaffLeaveTypeRequest {
  readonly body: V1CreateStaffLeaveTypeRequest;
}

export interface StaffLeaveTypeServiceApiStaffLeaveTypeServiceDeleteStaffLeaveTypeRequest {
  readonly id: string;
}

export interface StaffLeaveTypeServiceApiStaffLeaveTypeServiceGetStaffLeaveTypeRequest {
  readonly id: string;
}

export interface StaffLeaveTypeServiceApiStaffLeaveTypeServiceListStaffLeaveType2Request {
  readonly body: V1ListStaffLeaveTypeRequest;
}

export interface StaffLeaveTypeServiceApiStaffLeaveTypeServiceUpdateStaffLeaveTypeRequest {
  readonly leaveTypeId: string;
  readonly body: StaffLeaveTypeServiceUpdateStaffLeaveTypeRequest;
}

export interface StaffLeaveTypeServiceApiStaffLeaveTypeServiceUpdateStaffLeaveType2Request {
  readonly leaveTypeId: string;
  readonly body: StaffLeaveTypeServiceUpdateStaffLeaveTypeRequest;
}

export class StaffLeaveTypeServiceApi extends BaseAPI {
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

  public staffLeaveTypeServiceCreateStaffLeaveType(
    requestParameters: StaffLeaveTypeServiceApiStaffLeaveTypeServiceCreateStaffLeaveTypeRequest,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1StaffLeaveType>(
      'POST',
      '/v1/school/staff/leave-type',
      requestParameters.body,
      options,
    );
  }

  public staffLeaveTypeServiceDeleteStaffLeaveType(
    requestParameters: StaffLeaveTypeServiceApiStaffLeaveTypeServiceDeleteStaffLeaveTypeRequest,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1DeleteStaffLeaveTypeReply>(
      'DELETE',
      `/v1/school/staff/leave-type/${encodeURIComponent(String(requestParameters.id))}`,
      undefined,
      options,
    );
  }

  public staffLeaveTypeServiceGetStaffLeaveType(
    requestParameters: StaffLeaveTypeServiceApiStaffLeaveTypeServiceGetStaffLeaveTypeRequest,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1StaffLeaveType>(
      'GET',
      `/v1/school/staff/leave-type/${encodeURIComponent(String(requestParameters.id))}`,
      undefined,
      options,
    );
  }

  public staffLeaveTypeServiceListStaffLeaveType2(
    requestParameters: StaffLeaveTypeServiceApiStaffLeaveTypeServiceListStaffLeaveType2Request,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1ListStaffLeaveTypeReply>(
      'POST',
      '/v1/school/staff/leave-type/list',
      requestParameters.body,
      options,
    );
  }

  public staffLeaveTypeServiceUpdateStaffLeaveType(
    requestParameters: StaffLeaveTypeServiceApiStaffLeaveTypeServiceUpdateStaffLeaveTypeRequest,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1StaffLeaveType>(
      'PUT',
      `/v1/school/staff/leave-type/${encodeURIComponent(String(requestParameters.leaveTypeId))}`,
      requestParameters.body,
      options,
    );
  }

  public staffLeaveTypeServiceUpdateStaffLeaveType2(
    requestParameters: StaffLeaveTypeServiceApiStaffLeaveTypeServiceUpdateStaffLeaveType2Request,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1StaffLeaveType>(
      'PATCH',
      `/v1/school/staff/leave-type/${encodeURIComponent(String(requestParameters.leaveTypeId))}`,
      requestParameters.body,
      options,
    );
  }
}
