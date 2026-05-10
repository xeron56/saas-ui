/* tslint:disable */
/* eslint-disable */

import type { AxiosPromise, AxiosRequestConfig } from 'axios';
import { BaseAPI } from '../base';
import type {
  ExamGradeServiceUpdateExamGradeRequest,
  V1CreateExamGradeRequest,
  V1DeleteExamGradeReply,
  V1ExamGrade,
  V1ListExamGradeReply,
  V1ListExamGradeRequest,
} from '../models';

export interface ExamGradeServiceApiExamGradeServiceCreateExamGradeRequest {
  readonly body: V1CreateExamGradeRequest;
}

export interface ExamGradeServiceApiExamGradeServiceDeleteExamGradeRequest {
  readonly id: string;
}

export interface ExamGradeServiceApiExamGradeServiceGetExamGradeRequest {
  readonly id: string;
}

export interface ExamGradeServiceApiExamGradeServiceListExamGrade2Request {
  readonly body: V1ListExamGradeRequest;
}

export interface ExamGradeServiceApiExamGradeServiceUpdateExamGradeRequest {
  readonly examGradeId: string;
  readonly body: ExamGradeServiceUpdateExamGradeRequest;
}

export interface ExamGradeServiceApiExamGradeServiceUpdateExamGrade2Request {
  readonly examGradeId: string;
  readonly body: ExamGradeServiceUpdateExamGradeRequest;
}

export class ExamGradeServiceApi extends BaseAPI {
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

  public examGradeServiceCreateExamGrade(
    requestParameters: ExamGradeServiceApiExamGradeServiceCreateExamGradeRequest,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1ExamGrade>(
      'POST',
      '/v1/school/exam-grade',
      requestParameters.body,
      options,
    );
  }

  public examGradeServiceDeleteExamGrade(
    requestParameters: ExamGradeServiceApiExamGradeServiceDeleteExamGradeRequest,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1DeleteExamGradeReply>(
      'DELETE',
      `/v1/school/exam-grade/${encodeURIComponent(String(requestParameters.id))}`,
      undefined,
      options,
    );
  }

  public examGradeServiceGetExamGrade(
    requestParameters: ExamGradeServiceApiExamGradeServiceGetExamGradeRequest,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1ExamGrade>(
      'GET',
      `/v1/school/exam-grade/${encodeURIComponent(String(requestParameters.id))}`,
      undefined,
      options,
    );
  }

  public examGradeServiceListExamGrade2(
    requestParameters: ExamGradeServiceApiExamGradeServiceListExamGrade2Request,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1ListExamGradeReply>(
      'POST',
      '/v1/school/exam-grade/list',
      requestParameters.body,
      options,
    );
  }

  public examGradeServiceUpdateExamGrade(
    requestParameters: ExamGradeServiceApiExamGradeServiceUpdateExamGradeRequest,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1ExamGrade>(
      'PUT',
      `/v1/school/exam-grade/${encodeURIComponent(String(requestParameters.examGradeId))}`,
      requestParameters.body,
      options,
    );
  }

  public examGradeServiceUpdateExamGrade2(
    requestParameters: ExamGradeServiceApiExamGradeServiceUpdateExamGrade2Request,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1ExamGrade>(
      'PATCH',
      `/v1/school/exam-grade/${encodeURIComponent(String(requestParameters.examGradeId))}`,
      requestParameters.body,
      options,
    );
  }
}
