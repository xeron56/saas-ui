/* tslint:disable */
/* eslint-disable */

import type { AxiosPromise, AxiosRequestConfig } from 'axios';
import { BaseAPI } from '../base';
import type {
  HostelServiceUpdateHostelRequest,
  V1CreateHostelRequest,
  V1DeleteHostelReply,
  V1Hostel,
  V1ListHostelReply,
  V1ListHostelRequest,
} from '../models';

export interface HostelServiceApiHostelServiceCreateHostelRequest {
  readonly body: V1CreateHostelRequest;
}

export interface HostelServiceApiHostelServiceDeleteHostelRequest {
  readonly id: string;
}

export interface HostelServiceApiHostelServiceGetHostelRequest {
  readonly id: string;
}

export interface HostelServiceApiHostelServiceListHostel2Request {
  readonly body: V1ListHostelRequest;
}

export interface HostelServiceApiHostelServiceUpdateHostelRequest {
  readonly hostelId: string;
  readonly body: HostelServiceUpdateHostelRequest;
}

export interface HostelServiceApiHostelServiceUpdateHostel2Request {
  readonly hostelId: string;
  readonly body: HostelServiceUpdateHostelRequest;
}

export class HostelServiceApi extends BaseAPI {
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

  public hostelServiceCreateHostel(
    requestParameters: HostelServiceApiHostelServiceCreateHostelRequest,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1Hostel>(
      'POST',
      '/v1/school/hostel',
      requestParameters.body,
      options,
    );
  }

  public hostelServiceDeleteHostel(
    requestParameters: HostelServiceApiHostelServiceDeleteHostelRequest,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1DeleteHostelReply>(
      'DELETE',
      `/v1/school/hostel/${encodeURIComponent(String(requestParameters.id))}`,
      undefined,
      options,
    );
  }

  public hostelServiceGetHostel(
    requestParameters: HostelServiceApiHostelServiceGetHostelRequest,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1Hostel>(
      'GET',
      `/v1/school/hostel/${encodeURIComponent(String(requestParameters.id))}`,
      undefined,
      options,
    );
  }

  public hostelServiceListHostel2(
    requestParameters: HostelServiceApiHostelServiceListHostel2Request,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1ListHostelReply>(
      'POST',
      '/v1/school/hostel/list',
      requestParameters.body,
      options,
    );
  }

  public hostelServiceUpdateHostel(
    requestParameters: HostelServiceApiHostelServiceUpdateHostelRequest,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1Hostel>(
      'PUT',
      `/v1/school/hostel/${encodeURIComponent(String(requestParameters.hostelId))}`,
      requestParameters.body,
      options,
    );
  }

  public hostelServiceUpdateHostel2(
    requestParameters: HostelServiceApiHostelServiceUpdateHostel2Request,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1Hostel>(
      'PATCH',
      `/v1/school/hostel/${encodeURIComponent(String(requestParameters.hostelId))}`,
      requestParameters.body,
      options,
    );
  }
}
