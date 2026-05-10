/* tslint:disable */
/* eslint-disable */

import type { AxiosPromise, AxiosRequestConfig } from 'axios';
import { BaseAPI } from '../base';
import type {
  DailyAssignmentServiceUpdateDailyAssignmentRequest,
  V1CreateDailyAssignmentRequest,
  V1CreateMyDailyAssignmentRequest,
  V1DailyAssignment,
  V1DeleteDailyAssignmentReply,
  V1DeleteMyDailyAssignmentRequest,
  V1EvaluateDailyAssignmentRequest,
  V1ListDailyAssignmentReply,
  V1ListDailyAssignmentRequest,
  V1ListMyDailyAssignmentOptionsReply,
  V1ListMyDailyAssignmentOptionsRequest,
  V1ListMyDailyAssignmentReply,
  V1ListMyDailyAssignmentRequest,
  V1UpdateMyDailyAssignmentRequest,
} from '../models';

export interface DailyAssignmentServiceApiDailyAssignmentServiceCreateDailyAssignmentRequest {
  readonly body: V1CreateDailyAssignmentRequest;
}

export interface DailyAssignmentServiceApiDailyAssignmentServiceCreateMyDailyAssignmentRequest {
  readonly studentId: string;
  readonly body: V1CreateMyDailyAssignmentRequest;
}

export interface DailyAssignmentServiceApiDailyAssignmentServiceDeleteDailyAssignmentRequest {
  readonly id: string;
}

export interface DailyAssignmentServiceApiDailyAssignmentServiceDeleteMyDailyAssignmentRequest {
  readonly id: string;
  readonly body?: V1DeleteMyDailyAssignmentRequest;
}

export interface DailyAssignmentServiceApiDailyAssignmentServiceDownloadDailyAssignmentAttachmentRequest {
  readonly id: string;
}

export interface DailyAssignmentServiceApiDailyAssignmentServiceEvaluateDailyAssignmentRequest {
  readonly id: string;
  readonly body: V1EvaluateDailyAssignmentRequest;
}

export interface DailyAssignmentServiceApiDailyAssignmentServiceGetDailyAssignmentRequest {
  readonly id: string;
}

export interface DailyAssignmentServiceApiDailyAssignmentServiceListDailyAssignment2Request {
  readonly body: V1ListDailyAssignmentRequest;
}

export interface DailyAssignmentServiceApiDailyAssignmentServiceListMyDailyAssignmentRequest {
  readonly query?: V1ListMyDailyAssignmentRequest;
}

export interface DailyAssignmentServiceApiDailyAssignmentServiceListMyDailyAssignmentOptionsRequest {
  readonly query?: V1ListMyDailyAssignmentOptionsRequest;
}

export interface DailyAssignmentServiceApiDailyAssignmentServiceUpdateDailyAssignmentRequest {
  readonly assignmentId: string;
  readonly body: DailyAssignmentServiceUpdateDailyAssignmentRequest;
}

export interface DailyAssignmentServiceApiDailyAssignmentServiceUpdateDailyAssignment2Request {
  readonly assignmentId: string;
  readonly body: DailyAssignmentServiceUpdateDailyAssignmentRequest;
}

export interface DailyAssignmentServiceApiDailyAssignmentServiceUpdateMyDailyAssignmentRequest {
  readonly id: string;
  readonly body: V1UpdateMyDailyAssignmentRequest;
}

export interface DailyAssignmentServiceApiDailyAssignmentServiceUpdateMyDailyAssignment2Request {
  readonly id: string;
  readonly body: V1UpdateMyDailyAssignmentRequest;
}

export class DailyAssignmentServiceApi extends BaseAPI {
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

  public dailyAssignmentServiceCreateDailyAssignment(
    requestParameters: DailyAssignmentServiceApiDailyAssignmentServiceCreateDailyAssignmentRequest,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1DailyAssignment>(
      'POST',
      '/v1/school/daily-assignment',
      requestParameters.body,
      options,
    );
  }

  public dailyAssignmentServiceCreateMyDailyAssignment(
    requestParameters: DailyAssignmentServiceApiDailyAssignmentServiceCreateMyDailyAssignmentRequest,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1DailyAssignment>(
      'POST',
      `/v1/school/me/students/${encodeURIComponent(
        String(requestParameters.studentId),
      )}/daily-assignment`,
      requestParameters.body,
      options,
    );
  }

  public dailyAssignmentServiceDeleteDailyAssignment(
    requestParameters: DailyAssignmentServiceApiDailyAssignmentServiceDeleteDailyAssignmentRequest,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1DeleteDailyAssignmentReply>(
      'DELETE',
      `/v1/school/daily-assignment/${encodeURIComponent(String(requestParameters.id))}`,
      undefined,
      options,
    );
  }

