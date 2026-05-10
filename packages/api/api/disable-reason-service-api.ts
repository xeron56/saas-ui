/* tslint:disable */
/* eslint-disable */

import type { AxiosPromise, AxiosRequestConfig } from 'axios';
import { BaseAPI } from '../base';
import type {
  DisableReasonServiceUpdateDisableReasonRequest,
  V1CreateDisableReasonRequest,
  V1DeleteDisableReasonReply,
  V1DisableReason,
  V1ListDisableReasonReply,
  V1ListDisableReasonRequest,
} from '../models';

export interface DisableReasonServiceApiDisableReasonServiceCreateDisableReasonRequest {
  readonly body: V1CreateDisableReasonRequest;
}

export interface DisableReasonServiceApiDisableReasonServiceDeleteDisableReasonRequest {
  readonly id: string;
}

export interface DisableReasonServiceApiDisableReasonServiceGetDisableReasonRequest {
  readonly id: string;
}

export interface DisableReasonServiceApiDisableReasonServiceListDisableReason2Request {
  readonly body: V1ListDisableReasonRequest;
}

export interface DisableReasonServiceApiDisableReasonServiceUpdateDisableReasonRequest {
  readonly reasonId: string;
  readonly body: DisableReasonServiceUpdateDisableReasonRequest;
}

export interface DisableReasonServiceApiDisableReasonServiceUpdateDisableReason2Request {
  readonly reasonId: string;
  readonly body: DisableReasonServiceUpdateDisableReasonRequest;
}

export class DisableReasonServiceApi extends BaseAPI {
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

  public disableReasonServiceCreateDisableReason(
    requestParameters: DisableReasonServiceApiDisableReasonServiceCreateDisableReasonRequest,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1DisableReason>(
      'POST',
      '/v1/school/student/disable-reason',
      requestParameters.body,
      options,
    );
  }

  public disableReasonServiceDeleteDisableReason(
    requestParameters: DisableReasonServiceApiDisableReasonServiceDeleteDisableReasonRequest,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1DeleteDisableReasonReply>(
      'DELETE',
      `/v1/school/student/disable-reason/${encodeURIComponent(String(requestParameters.id))}`,
      undefined,
      options,
    );
  }

  public disableReasonServiceGetDisableReason(
    requestParameters: DisableReasonServiceApiDisableReasonServiceGetDisableReasonRequest,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1DisableReason>(
      'GET',
      `/v1/school/student/disable-reason/${encodeURIComponent(String(requestParameters.id))}`,
      undefined,
      options,
    );
  }

  public disableReasonServiceListDisableReason2(
    requestParameters: DisableReasonServiceApiDisableReasonServiceListDisableReason2Request,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1ListDisableReasonReply>(
      'POST',
      '/v1/school/student/disable-reason/list',
      requestParameters.body,
      options,
    );
  }

  public disableReasonServiceUpdateDisableReason(
    requestParameters: DisableReasonServiceApiDisableReasonServiceUpdateDisableReasonRequest,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1DisableReason>(
      'PUT',
      `/v1/school/student/disable-reason/${encodeURIComponent(String(requestParameters.reasonId))}`,
      requestParameters.body,
      options,
    );
  }

  public disableReasonServiceUpdateDisableReason2(
    requestParameters: DisableReasonServiceApiDisableReasonServiceUpdateDisableReason2Request,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1DisableReason>(
      'PATCH',
      `/v1/school/student/disable-reason/${encodeURIComponent(String(requestParameters.reasonId))}`,
      requestParameters.body,
      options,
    );
  }
}
