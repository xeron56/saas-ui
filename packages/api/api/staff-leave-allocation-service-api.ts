/* tslint:disable */
/* eslint-disable */

import type { AxiosPromise, AxiosRequestConfig } from 'axios';
import { BaseAPI } from '../base';
import type {
  StaffLeaveAllocationServiceUpdateStaffLeaveAllocationRequest,
  V1CreateStaffLeaveAllocationRequest,
  V1DeleteStaffLeaveAllocationReply,
  V1ListStaffLeaveAllocationReply,
  V1ListStaffLeaveAllocationRequest,
  V1StaffLeaveAllocation,
} from '../models';

export interface StaffLeaveAllocationServiceApiStaffLeaveAllocationServiceCreateStaffLeaveAllocationRequest {
  readonly body: V1CreateStaffLeaveAllocationRequest;
}

export interface StaffLeaveAllocationServiceApiStaffLeaveAllocationServiceDeleteStaffLeaveAllocationRequest {
  readonly id: string;
}

export interface StaffLeaveAllocationServiceApiStaffLeaveAllocationServiceGetStaffLeaveAllocationRequest {
  readonly id: string;
}

export interface StaffLeaveAllocationServiceApiStaffLeaveAllocationServiceListStaffLeaveAllocation2Request {
  readonly body: V1ListStaffLeaveAllocationRequest;
}

export interface StaffLeaveAllocationServiceApiStaffLeaveAllocationServiceUpdateStaffLeaveAllocationRequest {
  readonly allocationId: string;
  readonly body: StaffLeaveAllocationServiceUpdateStaffLeaveAllocationRequest;
}

export interface StaffLeaveAllocationServiceApiStaffLeaveAllocationServiceUpdateStaffLeaveAllocation2Request {
  readonly allocationId: string;
  readonly body: StaffLeaveAllocationServiceUpdateStaffLeaveAllocationRequest;
}

export class StaffLeaveAllocationServiceApi extends BaseAPI {
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

  public staffLeaveAllocationServiceCreateStaffLeaveAllocation(
    requestParameters: StaffLeaveAllocationServiceApiStaffLeaveAllocationServiceCreateStaffLeaveAllocationRequest,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1StaffLeaveAllocation>(
      'POST',
      '/v1/school/staff/leave-allocation',
      requestParameters.body,
      options,
    );
  }

  public staffLeaveAllocationServiceDeleteStaffLeaveAllocation(
    requestParameters: StaffLeaveAllocationServiceApiStaffLeaveAllocationServiceDeleteStaffLeaveAllocationRequest,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1DeleteStaffLeaveAllocationReply>(
      'DELETE',
      `/v1/school/staff/leave-allocation/${encodeURIComponent(String(requestParameters.id))}`,
      undefined,
      options,
    );
  }

  public staffLeaveAllocationServiceGetStaffLeaveAllocation(
    requestParameters: StaffLeaveAllocationServiceApiStaffLeaveAllocationServiceGetStaffLeaveAllocationRequest,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1StaffLeaveAllocation>(
      'GET',
      `/v1/school/staff/leave-allocation/${encodeURIComponent(String(requestParameters.id))}`,
      undefined,
      options,
    );
  }

  public staffLeaveAllocationServiceListStaffLeaveAllocation2(
    requestParameters: StaffLeaveAllocationServiceApiStaffLeaveAllocationServiceListStaffLeaveAllocation2Request,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1ListStaffLeaveAllocationReply>(
      'POST',
      '/v1/school/staff/leave-allocation/list',
      requestParameters.body,
      options,
    );
  }

  public staffLeaveAllocationServiceUpdateStaffLeaveAllocation(
    requestParameters: StaffLeaveAllocationServiceApiStaffLeaveAllocationServiceUpdateStaffLeaveAllocationRequest,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1StaffLeaveAllocation>(
      'PUT',
      `/v1/school/staff/leave-allocation/${encodeURIComponent(
        String(requestParameters.allocationId),
      )}`,
      requestParameters.body,
      options,
    );
  }

  public staffLeaveAllocationServiceUpdateStaffLeaveAllocation2(
    requestParameters: StaffLeaveAllocationServiceApiStaffLeaveAllocationServiceUpdateStaffLeaveAllocation2Request,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1StaffLeaveAllocation>(
      'PATCH',
      `/v1/school/staff/leave-allocation/${encodeURIComponent(
        String(requestParameters.allocationId),
      )}`,
      requestParameters.body,
      options,
    );
  }
}
