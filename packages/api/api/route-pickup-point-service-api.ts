/* tslint:disable */
/* eslint-disable */

import type { AxiosPromise, AxiosRequestConfig } from 'axios';
import { BaseAPI } from '../base';
import type {
  RoutePickupPointServiceUpdateRoutePickupPointRequest,
  V1CreateRoutePickupPointRequest,
  V1DeleteRoutePickupPointReply,
  V1ListRoutePickupPointReply,
  V1ListRoutePickupPointRequest,
  V1RoutePickupPoint,
} from '../models';

export interface RoutePickupPointServiceApiRoutePickupPointServiceCreateRoutePickupPointRequest {
  readonly body: V1CreateRoutePickupPointRequest;
}

export interface RoutePickupPointServiceApiRoutePickupPointServiceDeleteRoutePickupPointRequest {
  readonly id: string;
}

export interface RoutePickupPointServiceApiRoutePickupPointServiceGetRoutePickupPointRequest {
  readonly id: string;
}

export interface RoutePickupPointServiceApiRoutePickupPointServiceListRoutePickupPoint2Request {
  readonly body: V1ListRoutePickupPointRequest;
}

export interface RoutePickupPointServiceApiRoutePickupPointServiceUpdateRoutePickupPointRequest {
  readonly pointId: string;
  readonly body: RoutePickupPointServiceUpdateRoutePickupPointRequest;
}

export interface RoutePickupPointServiceApiRoutePickupPointServiceUpdateRoutePickupPoint2Request {
  readonly pointId: string;
  readonly body: RoutePickupPointServiceUpdateRoutePickupPointRequest;
}

export class RoutePickupPointServiceApi extends BaseAPI {
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

  public routePickupPointServiceCreateRoutePickupPoint(
    requestParameters: RoutePickupPointServiceApiRoutePickupPointServiceCreateRoutePickupPointRequest,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1RoutePickupPoint>(
      'POST',
      '/v1/school/transport/route-pickup-point',
      requestParameters.body,
      options,
    );
  }

  public routePickupPointServiceDeleteRoutePickupPoint(
    requestParameters: RoutePickupPointServiceApiRoutePickupPointServiceDeleteRoutePickupPointRequest,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1DeleteRoutePickupPointReply>(
      'DELETE',
      `/v1/school/transport/route-pickup-point/${encodeURIComponent(String(requestParameters.id))}`,
      undefined,
      options,
    );
  }

  public routePickupPointServiceGetRoutePickupPoint(
    requestParameters: RoutePickupPointServiceApiRoutePickupPointServiceGetRoutePickupPointRequest,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1RoutePickupPoint>(
      'GET',
      `/v1/school/transport/route-pickup-point/${encodeURIComponent(String(requestParameters.id))}`,
      undefined,
      options,
    );
  }

  public routePickupPointServiceListRoutePickupPoint2(
    requestParameters: RoutePickupPointServiceApiRoutePickupPointServiceListRoutePickupPoint2Request,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1ListRoutePickupPointReply>(
      'POST',
      '/v1/school/transport/route-pickup-point/list',
      requestParameters.body,
      options,
    );
  }

  public routePickupPointServiceUpdateRoutePickupPoint(
    requestParameters: RoutePickupPointServiceApiRoutePickupPointServiceUpdateRoutePickupPointRequest,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1RoutePickupPoint>(
      'PUT',
      `/v1/school/transport/route-pickup-point/${encodeURIComponent(String(requestParameters.pointId))}`,
      requestParameters.body,
      options,
    );
  }

  public routePickupPointServiceUpdateRoutePickupPoint2(
    requestParameters: RoutePickupPointServiceApiRoutePickupPointServiceUpdateRoutePickupPoint2Request,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1RoutePickupPoint>(
      'PATCH',
      `/v1/school/transport/route-pickup-point/${encodeURIComponent(String(requestParameters.pointId))}`,
      requestParameters.body,
      options,
    );
  }
}
