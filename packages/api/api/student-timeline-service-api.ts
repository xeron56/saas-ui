/* tslint:disable */
/* eslint-disable */

import type { AxiosPromise, AxiosRequestConfig } from 'axios';
import { BaseAPI } from '../base';
import type {
  StudentTimelineServiceUpdateStudentTimelineRequest,
  V1CreateStudentTimelineRequest,
  V1DeleteStudentTimelineReply,
  V1ListStudentTimelineReply,
  V1ListStudentTimelineRequest,
  V1ListMyStudentTimelineRequest,
  V1StudentTimeline,
} from '../models';

export interface StudentTimelineServiceApiStudentTimelineServiceCreateStudentTimelineRequest {
  readonly body: V1CreateStudentTimelineRequest;
}

export interface StudentTimelineServiceApiStudentTimelineServiceDeleteStudentTimelineRequest {
  readonly id: string;
}

export interface StudentTimelineServiceApiStudentTimelineServiceDownloadStudentTimelineRequest {
  readonly id: string;
}

export interface StudentTimelineServiceApiStudentTimelineServiceGetStudentTimelineRequest {
  readonly id: string;
}

export interface StudentTimelineServiceApiStudentTimelineServiceListStudentTimeline2Request {
  readonly body: V1ListStudentTimelineRequest;
}

export interface StudentTimelineServiceApiStudentTimelineServiceListMyStudentTimelineRequest {
  readonly query?: V1ListMyStudentTimelineRequest;
}

export interface StudentTimelineServiceApiStudentTimelineServiceDownloadMyStudentTimelineRequest {
  readonly id: string;
}

export interface StudentTimelineServiceApiStudentTimelineServiceUpdateStudentTimelineRequest {
  readonly timelineId: string;
  readonly body: StudentTimelineServiceUpdateStudentTimelineRequest;
}

export interface StudentTimelineServiceApiStudentTimelineServiceUpdateStudentTimeline2Request {
  readonly timelineId: string;
  readonly body: StudentTimelineServiceUpdateStudentTimelineRequest;
}

export class StudentTimelineServiceApi extends BaseAPI {
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

  public studentTimelineServiceCreateStudentTimeline(
    requestParameters: StudentTimelineServiceApiStudentTimelineServiceCreateStudentTimelineRequest,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1StudentTimeline>(
      'POST',
      '/v1/school/student/timeline',
      requestParameters.body,
      options,
    );
  }

  public studentTimelineServiceDeleteStudentTimeline(
    requestParameters: StudentTimelineServiceApiStudentTimelineServiceDeleteStudentTimelineRequest,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1DeleteStudentTimelineReply>(
      'DELETE',
      `/v1/school/student/timeline/${encodeURIComponent(String(requestParameters.id))}`,
      undefined,
      options,
    );
  }

  public studentTimelineServiceDownloadStudentTimeline(
    requestParameters: StudentTimelineServiceApiStudentTimelineServiceDownloadStudentTimelineRequest,
    options?: AxiosRequestConfig,
  ) {
    return this.request<Blob>(
      'GET',
      `/v1/school/student/timeline/${encodeURIComponent(String(requestParameters.id))}/download`,
      undefined,
      { ...options, responseType: 'blob' },
    );
  }

  public studentTimelineServiceGetStudentTimeline(
    requestParameters: StudentTimelineServiceApiStudentTimelineServiceGetStudentTimelineRequest,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1StudentTimeline>(
      'GET',
      `/v1/school/student/timeline/${encodeURIComponent(String(requestParameters.id))}`,
      undefined,
      options,
    );
  }

  public studentTimelineServiceListStudentTimeline2(
    requestParameters: StudentTimelineServiceApiStudentTimelineServiceListStudentTimeline2Request,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1ListStudentTimelineReply>(
      'POST',
      '/v1/school/student/timeline/list',
      requestParameters.body,
      options,
    );
  }

  public studentTimelineServiceListMyStudentTimeline(
    requestParameters: StudentTimelineServiceApiStudentTimelineServiceListMyStudentTimelineRequest = {},
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1ListStudentTimelineReply>(
      'GET',
      '/v1/school/me/student-timelines',
      undefined,
      {
        ...options,
        params: {
          ...options?.params,
          page_offset: requestParameters.query?.pageOffset,
          page_size: requestParameters.query?.pageSize,
          student_id: requestParameters.query?.studentId,
        },
      },
    );
  }

  public studentTimelineServiceDownloadMyStudentTimeline(
    requestParameters: StudentTimelineServiceApiStudentTimelineServiceDownloadMyStudentTimelineRequest,
    options?: AxiosRequestConfig,
  ) {
    return this.request<Blob>(
      'GET',
      `/v1/school/me/student-timeline/${encodeURIComponent(String(requestParameters.id))}/download`,
      undefined,
      { ...options, responseType: 'blob' },
    );
  }

  public studentTimelineServiceUpdateStudentTimeline(
    requestParameters: StudentTimelineServiceApiStudentTimelineServiceUpdateStudentTimelineRequest,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1StudentTimeline>(
      'PUT',
      `/v1/school/student/timeline/${encodeURIComponent(String(requestParameters.timelineId))}`,
      requestParameters.body,
      options,
    );
  }

  public studentTimelineServiceUpdateStudentTimeline2(
    requestParameters: StudentTimelineServiceApiStudentTimelineServiceUpdateStudentTimeline2Request,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1StudentTimeline>(
      'PATCH',
      `/v1/school/student/timeline/${encodeURIComponent(String(requestParameters.timelineId))}`,
      requestParameters.body,
      options,
    );
  }
}
