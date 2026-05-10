/* tslint:disable */
/* eslint-disable */

import type { AxiosPromise, AxiosRequestConfig } from 'axios';
import { BaseAPI } from '../base';
import type {
  RoomTypeServiceUpdateRoomTypeRequest,
  V1CreateRoomTypeRequest,
  V1DeleteRoomTypeReply,
  V1ListRoomTypeReply,
  V1ListRoomTypeRequest,
  V1RoomType,
} from '../models';

export interface RoomTypeServiceApiRoomTypeServiceCreateRoomTypeRequest {
  readonly body: V1CreateRoomTypeRequest;
}

export interface RoomTypeServiceApiRoomTypeServiceDeleteRoomTypeRequest {
  readonly id: string;
}

export interface RoomTypeServiceApiRoomTypeServiceGetRoomTypeRequest {
  readonly id: string;
}

export interface RoomTypeServiceApiRoomTypeServiceListRoomType2Request {
  readonly body: V1ListRoomTypeRequest;
}

export interface RoomTypeServiceApiRoomTypeServiceUpdateRoomTypeRequest {
  readonly roomTypeId: string;
  readonly body: RoomTypeServiceUpdateRoomTypeRequest;
}

export interface RoomTypeServiceApiRoomTypeServiceUpdateRoomType2Request {
  readonly roomTypeId: string;
  readonly body: RoomTypeServiceUpdateRoomTypeRequest;
}

export class RoomTypeServiceApi extends BaseAPI {
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

  public roomTypeServiceCreateRoomType(
    requestParameters: RoomTypeServiceApiRoomTypeServiceCreateRoomTypeRequest,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1RoomType>(
      'POST',
      '/v1/school/hostel/room-type',
      requestParameters.body,
      options,
    );
  }

  public roomTypeServiceDeleteRoomType(
    requestParameters: RoomTypeServiceApiRoomTypeServiceDeleteRoomTypeRequest,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1DeleteRoomTypeReply>(
      'DELETE',
      `/v1/school/hostel/room-type/${encodeURIComponent(String(requestParameters.id))}`,
      undefined,
      options,
    );
  }

  public roomTypeServiceGetRoomType(
    requestParameters: RoomTypeServiceApiRoomTypeServiceGetRoomTypeRequest,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1RoomType>(
      'GET',
      `/v1/school/hostel/room-type/${encodeURIComponent(String(requestParameters.id))}`,
      undefined,
      options,
    );
  }

  public roomTypeServiceListRoomType2(
    requestParameters: RoomTypeServiceApiRoomTypeServiceListRoomType2Request,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1ListRoomTypeReply>(
      'POST',
      '/v1/school/hostel/room-type/list',
      requestParameters.body,
      options,
    );
  }

  public roomTypeServiceUpdateRoomType(
    requestParameters: RoomTypeServiceApiRoomTypeServiceUpdateRoomTypeRequest,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1RoomType>(
      'PUT',
      `/v1/school/hostel/room-type/${encodeURIComponent(String(requestParameters.roomTypeId))}`,
      requestParameters.body,
      options,
    );
  }

  public roomTypeServiceUpdateRoomType2(
    requestParameters: RoomTypeServiceApiRoomTypeServiceUpdateRoomType2Request,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1RoomType>(
      'PATCH',
      `/v1/school/hostel/room-type/${encodeURIComponent(String(requestParameters.roomTypeId))}`,
      requestParameters.body,
      options,
    );
  }
}
