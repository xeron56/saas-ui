/* tslint:disable */
/* eslint-disable */

import type { AxiosPromise, AxiosRequestConfig } from 'axios';
import { BaseAPI } from '../base';
import type {
  PickupPointServiceUpdatePickupPointRequest,
  V1CreatePickupPointRequest,
  V1DeletePickupPointReply,
  V1ListPickupPointReply,
  V1ListPickupPointRequest,
  V1PickupPoint,
} from '../models';

export interface PickupPointServiceApiPickupPointServiceCreatePickupPointRequest {
  readonly body: V1CreatePickupPointRequest;
}

export interface PickupPointServiceApiPickupPointServiceDeletePickupPointRequest {
  readonly id: string;
}

export interface PickupPointServiceApiPickupPointServiceGetPickupPointRequest {
  readonly id: string;
}

export interface PickupPointServiceApiPickupPointServiceListPickupPoint2Request {
  readonly body: V1ListPickupPointRequest;
}

export interface PickupPointServiceApiPickupPointServiceUpdatePickupPointRequest {
  readonly pointId: string;
  readonly body: PickupPointServiceUpdatePickupPointRequest;
}

export interface PickupPointServiceApiPickupPointServiceUpdatePickupPoint2Request {
  readonly pointId: string;
  readonly body: PickupPointServiceUpdatePickupPointRequest;
}

export class PickupPointServiceApi extends BaseAPI {
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

  public pickupPointServiceCreatePickupPoint(
    requestParameters: PickupPointServiceApiPickupPointServiceCreatePickupPointRequest,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1PickupPoint>(
      'POST',
      '/v1/school/transport/pickup-point',
      requestParameters.body,
      options,
    );
  }

  public pickupPointServiceDeletePickupPoint(
    requestParameters: PickupPointServiceApiPickupPointServiceDeletePickupPointRequest,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1DeletePickupPointReply>(
      'DELETE',
      `/v1/school/transport/pickup-point/${encodeURIComponent(String(requestParameters.id))}`,
      undefined,
      options,
    );
  }

  public pickupPointServiceGetPickupPoint(
    requestParameters: PickupPointServiceApiPickupPointServiceGetPickupPointRequest,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1PickupPoint>(
      'GET',
      `/v1/school/transport/pickup-point/${encodeURIComponent(String(requestParameters.id))}`,
      undefined,
      options,
    );
  }

  public pickupPointServiceListPickupPoint2(
    requestParameters: PickupPointServiceApiPickupPointServiceListPickupPoint2Request,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1ListPickupPointReply>(
      'POST',
      '/v1/school/transport/pickup-point/list',
      requestParameters.body,
      options,
    );
  }

  public pickupPointServiceUpdatePickupPoint(
    requestParameters: PickupPointServiceApiPickupPointServiceUpdatePickupPointRequest,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1PickupPoint>(
      'PUT',
      `/v1/school/transport/pickup-point/${encodeURIComponent(String(requestParameters.pointId))}`,
      requestParameters.body,
      options,
    );
  }

  public pickupPointServiceUpdatePickupPoint2(
    requestParameters: PickupPointServiceApiPickupPointServiceUpdatePickupPoint2Request,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1PickupPoint>(
      'PATCH',
      `/v1/school/transport/pickup-point/${encodeURIComponent(String(requestParameters.pointId))}`,
      requestParameters.body,
      options,
    );
  }
}