  public dailyAssignmentServiceDeleteMyDailyAssignment(
    requestParameters: DailyAssignmentServiceApiDailyAssignmentServiceDeleteMyDailyAssignmentRequest,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1DeleteDailyAssignmentReply>(
      'DELETE',
      `/v1/school/me/daily-assignment/${encodeURIComponent(String(requestParameters.id))}`,
      requestParameters.body,
      options,
    );
  }

  public dailyAssignmentServiceDownloadDailyAssignmentAttachment(
    requestParameters: DailyAssignmentServiceApiDailyAssignmentServiceDownloadDailyAssignmentAttachmentRequest,
    options?: AxiosRequestConfig,
  ) {
    return this.request<Blob>(
      'GET',
      `/v1/school/daily-assignment/${encodeURIComponent(String(requestParameters.id))}/download`,
      undefined,
      { ...options, responseType: 'blob' },
    );
  }

  public dailyAssignmentServiceEvaluateDailyAssignment(
    requestParameters: DailyAssignmentServiceApiDailyAssignmentServiceEvaluateDailyAssignmentRequest,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1DailyAssignment>(
      'POST',
      `/v1/school/daily-assignment/${encodeURIComponent(String(requestParameters.id))}/evaluation`,
      requestParameters.body,
      options,
    );
  }

  public dailyAssignmentServiceGetDailyAssignment(
    requestParameters: DailyAssignmentServiceApiDailyAssignmentServiceGetDailyAssignmentRequest,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1DailyAssignment>(
      'GET',
      `/v1/school/daily-assignment/${encodeURIComponent(String(requestParameters.id))}`,
      undefined,
      options,
    );
  }

  public dailyAssignmentServiceListDailyAssignment2(
    requestParameters: DailyAssignmentServiceApiDailyAssignmentServiceListDailyAssignment2Request,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1ListDailyAssignmentReply>(
      'POST',
      '/v1/school/daily-assignment/list',
      requestParameters.body,
      options,
    );
  }

  public dailyAssignmentServiceListMyDailyAssignment(
    requestParameters: DailyAssignmentServiceApiDailyAssignmentServiceListMyDailyAssignmentRequest = {},
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1ListMyDailyAssignmentReply>(
      'GET',
      '/v1/school/me/daily-assignments',
      undefined,
      {
        ...options,
        params: {
          ...options?.params,
          page_offset: requestParameters.query?.pageOffset,
          page_size: requestParameters.query?.pageSize,
        },
      },
    );
  }

  public dailyAssignmentServiceListMyDailyAssignmentOptions(
    _requestParameters: DailyAssignmentServiceApiDailyAssignmentServiceListMyDailyAssignmentOptionsRequest = {},
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1ListMyDailyAssignmentOptionsReply>(
      'GET',
      '/v1/school/me/daily-assignment-options',
      undefined,
      options,
    );
  }

  public dailyAssignmentServiceUpdateDailyAssignment(
    requestParameters: DailyAssignmentServiceApiDailyAssignmentServiceUpdateDailyAssignmentRequest,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1DailyAssignment>(
      'PUT',
      `/v1/school/daily-assignment/${encodeURIComponent(String(requestParameters.assignmentId))}`,
      requestParameters.body,
      options,
    );
  }

  public dailyAssignmentServiceUpdateDailyAssignment2(
    requestParameters: DailyAssignmentServiceApiDailyAssignmentServiceUpdateDailyAssignment2Request,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1DailyAssignment>(
      'PATCH',
      `/v1/school/daily-assignment/${encodeURIComponent(String(requestParameters.assignmentId))}`,
      requestParameters.body,
      options,
    );
  }

  public dailyAssignmentServiceUpdateMyDailyAssignment(
    requestParameters: DailyAssignmentServiceApiDailyAssignmentServiceUpdateMyDailyAssignmentRequest,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1DailyAssignment>(
      'PUT',
      `/v1/school/me/daily-assignment/${encodeURIComponent(String(requestParameters.id))}`,
      requestParameters.body,
      options,
    );
  }

  public dailyAssignmentServiceUpdateMyDailyAssignment2(
    requestParameters: DailyAssignmentServiceApiDailyAssignmentServiceUpdateMyDailyAssignment2Request,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1DailyAssignment>(
      'PATCH',
      `/v1/school/me/daily-assignment/${encodeURIComponent(String(requestParameters.id))}`,
      requestParameters.body,
      options,
    );
  }
}
