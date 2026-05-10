/* tslint:disable */
/* eslint-disable */

import type { AxiosPromise, AxiosRequestConfig } from 'axios';
import { BaseAPI } from '../base';
import type {
  V1CreateVehicleRouteRequest,
  V1DeleteVehicleRouteReply,
  V1ListVehicleRouteReply,
  V1ListVehicleRouteRequest,
  V1VehicleRoute,
  VehicleRouteServiceUpdateVehicleRouteRequest,
} from '../models';

export interface VehicleRouteServiceApiVehicleRouteServiceCreateVehicleRouteRequest {
  readonly body: V1CreateVehicleRouteRequest;
}

export interface VehicleRouteServiceApiVehicleRouteServiceDeleteVehicleRouteRequest {
  readonly id: string;
}

export interface VehicleRouteServiceApiVehicleRouteServiceGetVehicleRouteRequest {
  readonly id: string;
}

export interface VehicleRouteServiceApiVehicleRouteServiceListVehicleRoute2Request {
  readonly body: V1ListVehicleRouteRequest;
}

export interface VehicleRouteServiceApiVehicleRouteServiceUpdateVehicleRouteRequest {
  readonly vehicleRouteId: string;
  readonly body: VehicleRouteServiceUpdateVehicleRouteRequest;
}

export interface VehicleRouteServiceApiVehicleRouteServiceUpdateVehicleRoute2Request {
  readonly vehicleRouteId: string;
  readonly body: VehicleRouteServiceUpdateVehicleRouteRequest;
}

export class VehicleRouteServiceApi extends BaseAPI {
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

  public vehicleRouteServiceCreateVehicleRoute(
    requestParameters: VehicleRouteServiceApiVehicleRouteServiceCreateVehicleRouteRequest,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1VehicleRoute>(
      'POST',
      '/v1/school/transport/vehicle-route',
      requestParameters.body,
      options,
    );
  }

  public vehicleRouteServiceDeleteVehicleRoute(
    requestParameters: VehicleRouteServiceApiVehicleRouteServiceDeleteVehicleRouteRequest,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1DeleteVehicleRouteReply>(
      'DELETE',
      `/v1/school/transport/vehicle-route/${encodeURIComponent(String(requestParameters.id))}`,
      undefined,
      options,
    );
  }

  public vehicleRouteServiceGetVehicleRoute(
    requestParameters: VehicleRouteServiceApiVehicleRouteServiceGetVehicleRouteRequest,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1VehicleRoute>(
      'GET',
      `/v1/school/transport/vehicle-route/${encodeURIComponent(String(requestParameters.id))}`,
      undefined,
      options,
    );
  }

  public vehicleRouteServiceListVehicleRoute2(
    requestParameters: VehicleRouteServiceApiVehicleRouteServiceListVehicleRoute2Request,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1ListVehicleRouteReply>(
      'POST',
      '/v1/school/transport/vehicle-route/list',
      requestParameters.body,
      options,
    );
  }

  public vehicleRouteServiceUpdateVehicleRoute(
    requestParameters: VehicleRouteServiceApiVehicleRouteServiceUpdateVehicleRouteRequest,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1VehicleRoute>(
      'PUT',
      `/v1/school/transport/vehicle-route/${encodeURIComponent(
        String(requestParameters.vehicleRouteId),
      )}`,
      requestParameters.body,
      options,
    );
  }

  public vehicleRouteServiceUpdateVehicleRoute2(
    requestParameters: VehicleRouteServiceApiVehicleRouteServiceUpdateVehicleRoute2Request,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1VehicleRoute>(
      'PATCH',
      `/v1/school/transport/vehicle-route/${encodeURIComponent(
        String(requestParameters.vehicleRouteId),
      )}`,
      requestParameters.body,
      options,
    );
  }
}
