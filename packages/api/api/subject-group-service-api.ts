/* tslint:disable */
/* eslint-disable */

import type { AxiosPromise, AxiosRequestConfig } from 'axios';
import { BaseAPI } from '../base';
import type {
  SubjectGroupServiceUpdateSubjectGroupRequest,
  V1AssignSubjectGroupStudentsRequest,
  V1CreateSubjectGroupRequest,
  V1DeleteSubjectGroupReply,
  V1ListSubjectGroupReply,
  V1ListSubjectGroupRequest,
  V1ListSubjectGroupStudentsReply,
  V1SubjectGroup,
} from '../models';

export interface SubjectGroupServiceApiSubjectGroupServiceCreateSubjectGroupRequest {
  readonly body: V1CreateSubjectGroupRequest;
}

export interface SubjectGroupServiceApiSubjectGroupServiceDeleteSubjectGroupRequest {
  readonly id: string;
}

export interface SubjectGroupServiceApiSubjectGroupServiceGetSubjectGroupRequest {
  readonly id: string;
}

export interface SubjectGroupServiceApiSubjectGroupServiceListSubjectGroup2Request {
  readonly body: V1ListSubjectGroupRequest;
}

export interface SubjectGroupServiceApiSubjectGroupServiceListSubjectGroupStudentsRequest {
  readonly subjectGroupId: string;
  readonly classSectionId: string;
}

export interface SubjectGroupServiceApiSubjectGroupServiceAssignSubjectGroupStudentsRequest {
  readonly subjectGroupId: string;
  readonly body: V1AssignSubjectGroupStudentsRequest;
}

export interface SubjectGroupServiceApiSubjectGroupServiceUpdateSubjectGroupRequest {
  readonly subjectGroupId: string;
  readonly body: SubjectGroupServiceUpdateSubjectGroupRequest;
}

export interface SubjectGroupServiceApiSubjectGroupServiceUpdateSubjectGroup2Request {
  readonly subjectGroupId: string;
  readonly body: SubjectGroupServiceUpdateSubjectGroupRequest;
}

export class SubjectGroupServiceApi extends BaseAPI {
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

  public subjectGroupServiceCreateSubjectGroup(
    requestParameters: SubjectGroupServiceApiSubjectGroupServiceCreateSubjectGroupRequest,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1SubjectGroup>(
      'POST',
      '/v1/school/subject-group',
      requestParameters.body,
      options,
    );
  }

  public subjectGroupServiceDeleteSubjectGroup(
    requestParameters: SubjectGroupServiceApiSubjectGroupServiceDeleteSubjectGroupRequest,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1DeleteSubjectGroupReply>(
      'DELETE',
      `/v1/school/subject-group/${encodeURIComponent(String(requestParameters.id))}`,
      undefined,
      options,
    );
  }

  public subjectGroupServiceGetSubjectGroup(
    requestParameters: SubjectGroupServiceApiSubjectGroupServiceGetSubjectGroupRequest,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1SubjectGroup>(
      'GET',
      `/v1/school/subject-group/${encodeURIComponent(String(requestParameters.id))}`,
      undefined,
      options,
    );
  }

  public subjectGroupServiceListSubjectGroup2(
    requestParameters: SubjectGroupServiceApiSubjectGroupServiceListSubjectGroup2Request,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1ListSubjectGroupReply>(
      'POST',
      '/v1/school/subject-group/list',
      requestParameters.body,
      options,
    );
  }

  public subjectGroupServiceListSubjectGroupStudents(
    requestParameters: SubjectGroupServiceApiSubjectGroupServiceListSubjectGroupStudentsRequest,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1ListSubjectGroupStudentsReply>(
      'GET',
      `/v1/school/subject-group/${encodeURIComponent(
        String(requestParameters.subjectGroupId),
      )}/students`,
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

  public subjectGroupServiceAssignSubjectGroupStudents(
    requestParameters: SubjectGroupServiceApiSubjectGroupServiceAssignSubjectGroupStudentsRequest,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1ListSubjectGroupStudentsReply>(
      'POST',
      `/v1/school/subject-group/${encodeURIComponent(
        String(requestParameters.subjectGroupId),
      )}/students`,
      requestParameters.body,
      options,
    );
  }

  public subjectGroupServiceUpdateSubjectGroup(
    requestParameters: SubjectGroupServiceApiSubjectGroupServiceUpdateSubjectGroupRequest,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1SubjectGroup>(
      'PUT',
      `/v1/school/subject-group/${encodeURIComponent(String(requestParameters.subjectGroupId))}`,
      requestParameters.body,
      options,
    );
  }

  public subjectGroupServiceUpdateSubjectGroup2(
    requestParameters: SubjectGroupServiceApiSubjectGroupServiceUpdateSubjectGroup2Request,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1SubjectGroup>(
      'PATCH',
      `/v1/school/subject-group/${encodeURIComponent(String(requestParameters.subjectGroupId))}`,
      requestParameters.body,
      options,
    );
  }
}
