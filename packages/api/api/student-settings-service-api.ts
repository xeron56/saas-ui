/* tslint:disable */
/* eslint-disable */

import type { AxiosPromise, AxiosRequestConfig } from 'axios';
import { BaseAPI } from '../base';
import type { V1StudentSettings, V1UpdateStudentSettingsRequest } from '../models';

export interface StudentSettingsServiceApiStudentSettingsServiceUpdateStudentSettingsRequest {
  readonly body: V1UpdateStudentSettingsRequest;
}

export interface StudentSettingsServiceApiStudentSettingsServiceUpdateStudentSettings2Request {
  readonly body: V1UpdateStudentSettingsRequest;
}

export class StudentSettingsServiceApi extends BaseAPI {
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

  public studentSettingsServiceGetStudentSettings(options?: AxiosRequestConfig) {
    return this.request<V1StudentSettings>('GET', '/v1/school/student/settings', undefined, options);
  }

  public studentSettingsServiceUpdateStudentSettings(
    requestParameters: StudentSettingsServiceApiStudentSettingsServiceUpdateStudentSettingsRequest,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1StudentSettings>(
      'PUT',
      '/v1/school/student/settings',
      requestParameters.body,
      options,
    );
  }

  public studentSettingsServiceUpdateStudentSettings2(
    requestParameters: StudentSettingsServiceApiStudentSettingsServiceUpdateStudentSettings2Request,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1StudentSettings>(
      'PATCH',
      '/v1/school/student/settings',
      requestParameters.body,
      options,
    );
  }
}
