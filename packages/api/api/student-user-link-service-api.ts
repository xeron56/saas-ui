/* tslint:disable */
/* eslint-disable */

import type { AxiosPromise, AxiosRequestConfig } from 'axios';
import { BaseAPI } from '../base';
import type {
  StudentUserLinkServiceUpdateStudentUserLinkRequest,
  V1CreateStudentUserLinkRequest,
  V1DeleteStudentUserLinkReply,
  V1ListStudentUserLinkReply,
  V1ListStudentUserLinkRequest,
  V1StudentUserLink,
} from '../models';

export interface StudentUserLinkServiceApiStudentUserLinkServiceCreateStudentUserLinkRequest {
  readonly body: V1CreateStudentUserLinkRequest;
}

export interface StudentUserLinkServiceApiStudentUserLinkServiceDeleteStudentUserLinkRequest {
  readonly id: string;
}

export interface StudentUserLinkServiceApiStudentUserLinkServiceGetStudentUserLinkRequest {
  readonly id: string;
}

export interface StudentUserLinkServiceApiStudentUserLinkServiceListStudentUserLink2Request {
  readonly body: V1ListStudentUserLinkRequest;
}

export interface StudentUserLinkServiceApiStudentUserLinkServiceUpdateStudentUserLinkRequest {
  readonly linkId: string;
  readonly body: StudentUserLinkServiceUpdateStudentUserLinkRequest;
}

export interface StudentUserLinkServiceApiStudentUserLinkServiceUpdateStudentUserLink2Request {
  readonly linkId: string;
  readonly body: StudentUserLinkServiceUpdateStudentUserLinkRequest;
}

export class StudentUserLinkServiceApi extends BaseAPI {
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

  public studentUserLinkServiceCreateStudentUserLink(
    requestParameters: StudentUserLinkServiceApiStudentUserLinkServiceCreateStudentUserLinkRequest,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1StudentUserLink>(
      'POST',
      '/v1/school/student-user-link',
      requestParameters.body,
      options,
    );
  }

  public studentUserLinkServiceDeleteStudentUserLink(
    requestParameters: StudentUserLinkServiceApiStudentUserLinkServiceDeleteStudentUserLinkRequest,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1DeleteStudentUserLinkReply>(
      'DELETE',
      `/v1/school/student-user-link/${encodeURIComponent(String(requestParameters.id))}`,
      undefined,
      options,
    );
  }

  public studentUserLinkServiceGetStudentUserLink(
    requestParameters: StudentUserLinkServiceApiStudentUserLinkServiceGetStudentUserLinkRequest,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1StudentUserLink>(
      'GET',
      `/v1/school/student-user-link/${encodeURIComponent(String(requestParameters.id))}`,
      undefined,
      options,
    );
  }

  public studentUserLinkServiceListStudentUserLink2(
    requestParameters: StudentUserLinkServiceApiStudentUserLinkServiceListStudentUserLink2Request,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1ListStudentUserLinkReply>(
      'POST',
      '/v1/school/student-user-link/list',
      requestParameters.body,
      options,
    );
  }

  public studentUserLinkServiceUpdateStudentUserLink(
    requestParameters: StudentUserLinkServiceApiStudentUserLinkServiceUpdateStudentUserLinkRequest,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1StudentUserLink>(
      'PUT',
      `/v1/school/student-user-link/${encodeURIComponent(String(requestParameters.linkId))}`,
      requestParameters.body,
      options,
    );
  }

  public studentUserLinkServiceUpdateStudentUserLink2(
    requestParameters: StudentUserLinkServiceApiStudentUserLinkServiceUpdateStudentUserLink2Request,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1StudentUserLink>(
      'PATCH',
      `/v1/school/student-user-link/${encodeURIComponent(String(requestParameters.linkId))}`,
      requestParameters.body,
      options,
    );
  }
}
