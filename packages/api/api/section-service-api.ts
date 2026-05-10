/* tslint:disable */
/* eslint-disable */

import type { AxiosPromise, AxiosRequestConfig } from 'axios';
import { BaseAPI } from '../base';
import type {
  SectionServiceUpdateSectionRequest,
  V1CreateSectionRequest,
  V1DeleteSectionReply,
  V1ListSectionReply,
  V1ListSectionRequest,
  V1Section,
} from '../models';

export interface SectionServiceApiSectionServiceCreateSectionRequest {
  readonly body: V1CreateSectionRequest;
}

export interface SectionServiceApiSectionServiceDeleteSectionRequest {
  readonly id: string;
}

export interface SectionServiceApiSectionServiceGetSectionRequest {
  readonly id: string;
}

export interface SectionServiceApiSectionServiceListSection2Request {
  readonly body: V1ListSectionRequest;
}

export interface SectionServiceApiSectionServiceUpdateSectionRequest {
  readonly sectionId: string;
  readonly body: SectionServiceUpdateSectionRequest;
}

export interface SectionServiceApiSectionServiceUpdateSection2Request {
  readonly sectionId: string;
  readonly body: SectionServiceUpdateSectionRequest;
}

export class SectionServiceApi extends BaseAPI {
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

  public sectionServiceCreateSection(
    requestParameters: SectionServiceApiSectionServiceCreateSectionRequest,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1Section>('POST', '/v1/school/section', requestParameters.body, options);
  }

  public sectionServiceDeleteSection(
    requestParameters: SectionServiceApiSectionServiceDeleteSectionRequest,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1DeleteSectionReply>(
      'DELETE',
      `/v1/school/section/${encodeURIComponent(String(requestParameters.id))}`,
      undefined,
      options,
    );
  }

  public sectionServiceGetSection(
    requestParameters: SectionServiceApiSectionServiceGetSectionRequest,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1Section>(
      'GET',
      `/v1/school/section/${encodeURIComponent(String(requestParameters.id))}`,
      undefined,
      options,
    );
  }

  public sectionServiceListSection2(
    requestParameters: SectionServiceApiSectionServiceListSection2Request,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1ListSectionReply>(
      'POST',
      '/v1/school/section/list',
      requestParameters.body,
      options,
    );
  }

  public sectionServiceUpdateSection(
    requestParameters: SectionServiceApiSectionServiceUpdateSectionRequest,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1Section>(
      'PUT',
      `/v1/school/section/${encodeURIComponent(String(requestParameters.sectionId))}`,
      requestParameters.body,
      options,
    );
  }

  public sectionServiceUpdateSection2(
    requestParameters: SectionServiceApiSectionServiceUpdateSection2Request,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1Section>(
      'PATCH',
      `/v1/school/section/${encodeURIComponent(String(requestParameters.sectionId))}`,
      requestParameters.body,
      options,
    );
  }
}
