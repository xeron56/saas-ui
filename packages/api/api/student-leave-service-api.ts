/* tslint:disable */
/* eslint-disable */

import type { AxiosPromise, AxiosRequestConfig } from 'axios';
import { BaseAPI } from '../base';
import type {
  StudentLeaveServiceUpdateStudentLeaveRequest,
  V1CreateStudentLeaveRequest,
  V1DeleteStudentLeaveReply,
  V1ListStudentLeaveReply,
  V1ListStudentLeaveRequest,
  V1StudentLeave,
  V1UpdateStudentLeaveStatusRequest,
} from '../models';

export interface StudentLeaveServiceApiStudentLeaveServiceCreateStudentLeaveRequest {
  readonly body: V1CreateStudentLeaveRequest;
}

export interface StudentLeaveServiceApiStudentLeaveServiceDeleteStudentLeaveRequest {
  readonly id: string;
}

export interface StudentLeaveServiceApiStudentLeaveServiceDownloadStudentLeaveAttachmentRequest {
  readonly id: string;
}

export interface StudentLeaveServiceApiStudentLeaveServiceGetStudentLeaveRequest {
  readonly id: string;
}

export interface StudentLeaveServiceApiStudentLeaveServiceListStudentLeave2Request {
  readonly body: V1ListStudentLeaveRequest;
}

export interface StudentLeaveServiceApiStudentLeaveServiceUpdateStudentLeaveRequest {
  readonly leaveId: string;
  readonly body: StudentLeaveServiceUpdateStudentLeaveRequest;
}

export interface StudentLeaveServiceApiStudentLeaveServiceUpdateStudentLeave2Request {
  readonly leaveId: string;
  readonly body: StudentLeaveServiceUpdateStudentLeaveRequest;
}

export interface StudentLeaveServiceApiStudentLeaveServiceUpdateStudentLeaveStatusRequest {
  readonly id: string;
  readonly body: V1UpdateStudentLeaveStatusRequest;
}

export class StudentLeaveServiceApi extends BaseAPI {
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

  public studentLeaveServiceCreateStudentLeave(
    requestParameters: StudentLeaveServiceApiStudentLeaveServiceCreateStudentLeaveRequest,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1StudentLeave>(
      'POST',
      '/v1/school/student/leave',
      requestParameters.body,
      options,
    );
  }

  public studentLeaveServiceDeleteStudentLeave(
    requestParameters: StudentLeaveServiceApiStudentLeaveServiceDeleteStudentLeaveRequest,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1DeleteStudentLeaveReply>(
      'DELETE',
      `/v1/school/student/leave/${encodeURIComponent(String(requestParameters.id))}`,
      undefined,
      options,
    );
  }

  public studentLeaveServiceDownloadStudentLeaveAttachment(
    requestParameters: StudentLeaveServiceApiStudentLeaveServiceDownloadStudentLeaveAttachmentRequest,
    options?: AxiosRequestConfig,
  ) {
    return this.request<Blob>(
      'GET',
      `/v1/school/student/leave/${encodeURIComponent(String(requestParameters.id))}/download`,
      undefined,
      { ...options, responseType: 'blob' },
    );
  }

  public studentLeaveServiceGetStudentLeave(
    requestParameters: StudentLeaveServiceApiStudentLeaveServiceGetStudentLeaveRequest,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1StudentLeave>(
      'GET',
      `/v1/school/student/leave/${encodeURIComponent(String(requestParameters.id))}`,
      undefined,
      options,
    );
  }

  public studentLeaveServiceListStudentLeave2(
    requestParameters: StudentLeaveServiceApiStudentLeaveServiceListStudentLeave2Request,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1ListStudentLeaveReply>(
      'POST',
      '/v1/school/student/leave/list',
      requestParameters.body,
      options,
    );
  }

  public studentLeaveServiceUpdateStudentLeave(
    requestParameters: StudentLeaveServiceApiStudentLeaveServiceUpdateStudentLeaveRequest,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1StudentLeave>(
      'PUT',
      `/v1/school/student/leave/${encodeURIComponent(String(requestParameters.leaveId))}`,
      requestParameters.body,
      options,
    );
  }

  public studentLeaveServiceUpdateStudentLeave2(
    requestParameters: StudentLeaveServiceApiStudentLeaveServiceUpdateStudentLeave2Request,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1StudentLeave>(
      'PATCH',
      `/v1/school/student/leave/${encodeURIComponent(String(requestParameters.leaveId))}`,
      requestParameters.body,
      options,
    );
  }

  public studentLeaveServiceUpdateStudentLeaveStatus(
    requestParameters: StudentLeaveServiceApiStudentLeaveServiceUpdateStudentLeaveStatusRequest,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1StudentLeave>(
      'POST',
      `/v1/school/student/leave/${encodeURIComponent(String(requestParameters.id))}/status`,
      requestParameters.body,
      options,
    );
  }
}
