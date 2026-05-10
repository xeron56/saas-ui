/* tslint:disable */
/* eslint-disable */

import type { AxiosPromise, AxiosRequestConfig } from 'axios';
import { BaseAPI } from '../base';
import type {
  ExamAdmitCardTemplateServiceUpdateExamAdmitCardTemplateRequest,
  V1ActivateExamAdmitCardTemplateRequest,
  V1CreateExamAdmitCardTemplateRequest,
  V1DeleteExamAdmitCardTemplateReply,
  V1ExamAdmitCardTemplate,
  V1ListExamAdmitCardTemplateReply,
  V1ListExamAdmitCardTemplateRequest,
} from '../models';

export interface ExamAdmitCardTemplateServiceApiCreateExamAdmitCardTemplateRequest {
  readonly body: V1CreateExamAdmitCardTemplateRequest;
}

export interface ExamAdmitCardTemplateServiceApiDeleteExamAdmitCardTemplateRequest {
  readonly id: string;
}

export interface ExamAdmitCardTemplateServiceApiDownloadExamAdmitCardTemplateAssetRequest {
  readonly id: string;
  readonly asset: string;
}

export interface ExamAdmitCardTemplateServiceApiGetExamAdmitCardTemplateRequest {
  readonly id: string;
}

export interface ExamAdmitCardTemplateServiceApiListExamAdmitCardTemplate2Request {
  readonly body: V1ListExamAdmitCardTemplateRequest;
}

export interface ExamAdmitCardTemplateServiceApiUpdateExamAdmitCardTemplateRequest {
  readonly templateId: string;
  readonly body: ExamAdmitCardTemplateServiceUpdateExamAdmitCardTemplateRequest;
}

export interface ExamAdmitCardTemplateServiceApiUpdateExamAdmitCardTemplate2Request {
  readonly templateId: string;
  readonly body: ExamAdmitCardTemplateServiceUpdateExamAdmitCardTemplateRequest;
}

export interface ExamAdmitCardTemplateServiceApiActivateExamAdmitCardTemplateRequest {
  readonly id: string;
  readonly body?: V1ActivateExamAdmitCardTemplateRequest;
}

export class ExamAdmitCardTemplateServiceApi extends BaseAPI {
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

  public examAdmitCardTemplateServiceCreateExamAdmitCardTemplate(
    requestParameters: ExamAdmitCardTemplateServiceApiCreateExamAdmitCardTemplateRequest,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1ExamAdmitCardTemplate>(
      'POST',
      '/v1/school/exam-admit-card-template',
      requestParameters.body,
      options,
    );
  }

  public examAdmitCardTemplateServiceDeleteExamAdmitCardTemplate(
    requestParameters: ExamAdmitCardTemplateServiceApiDeleteExamAdmitCardTemplateRequest,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1DeleteExamAdmitCardTemplateReply>(
      'DELETE',
      `/v1/school/exam-admit-card-template/${encodeURIComponent(String(requestParameters.id))}`,
      undefined,
      options,
    );
  }

  public examAdmitCardTemplateServiceDownloadExamAdmitCardTemplateAsset(
    requestParameters: ExamAdmitCardTemplateServiceApiDownloadExamAdmitCardTemplateAssetRequest,
    options?: AxiosRequestConfig,
  ) {
    return this.request<Blob>(
      'GET',
      `/v1/school/exam-admit-card-template/${encodeURIComponent(
        String(requestParameters.id),
      )}/asset/${encodeURIComponent(String(requestParameters.asset))}/download`,
      undefined,
      { ...options, responseType: 'blob' },
    );
  }

  public examAdmitCardTemplateServiceGetExamAdmitCardTemplate(
    requestParameters: ExamAdmitCardTemplateServiceApiGetExamAdmitCardTemplateRequest,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1ExamAdmitCardTemplate>(
      'GET',
      `/v1/school/exam-admit-card-template/${encodeURIComponent(String(requestParameters.id))}`,
      undefined,
      options,
    );
  }

  public examAdmitCardTemplateServiceListExamAdmitCardTemplate2(
    requestParameters: ExamAdmitCardTemplateServiceApiListExamAdmitCardTemplate2Request,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1ListExamAdmitCardTemplateReply>(
      'POST',
      '/v1/school/exam-admit-card-template/list',
      requestParameters.body,
      options,
    );
  }

  public examAdmitCardTemplateServiceUpdateExamAdmitCardTemplate(
    requestParameters: ExamAdmitCardTemplateServiceApiUpdateExamAdmitCardTemplateRequest,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1ExamAdmitCardTemplate>(
      'PUT',
      `/v1/school/exam-admit-card-template/${encodeURIComponent(
        String(requestParameters.templateId),
      )}`,
      requestParameters.body,
      options,
    );
  }

  public examAdmitCardTemplateServiceUpdateExamAdmitCardTemplate2(
    requestParameters: ExamAdmitCardTemplateServiceApiUpdateExamAdmitCardTemplate2Request,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1ExamAdmitCardTemplate>(
      'PATCH',
      `/v1/school/exam-admit-card-template/${encodeURIComponent(
        String(requestParameters.templateId),
      )}`,
      requestParameters.body,
      options,
    );
  }

  public examAdmitCardTemplateServiceActivateExamAdmitCardTemplate(
    requestParameters: ExamAdmitCardTemplateServiceApiActivateExamAdmitCardTemplateRequest,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1ExamAdmitCardTemplate>(
      'POST',
      `/v1/school/exam-admit-card-template/${encodeURIComponent(
        String(requestParameters.id),
      )}/activate`,
      requestParameters.body || { id: requestParameters.id },
      options,
    );
  }
}
