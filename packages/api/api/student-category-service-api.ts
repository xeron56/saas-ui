/* tslint:disable */
/* eslint-disable */

import type { AxiosPromise, AxiosRequestConfig } from 'axios';
import { BaseAPI } from '../base';
import type {
  StudentCategoryServiceUpdateStudentCategoryRequest,
  V1CreateStudentCategoryRequest,
  V1DeleteStudentCategoryReply,
  V1ListStudentCategoryReply,
  V1ListStudentCategoryRequest,
  V1StudentCategory,
} from '../models';

export interface StudentCategoryServiceApiStudentCategoryServiceCreateStudentCategoryRequest {
  readonly body: V1CreateStudentCategoryRequest;
}

export interface StudentCategoryServiceApiStudentCategoryServiceDeleteStudentCategoryRequest {
  readonly id: string;
}

export interface StudentCategoryServiceApiStudentCategoryServiceGetStudentCategoryRequest {
  readonly id: string;
}

export interface StudentCategoryServiceApiStudentCategoryServiceListStudentCategory2Request {
  readonly body: V1ListStudentCategoryRequest;
}

export interface StudentCategoryServiceApiStudentCategoryServiceUpdateStudentCategoryRequest {
  readonly categoryId: string;
  readonly body: StudentCategoryServiceUpdateStudentCategoryRequest;
}

export interface StudentCategoryServiceApiStudentCategoryServiceUpdateStudentCategory2Request {
  readonly categoryId: string;
  readonly body: StudentCategoryServiceUpdateStudentCategoryRequest;
}

export class StudentCategoryServiceApi extends BaseAPI {
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

  public studentCategoryServiceCreateStudentCategory(
    requestParameters: StudentCategoryServiceApiStudentCategoryServiceCreateStudentCategoryRequest,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1StudentCategory>(
      'POST',
      '/v1/school/student/category',
      requestParameters.body,
      options,
    );
  }

  public studentCategoryServiceDeleteStudentCategory(
    requestParameters: StudentCategoryServiceApiStudentCategoryServiceDeleteStudentCategoryRequest,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1DeleteStudentCategoryReply>(
      'DELETE',
      `/v1/school/student/category/${encodeURIComponent(String(requestParameters.id))}`,
      undefined,
      options,
    );
  }

  public studentCategoryServiceGetStudentCategory(
    requestParameters: StudentCategoryServiceApiStudentCategoryServiceGetStudentCategoryRequest,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1StudentCategory>(
      'GET',
      `/v1/school/student/category/${encodeURIComponent(String(requestParameters.id))}`,
      undefined,
      options,
    );
  }

  public studentCategoryServiceListStudentCategory2(
    requestParameters: StudentCategoryServiceApiStudentCategoryServiceListStudentCategory2Request,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1ListStudentCategoryReply>(
      'POST',
      '/v1/school/student/category/list',
      requestParameters.body,
      options,
    );
  }

  public studentCategoryServiceUpdateStudentCategory(
    requestParameters: StudentCategoryServiceApiStudentCategoryServiceUpdateStudentCategoryRequest,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1StudentCategory>(
      'PUT',
      `/v1/school/student/category/${encodeURIComponent(String(requestParameters.categoryId))}`,
      requestParameters.body,
      options,
    );
  }

  public studentCategoryServiceUpdateStudentCategory2(
    requestParameters: StudentCategoryServiceApiStudentCategoryServiceUpdateStudentCategory2Request,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1StudentCategory>(
      'PATCH',
      `/v1/school/student/category/${encodeURIComponent(String(requestParameters.categoryId))}`,
      requestParameters.body,
      options,
    );
  }
}
