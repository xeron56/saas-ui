/* tslint:disable */
/* eslint-disable */

import type { AxiosPromise, AxiosRequestConfig } from 'axios';
import { BaseAPI } from '../base';
import type {
  HomeworkServiceUpdateHomeworkRequest,
  V1CreateHomeworkRequest,
  V1DeleteHomeworkReply,
  V1DeleteHomeworkSubmissionReply,
  V1Homework,
  V1HomeworkSubmission,
  V1ListHomeworkStudentReply,
  V1ListHomeworkReply,
  V1ListHomeworkRequest,
  V1ListMyHomeworkReply,
  V1ListMyHomeworkRequest,
  V1MyHomework,
  V1SaveHomeworkEvaluationsRequest,
  V1SubmitHomeworkRequest,
  V1SubmitMyHomeworkRequest,
} from '../models';

export interface HomeworkServiceApiHomeworkServiceCreateHomeworkRequest {
  readonly body: V1CreateHomeworkRequest;
}

export interface HomeworkServiceApiHomeworkServiceDeleteHomeworkRequest {
  readonly id: string;
}

export interface HomeworkServiceApiHomeworkServiceDownloadHomeworkAttachmentRequest {
  readonly id: string;
}

export interface HomeworkServiceApiHomeworkServiceDownloadHomeworkSubmissionAttachmentRequest {
  readonly id: string;
}

export interface HomeworkServiceApiHomeworkServiceGetHomeworkRequest {
  readonly id: string;
}

export interface HomeworkServiceApiHomeworkServiceListHomeworkStudentRequest {
  readonly homeworkId: string;
}

export interface HomeworkServiceApiHomeworkServiceListHomework2Request {
  readonly body: V1ListHomeworkRequest;
}

export interface HomeworkServiceApiHomeworkServiceListMyHomeworkRequest {
  readonly query?: V1ListMyHomeworkRequest;
}

export interface HomeworkServiceApiHomeworkServiceSaveHomeworkEvaluationsRequest {
  readonly homeworkId: string;
  readonly body: V1SaveHomeworkEvaluationsRequest;
}

export interface HomeworkServiceApiHomeworkServiceSubmitHomeworkRequest {
  readonly homeworkId: string;
  readonly body: V1SubmitHomeworkRequest;
}

export interface HomeworkServiceApiHomeworkServiceSubmitMyHomeworkRequest {
  readonly studentId: string;
  readonly homeworkId: string;
  readonly body: V1SubmitMyHomeworkRequest;
}

export interface HomeworkServiceApiHomeworkServiceDeleteHomeworkSubmissionRequest {
  readonly id: string;
}

export interface HomeworkServiceApiHomeworkServiceUpdateHomeworkRequest {
  readonly homeworkId: string;
  readonly body: HomeworkServiceUpdateHomeworkRequest;
}

export interface HomeworkServiceApiHomeworkServiceUpdateHomework2Request {
  readonly homeworkId: string;
  readonly body: HomeworkServiceUpdateHomeworkRequest;
}

export class HomeworkServiceApi extends BaseAPI {
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

  public homeworkServiceCreateHomework(
    requestParameters: HomeworkServiceApiHomeworkServiceCreateHomeworkRequest,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1Homework>('POST', '/v1/school/homework', requestParameters.body, options);
  }

  public homeworkServiceDeleteHomework(
    requestParameters: HomeworkServiceApiHomeworkServiceDeleteHomeworkRequest,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1DeleteHomeworkReply>(
      'DELETE',
      `/v1/school/homework/${encodeURIComponent(String(requestParameters.id))}`,
      undefined,
      options,
    );
  }

  public homeworkServiceDownloadHomeworkAttachment(
    requestParameters: HomeworkServiceApiHomeworkServiceDownloadHomeworkAttachmentRequest,
    options?: AxiosRequestConfig,
  ) {
    return this.request<Blob>(
      'GET',
      `/v1/school/homework/${encodeURIComponent(String(requestParameters.id))}/download`,
      undefined,
      { ...options, responseType: 'blob' },
    );
  }

