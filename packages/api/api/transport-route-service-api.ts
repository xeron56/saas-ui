/* tslint:disable */
/* eslint-disable */

import type { AxiosPromise, AxiosRequestConfig } from 'axios';
import { BaseAPI } from '../base';
import type {
  TransportRouteServiceUpdateTransportRouteRequest,
  V1CreateTransportRouteRequest,
  V1DeleteTransportRouteReply,
  V1ListTransportRouteReply,
  V1ListTransportRouteRequest,
  V1TransportRoute,
} from '../models';

export interface TransportRouteServiceApiTransportRouteServiceCreateTransportRouteRequest {
  readonly body: V1CreateTransportRouteRequest;
}

export interface TransportRouteServiceApiTransportRouteServiceDeleteTransportRouteRequest {
  readonly id: string;
}

export interface TransportRouteServiceApiTransportRouteServiceGetTransportRouteRequest {
  readonly id: string;
}

export interface TransportRouteServiceApiTransportRouteServiceListTransportRoute2Request {
  readonly body: V1ListTransportRouteRequest;
}

export interface TransportRouteServiceApiTransportRouteServiceUpdateTransportRouteRequest {
  readonly routeId: string;
  readonly body: TransportRouteServiceUpdateTransportRouteRequest;
}

export interface TransportRouteServiceApiTransportRouteServiceUpdateTransportRoute2Request {
  readonly routeId: string;
  readonly body: TransportRouteServiceUpdateTransportRouteRequest;
}

export class TransportRouteServiceApi extends BaseAPI {
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

  public transportRouteServiceCreateTransportRoute(
    requestParameters: TransportRouteServiceApiTransportRouteServiceCreateTransportRouteRequest,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1TransportRoute>(
      'POST',
      '/v1/school/transport/route',
      requestParameters.body,
      options,
    );
  }

  public transportRouteServiceDeleteTransportRoute(
    requestParameters: TransportRouteServiceApiTransportRouteServiceDeleteTransportRouteRequest,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1DeleteTransportRouteReply>(
      'DELETE',
      `/v1/school/transport/route/${encodeURIComponent(String(requestParameters.id))}`,
      undefined,
      options,
    );
  }

  public transportRouteServiceGetTransportRoute(
    requestParameters: TransportRouteServiceApiTransportRouteServiceGetTransportRouteRequest,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1TransportRoute>(
      'GET',
      `/v1/school/transport/route/${encodeURIComponent(String(requestParameters.id))}`,
      undefined,
      options,
    );
  }

  public transportRouteServiceListTransportRoute2(
    requestParameters: TransportRouteServiceApiTransportRouteServiceListTransportRoute2Request,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1ListTransportRouteReply>(
      'POST',
      '/v1/school/transport/route/list',
      requestParameters.body,
      options,
    );
  }

  public transportRouteServiceUpdateTransportRoute(
    requestParameters: TransportRouteServiceApiTransportRouteServiceUpdateTransportRouteRequest,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1TransportRoute>(
      'PUT',
      `/v1/school/transport/route/${encodeURIComponent(String(requestParameters.routeId))}`,
      requestParameters.body,
      options,
    );
  }

  public transportRouteServiceUpdateTransportRoute2(
    requestParameters: TransportRouteServiceApiTransportRouteServiceUpdateTransportRoute2Request,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1TransportRoute>(
      'PATCH',
      `/v1/school/transport/route/${encodeURIComponent(String(requestParameters.routeId))}`,
      requestParameters.body,
      options,
    );
  }
}
