/* tslint:disable */
/* eslint-disable */

import type { AxiosPromise, AxiosRequestConfig } from 'axios';
import { BaseAPI } from '../base';
import type {
  ExamServiceUpdateExamRequest,
  V1CreateExamRequest,
  V1DeleteExamReply,
  V1Exam,
  V1ListExamReply,
  V1ListExamRequest,
} from '../models';

export interface ExamServiceApiExamServiceCreateExamRequest {
  readonly body: V1CreateExamRequest;
}

export interface ExamServiceApiExamServiceDeleteExamRequest {
  readonly id: string;
}

export interface ExamServiceApiExamServiceGetExamRequest {
  readonly id: string;
}

export interface ExamServiceApiExamServiceListExam2Request {
  readonly body: V1ListExamRequest;
}

export interface SchoolExamConnection {
  readonly id?: string;
  readonly examGroupId?: string;
  readonly examId?: string;
  readonly examName?: string;
  readonly examWeightage?: number;
  readonly isActive?: boolean;
  readonly totalSubjects?: number;
}

export interface SchoolListExamConnectionsReply {
  readonly items?: SchoolExamConnection[];
}

export interface SchoolSaveExamConnectionsRequest {
  readonly items?: SchoolExamConnection[];
}

export interface ExamServiceApiExamServiceListExamConnectionsRequest {
  readonly examGroupId: string;
}

export interface ExamServiceApiExamServiceSaveExamConnectionsRequest {
  readonly examGroupId: string;
  readonly body: SchoolSaveExamConnectionsRequest;
}

export interface ExamServiceApiExamServiceUpdateExamRequest {
  readonly examId: string;
  readonly body: ExamServiceUpdateExamRequest;
}

export interface ExamServiceApiExamServiceUpdateExam2Request {
  readonly examId: string;
  readonly body: ExamServiceUpdateExamRequest;
}

export class ExamServiceApi extends BaseAPI {
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

  public examServiceCreateExam(
    requestParameters: ExamServiceApiExamServiceCreateExamRequest,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1Exam>('POST', '/v1/school/exam', requestParameters.body, options);
  }

  public examServiceDeleteExam(
    requestParameters: ExamServiceApiExamServiceDeleteExamRequest,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1DeleteExamReply>(
      'DELETE',
      `/v1/school/exam/${encodeURIComponent(String(requestParameters.id))}`,
      undefined,
      options,
    );
  }

  public examServiceGetExam(
    requestParameters: ExamServiceApiExamServiceGetExamRequest,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1Exam>(
      'GET',
      `/v1/school/exam/${encodeURIComponent(String(requestParameters.id))}`,
      undefined,
      options,
    );
  }

  public examServiceListExam2(
    requestParameters: ExamServiceApiExamServiceListExam2Request,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1ListExamReply>(
      'POST',
      '/v1/school/exam/list',
      requestParameters.body,
      options,
    );
  }

  public examServiceListExamConnections(
    requestParameters: ExamServiceApiExamServiceListExamConnectionsRequest,
    options?: AxiosRequestConfig,
  ) {
    return this.request<SchoolListExamConnectionsReply>(
      'GET',
      `/v1/school/exam-group/${encodeURIComponent(
        String(requestParameters.examGroupId),
      )}/connections`,
      undefined,
      options,
    );
  }

  public examServiceSaveExamConnections(
    requestParameters: ExamServiceApiExamServiceSaveExamConnectionsRequest,
    options?: AxiosRequestConfig,
  ) {
    return this.request<SchoolListExamConnectionsReply>(
      'POST',
      `/v1/school/exam-group/${encodeURIComponent(
        String(requestParameters.examGroupId),
      )}/connections`,
      requestParameters.body,
      options,
    );
  }

  public examServiceUpdateExam(
    requestParameters: ExamServiceApiExamServiceUpdateExamRequest,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1Exam>(
      'PUT',
      `/v1/school/exam/${encodeURIComponent(String(requestParameters.examId))}`,
      requestParameters.body,
      options,
    );
  }

  public examServiceUpdateExam2(
    requestParameters: ExamServiceApiExamServiceUpdateExam2Request,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1Exam>(
      'PATCH',
      `/v1/school/exam/${encodeURIComponent(String(requestParameters.examId))}`,
      requestParameters.body,
      options,
    );
  }
}
