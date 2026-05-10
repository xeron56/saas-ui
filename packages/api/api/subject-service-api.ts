/* tslint:disable */
/* eslint-disable */

import type { AxiosPromise, AxiosRequestConfig } from 'axios';
import { BaseAPI } from '../base';
import type {
  SubjectServiceUpdateSubjectRequest,
  V1CreateSubjectRequest,
  V1DeleteSubjectReply,
  V1ListSubjectReply,
  V1ListSubjectRequest,
  V1Subject,
} from '../models';

export interface SubjectServiceApiSubjectServiceCreateSubjectRequest {
  readonly body: V1CreateSubjectRequest;
}

export interface SubjectServiceApiSubjectServiceDeleteSubjectRequest {
  readonly id: string;
}

export interface SubjectServiceApiSubjectServiceGetSubjectRequest {
  readonly id: string;
}

export interface SubjectServiceApiSubjectServiceListSubject2Request {
  readonly body: V1ListSubjectRequest;
}

export interface SubjectServiceApiSubjectServiceUpdateSubjectRequest {
  readonly subjectId: string;
  readonly body: SubjectServiceUpdateSubjectRequest;
}

export interface SubjectServiceApiSubjectServiceUpdateSubject2Request {
  readonly subjectId: string;
  readonly body: SubjectServiceUpdateSubjectRequest;
}

export class SubjectServiceApi extends BaseAPI {
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

  public subjectServiceCreateSubject(
    requestParameters: SubjectServiceApiSubjectServiceCreateSubjectRequest,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1Subject>('POST', '/v1/school/subject', requestParameters.body, options);
  }

  public subjectServiceDeleteSubject(
    requestParameters: SubjectServiceApiSubjectServiceDeleteSubjectRequest,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1DeleteSubjectReply>(
      'DELETE',
      `/v1/school/subject/${encodeURIComponent(String(requestParameters.id))}`,
      undefined,
      options,
    );
  }

  public subjectServiceGetSubject(
    requestParameters: SubjectServiceApiSubjectServiceGetSubjectRequest,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1Subject>(
      'GET',
      `/v1/school/subject/${encodeURIComponent(String(requestParameters.id))}`,
      undefined,
      options,
    );
  }

  public subjectServiceListSubject2(
    requestParameters: SubjectServiceApiSubjectServiceListSubject2Request,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1ListSubjectReply>(
      'POST',
      '/v1/school/subject/list',
      requestParameters.body,
      options,
    );
  }

  public subjectServiceUpdateSubject(
    requestParameters: SubjectServiceApiSubjectServiceUpdateSubjectRequest,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1Subject>(
      'PUT',
      `/v1/school/subject/${encodeURIComponent(String(requestParameters.subjectId))}`,
      requestParameters.body,
      options,
    );
  }

  public subjectServiceUpdateSubject2(
    requestParameters: SubjectServiceApiSubjectServiceUpdateSubject2Request,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1Subject>(
      'PATCH',
      `/v1/school/subject/${encodeURIComponent(String(requestParameters.subjectId))}`,
      requestParameters.body,
      options,
    );
  }
}
