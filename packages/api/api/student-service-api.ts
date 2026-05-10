/* tslint:disable */
/* eslint-disable */

import type { AxiosPromise, AxiosRequestConfig } from 'axios';
import { BaseAPI } from '../base';
import type {
  StudentServiceUpdateStudentRequest,
  V1CreateStudentRequest,
  V1DeleteStudentReply,
  V1DisableStudentRequest,
  V1ListStudentReply,
  V1ListStudentRequest,
  V1ListStudentSiblingReply,
  V1ReactivateStudentRequest,
  V1Student,
} from '../models';

export interface StudentServiceApiStudentServiceCreateStudentRequest {
  readonly body: V1CreateStudentRequest;
}

export interface StudentServiceApiStudentServiceDeleteStudentRequest {
  readonly id: string;
}

export interface StudentServiceApiStudentServiceDisableStudentRequest {
  readonly id: string;
  readonly body: V1DisableStudentRequest;
}

export interface StudentServiceApiStudentServiceGetStudentRequest {
  readonly id: string;
}

export interface StudentServiceApiStudentServiceListStudent2Request {
  readonly body: V1ListStudentRequest;
}

export interface StudentServiceApiStudentServiceListStudentSiblingRequest {
  readonly studentId: string;
}

export interface StudentServiceApiStudentServiceReactivateStudentRequest {
  readonly id: string;
  readonly body: V1ReactivateStudentRequest;
}

export interface StudentServiceApiStudentServiceUpdateStudentRequest {
  readonly studentId: string;
  readonly body: StudentServiceUpdateStudentRequest;
}

export interface StudentServiceApiStudentServiceUpdateStudent2Request {
  readonly studentId: string;
  readonly body: StudentServiceUpdateStudentRequest;
}

export class StudentServiceApi extends BaseAPI {
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

  public studentServiceCreateStudent(
    requestParameters: StudentServiceApiStudentServiceCreateStudentRequest,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1Student>('POST', '/v1/school/student', requestParameters.body, options);
  }

  public studentServiceDeleteStudent(
    requestParameters: StudentServiceApiStudentServiceDeleteStudentRequest,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1DeleteStudentReply>(
      'DELETE',
      `/v1/school/student/${encodeURIComponent(String(requestParameters.id))}`,
      undefined,
      options,
    );
  }

  public studentServiceDisableStudent(
    requestParameters: StudentServiceApiStudentServiceDisableStudentRequest,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1Student>(
      'POST',
      `/v1/school/student/${encodeURIComponent(String(requestParameters.id))}/disable`,
      requestParameters.body,
      options,
    );
  }

  public studentServiceGetStudent(
    requestParameters: StudentServiceApiStudentServiceGetStudentRequest,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1Student>(
      'GET',
      `/v1/school/student/${encodeURIComponent(String(requestParameters.id))}`,
      undefined,
      options,
    );
  }

  public studentServiceListStudent2(
    requestParameters: StudentServiceApiStudentServiceListStudent2Request,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1ListStudentReply>(
      'POST',
      '/v1/school/student/list',
      requestParameters.body,
      options,
    );
  }

  public studentServiceListStudentSibling(
    requestParameters: StudentServiceApiStudentServiceListStudentSiblingRequest,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1ListStudentSiblingReply>(
      'GET',
      `/v1/school/student/${encodeURIComponent(String(requestParameters.studentId))}/siblings`,
      undefined,
      options,
    );
  }

  public studentServiceReactivateStudent(
    requestParameters: StudentServiceApiStudentServiceReactivateStudentRequest,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1Student>(
      'POST',
      `/v1/school/student/${encodeURIComponent(String(requestParameters.id))}/reactivate`,
      requestParameters.body,
      options,
    );
  }

  public studentServiceUpdateStudent(
    requestParameters: StudentServiceApiStudentServiceUpdateStudentRequest,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1Student>(
      'PUT',
      `/v1/school/student/${encodeURIComponent(String(requestParameters.studentId))}`,
      requestParameters.body,
      options,
    );
  }

  public studentServiceUpdateStudent2(
    requestParameters: StudentServiceApiStudentServiceUpdateStudent2Request,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1Student>(
      'PATCH',
      `/v1/school/student/${encodeURIComponent(String(requestParameters.studentId))}`,
      requestParameters.body,
      options,
    );
  }
}
