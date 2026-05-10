/* tslint:disable */
/* eslint-disable */

import type { AxiosPromise, AxiosRequestConfig } from 'axios';
import { BaseAPI } from '../base';
import type {
  ExamGroupServiceUpdateExamGroupRequest,
  V1CreateExamGroupRequest,
  V1DeleteExamGroupReply,
  V1ExamGroup,
  V1ListExamGroupReply,
  V1ListExamGroupRequest,
} from '../models';

export interface ExamGroupServiceApiExamGroupServiceCreateExamGroupRequest {
  readonly body: V1CreateExamGroupRequest;
}

export interface ExamGroupServiceApiExamGroupServiceDeleteExamGroupRequest {
  readonly id: string;
}

export interface ExamGroupServiceApiExamGroupServiceGetExamGroupRequest {
  readonly id: string;
}

export interface ExamGroupServiceApiExamGroupServiceListExamGroup2Request {
  readonly body: V1ListExamGroupRequest;
}

export interface ExamGroupServiceApiExamGroupServiceUpdateExamGroupRequest {
  readonly examGroupId: string;
  readonly body: ExamGroupServiceUpdateExamGroupRequest;
}

export interface ExamGroupServiceApiExamGroupServiceUpdateExamGroup2Request {
  readonly examGroupId: string;
  readonly body: ExamGroupServiceUpdateExamGroupRequest;
}

export class ExamGroupServiceApi extends BaseAPI {
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

  public examGroupServiceCreateExamGroup(
    requestParameters: ExamGroupServiceApiExamGroupServiceCreateExamGroupRequest,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1ExamGroup>(
      'POST',
      '/v1/school/exam-group',
      requestParameters.body,
      options,
    );
  }

  public examGroupServiceDeleteExamGroup(
    requestParameters: ExamGroupServiceApiExamGroupServiceDeleteExamGroupRequest,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1DeleteExamGroupReply>(
      'DELETE',
      `/v1/school/exam-group/${encodeURIComponent(String(requestParameters.id))}`,
      undefined,
      options,
    );
  }

  public examGroupServiceGetExamGroup(
    requestParameters: ExamGroupServiceApiExamGroupServiceGetExamGroupRequest,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1ExamGroup>(
      'GET',
      `/v1/school/exam-group/${encodeURIComponent(String(requestParameters.id))}`,
      undefined,
      options,
    );
  }

  public examGroupServiceListExamGroup2(
    requestParameters: ExamGroupServiceApiExamGroupServiceListExamGroup2Request,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1ListExamGroupReply>(
      'POST',
      '/v1/school/exam-group/list',
      requestParameters.body,
      options,
    );
  }

  public examGroupServiceUpdateExamGroup(
    requestParameters: ExamGroupServiceApiExamGroupServiceUpdateExamGroupRequest,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1ExamGroup>(
      'PUT',
      `/v1/school/exam-group/${encodeURIComponent(String(requestParameters.examGroupId))}`,
      requestParameters.body,
      options,
    );
  }

  public examGroupServiceUpdateExamGroup2(
    requestParameters: ExamGroupServiceApiExamGroupServiceUpdateExamGroup2Request,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1ExamGroup>(
      'PATCH',
      `/v1/school/exam-group/${encodeURIComponent(String(requestParameters.examGroupId))}`,
      requestParameters.body,
      options,
    );
  }
}
