/* tslint:disable */
/* eslint-disable */

import type { AxiosPromise, AxiosRequestConfig } from 'axios';
import { BaseAPI } from '../base';
import type {
  SubjectTimetableServiceUpdateSubjectTimetableRequest,
  V1CreateSubjectTimetableRequest,
  V1DeleteSubjectTimetableReply,
  V1ListSubjectTimetableReply,
  V1ListSubjectTimetableRequest,
  V1SubjectTimetable,
} from '../models';

export interface SubjectTimetableServiceApiSubjectTimetableServiceCreateSubjectTimetableRequest {
  readonly body: V1CreateSubjectTimetableRequest;
}

export interface SubjectTimetableServiceApiSubjectTimetableServiceDeleteSubjectTimetableRequest {
  readonly id: string;
}

export interface SubjectTimetableServiceApiSubjectTimetableServiceGetSubjectTimetableRequest {
  readonly id: string;
}

export interface SubjectTimetableServiceApiSubjectTimetableServiceListSubjectTimetable2Request {
  readonly body: V1ListSubjectTimetableRequest;
}

export interface SubjectTimetableServiceApiSubjectTimetableServiceUpdateSubjectTimetableRequest {
  readonly timetableId: string;
  readonly body: SubjectTimetableServiceUpdateSubjectTimetableRequest;
}

export interface SubjectTimetableServiceApiSubjectTimetableServiceUpdateSubjectTimetable2Request {
  readonly timetableId: string;
  readonly body: SubjectTimetableServiceUpdateSubjectTimetableRequest;
}

export class SubjectTimetableServiceApi extends BaseAPI {
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

  public subjectTimetableServiceCreateSubjectTimetable(
    requestParameters: SubjectTimetableServiceApiSubjectTimetableServiceCreateSubjectTimetableRequest,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1SubjectTimetable>(
      'POST',
      '/v1/school/subject-timetable',
      requestParameters.body,
      options,
    );
  }

  public subjectTimetableServiceDeleteSubjectTimetable(
    requestParameters: SubjectTimetableServiceApiSubjectTimetableServiceDeleteSubjectTimetableRequest,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1DeleteSubjectTimetableReply>(
      'DELETE',
      `/v1/school/subject-timetable/${encodeURIComponent(String(requestParameters.id))}`,
      undefined,
      options,
    );
  }

  public subjectTimetableServiceGetSubjectTimetable(
    requestParameters: SubjectTimetableServiceApiSubjectTimetableServiceGetSubjectTimetableRequest,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1SubjectTimetable>(
      'GET',
      `/v1/school/subject-timetable/${encodeURIComponent(String(requestParameters.id))}`,
      undefined,
      options,
    );
  }

  public subjectTimetableServiceListSubjectTimetable2(
    requestParameters: SubjectTimetableServiceApiSubjectTimetableServiceListSubjectTimetable2Request,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1ListSubjectTimetableReply>(
      'POST',
      '/v1/school/subject-timetable/list',
      requestParameters.body,
      options,
    );
  }

  public subjectTimetableServiceUpdateSubjectTimetable(
    requestParameters: SubjectTimetableServiceApiSubjectTimetableServiceUpdateSubjectTimetableRequest,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1SubjectTimetable>(
      'PUT',
      `/v1/school/subject-timetable/${encodeURIComponent(
        String(requestParameters.timetableId),
      )}`,
      requestParameters.body,
      options,
    );
  }

  public subjectTimetableServiceUpdateSubjectTimetable2(
    requestParameters: SubjectTimetableServiceApiSubjectTimetableServiceUpdateSubjectTimetable2Request,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1SubjectTimetable>(
      'PATCH',
      `/v1/school/subject-timetable/${encodeURIComponent(
        String(requestParameters.timetableId),
      )}`,
      requestParameters.body,
      options,
    );
  }
}
