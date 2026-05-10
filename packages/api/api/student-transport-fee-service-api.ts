/* tslint:disable */
/* eslint-disable */

import type { AxiosPromise, AxiosRequestConfig } from 'axios';
import { BaseAPI } from '../base';
import type {
  StudentTransportFeeServiceUpdateStudentTransportFeeRequest,
  V1CreateStudentTransportPaymentRequest,
  V1CreateStudentTransportFeeRequest,
  V1DeleteStudentTransportPaymentReply,
  V1DeleteStudentTransportFeeReply,
  V1GetStudentTransportReconciliationSnapshotRequest,
  V1ListMyStudentTransportDueRequest,
  V1ListMyStudentTransportPaymentRequest,
  V1ListStudentTransportDueReply,
  V1ListStudentTransportDueRequest,
  V1ListStudentTransportFeeReply,
  V1ListStudentTransportFeeRequest,
  V1ListStudentTransportPaymentReply,
  V1ListStudentTransportPaymentRequest,
  V1ReplaceStudentTransportFeesRequest,
  V1StudentTransportFee,
  V1StudentTransportPayment,
  V1StudentTransportReconciliationSnapshot,
} from '../models';

export interface StudentTransportFeeServiceApiStudentTransportFeeServiceCreateStudentTransportFeeRequest {
  readonly body: V1CreateStudentTransportFeeRequest;
}

export interface StudentTransportFeeServiceApiStudentTransportFeeServiceCreateStudentTransportPaymentRequest {
  readonly body: V1CreateStudentTransportPaymentRequest;
}

export interface StudentTransportFeeServiceApiStudentTransportFeeServiceDeleteStudentTransportFeeRequest {
  readonly id: string;
}

export interface StudentTransportFeeServiceApiStudentTransportFeeServiceDeleteStudentTransportPaymentRequest {
  readonly id: string;
}

export interface StudentTransportFeeServiceApiStudentTransportFeeServiceGetStudentTransportFeeRequest {
  readonly id: string;
}

export interface StudentTransportFeeServiceApiStudentTransportFeeServiceGetStudentTransportPaymentRequest {
  readonly id: string;
}

export interface StudentTransportFeeServiceApiStudentTransportFeeServiceListStudentTransportFee2Request {
  readonly body: V1ListStudentTransportFeeRequest;
}

export interface StudentTransportFeeServiceApiStudentTransportFeeServiceListStudentTransportDue2Request {
  readonly body: V1ListStudentTransportDueRequest;
}

export interface StudentTransportFeeServiceApiStudentTransportFeeServiceListMyStudentTransportDueRequest {
  readonly body: V1ListMyStudentTransportDueRequest;
}

export interface StudentTransportFeeServiceApiStudentTransportFeeServiceGetStudentTransportReconciliationSnapshotRequest {
  readonly body: V1GetStudentTransportReconciliationSnapshotRequest;
}

export interface StudentTransportFeeServiceApiStudentTransportFeeServiceListStudentTransportPayment2Request {
  readonly body: V1ListStudentTransportPaymentRequest;
}

export interface StudentTransportFeeServiceApiStudentTransportFeeServiceListMyStudentTransportPaymentRequest {
  readonly body: V1ListMyStudentTransportPaymentRequest;
}

export interface StudentTransportFeeServiceApiStudentTransportFeeServiceReplaceStudentTransportFeesRequest {
  readonly body: V1ReplaceStudentTransportFeesRequest;
}

export interface StudentTransportFeeServiceApiStudentTransportFeeServiceUpdateStudentTransportFeeRequest {
  readonly studentFeeId: string;
  readonly body: StudentTransportFeeServiceUpdateStudentTransportFeeRequest;
}

export interface StudentTransportFeeServiceApiStudentTransportFeeServiceUpdateStudentTransportFee2Request {
  readonly studentFeeId: string;
  readonly body: StudentTransportFeeServiceUpdateStudentTransportFeeRequest;
}

export class StudentTransportFeeServiceApi extends BaseAPI {
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

  public studentTransportFeeServiceCreateStudentTransportFee(
    requestParameters: StudentTransportFeeServiceApiStudentTransportFeeServiceCreateStudentTransportFeeRequest,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1StudentTransportFee>(
      'POST',
      '/v1/school/transport/student-fee',
      requestParameters.body,
      options,
    );
  }

  public studentTransportFeeServiceCreateStudentTransportPayment(
    requestParameters: StudentTransportFeeServiceApiStudentTransportFeeServiceCreateStudentTransportPaymentRequest,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1StudentTransportPayment>(
      'POST',
      '/v1/school/transport/student-payment',
      requestParameters.body,
      options,
    );
  }

