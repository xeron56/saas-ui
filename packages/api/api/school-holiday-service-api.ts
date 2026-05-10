/* tslint:disable */
/* eslint-disable */

import type { AxiosPromise, AxiosRequestConfig } from 'axios';
import { BaseAPI } from '../base';
import type {
  SchoolHolidayServiceUpdateSchoolHolidayRequest,
  V1CreateSchoolHolidayRequest,
  V1DeleteSchoolHolidayReply,
  V1ListSchoolHolidayReply,
  V1ListSchoolHolidayRequest,
  V1SchoolHoliday,
} from '../models';

export interface SchoolHolidayServiceApiSchoolHolidayServiceCreateSchoolHolidayRequest {
  readonly body: V1CreateSchoolHolidayRequest;
}

export interface SchoolHolidayServiceApiSchoolHolidayServiceDeleteSchoolHolidayRequest {
  readonly id: string;
}

export interface SchoolHolidayServiceApiSchoolHolidayServiceGetSchoolHolidayRequest {
  readonly id: string;
}

export interface SchoolHolidayServiceApiSchoolHolidayServiceListSchoolHoliday2Request {
  readonly body: V1ListSchoolHolidayRequest;
}

export interface SchoolHolidayServiceApiSchoolHolidayServiceUpdateSchoolHolidayRequest {
  readonly holidayId: string;
  readonly body: SchoolHolidayServiceUpdateSchoolHolidayRequest;
}

export interface SchoolHolidayServiceApiSchoolHolidayServiceUpdateSchoolHoliday2Request {
  readonly holidayId: string;
  readonly body: SchoolHolidayServiceUpdateSchoolHolidayRequest;
}

export class SchoolHolidayServiceApi extends BaseAPI {
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

  public schoolHolidayServiceCreateSchoolHoliday(
    requestParameters: SchoolHolidayServiceApiSchoolHolidayServiceCreateSchoolHolidayRequest,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1SchoolHoliday>(
      'POST',
      '/v1/school/academic/holiday',
      requestParameters.body,
      options,
    );
  }

  public schoolHolidayServiceDeleteSchoolHoliday(
    requestParameters: SchoolHolidayServiceApiSchoolHolidayServiceDeleteSchoolHolidayRequest,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1DeleteSchoolHolidayReply>(
      'DELETE',
      `/v1/school/academic/holiday/${encodeURIComponent(String(requestParameters.id))}`,
      undefined,
      options,
    );
  }

  public schoolHolidayServiceGetSchoolHoliday(
    requestParameters: SchoolHolidayServiceApiSchoolHolidayServiceGetSchoolHolidayRequest,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1SchoolHoliday>(
      'GET',
      `/v1/school/academic/holiday/${encodeURIComponent(String(requestParameters.id))}`,
      undefined,
      options,
    );
  }

  public schoolHolidayServiceListSchoolHoliday2(
    requestParameters: SchoolHolidayServiceApiSchoolHolidayServiceListSchoolHoliday2Request,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1ListSchoolHolidayReply>(
      'POST',
      '/v1/school/academic/holiday/list',
      requestParameters.body,
      options,
    );
  }

  public schoolHolidayServiceUpdateSchoolHoliday(
    requestParameters: SchoolHolidayServiceApiSchoolHolidayServiceUpdateSchoolHolidayRequest,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1SchoolHoliday>(
      'PUT',
      `/v1/school/academic/holiday/${encodeURIComponent(String(requestParameters.holidayId))}`,
      requestParameters.body,
      options,
    );
  }

  public schoolHolidayServiceUpdateSchoolHoliday2(
    requestParameters: SchoolHolidayServiceApiSchoolHolidayServiceUpdateSchoolHoliday2Request,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1SchoolHoliday>(
      'PATCH',
      `/v1/school/academic/holiday/${encodeURIComponent(String(requestParameters.holidayId))}`,
      requestParameters.body,
      options,
    );
  }
}
