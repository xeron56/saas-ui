/* tslint:disable */
/* eslint-disable */

import type { AxiosPromise, AxiosRequestConfig } from 'axios';
import { BaseAPI } from '../base';
import type {
  TransportFeeMasterServiceUpdateTransportFeeMasterRequest,
  V1CreateTransportFeeMasterRequest,
  V1DeleteTransportFeeMasterReply,
  V1ListTransportFeeMasterReply,
  V1ListTransportFeeMasterRequest,
  V1TransportFeeMaster,
} from '../models';

export interface TransportFeeMasterServiceApiTransportFeeMasterServiceCreateTransportFeeMasterRequest {
  readonly body: V1CreateTransportFeeMasterRequest;
}

export interface TransportFeeMasterServiceApiTransportFeeMasterServiceDeleteTransportFeeMasterRequest {
  readonly id: string;
}

export interface TransportFeeMasterServiceApiTransportFeeMasterServiceGetTransportFeeMasterRequest {
  readonly id: string;
}

export interface TransportFeeMasterServiceApiTransportFeeMasterServiceListTransportFeeMaster2Request {
  readonly body: V1ListTransportFeeMasterRequest;
}

export interface TransportFeeMasterServiceApiTransportFeeMasterServiceUpdateTransportFeeMasterRequest {
  readonly feeMasterId: string;
  readonly body: TransportFeeMasterServiceUpdateTransportFeeMasterRequest;
}

export interface TransportFeeMasterServiceApiTransportFeeMasterServiceUpdateTransportFeeMaster2Request {
  readonly feeMasterId: string;
  readonly body: TransportFeeMasterServiceUpdateTransportFeeMasterRequest;
}

export class TransportFeeMasterServiceApi extends BaseAPI {
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

  public transportFeeMasterServiceCreateTransportFeeMaster(
    requestParameters: TransportFeeMasterServiceApiTransportFeeMasterServiceCreateTransportFeeMasterRequest,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1TransportFeeMaster>(
      'POST',
      '/v1/school/transport/fee-master',
      requestParameters.body,
      options,
    );
  }

  public transportFeeMasterServiceDeleteTransportFeeMaster(
    requestParameters: TransportFeeMasterServiceApiTransportFeeMasterServiceDeleteTransportFeeMasterRequest,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1DeleteTransportFeeMasterReply>(
      'DELETE',
      `/v1/school/transport/fee-master/${encodeURIComponent(String(requestParameters.id))}`,
      undefined,
      options,
    );
  }

  public transportFeeMasterServiceGetTransportFeeMaster(
    requestParameters: TransportFeeMasterServiceApiTransportFeeMasterServiceGetTransportFeeMasterRequest,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1TransportFeeMaster>(
      'GET',
      `/v1/school/transport/fee-master/${encodeURIComponent(String(requestParameters.id))}`,
      undefined,
      options,
    );
  }

  public transportFeeMasterServiceListTransportFeeMaster2(
    requestParameters: TransportFeeMasterServiceApiTransportFeeMasterServiceListTransportFeeMaster2Request,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1ListTransportFeeMasterReply>(
      'POST',
      '/v1/school/transport/fee-master/list',
      requestParameters.body,
      options,
    );
  }

  public transportFeeMasterServiceUpdateTransportFeeMaster(
    requestParameters: TransportFeeMasterServiceApiTransportFeeMasterServiceUpdateTransportFeeMasterRequest,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1TransportFeeMaster>(
      'PUT',
      `/v1/school/transport/fee-master/${encodeURIComponent(
        String(requestParameters.feeMasterId),
      )}`,
      requestParameters.body,
      options,
    );
  }

  public transportFeeMasterServiceUpdateTransportFeeMaster2(
    requestParameters: TransportFeeMasterServiceApiTransportFeeMasterServiceUpdateTransportFeeMaster2Request,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1TransportFeeMaster>(
      'PATCH',
      `/v1/school/transport/fee-master/${encodeURIComponent(
        String(requestParameters.feeMasterId),
      )}`,
      requestParameters.body,
      options,
    );
  }
}
