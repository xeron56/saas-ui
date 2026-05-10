/* tslint:disable */
/* eslint-disable */

import type { AxiosPromise, AxiosRequestConfig } from 'axios';
import { BaseAPI } from '../base';
import type {
  HostelRoomServiceUpdateHostelRoomRequest,
  V1CreateHostelRoomRequest,
  V1DeleteHostelRoomReply,
  V1HostelRoom,
  V1ListHostelRoomReply,
  V1ListHostelRoomRequest,
} from '../models';

export interface HostelRoomServiceApiHostelRoomServiceCreateHostelRoomRequest {
  readonly body: V1CreateHostelRoomRequest;
}

export interface HostelRoomServiceApiHostelRoomServiceDeleteHostelRoomRequest {
  readonly id: string;
}

export interface HostelRoomServiceApiHostelRoomServiceGetHostelRoomRequest {
  readonly id: string;
}

export interface HostelRoomServiceApiHostelRoomServiceListHostelRoom2Request {
  readonly body: V1ListHostelRoomRequest;
}

export interface HostelRoomServiceApiHostelRoomServiceUpdateHostelRoomRequest {
  readonly roomId: string;
  readonly body: HostelRoomServiceUpdateHostelRoomRequest;
}

export interface HostelRoomServiceApiHostelRoomServiceUpdateHostelRoom2Request {
  readonly roomId: string;
  readonly body: HostelRoomServiceUpdateHostelRoomRequest;
}

export class HostelRoomServiceApi extends BaseAPI {
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

  public hostelRoomServiceCreateHostelRoom(
    requestParameters: HostelRoomServiceApiHostelRoomServiceCreateHostelRoomRequest,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1HostelRoom>(
      'POST',
      '/v1/school/hostel/room',
      requestParameters.body,
      options,
    );
  }

  public hostelRoomServiceDeleteHostelRoom(
    requestParameters: HostelRoomServiceApiHostelRoomServiceDeleteHostelRoomRequest,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1DeleteHostelRoomReply>(
      'DELETE',
      `/v1/school/hostel/room/${encodeURIComponent(String(requestParameters.id))}`,
      undefined,
      options,
    );
  }

  public hostelRoomServiceGetHostelRoom(
    requestParameters: HostelRoomServiceApiHostelRoomServiceGetHostelRoomRequest,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1HostelRoom>(
      'GET',
      `/v1/school/hostel/room/${encodeURIComponent(String(requestParameters.id))}`,
      undefined,
      options,
    );
  }

  public hostelRoomServiceListHostelRoom2(
    requestParameters: HostelRoomServiceApiHostelRoomServiceListHostelRoom2Request,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1ListHostelRoomReply>(
      'POST',
      '/v1/school/hostel/room/list',
      requestParameters.body,
      options,
    );
  }

  public hostelRoomServiceUpdateHostelRoom(
    requestParameters: HostelRoomServiceApiHostelRoomServiceUpdateHostelRoomRequest,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1HostelRoom>(
      'PUT',
      `/v1/school/hostel/room/${encodeURIComponent(String(requestParameters.roomId))}`,
      requestParameters.body,
      options,
    );
  }

  public hostelRoomServiceUpdateHostelRoom2(
    requestParameters: HostelRoomServiceApiHostelRoomServiceUpdateHostelRoom2Request,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1HostelRoom>(
      'PATCH',
      `/v1/school/hostel/room/${encodeURIComponent(String(requestParameters.roomId))}`,
      requestParameters.body,
      options,
    );
  }
}
