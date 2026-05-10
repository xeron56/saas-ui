/* tslint:disable */
/* eslint-disable */

import type { AxiosPromise, AxiosRequestConfig } from 'axios';
import { BaseAPI } from '../base';
import type {
  HolidayTypeServiceUpdateHolidayTypeRequest,
  V1CreateHolidayTypeRequest,
  V1DeleteHolidayTypeReply,
  V1HolidayType,
  V1ListHolidayTypeReply,
  V1ListHolidayTypeRequest,
} from '../models';

export interface HolidayTypeServiceApiHolidayTypeServiceCreateHolidayTypeRequest {
  readonly body: V1CreateHolidayTypeRequest;
}

export interface HolidayTypeServiceApiHolidayTypeServiceDeleteHolidayTypeRequest {
  readonly id: string;
}

export interface HolidayTypeServiceApiHolidayTypeServiceGetHolidayTypeRequest {
  readonly id: string;
}

export interface HolidayTypeServiceApiHolidayTypeServiceListHolidayType2Request {
  readonly body: V1ListHolidayTypeRequest;
}

export interface HolidayTypeServiceApiHolidayTypeServiceUpdateHolidayTypeRequest {
  readonly holidayTypeId: string;
  readonly body: HolidayTypeServiceUpdateHolidayTypeRequest;
}

export interface HolidayTypeServiceApiHolidayTypeServiceUpdateHolidayType2Request {
  readonly holidayTypeId: string;
  readonly body: HolidayTypeServiceUpdateHolidayTypeRequest;
}

export class HolidayTypeServiceApi extends BaseAPI {
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

  public holidayTypeServiceCreateHolidayType(
    requestParameters: HolidayTypeServiceApiHolidayTypeServiceCreateHolidayTypeRequest,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1HolidayType>(
      'POST',
      '/v1/school/academic/holiday-type',
      requestParameters.body,
      options,
    );
  }

  public holidayTypeServiceDeleteHolidayType(
    requestParameters: HolidayTypeServiceApiHolidayTypeServiceDeleteHolidayTypeRequest,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1DeleteHolidayTypeReply>(
      'DELETE',
      `/v1/school/academic/holiday-type/${encodeURIComponent(String(requestParameters.id))}`,
      undefined,
      options,
    );
  }

  public holidayTypeServiceGetHolidayType(
    requestParameters: HolidayTypeServiceApiHolidayTypeServiceGetHolidayTypeRequest,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1HolidayType>(
      'GET',
      `/v1/school/academic/holiday-type/${encodeURIComponent(String(requestParameters.id))}`,
      undefined,
      options,
    );
  }

  public holidayTypeServiceListHolidayType2(
    requestParameters: HolidayTypeServiceApiHolidayTypeServiceListHolidayType2Request,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1ListHolidayTypeReply>(
      'POST',
      '/v1/school/academic/holiday-type/list',
      requestParameters.body,
      options,
    );
  }

  public holidayTypeServiceUpdateHolidayType(
    requestParameters: HolidayTypeServiceApiHolidayTypeServiceUpdateHolidayTypeRequest,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1HolidayType>(
      'PUT',
      `/v1/school/academic/holiday-type/${encodeURIComponent(
        String(requestParameters.holidayTypeId),
      )}`,
      requestParameters.body,
      options,
    );
  }

  public holidayTypeServiceUpdateHolidayType2(
    requestParameters: HolidayTypeServiceApiHolidayTypeServiceUpdateHolidayType2Request,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1HolidayType>(
      'PATCH',
      `/v1/school/academic/holiday-type/${encodeURIComponent(
        String(requestParameters.holidayTypeId),
      )}`,
      requestParameters.body,
      options,
    );
  }
}
