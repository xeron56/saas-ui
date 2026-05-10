/* tslint:disable */
/* eslint-disable */

import type { AxiosPromise, AxiosRequestConfig } from 'axios';
import { BaseAPI } from '../base';
import type {
  StudentFeeServiceUpdateStudentFeeRequest,
  V1CreateStudentFeePaymentRequest,
  V1CreateStudentFeeRequest,
  V1DeleteStudentFeePaymentReply,
  V1DeleteStudentFeeReply,
  V1ListMyStudentFeeDueRequest,
  V1ListMyStudentFeePaymentRequest,
  V1ListStudentFeeDueReply,
  V1ListStudentFeeDueRequest,
  V1ListStudentFeePaymentReply,
  V1ListStudentFeePaymentRequest,
  V1ListStudentFeeReply,
  V1ListStudentFeeRequest,
  V1ReplaceStudentFeesRequest,
  V1GetStudentFeeReconciliationSnapshotRequest,
  V1StudentFee,
  V1StudentFeePayment,
  V1StudentFeeReconciliationSnapshot,
} from '../models';

export interface StudentFeeServiceApiStudentFeeServiceCreateStudentFeeRequest {
  readonly body: V1CreateStudentFeeRequest;
}

export interface StudentFeeServiceApiStudentFeeServiceCreateStudentFeePaymentRequest {
  readonly body: V1CreateStudentFeePaymentRequest;
}

export interface StudentFeeServiceApiStudentFeeServiceDeleteStudentFeeRequest {
  readonly id: string;
}

export interface StudentFeeServiceApiStudentFeeServiceDeleteStudentFeePaymentRequest {
  readonly id: string;
}

export interface StudentFeeServiceApiStudentFeeServiceGetStudentFeeRequest {
  readonly id: string;
}

export interface StudentFeeServiceApiStudentFeeServiceGetStudentFeePaymentRequest {
  readonly id: string;
}

export interface StudentFeeServiceApiStudentFeeServiceListStudentFee2Request {
  readonly body: V1ListStudentFeeRequest;
}

export interface StudentFeeServiceApiStudentFeeServiceListStudentFeeDue2Request {
  readonly body: V1ListStudentFeeDueRequest;
}

export interface StudentFeeServiceApiStudentFeeServiceListMyStudentFeeDueRequest {
  readonly body: V1ListMyStudentFeeDueRequest;
}

export interface StudentFeeServiceApiStudentFeeServiceListStudentFeePayment2Request {
  readonly body: V1ListStudentFeePaymentRequest;
}

export interface StudentFeeServiceApiStudentFeeServiceListMyStudentFeePaymentRequest {
  readonly body: V1ListMyStudentFeePaymentRequest;
}

export interface StudentFeeServiceApiStudentFeeServiceGetStudentFeeReconciliationSnapshotRequest {
  readonly body: V1GetStudentFeeReconciliationSnapshotRequest;
}

export interface StudentFeeServiceApiStudentFeeServiceReplaceStudentFeesRequest {
  readonly body: V1ReplaceStudentFeesRequest;
}

export interface StudentFeeServiceApiStudentFeeServiceUpdateStudentFeeRequest {
  readonly studentFeeId: string;
  readonly body: StudentFeeServiceUpdateStudentFeeRequest;
}

export interface StudentFeeServiceApiStudentFeeServiceUpdateStudentFee2Request {
  readonly studentFeeId: string;
  readonly body: StudentFeeServiceUpdateStudentFeeRequest;
}

export class StudentFeeServiceApi extends BaseAPI {
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

  public studentFeeServiceCreateStudentFee(
    requestParameters: StudentFeeServiceApiStudentFeeServiceCreateStudentFeeRequest,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1StudentFee>(
      'POST',
      '/v1/school/fees/student-fee',
      requestParameters.body,
      options,
    );
  }

  public studentFeeServiceCreateStudentFeePayment(
    requestParameters: StudentFeeServiceApiStudentFeeServiceCreateStudentFeePaymentRequest,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1StudentFeePayment>(
      'POST',
      '/v1/school/fees/student-payment',
      requestParameters.body,
      options,
    );
  }

