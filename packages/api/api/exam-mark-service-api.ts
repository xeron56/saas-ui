/* tslint:disable */
/* eslint-disable */

import type { AxiosPromise, AxiosRequestConfig } from 'axios';
import { BaseAPI } from '../base';
import type { V1ExamSubjectMarksReply, V1SaveExamSubjectMarksRequest } from '../models';

export interface ExamMarkServiceApiExamMarkServiceGetExamSubjectMarksRequest {
  readonly examSubjectId: string;
  readonly classSectionId: string;
}

export interface ExamMarkServiceApiExamMarkServiceSaveExamSubjectMarksRequest {
  readonly examSubjectId: string;
  readonly body: V1SaveExamSubjectMarksRequest;
}

export class ExamMarkServiceApi extends BaseAPI {
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

  public examMarkServiceGetExamSubjectMarks(
    requestParameters: ExamMarkServiceApiExamMarkServiceGetExamSubjectMarksRequest,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1ExamSubjectMarksReply>(
      'GET',
      `/v1/school/exam-subject/${encodeURIComponent(
        String(requestParameters.examSubjectId),
      )}/marks`,
      undefined,
      {
        ...options,
        params: {
          ...options?.params,
          class_section_id: requestParameters.classSectionId,
        },
      },
    );
  }

  public examMarkServiceSaveExamSubjectMarks(
    requestParameters: ExamMarkServiceApiExamMarkServiceSaveExamSubjectMarksRequest,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1ExamSubjectMarksReply>(
      'POST',
      `/v1/school/exam-subject/${encodeURIComponent(
        String(requestParameters.examSubjectId),
      )}/marks`,
      requestParameters.body,
      options,
    );
  }
}
