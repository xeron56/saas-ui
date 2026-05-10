/* tslint:disable */
/* eslint-disable */

import type { AxiosPromise, AxiosRequestConfig } from 'axios';
import { BaseAPI } from '../base';
import type {
  StudentHouseServiceUpdateStudentHouseRequest,
  V1CreateStudentHouseRequest,
  V1DeleteStudentHouseReply,
  V1ListStudentHouseReply,
  V1ListStudentHouseRequest,
  V1StudentHouse,
} from '../models';

export interface StudentHouseServiceApiStudentHouseServiceCreateStudentHouseRequest {
  readonly body: V1CreateStudentHouseRequest;
}

export interface StudentHouseServiceApiStudentHouseServiceDeleteStudentHouseRequest {
  readonly id: string;
}

export interface StudentHouseServiceApiStudentHouseServiceGetStudentHouseRequest {
  readonly id: string;
}

export interface StudentHouseServiceApiStudentHouseServiceListStudentHouse2Request {
  readonly body: V1ListStudentHouseRequest;
}

export interface StudentHouseServiceApiStudentHouseServiceUpdateStudentHouseRequest {
  readonly houseId: string;
  readonly body: StudentHouseServiceUpdateStudentHouseRequest;
}

export interface StudentHouseServiceApiStudentHouseServiceUpdateStudentHouse2Request {
  readonly houseId: string;
  readonly body: StudentHouseServiceUpdateStudentHouseRequest;
}

export class StudentHouseServiceApi extends BaseAPI {
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

  public studentHouseServiceCreateStudentHouse(
    requestParameters: StudentHouseServiceApiStudentHouseServiceCreateStudentHouseRequest,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1StudentHouse>(
      'POST',
      '/v1/school/student/house',
      requestParameters.body,
      options,
    );
  }

  public studentHouseServiceDeleteStudentHouse(
    requestParameters: StudentHouseServiceApiStudentHouseServiceDeleteStudentHouseRequest,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1DeleteStudentHouseReply>(
      'DELETE',
      `/v1/school/student/house/${encodeURIComponent(String(requestParameters.id))}`,
      undefined,
      options,
    );
  }

  public studentHouseServiceGetStudentHouse(
    requestParameters: StudentHouseServiceApiStudentHouseServiceGetStudentHouseRequest,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1StudentHouse>(
      'GET',
      `/v1/school/student/house/${encodeURIComponent(String(requestParameters.id))}`,
      undefined,
      options,
    );
  }

  public studentHouseServiceListStudentHouse2(
    requestParameters: StudentHouseServiceApiStudentHouseServiceListStudentHouse2Request,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1ListStudentHouseReply>(
      'POST',
      '/v1/school/student/house/list',
      requestParameters.body,
      options,
    );
  }

  public studentHouseServiceUpdateStudentHouse(
    requestParameters: StudentHouseServiceApiStudentHouseServiceUpdateStudentHouseRequest,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1StudentHouse>(
      'PUT',
      `/v1/school/student/house/${encodeURIComponent(String(requestParameters.houseId))}`,
      requestParameters.body,
      options,
    );
  }

  public studentHouseServiceUpdateStudentHouse2(
    requestParameters: StudentHouseServiceApiStudentHouseServiceUpdateStudentHouse2Request,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1StudentHouse>(
      'PATCH',
      `/v1/school/student/house/${encodeURIComponent(String(requestParameters.houseId))}`,
      requestParameters.body,
      options,
    );
  }
}
