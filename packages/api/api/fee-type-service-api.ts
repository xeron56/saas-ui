/* tslint:disable */
/* eslint-disable */

import type { AxiosPromise, AxiosRequestConfig } from 'axios';
import { BaseAPI } from '../base';
import type {
  FeeTypeServiceUpdateFeeTypeRequest,
  V1CreateFeeTypeRequest,
  V1DeleteFeeTypeReply,
  V1FeeType,
  V1ListFeeTypeReply,
  V1ListFeeTypeRequest,
} from '../models';

export interface FeeTypeServiceApiFeeTypeServiceCreateFeeTypeRequest {
  readonly body: V1CreateFeeTypeRequest;
}

export interface FeeTypeServiceApiFeeTypeServiceDeleteFeeTypeRequest {
  readonly id: string;
}

export interface FeeTypeServiceApiFeeTypeServiceGetFeeTypeRequest {
  readonly id: string;
}

export interface FeeTypeServiceApiFeeTypeServiceListFeeType2Request {
  readonly body: V1ListFeeTypeRequest;
}

export interface FeeTypeServiceApiFeeTypeServiceUpdateFeeTypeRequest {
  readonly feeTypeId: string;
  readonly body: FeeTypeServiceUpdateFeeTypeRequest;
}

export interface FeeTypeServiceApiFeeTypeServiceUpdateFeeType2Request {
  readonly feeTypeId: string;
  readonly body: FeeTypeServiceUpdateFeeTypeRequest;
}

export class FeeTypeServiceApi extends BaseAPI {
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

  public feeTypeServiceCreateFeeType(
    requestParameters: FeeTypeServiceApiFeeTypeServiceCreateFeeTypeRequest,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1FeeType>('POST', '/v1/school/fees/type', requestParameters.body, options);
  }

  public feeTypeServiceDeleteFeeType(
    requestParameters: FeeTypeServiceApiFeeTypeServiceDeleteFeeTypeRequest,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1DeleteFeeTypeReply>(
      'DELETE',
      `/v1/school/fees/type/${encodeURIComponent(String(requestParameters.id))}`,
      undefined,
      options,
    );
  }

  public feeTypeServiceGetFeeType(
    requestParameters: FeeTypeServiceApiFeeTypeServiceGetFeeTypeRequest,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1FeeType>(
      'GET',
      `/v1/school/fees/type/${encodeURIComponent(String(requestParameters.id))}`,
      undefined,
      options,
    );
  }

  public feeTypeServiceListFeeType2(
    requestParameters: FeeTypeServiceApiFeeTypeServiceListFeeType2Request,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1ListFeeTypeReply>(
      'POST',
      '/v1/school/fees/type/list',
      requestParameters.body,
      options,
    );
  }

  public feeTypeServiceUpdateFeeType(
    requestParameters: FeeTypeServiceApiFeeTypeServiceUpdateFeeTypeRequest,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1FeeType>(
      'PUT',
      `/v1/school/fees/type/${encodeURIComponent(String(requestParameters.feeTypeId))}`,
      requestParameters.body,
      options,
    );
  }

  public feeTypeServiceUpdateFeeType2(
    requestParameters: FeeTypeServiceApiFeeTypeServiceUpdateFeeType2Request,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1FeeType>(
      'PATCH',
      `/v1/school/fees/type/${encodeURIComponent(String(requestParameters.feeTypeId))}`,
      requestParameters.body,
      options,
    );
  }
}