  public studentTransportFeeServiceDeleteStudentTransportFee(
    requestParameters: StudentTransportFeeServiceApiStudentTransportFeeServiceDeleteStudentTransportFeeRequest,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1DeleteStudentTransportFeeReply>(
      'DELETE',
      `/v1/school/transport/student-fee/${encodeURIComponent(String(requestParameters.id))}`,
      undefined,
      options,
    );
  }

  public studentTransportFeeServiceDeleteStudentTransportPayment(
    requestParameters: StudentTransportFeeServiceApiStudentTransportFeeServiceDeleteStudentTransportPaymentRequest,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1DeleteStudentTransportPaymentReply>(
      'DELETE',
      `/v1/school/transport/student-payment/${encodeURIComponent(String(requestParameters.id))}`,
      undefined,
      options,
    );
  }

  public studentTransportFeeServiceGetStudentTransportFee(
    requestParameters: StudentTransportFeeServiceApiStudentTransportFeeServiceGetStudentTransportFeeRequest,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1StudentTransportFee>(
      'GET',
      `/v1/school/transport/student-fee/${encodeURIComponent(String(requestParameters.id))}`,
      undefined,
      options,
    );
  }

  public studentTransportFeeServiceGetStudentTransportPayment(
    requestParameters: StudentTransportFeeServiceApiStudentTransportFeeServiceGetStudentTransportPaymentRequest,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1StudentTransportPayment>(
      'GET',
      `/v1/school/transport/student-payment/${encodeURIComponent(String(requestParameters.id))}`,
      undefined,
      options,
    );
  }

  public studentTransportFeeServiceListStudentTransportFee2(
    requestParameters: StudentTransportFeeServiceApiStudentTransportFeeServiceListStudentTransportFee2Request,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1ListStudentTransportFeeReply>(
      'POST',
      '/v1/school/transport/student-fee/list',
      requestParameters.body,
      options,
    );
  }

  public studentTransportFeeServiceListStudentTransportDue2(
    requestParameters: StudentTransportFeeServiceApiStudentTransportFeeServiceListStudentTransportDue2Request,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1ListStudentTransportDueReply>(
      'POST',
      '/v1/school/transport/student-due/list',
      requestParameters.body,
      options,
    );
  }

  public studentTransportFeeServiceListMyStudentTransportDue(
    requestParameters: StudentTransportFeeServiceApiStudentTransportFeeServiceListMyStudentTransportDueRequest,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1ListStudentTransportDueReply>(
      'POST',
      '/v1/school/me/transport/student-due/list',
      requestParameters.body,
      options,
    );
  }

  public studentTransportFeeServiceGetStudentTransportReconciliationSnapshot(
    requestParameters: StudentTransportFeeServiceApiStudentTransportFeeServiceGetStudentTransportReconciliationSnapshotRequest,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1StudentTransportReconciliationSnapshot>(
      'POST',
      '/v1/school/transport/student-fee/reconciliation-snapshot',
      requestParameters.body,
      options,
    );
  }

  public studentTransportFeeServiceListStudentTransportPayment2(
    requestParameters: StudentTransportFeeServiceApiStudentTransportFeeServiceListStudentTransportPayment2Request,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1ListStudentTransportPaymentReply>(
      'POST',
      '/v1/school/transport/student-payment/list',
      requestParameters.body,
      options,
    );
  }

  public studentTransportFeeServiceListMyStudentTransportPayment(
    requestParameters: StudentTransportFeeServiceApiStudentTransportFeeServiceListMyStudentTransportPaymentRequest,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1ListStudentTransportPaymentReply>(
      'POST',
      '/v1/school/me/transport/student-payment/list',
      requestParameters.body,
      options,
    );
  }

  public studentTransportFeeServiceReplaceStudentTransportFees(
    requestParameters: StudentTransportFeeServiceApiStudentTransportFeeServiceReplaceStudentTransportFeesRequest,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1ListStudentTransportFeeReply>(
      'POST',
      '/v1/school/transport/student-fee/replace',
      requestParameters.body,
      options,
    );
  }

  public studentTransportFeeServiceUpdateStudentTransportFee(
    requestParameters: StudentTransportFeeServiceApiStudentTransportFeeServiceUpdateStudentTransportFeeRequest,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1StudentTransportFee>(
      'PUT',
      `/v1/school/transport/student-fee/${encodeURIComponent(
        String(requestParameters.studentFeeId),
      )}`,
      requestParameters.body,
      options,
    );
  }

  public studentTransportFeeServiceUpdateStudentTransportFee2(
    requestParameters: StudentTransportFeeServiceApiStudentTransportFeeServiceUpdateStudentTransportFee2Request,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1StudentTransportFee>(
      'PATCH',
      `/v1/school/transport/student-fee/${encodeURIComponent(
        String(requestParameters.studentFeeId),
      )}`,
      requestParameters.body,
      options,
    );
  }
}
