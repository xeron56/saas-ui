/* tslint:disable */
/* eslint-disable */

import type { AxiosPromise, AxiosRequestConfig } from 'axios';
import { BaseAPI } from '../base';
import type {
  ClassSectionServiceUpdateClassSectionRequest,
  V1ClassSection,
  V1CreateClassSectionRequest,
  V1DeleteClassSectionReply,
  V1ListClassSectionReply,
  V1ListClassSectionRequest,
} from '../models';

export interface ClassSectionServiceApiClassSectionServiceCreateClassSectionRequest {
  readonly body: V1CreateClassSectionRequest;
}

export interface ClassSectionServiceApiClassSectionServiceDeleteClassSectionRequest {
  readonly id: string;
}

export interface ClassSectionServiceApiClassSectionServiceGetClassSectionRequest {
  readonly id: string;
}

export interface ClassSectionServiceApiClassSectionServiceListClassSection2Request {
  readonly body: V1ListClassSectionRequest;
}

export interface ClassSectionServiceApiClassSectionServiceUpdateClassSectionRequest {
  readonly classSectionId: string;
  readonly body: ClassSectionServiceUpdateClassSectionRequest;
}

export interface ClassSectionServiceApiClassSectionServiceUpdateClassSection2Request {
  readonly classSectionId: string;
  readonly body: ClassSectionServiceUpdateClassSectionRequest;
}

export class ClassSectionServiceApi extends BaseAPI {
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

  public classSectionServiceCreateClassSection(
    requestParameters: ClassSectionServiceApiClassSectionServiceCreateClassSectionRequest,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1ClassSection>(
      'POST',
      '/v1/school/class-section',
      requestParameters.body,
      options,
    );
  }

  public classSectionServiceDeleteClassSection(
    requestParameters: ClassSectionServiceApiClassSectionServiceDeleteClassSectionRequest,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1DeleteClassSectionReply>(
      'DELETE',
      `/v1/school/class-section/${encodeURIComponent(String(requestParameters.id))}`,
      undefined,
      options,
    );
  }

  public classSectionServiceGetClassSection(
    requestParameters: ClassSectionServiceApiClassSectionServiceGetClassSectionRequest,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1ClassSection>(
      'GET',
      `/v1/school/class-section/${encodeURIComponent(String(requestParameters.id))}`,
      undefined,
      options,
    );
  }

  public classSectionServiceListClassSection2(
    requestParameters: ClassSectionServiceApiClassSectionServiceListClassSection2Request,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1ListClassSectionReply>(
      'POST',
      '/v1/school/class-section/list',
      requestParameters.body,
      options,
    );
  }

  public classSectionServiceUpdateClassSection(
    requestParameters: ClassSectionServiceApiClassSectionServiceUpdateClassSectionRequest,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1ClassSection>(
      'PUT',
      `/v1/school/class-section/${encodeURIComponent(String(requestParameters.classSectionId))}`,
      requestParameters.body,
      options,
    );
  }

  public classSectionServiceUpdateClassSection2(
    requestParameters: ClassSectionServiceApiClassSectionServiceUpdateClassSection2Request,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1ClassSection>(
      'PATCH',
      `/v1/school/class-section/${encodeURIComponent(String(requestParameters.classSectionId))}`,
      requestParameters.body,
      options,
    );
  }
}
