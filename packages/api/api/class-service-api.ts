/* tslint:disable */
/* eslint-disable */

import type { AxiosPromise, AxiosRequestConfig } from 'axios';
import { BaseAPI } from '../base';
import type {
  ClassServiceUpdateClassRequest,
  V1Class,
  V1CreateClassRequest,
  V1DeleteClassReply,
  V1ListClassReply,
  V1ListClassRequest,
} from '../models';

export interface ClassServiceApiClassServiceCreateClassRequest {
  readonly body: V1CreateClassRequest;
}

export interface ClassServiceApiClassServiceDeleteClassRequest {
  readonly id: string;
}

export interface ClassServiceApiClassServiceGetClassRequest {
  readonly id: string;
}

export interface ClassServiceApiClassServiceListClass2Request {
  readonly body: V1ListClassRequest;
}

export interface ClassServiceApiClassServiceUpdateClassRequest {
  readonly classId: string;
  readonly body: ClassServiceUpdateClassRequest;
}

export interface ClassServiceApiClassServiceUpdateClass2Request {
  readonly classId: string;
  readonly body: ClassServiceUpdateClassRequest;
}

export class ClassServiceApi extends BaseAPI {
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

  public classServiceCreateClass(
    requestParameters: ClassServiceApiClassServiceCreateClassRequest,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1Class>('POST', '/v1/school/class', requestParameters.body, options);
  }

  public classServiceDeleteClass(
    requestParameters: ClassServiceApiClassServiceDeleteClassRequest,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1DeleteClassReply>(
      'DELETE',
      `/v1/school/class/${encodeURIComponent(String(requestParameters.id))}`,
      undefined,
      options,
    );
  }

  public classServiceGetClass(
    requestParameters: ClassServiceApiClassServiceGetClassRequest,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1Class>(
      'GET',
      `/v1/school/class/${encodeURIComponent(String(requestParameters.id))}`,
      undefined,
      options,
    );
  }

  public classServiceListClass2(
    requestParameters: ClassServiceApiClassServiceListClass2Request,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1ListClassReply>(
      'POST',
      '/v1/school/class/list',
      requestParameters.body,
      options,
    );
  }

  public classServiceUpdateClass(
    requestParameters: ClassServiceApiClassServiceUpdateClassRequest,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1Class>(
      'PUT',
      `/v1/school/class/${encodeURIComponent(String(requestParameters.classId))}`,
      requestParameters.body,
      options,
    );
  }

  public classServiceUpdateClass2(
    requestParameters: ClassServiceApiClassServiceUpdateClass2Request,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1Class>(
      'PATCH',
      `/v1/school/class/${encodeURIComponent(String(requestParameters.classId))}`,
      requestParameters.body,
      options,
    );
  }
}
