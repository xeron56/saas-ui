/* tslint:disable */
/* eslint-disable */

import type { AxiosPromise, AxiosRequestConfig } from 'axios';
import { BaseAPI } from '../base';
import type {
  ExamMarksheetTemplateServiceUpdateExamMarksheetTemplateRequest,
  V1CreateExamMarksheetTemplateRequest,
  V1DeleteExamMarksheetTemplateReply,
  V1ExamMarksheetTemplate,
  V1ListExamMarksheetTemplateReply,
  V1ListExamMarksheetTemplateRequest,
} from '../models';

export interface ExamMarksheetTemplateServiceApiCreateExamMarksheetTemplateRequest {
  readonly body: V1CreateExamMarksheetTemplateRequest;
}

export interface ExamMarksheetTemplateServiceApiDeleteExamMarksheetTemplateRequest {
  readonly id: string;
}

export interface ExamMarksheetTemplateServiceApiDownloadExamMarksheetTemplateAssetRequest {
  readonly id: string;
  readonly asset: string;
}

export interface ExamMarksheetTemplateServiceApiGetExamMarksheetTemplateRequest {
  readonly id: string;
}

export interface ExamMarksheetTemplateServiceApiListExamMarksheetTemplate2Request {
  readonly body: V1ListExamMarksheetTemplateRequest;
}

export interface ExamMarksheetTemplateServiceApiUpdateExamMarksheetTemplateRequest {
  readonly templateId: string;
  readonly body: ExamMarksheetTemplateServiceUpdateExamMarksheetTemplateRequest;
}

export interface ExamMarksheetTemplateServiceApiUpdateExamMarksheetTemplate2Request {
  readonly templateId: string;
  readonly body: ExamMarksheetTemplateServiceUpdateExamMarksheetTemplateRequest;
}

export class ExamMarksheetTemplateServiceApi extends BaseAPI {
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

  public examMarksheetTemplateServiceCreateExamMarksheetTemplate(
    requestParameters: ExamMarksheetTemplateServiceApiCreateExamMarksheetTemplateRequest,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1ExamMarksheetTemplate>(
      'POST',
      '/v1/school/exam-marksheet-template',
      requestParameters.body,
      options,
    );
  }

  public examMarksheetTemplateServiceDeleteExamMarksheetTemplate(
    requestParameters: ExamMarksheetTemplateServiceApiDeleteExamMarksheetTemplateRequest,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1DeleteExamMarksheetTemplateReply>(
      'DELETE',
      `/v1/school/exam-marksheet-template/${encodeURIComponent(String(requestParameters.id))}`,
      undefined,
      options,
    );
  }

  public examMarksheetTemplateServiceDownloadExamMarksheetTemplateAsset(
    requestParameters: ExamMarksheetTemplateServiceApiDownloadExamMarksheetTemplateAssetRequest,
    options?: AxiosRequestConfig,
  ) {
    return this.request<Blob>(
      'GET',
      `/v1/school/exam-marksheet-template/${encodeURIComponent(
        String(requestParameters.id),
      )}/asset/${encodeURIComponent(String(requestParameters.asset))}/download`,
      undefined,
      { ...options, responseType: 'blob' },
    );
  }

  public examMarksheetTemplateServiceGetExamMarksheetTemplate(
    requestParameters: ExamMarksheetTemplateServiceApiGetExamMarksheetTemplateRequest,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1ExamMarksheetTemplate>(
      'GET',
      `/v1/school/exam-marksheet-template/${encodeURIComponent(String(requestParameters.id))}`,
      undefined,
      options,
    );
  }

  public examMarksheetTemplateServiceListExamMarksheetTemplate2(
    requestParameters: ExamMarksheetTemplateServiceApiListExamMarksheetTemplate2Request,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1ListExamMarksheetTemplateReply>(
      'POST',
      '/v1/school/exam-marksheet-template/list',
      requestParameters.body,
      options,
    );
  }

  public examMarksheetTemplateServiceUpdateExamMarksheetTemplate(
    requestParameters: ExamMarksheetTemplateServiceApiUpdateExamMarksheetTemplateRequest,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1ExamMarksheetTemplate>(
      'PUT',
      `/v1/school/exam-marksheet-template/${encodeURIComponent(
        String(requestParameters.templateId),
      )}`,
      requestParameters.body,
      options,
    );
  }

  public examMarksheetTemplateServiceUpdateExamMarksheetTemplate2(
    requestParameters: ExamMarksheetTemplateServiceApiUpdateExamMarksheetTemplate2Request,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1ExamMarksheetTemplate>(
      'PATCH',
      `/v1/school/exam-marksheet-template/${encodeURIComponent(
        String(requestParameters.templateId),
      )}`,
      requestParameters.body,
      options,
    );
  }
}
