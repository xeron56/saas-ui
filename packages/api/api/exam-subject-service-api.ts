/* tslint:disable */
/* eslint-disable */

import type { AxiosPromise, AxiosRequestConfig } from 'axios';
import { BaseAPI } from '../base';
import type {
  ExamSubjectServiceUpdateExamSubjectRequest,
  V1CreateExamSubjectRequest,
  V1DeleteExamSubjectReply,
  V1ExamSubject,
  V1ListExamSubjectReply,
  V1ListExamSubjectRequest,
} from '../models';

export interface ExamSubjectServiceApiExamSubjectServiceCreateExamSubjectRequest {
  readonly body: V1CreateExamSubjectRequest;
}

export interface ExamSubjectServiceApiExamSubjectServiceDeleteExamSubjectRequest {
  readonly id: string;
}

export interface ExamSubjectServiceApiExamSubjectServiceGetExamSubjectRequest {
  readonly id: string;
}

export interface ExamSubjectServiceApiExamSubjectServiceListExamSubject2Request {
  readonly body: V1ListExamSubjectRequest;
}

export interface ExamSubjectServiceApiExamSubjectServiceUpdateExamSubjectRequest {
  readonly examSubjectId: string;
  readonly body: ExamSubjectServiceUpdateExamSubjectRequest;
}

export interface ExamSubjectServiceApiExamSubjectServiceUpdateExamSubject2Request {
  readonly examSubjectId: string;
  readonly body: ExamSubjectServiceUpdateExamSubjectRequest;
}

export class ExamSubjectServiceApi extends BaseAPI {
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

  public examSubjectServiceCreateExamSubject(
    requestParameters: ExamSubjectServiceApiExamSubjectServiceCreateExamSubjectRequest,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1ExamSubject>(
      'POST',
      '/v1/school/exam-subject',
      requestParameters.body,
      options,
    );
  }

  public examSubjectServiceDeleteExamSubject(
    requestParameters: ExamSubjectServiceApiExamSubjectServiceDeleteExamSubjectRequest,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1DeleteExamSubjectReply>(
      'DELETE',
      `/v1/school/exam-subject/${encodeURIComponent(String(requestParameters.id))}`,
      undefined,
      options,
    );
  }

  public examSubjectServiceGetExamSubject(
    requestParameters: ExamSubjectServiceApiExamSubjectServiceGetExamSubjectRequest,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1ExamSubject>(
      'GET',
      `/v1/school/exam-subject/${encodeURIComponent(String(requestParameters.id))}`,
      undefined,
      options,
    );
  }

  public examSubjectServiceListExamSubject2(
    requestParameters: ExamSubjectServiceApiExamSubjectServiceListExamSubject2Request,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1ListExamSubjectReply>(
      'POST',
      '/v1/school/exam-subject/list',
      requestParameters.body,
      options,
    );
  }

  public examSubjectServiceUpdateExamSubject(
    requestParameters: ExamSubjectServiceApiExamSubjectServiceUpdateExamSubjectRequest,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1ExamSubject>(
      'PUT',
      `/v1/school/exam-subject/${encodeURIComponent(String(requestParameters.examSubjectId))}`,
      requestParameters.body,
      options,
    );
  }

  public examSubjectServiceUpdateExamSubject2(
    requestParameters: ExamSubjectServiceApiExamSubjectServiceUpdateExamSubject2Request,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1ExamSubject>(
      'PATCH',
      `/v1/school/exam-subject/${encodeURIComponent(String(requestParameters.examSubjectId))}`,
      requestParameters.body,
      options,
    );
  }
}
