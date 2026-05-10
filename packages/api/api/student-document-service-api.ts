/* tslint:disable */
/* eslint-disable */

import type { AxiosPromise, AxiosRequestConfig } from 'axios';
import { BaseAPI } from '../base';
import type {
  V1DeleteStudentDocumentReply,
  V1ListStudentDocumentReply,
  V1ListStudentDocumentRequest,
  V1ListMyStudentDocumentRequest,
  V1StudentDocument,
} from '../models';

export interface StudentDocumentServiceApiStudentDocumentServiceDeleteStudentDocumentRequest {
  readonly id: string;
}

export interface StudentDocumentServiceApiStudentDocumentServiceDownloadStudentDocumentRequest {
  readonly id: string;
}

export interface StudentDocumentServiceApiStudentDocumentServiceGetStudentDocumentRequest {
  readonly id: string;
}

export interface StudentDocumentServiceApiStudentDocumentServiceListStudentDocument2Request {
  readonly body: V1ListStudentDocumentRequest;
}

export interface StudentDocumentServiceApiStudentDocumentServiceListMyStudentDocumentRequest {
  readonly query?: V1ListMyStudentDocumentRequest;
}

export interface StudentDocumentServiceApiStudentDocumentServiceDownloadMyStudentDocumentRequest {
  readonly id: string;
}

export class StudentDocumentServiceApi extends BaseAPI {
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

  public studentDocumentServiceDeleteStudentDocument(
    requestParameters: StudentDocumentServiceApiStudentDocumentServiceDeleteStudentDocumentRequest,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1DeleteStudentDocumentReply>(
      'DELETE',
      `/v1/school/student/document/${encodeURIComponent(String(requestParameters.id))}`,
      undefined,
      options,
    );
  }

  public studentDocumentServiceDownloadStudentDocument(
    requestParameters: StudentDocumentServiceApiStudentDocumentServiceDownloadStudentDocumentRequest,
    options?: AxiosRequestConfig,
  ) {
    return this.request<Blob>(
      'GET',
      `/v1/school/student/document/${encodeURIComponent(String(requestParameters.id))}/download`,
      undefined,
      { ...options, responseType: 'blob' },
    );
  }

  public studentDocumentServiceGetStudentDocument(
    requestParameters: StudentDocumentServiceApiStudentDocumentServiceGetStudentDocumentRequest,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1StudentDocument>(
      'GET',
      `/v1/school/student/document/${encodeURIComponent(String(requestParameters.id))}`,
      undefined,
      options,
    );
  }

  public studentDocumentServiceListStudentDocument2(
    requestParameters: StudentDocumentServiceApiStudentDocumentServiceListStudentDocument2Request,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1ListStudentDocumentReply>(
      'POST',
      '/v1/school/student/document/list',
      requestParameters.body,
      options,
    );
  }

  public studentDocumentServiceListMyStudentDocument(
    requestParameters: StudentDocumentServiceApiStudentDocumentServiceListMyStudentDocumentRequest = {},
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1ListStudentDocumentReply>(
      'GET',
      '/v1/school/me/student-documents',
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

  public studentDocumentServiceDownloadMyStudentDocument(
    requestParameters: StudentDocumentServiceApiStudentDocumentServiceDownloadMyStudentDocumentRequest,
    options?: AxiosRequestConfig,
  ) {
    return this.request<Blob>(
      'GET',
      `/v1/school/me/student-document/${encodeURIComponent(String(requestParameters.id))}/download`,
      undefined,
      { ...options, responseType: 'blob' },
    );
  }
}
