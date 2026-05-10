/* tslint:disable */
/* eslint-disable */

import type { AxiosPromise, AxiosRequestConfig } from 'axios';
import { BaseAPI } from '../base';
import type {
  MarkDivisionServiceUpdateMarkDivisionRequest,
  V1CreateMarkDivisionRequest,
  V1DeleteMarkDivisionReply,
  V1ListMarkDivisionReply,
  V1ListMarkDivisionRequest,
  V1MarkDivision,
} from '../models';

export interface MarkDivisionServiceApiMarkDivisionServiceCreateMarkDivisionRequest {
  readonly body: V1CreateMarkDivisionRequest;
}

export interface MarkDivisionServiceApiMarkDivisionServiceDeleteMarkDivisionRequest {
  readonly id: string;
}

export interface MarkDivisionServiceApiMarkDivisionServiceGetMarkDivisionRequest {
  readonly id: string;
}

export interface MarkDivisionServiceApiMarkDivisionServiceListMarkDivision2Request {
  readonly body: V1ListMarkDivisionRequest;
}

export interface MarkDivisionServiceApiMarkDivisionServiceUpdateMarkDivisionRequest {
  readonly markDivisionId: string;
  readonly body: MarkDivisionServiceUpdateMarkDivisionRequest;
}

export interface MarkDivisionServiceApiMarkDivisionServiceUpdateMarkDivision2Request {
  readonly markDivisionId: string;
  readonly body: MarkDivisionServiceUpdateMarkDivisionRequest;
}

export class MarkDivisionServiceApi extends BaseAPI {
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

  public markDivisionServiceCreateMarkDivision(
    requestParameters: MarkDivisionServiceApiMarkDivisionServiceCreateMarkDivisionRequest,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1MarkDivision>(
      'POST',
      '/v1/school/mark-division',
      requestParameters.body,
      options,
    );
  }

  public markDivisionServiceDeleteMarkDivision(
    requestParameters: MarkDivisionServiceApiMarkDivisionServiceDeleteMarkDivisionRequest,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1DeleteMarkDivisionReply>(
      'DELETE',
      `/v1/school/mark-division/${encodeURIComponent(String(requestParameters.id))}`,
      undefined,
      options,
    );
  }

  public markDivisionServiceGetMarkDivision(
    requestParameters: MarkDivisionServiceApiMarkDivisionServiceGetMarkDivisionRequest,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1MarkDivision>(
      'GET',
      `/v1/school/mark-division/${encodeURIComponent(String(requestParameters.id))}`,
      undefined,
      options,
    );
  }

  public markDivisionServiceListMarkDivision2(
    requestParameters: MarkDivisionServiceApiMarkDivisionServiceListMarkDivision2Request,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1ListMarkDivisionReply>(
      'POST',
      '/v1/school/mark-division/list',
      requestParameters.body,
      options,
    );
  }

  public markDivisionServiceUpdateMarkDivision(
    requestParameters: MarkDivisionServiceApiMarkDivisionServiceUpdateMarkDivisionRequest,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1MarkDivision>(
      'PUT',
      `/v1/school/mark-division/${encodeURIComponent(String(requestParameters.markDivisionId))}`,
      requestParameters.body,
      options,
    );
  }

  public markDivisionServiceUpdateMarkDivision2(
    requestParameters: MarkDivisionServiceApiMarkDivisionServiceUpdateMarkDivision2Request,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1MarkDivision>(
      'PATCH',
      `/v1/school/mark-division/${encodeURIComponent(String(requestParameters.markDivisionId))}`,
      requestParameters.body,
      options,
    );
  }
}