  public studentFeeServiceDeleteStudentFee(
    requestParameters: StudentFeeServiceApiStudentFeeServiceDeleteStudentFeeRequest,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1DeleteStudentFeeReply>(
      'DELETE',
      `/v1/school/fees/student-fee/${encodeURIComponent(String(requestParameters.id))}`,
      undefined,
      options,
    );
  }

  public studentFeeServiceDeleteStudentFeePayment(
    requestParameters: StudentFeeServiceApiStudentFeeServiceDeleteStudentFeePaymentRequest,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1DeleteStudentFeePaymentReply>(
      'DELETE',
      `/v1/school/fees/student-payment/${encodeURIComponent(String(requestParameters.id))}`,
      undefined,
      options,
    );
  }

  public studentFeeServiceGetStudentFee(
    requestParameters: StudentFeeServiceApiStudentFeeServiceGetStudentFeeRequest,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1StudentFee>(
      'GET',
      `/v1/school/fees/student-fee/${encodeURIComponent(String(requestParameters.id))}`,
      undefined,
      options,
    );
  }

  public studentFeeServiceGetStudentFeePayment(
    requestParameters: StudentFeeServiceApiStudentFeeServiceGetStudentFeePaymentRequest,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1StudentFeePayment>(
      'GET',
      `/v1/school/fees/student-payment/${encodeURIComponent(String(requestParameters.id))}`,
      undefined,
      options,
    );
  }

  public studentFeeServiceListStudentFee2(
    requestParameters: StudentFeeServiceApiStudentFeeServiceListStudentFee2Request,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1ListStudentFeeReply>(
      'POST',
      '/v1/school/fees/student-fee/list',
      requestParameters.body,
      options,
    );
  }

  public studentFeeServiceListStudentFeeDue2(
    requestParameters: StudentFeeServiceApiStudentFeeServiceListStudentFeeDue2Request,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1ListStudentFeeDueReply>(
      'POST',
      '/v1/school/fees/student-due/list',
      requestParameters.body,
      options,
    );
  }

  public studentFeeServiceListMyStudentFeeDue(
    requestParameters: StudentFeeServiceApiStudentFeeServiceListMyStudentFeeDueRequest,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1ListStudentFeeDueReply>(
      'POST',
      '/v1/school/me/fees/student-due/list',
      requestParameters.body,
      options,
    );
  }

  public studentFeeServiceListStudentFeePayment2(
    requestParameters: StudentFeeServiceApiStudentFeeServiceListStudentFeePayment2Request,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1ListStudentFeePaymentReply>(
      'POST',
      '/v1/school/fees/student-payment/list',
      requestParameters.body,
      options,
    );
  }

  public studentFeeServiceListMyStudentFeePayment(
    requestParameters: StudentFeeServiceApiStudentFeeServiceListMyStudentFeePaymentRequest,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1ListStudentFeePaymentReply>(
      'POST',
      '/v1/school/me/fees/student-payment/list',
      requestParameters.body,
      options,
    );
  }

  public studentFeeServiceGetStudentFeeReconciliationSnapshot(
    requestParameters: StudentFeeServiceApiStudentFeeServiceGetStudentFeeReconciliationSnapshotRequest,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1StudentFeeReconciliationSnapshot>(
      'POST',
      '/v1/school/fees/student-fee/reconciliation-snapshot',
      requestParameters.body,
      options,
    );
  }

  public studentFeeServiceReplaceStudentFees(
    requestParameters: StudentFeeServiceApiStudentFeeServiceReplaceStudentFeesRequest,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1ListStudentFeeReply>(
      'POST',
      '/v1/school/fees/student-fee/replace',
      requestParameters.body,
      options,
    );
  }

  public studentFeeServiceUpdateStudentFee(
    requestParameters: StudentFeeServiceApiStudentFeeServiceUpdateStudentFeeRequest,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1StudentFee>(
      'PUT',
      `/v1/school/fees/student-fee/${encodeURIComponent(
        String(requestParameters.studentFeeId),
      )}`,
      requestParameters.body,
      options,
    );
  }

  public studentFeeServiceUpdateStudentFee2(
    requestParameters: StudentFeeServiceApiStudentFeeServiceUpdateStudentFee2Request,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1StudentFee>(
      'PATCH',
      `/v1/school/fees/student-fee/${encodeURIComponent(
        String(requestParameters.studentFeeId),
      )}`,
      requestParameters.body,
      options,
    );
  }
}