  public homeworkServiceDownloadHomeworkSubmissionAttachment(
    requestParameters: HomeworkServiceApiHomeworkServiceDownloadHomeworkSubmissionAttachmentRequest,
    options?: AxiosRequestConfig,
  ) {
    return this.request<Blob>(
      'GET',
      `/v1/school/homework/submission/${encodeURIComponent(String(requestParameters.id))}/download`,
      undefined,
      { ...options, responseType: 'blob' },
    );
  }

  public homeworkServiceGetHomework(
    requestParameters: HomeworkServiceApiHomeworkServiceGetHomeworkRequest,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1Homework>(
      'GET',
      `/v1/school/homework/${encodeURIComponent(String(requestParameters.id))}`,
      undefined,
      options,
    );
  }

  public homeworkServiceListHomeworkStudent(
    requestParameters: HomeworkServiceApiHomeworkServiceListHomeworkStudentRequest,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1ListHomeworkStudentReply>(
      'GET',
      `/v1/school/homework/${encodeURIComponent(String(requestParameters.homeworkId))}/students`,
      undefined,
      options,
    );
  }

  public homeworkServiceListHomework2(
    requestParameters: HomeworkServiceApiHomeworkServiceListHomework2Request,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1ListHomeworkReply>(
      'POST',
      '/v1/school/homework/list',
      requestParameters.body,
      options,
    );
  }

  public homeworkServiceListMyHomework(
    requestParameters: HomeworkServiceApiHomeworkServiceListMyHomeworkRequest = {},
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1ListMyHomeworkReply>('GET', '/v1/school/me/homeworks', undefined, {
      ...options,
      params: {
        ...options?.params,
        page_offset: requestParameters.query?.pageOffset,
        page_size: requestParameters.query?.pageSize,
      },
    });
  }

  public homeworkServiceSaveHomeworkEvaluations(
    requestParameters: HomeworkServiceApiHomeworkServiceSaveHomeworkEvaluationsRequest,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1ListHomeworkStudentReply>(
      'POST',
      `/v1/school/homework/${encodeURIComponent(String(requestParameters.homeworkId))}/evaluations`,
      requestParameters.body,
      options,
    );
  }

  public homeworkServiceSubmitHomework(
    requestParameters: HomeworkServiceApiHomeworkServiceSubmitHomeworkRequest,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1HomeworkSubmission>(
      'POST',
      `/v1/school/homework/${encodeURIComponent(String(requestParameters.homeworkId))}/submission`,
      requestParameters.body,
      options,
    );
  }

  public homeworkServiceSubmitMyHomework(
    requestParameters: HomeworkServiceApiHomeworkServiceSubmitMyHomeworkRequest,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1MyHomework>(
      'POST',
      `/v1/school/me/students/${encodeURIComponent(
        String(requestParameters.studentId),
      )}/homework/${encodeURIComponent(String(requestParameters.homeworkId))}/submission`,
      requestParameters.body,
      options,
    );
  }

  public homeworkServiceDeleteHomeworkSubmission(
    requestParameters: HomeworkServiceApiHomeworkServiceDeleteHomeworkSubmissionRequest,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1DeleteHomeworkSubmissionReply>(
      'DELETE',
      `/v1/school/homework/submission/${encodeURIComponent(String(requestParameters.id))}`,
      undefined,
      options,
    );
  }

  public homeworkServiceUpdateHomework(
    requestParameters: HomeworkServiceApiHomeworkServiceUpdateHomeworkRequest,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1Homework>(
      'PUT',
      `/v1/school/homework/${encodeURIComponent(String(requestParameters.homeworkId))}`,
      requestParameters.body,
      options,
    );
  }

  public homeworkServiceUpdateHomework2(
    requestParameters: HomeworkServiceApiHomeworkServiceUpdateHomework2Request,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1Homework>(
      'PATCH',
      `/v1/school/homework/${encodeURIComponent(String(requestParameters.homeworkId))}`,
      requestParameters.body,
      options,
    );
  }
}
