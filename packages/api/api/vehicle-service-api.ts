/* tslint:disable */
/* eslint-disable */

import type { AxiosPromise, AxiosRequestConfig } from 'axios';
import { BaseAPI } from '../base';
import type {
  V1CreateVehicleRequest,
  V1DeleteVehicleReply,
  V1ListVehicleReply,
  V1ListVehicleRequest,
  V1Vehicle,
  VehicleServiceUpdateVehicleRequest,
} from '../models';

export interface VehicleServiceApiVehicleServiceCreateVehicleRequest {
  readonly body: V1CreateVehicleRequest;
}

export interface VehicleServiceApiVehicleServiceDeleteVehicleRequest {
  readonly id: string;
}

export interface VehicleServiceApiVehicleServiceGetVehicleRequest {
  readonly id: string;
}

export interface VehicleServiceApiVehicleServiceListVehicle2Request {
  readonly body: V1ListVehicleRequest;
}

export interface VehicleServiceApiVehicleServiceUpdateVehicleRequest {
  readonly vehicleId: string;
  readonly body: VehicleServiceUpdateVehicleRequest;
}

export interface VehicleServiceApiVehicleServiceUpdateVehicle2Request {
  readonly vehicleId: string;
  readonly body: VehicleServiceUpdateVehicleRequest;
}

export class VehicleServiceApi extends BaseAPI {
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

  public vehicleServiceCreateVehicle(
    requestParameters: VehicleServiceApiVehicleServiceCreateVehicleRequest,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1Vehicle>(
      'POST',
      '/v1/school/transport/vehicle',
      requestParameters.body,
      options,
    );
  }

  public vehicleServiceDeleteVehicle(
    requestParameters: VehicleServiceApiVehicleServiceDeleteVehicleRequest,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1DeleteVehicleReply>(
      'DELETE',
      `/v1/school/transport/vehicle/${encodeURIComponent(String(requestParameters.id))}`,
      undefined,
      options,
    );
  }

  public vehicleServiceGetVehicle(
    requestParameters: VehicleServiceApiVehicleServiceGetVehicleRequest,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1Vehicle>(
      'GET',
      `/v1/school/transport/vehicle/${encodeURIComponent(String(requestParameters.id))}`,
      undefined,
      options,
    );
  }

  public vehicleServiceListVehicle2(
    requestParameters: VehicleServiceApiVehicleServiceListVehicle2Request,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1ListVehicleReply>(
      'POST',
      '/v1/school/transport/vehicle/list',
      requestParameters.body,
      options,
    );
  }

  public vehicleServiceUpdateVehicle(
    requestParameters: VehicleServiceApiVehicleServiceUpdateVehicleRequest,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1Vehicle>(
      'PUT',
      `/v1/school/transport/vehicle/${encodeURIComponent(String(requestParameters.vehicleId))}`,
      requestParameters.body,
      options,
    );
  }

  public vehicleServiceUpdateVehicle2(
    requestParameters: VehicleServiceApiVehicleServiceUpdateVehicle2Request,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1Vehicle>(
      'PATCH',
      `/v1/school/transport/vehicle/${encodeURIComponent(String(requestParameters.vehicleId))}`,
      requestParameters.body,
      options,
    );
  }
}
