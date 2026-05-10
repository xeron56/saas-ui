/* tslint:disable */
/* eslint-disable */

import type { AxiosPromise, AxiosRequestConfig } from 'axios';
import { BaseAPI } from '../base';
import type {
  FeeMasterServiceUpdateFeeMasterRequest,
  V1CreateFeeMasterRequest,
  V1DeleteFeeMasterReply,
  V1FeeMaster,
  V1ListFeeMasterReply,
  V1ListFeeMasterRequest,
} from '../models';

export interface FeeMasterServiceApiFeeMasterServiceCreateFeeMasterRequest {
  readonly body: V1CreateFeeMasterRequest;
}

export interface FeeMasterServiceApiFeeMasterServiceDeleteFeeMasterRequest {
  readonly id: string;
}

export interface FeeMasterServiceApiFeeMasterServiceGetFeeMasterRequest {
  readonly id: string;
}

export interface FeeMasterServiceApiFeeMasterServiceListFeeMaster2Request {
  readonly body: V1ListFeeMasterRequest;
}

export interface FeeMasterServiceApiFeeMasterServiceUpdateFeeMasterRequest {
  readonly feeMasterId: string;
  readonly body: FeeMasterServiceUpdateFeeMasterRequest;
}

export interface FeeMasterServiceApiFeeMasterServiceUpdateFeeMaster2Request {
  readonly feeMasterId: string;
  readonly body: FeeMasterServiceUpdateFeeMasterRequest;
}

export class FeeMasterServiceApi extends BaseAPI {
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

  public feeMasterServiceCreateFeeMaster(
    requestParameters: FeeMasterServiceApiFeeMasterServiceCreateFeeMasterRequest,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1FeeMaster>(
      'POST',
      '/v1/school/fees/master',
      requestParameters.body,
      options,
    );
  }

  public feeMasterServiceDeleteFeeMaster(
    requestParameters: FeeMasterServiceApiFeeMasterServiceDeleteFeeMasterRequest,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1DeleteFeeMasterReply>(
      'DELETE',
      `/v1/school/fees/master/${encodeURIComponent(String(requestParameters.id))}`,
      undefined,
      options,
    );
  }

  public feeMasterServiceGetFeeMaster(
    requestParameters: FeeMasterServiceApiFeeMasterServiceGetFeeMasterRequest,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1FeeMaster>(
      'GET',
      `/v1/school/fees/master/${encodeURIComponent(String(requestParameters.id))}`,
      undefined,
      options,
    );
  }

  public feeMasterServiceListFeeMaster2(
    requestParameters: FeeMasterServiceApiFeeMasterServiceListFeeMaster2Request,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1ListFeeMasterReply>(
      'POST',
      '/v1/school/fees/master/list',
      requestParameters.body,
      options,
    );
  }

  public feeMasterServiceUpdateFeeMaster(
    requestParameters: FeeMasterServiceApiFeeMasterServiceUpdateFeeMasterRequest,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1FeeMaster>(
      'PUT',
      `/v1/school/fees/master/${encodeURIComponent(String(requestParameters.feeMasterId))}`,
      requestParameters.body,
      options,
    );
  }

  public feeMasterServiceUpdateFeeMaster2(
    requestParameters: FeeMasterServiceApiFeeMasterServiceUpdateFeeMaster2Request,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1FeeMaster>(
      'PATCH',
      `/v1/school/fees/master/${encodeURIComponent(String(requestParameters.feeMasterId))}`,
      requestParameters.body,
      options,
    );
  }
}
