/* tslint:disable */
/* eslint-disable */

import type { AxiosPromise, AxiosRequestConfig } from 'axios';
import { BaseAPI } from '../base';
import type {
  FeeGroupServiceUpdateFeeGroupRequest,
  V1CreateFeeGroupRequest,
  V1DeleteFeeGroupReply,
  V1FeeGroup,
  V1ListFeeGroupReply,
  V1ListFeeGroupRequest,
} from '../models';

export interface FeeGroupServiceApiFeeGroupServiceCreateFeeGroupRequest {
  readonly body: V1CreateFeeGroupRequest;
}

export interface FeeGroupServiceApiFeeGroupServiceDeleteFeeGroupRequest {
  readonly id: string;
}

export interface FeeGroupServiceApiFeeGroupServiceGetFeeGroupRequest {
  readonly id: string;
}

export interface FeeGroupServiceApiFeeGroupServiceListFeeGroup2Request {
  readonly body: V1ListFeeGroupRequest;
}

export interface FeeGroupServiceApiFeeGroupServiceUpdateFeeGroupRequest {
  readonly groupId: string;
  readonly body: FeeGroupServiceUpdateFeeGroupRequest;
}

export interface FeeGroupServiceApiFeeGroupServiceUpdateFeeGroup2Request {
  readonly groupId: string;
  readonly body: FeeGroupServiceUpdateFeeGroupRequest;
}

export class FeeGroupServiceApi extends BaseAPI {
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

  public feeGroupServiceCreateFeeGroup(
    requestParameters: FeeGroupServiceApiFeeGroupServiceCreateFeeGroupRequest,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1FeeGroup>('POST', '/v1/school/fees/group', requestParameters.body, options);
  }

  public feeGroupServiceDeleteFeeGroup(
    requestParameters: FeeGroupServiceApiFeeGroupServiceDeleteFeeGroupRequest,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1DeleteFeeGroupReply>(
      'DELETE',
      `/v1/school/fees/group/${encodeURIComponent(String(requestParameters.id))}`,
      undefined,
      options,
    );
  }

  public feeGroupServiceGetFeeGroup(
    requestParameters: FeeGroupServiceApiFeeGroupServiceGetFeeGroupRequest,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1FeeGroup>(
      'GET',
      `/v1/school/fees/group/${encodeURIComponent(String(requestParameters.id))}`,
      undefined,
      options,
    );
  }

  public feeGroupServiceListFeeGroup2(
    requestParameters: FeeGroupServiceApiFeeGroupServiceListFeeGroup2Request,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1ListFeeGroupReply>(
      'POST',
      '/v1/school/fees/group/list',
      requestParameters.body,
      options,
    );
  }

  public feeGroupServiceUpdateFeeGroup(
    requestParameters: FeeGroupServiceApiFeeGroupServiceUpdateFeeGroupRequest,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1FeeGroup>(
      'PUT',
      `/v1/school/fees/group/${encodeURIComponent(String(requestParameters.groupId))}`,
      requestParameters.body,
      options,
    );
  }

  public feeGroupServiceUpdateFeeGroup2(
    requestParameters: FeeGroupServiceApiFeeGroupServiceUpdateFeeGroup2Request,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1FeeGroup>(
      'PATCH',
      `/v1/school/fees/group/${encodeURIComponent(String(requestParameters.groupId))}`,
      requestParameters.body,
      options,
    );
  }
}
