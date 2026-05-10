/* tslint:disable */
/* eslint-disable */

import type { AxiosPromise, AxiosRequestConfig } from 'axios';
import { BaseAPI } from '../base';
import type {
  AcademicSessionServiceUpdateAcademicSessionRequest,
  V1AcademicSession,
  V1CreateAcademicSessionRequest,
  V1DeleteAcademicSessionReply,
  V1ListAcademicSessionReply,
  V1ListAcademicSessionRequest,
} from '../models';

export interface AcademicSessionServiceApiAcademicSessionServiceCreateAcademicSessionRequest {
  readonly body: V1CreateAcademicSessionRequest;
}

export interface AcademicSessionServiceApiAcademicSessionServiceDeleteAcademicSessionRequest {
  readonly id: string;
}

export interface AcademicSessionServiceApiAcademicSessionServiceGetAcademicSessionRequest {
  readonly id: string;
}

export interface AcademicSessionServiceApiAcademicSessionServiceListAcademicSession2Request {
  readonly body: V1ListAcademicSessionRequest;
}

export interface AcademicSessionServiceApiAcademicSessionServiceUpdateAcademicSessionRequest {
  readonly sessionId: string;
  readonly body: AcademicSessionServiceUpdateAcademicSessionRequest;
}

export interface AcademicSessionServiceApiAcademicSessionServiceUpdateAcademicSession2Request {
  readonly sessionId: string;
  readonly body: AcademicSessionServiceUpdateAcademicSessionRequest;
}

export class AcademicSessionServiceApi extends BaseAPI {
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

  public academicSessionServiceCreateAcademicSession(
    requestParameters: AcademicSessionServiceApiAcademicSessionServiceCreateAcademicSessionRequest,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1AcademicSession>(
      'POST',
      '/v1/school/academic/session',
      requestParameters.body,
      options,
    );
  }

  public academicSessionServiceDeleteAcademicSession(
    requestParameters: AcademicSessionServiceApiAcademicSessionServiceDeleteAcademicSessionRequest,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1DeleteAcademicSessionReply>(
      'DELETE',
      `/v1/school/academic/session/${encodeURIComponent(String(requestParameters.id))}`,
      undefined,
      options,
    );
  }

  public academicSessionServiceGetAcademicSession(
    requestParameters: AcademicSessionServiceApiAcademicSessionServiceGetAcademicSessionRequest,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1AcademicSession>(
      'GET',
      `/v1/school/academic/session/${encodeURIComponent(String(requestParameters.id))}`,
      undefined,
      options,
    );
  }

  public academicSessionServiceListAcademicSession2(
    requestParameters: AcademicSessionServiceApiAcademicSessionServiceListAcademicSession2Request,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1ListAcademicSessionReply>(
      'POST',
      '/v1/school/academic/session/list',
      requestParameters.body,
      options,
    );
  }

  public academicSessionServiceUpdateAcademicSession(
    requestParameters: AcademicSessionServiceApiAcademicSessionServiceUpdateAcademicSessionRequest,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1AcademicSession>(
      'PUT',
      `/v1/school/academic/session/${encodeURIComponent(String(requestParameters.sessionId))}`,
      requestParameters.body,
      options,
    );
  }

  public academicSessionServiceUpdateAcademicSession2(
    requestParameters: AcademicSessionServiceApiAcademicSessionServiceUpdateAcademicSession2Request,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1AcademicSession>(
      'PATCH',
      `/v1/school/academic/session/${encodeURIComponent(String(requestParameters.sessionId))}`,
      requestParameters.body,
      options,
    );
  }
}
