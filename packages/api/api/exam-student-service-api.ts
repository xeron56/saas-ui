/* tslint:disable */
/* eslint-disable */

import type { AxiosPromise, AxiosRequestConfig } from 'axios';
import { BaseAPI } from '../base';
import type {
  ExamStudentServiceUpdateExamStudentRequest,
  V1DeleteExamStudentReply,
  V1ExamRankReportReply,
  V1ExamStudentAdmitCardReportReply,
  V1ExamStudentMarksheetReportReply,
  V1ExamStudent,
  V1ExamStudentsReply,
  V1GenerateExamRanksRequest,
  V1ListExamStudentReply,
  V1ListExamStudentRequest,
  V1ListMyPublishedExamAdmitCardsRequest,
  V1ListMyPublishedExamResultCardsReply,
  V1ListMyPublishedExamResultCardsRequest,
  V1ListPublishedExamResultCardsByAdmissionNoRequest,
  V1GetPublishedExamResultCardByAdmissionNoRequest,
  V1SaveExamStudentsRequest,
} from '../models';

export interface ExamStudentServiceApiExamStudentServiceDeleteExamStudentRequest {
  readonly id: string;
}

export interface ExamStudentServiceApiExamStudentServiceGetExamStudentsRequest {
  readonly examId: string;
  readonly classSectionId: string;
}

export interface ExamStudentServiceApiExamStudentServiceGetExamRankReportRequest {
  readonly examId: string;
  readonly classSectionId: string;
}

export interface ExamStudentServiceApiExamStudentServiceGetExamStudentMarksheetReportRequest {
  readonly examId: string;
  readonly classSectionId: string;
  readonly examStudentId: string;
}

export interface ExamStudentServiceApiExamStudentServiceDownloadExamStudentMarksheetPdfRequest {
  readonly examId: string;
  readonly classSectionId: string;
  readonly examStudentId: string;
}

export interface ExamStudentServiceApiExamStudentServiceSendExamStudentMarksheetEmailRequest {
  readonly examId: string;
  readonly classSectionId: string;
  readonly examStudentId: string;
}

export interface ExamStudentServiceApiExamStudentServiceGetExamStudentAdmitCardReportRequest {
  readonly examId: string;
  readonly classSectionId: string;
  readonly examStudentId: string;
}

export interface ExamStudentServiceApiExamStudentServiceDownloadExamStudentAdmitCardPdfRequest {
  readonly examId: string;
  readonly classSectionId: string;
  readonly examStudentId: string;
}

export interface ExamStudentServiceApiExamStudentServiceGetMyPublishedExamResultCardRequest {
  readonly studentId: string;
  readonly examId: string;
}

export interface ExamStudentServiceApiExamStudentServiceDownloadMyPublishedExamMarksheetPdfRequest {
  readonly studentId: string;
  readonly examId: string;
}

export interface ExamStudentServiceApiExamStudentServiceGetMyPublishedExamAdmitCardRequest {
  readonly studentId: string;
  readonly examId: string;
}

export interface ExamStudentServiceApiExamStudentServiceDownloadMyPublishedExamAdmitCardPdfRequest {
  readonly studentId: string;
  readonly examId: string;
}

export interface ExamStudentServiceApiExamStudentServiceListMyPublishedExamResultCardsRequest {
  readonly query?: V1ListMyPublishedExamResultCardsRequest;
}

export interface ExamStudentServiceApiExamStudentServiceListMyPublishedExamAdmitCardsRequest {
  readonly query?: V1ListMyPublishedExamAdmitCardsRequest;
}

export interface ExamStudentServiceApiExamStudentServiceListPublishedExamResultCardsByAdmissionNoRequest {
  readonly query?: V1ListPublishedExamResultCardsByAdmissionNoRequest;
}

export interface ExamStudentServiceApiExamStudentServiceGetPublishedExamResultCardByAdmissionNoRequest {
  readonly examId: string;
  readonly query?: V1GetPublishedExamResultCardByAdmissionNoRequest;
}

export interface ExamStudentServiceApiExamStudentServiceDownloadPublishedExamMarksheetPdfByAdmissionNoRequest {
  readonly examId: string;
  readonly query?: V1GetPublishedExamResultCardByAdmissionNoRequest;
}

export interface ExamStudentServiceApiExamStudentServiceGenerateExamRanksRequest {
  readonly examId: string;
  readonly classSectionId: string;
  readonly body: V1GenerateExamRanksRequest;
}

export interface ExamStudentServiceApiExamStudentServiceListExamStudent2Request {
  readonly body: V1ListExamStudentRequest;
}

export interface ExamStudentServiceApiExamStudentServiceSaveExamStudentsRequest {
  readonly examId: string;
  readonly body: V1SaveExamStudentsRequest;
}

export interface ExamStudentServiceApiExamStudentServiceUpdateExamStudentRequest {
  readonly examStudentId: string;
  readonly body: ExamStudentServiceUpdateExamStudentRequest;
}

export interface ExamStudentServiceApiExamStudentServiceUpdateExamStudent2Request {
  readonly examStudentId: string;
  readonly body: ExamStudentServiceUpdateExamStudentRequest;
}

export class ExamStudentServiceApi extends BaseAPI {
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

  public examStudentServiceDeleteExamStudent(
    requestParameters: ExamStudentServiceApiExamStudentServiceDeleteExamStudentRequest,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1DeleteExamStudentReply>(
      'DELETE',
      `/v1/school/exam-student/${encodeURIComponent(String(requestParameters.id))}`,
      undefined,
      options,
    );
  }

  public examStudentServiceGetExamStudents(
    requestParameters: ExamStudentServiceApiExamStudentServiceGetExamStudentsRequest,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1ExamStudentsReply>(
      'GET',
      `/v1/school/exam/${encodeURIComponent(String(requestParameters.examId))}/students`,
      undefined,
      {
        ...options,
        params: {
          ...options?.params,
          class_section_id: requestParameters.classSectionId,
        },
      },
    );
  }

  public examStudentServiceGenerateExamRanks(
    requestParameters: ExamStudentServiceApiExamStudentServiceGenerateExamRanksRequest,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1ExamStudentsReply>(
      'POST',
      `/v1/school/exam/${encodeURIComponent(
        String(requestParameters.examId),
      )}/class-section/${encodeURIComponent(String(requestParameters.classSectionId))}/ranks`,
      requestParameters.body,
      options,
    );
  }

  public examStudentServiceGetExamRankReport(
    requestParameters: ExamStudentServiceApiExamStudentServiceGetExamRankReportRequest,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1ExamRankReportReply>(
      'GET',
      `/v1/school/exam/${encodeURIComponent(
        String(requestParameters.examId),
      )}/class-section/${encodeURIComponent(String(requestParameters.classSectionId))}/rank-report`,
      undefined,
      options,
    );
  }

  public examStudentServiceGetExamStudentMarksheetReport(
    requestParameters: ExamStudentServiceApiExamStudentServiceGetExamStudentMarksheetReportRequest,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1ExamStudentMarksheetReportReply>(
      'GET',
      `/v1/school/exam/${encodeURIComponent(
        String(requestParameters.examId),
      )}/class-section/${encodeURIComponent(
        String(requestParameters.classSectionId),
      )}/student/${encodeURIComponent(String(requestParameters.examStudentId))}/marksheet-report`,
      undefined,
      options,
    );
  }

  public examStudentServiceDownloadExamStudentMarksheetPdf(
    requestParameters: ExamStudentServiceApiExamStudentServiceDownloadExamStudentMarksheetPdfRequest,
    options?: AxiosRequestConfig,
  ) {
    return this.request<Blob>(
      'GET',
      `/v1/school/exam/${encodeURIComponent(
        String(requestParameters.examId),
      )}/class-section/${encodeURIComponent(
        String(requestParameters.classSectionId),
      )}/student/${encodeURIComponent(String(requestParameters.examStudentId))}/marksheet.pdf`,
      undefined,
      { ...options, responseType: 'blob' },
    );
  }

  public examStudentServiceSendExamStudentMarksheetEmail(
    requestParameters: ExamStudentServiceApiExamStudentServiceSendExamStudentMarksheetEmailRequest,
    options?: AxiosRequestConfig,
  ) {
    return this.request<{ sent_count?: number }>(
      'POST',
      `/v1/school/exam/${encodeURIComponent(
        String(requestParameters.examId),
      )}/class-section/${encodeURIComponent(
        String(requestParameters.classSectionId),
      )}/student/${encodeURIComponent(String(requestParameters.examStudentId))}/marksheet-email`,
      undefined,
      options,
    );
  }

  public examStudentServiceGetExamStudentAdmitCardReport(
    requestParameters: ExamStudentServiceApiExamStudentServiceGetExamStudentAdmitCardReportRequest,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1ExamStudentAdmitCardReportReply>(
      'GET',
      `/v1/school/exam/${encodeURIComponent(
        String(requestParameters.examId),
      )}/class-section/${encodeURIComponent(
        String(requestParameters.classSectionId),
      )}/student/${encodeURIComponent(String(requestParameters.examStudentId))}/admit-card-report`,
      undefined,
      options,
    );
  }

  public examStudentServiceDownloadExamStudentAdmitCardPdf(
    requestParameters: ExamStudentServiceApiExamStudentServiceDownloadExamStudentAdmitCardPdfRequest,
    options?: AxiosRequestConfig,
  ) {
    return this.request<Blob>(
      'GET',
      `/v1/school/exam/${encodeURIComponent(
        String(requestParameters.examId),
      )}/class-section/${encodeURIComponent(
        String(requestParameters.classSectionId),
      )}/student/${encodeURIComponent(String(requestParameters.examStudentId))}/admit-card.pdf`,
      undefined,
      { ...options, responseType: 'blob' },
    );
  }

  public examStudentServiceGetMyPublishedExamResultCard(
    requestParameters: ExamStudentServiceApiExamStudentServiceGetMyPublishedExamResultCardRequest,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1ExamStudentMarksheetReportReply>(
      'GET',
      `/v1/school/me/students/${encodeURIComponent(
        String(requestParameters.studentId),
      )}/exams/${encodeURIComponent(String(requestParameters.examId))}/marksheet-report`,
      undefined,
      options,
    );
  }

  public examStudentServiceDownloadMyPublishedExamMarksheetPdf(
    requestParameters: ExamStudentServiceApiExamStudentServiceDownloadMyPublishedExamMarksheetPdfRequest,
    options?: AxiosRequestConfig,
  ) {
    return this.request<Blob>(
      'GET',
      `/v1/school/me/students/${encodeURIComponent(
        String(requestParameters.studentId),
      )}/exams/${encodeURIComponent(String(requestParameters.examId))}/marksheet.pdf`,
      undefined,
      { ...options, responseType: 'blob' },
    );
  }

  public examStudentServiceListMyPublishedExamResultCards(
    requestParameters: ExamStudentServiceApiExamStudentServiceListMyPublishedExamResultCardsRequest = {},
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1ListMyPublishedExamResultCardsReply>(
      'GET',
      '/v1/school/me/exam-result-cards',
      undefined,
      {
        ...options,
        params: {
          ...options?.params,
          page_offset: requestParameters.query?.pageOffset,
          page_size: requestParameters.query?.pageSize,
        },
      },
    );
  }

  public examStudentServiceListMyPublishedExamAdmitCards(
    requestParameters: ExamStudentServiceApiExamStudentServiceListMyPublishedExamAdmitCardsRequest = {},
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1ListMyPublishedExamResultCardsReply>(
      'GET',
      '/v1/school/me/exam-admit-cards',
      undefined,
      {
        ...options,
        params: {
          ...options?.params,
          page_offset: requestParameters.query?.pageOffset,
          page_size: requestParameters.query?.pageSize,
        },
      },
    );
  }

  public examStudentServiceGetMyPublishedExamAdmitCard(
    requestParameters: ExamStudentServiceApiExamStudentServiceGetMyPublishedExamAdmitCardRequest,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1ExamStudentAdmitCardReportReply>(
      'GET',
      `/v1/school/me/students/${encodeURIComponent(
        String(requestParameters.studentId),
      )}/exams/${encodeURIComponent(String(requestParameters.examId))}/admit-card-report`,
      undefined,
      options,
    );
  }

  public examStudentServiceDownloadMyPublishedExamAdmitCardPdf(
    requestParameters: ExamStudentServiceApiExamStudentServiceDownloadMyPublishedExamAdmitCardPdfRequest,
    options?: AxiosRequestConfig,
  ) {
    return this.request<Blob>(
      'GET',
      `/v1/school/me/students/${encodeURIComponent(
        String(requestParameters.studentId),
      )}/exams/${encodeURIComponent(String(requestParameters.examId))}/admit-card.pdf`,
      undefined,
      { ...options, responseType: 'blob' },
    );
  }

  public examStudentServiceListPublishedExamResultCardsByAdmissionNo(
    requestParameters: ExamStudentServiceApiExamStudentServiceListPublishedExamResultCardsByAdmissionNoRequest = {},
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1ListMyPublishedExamResultCardsReply>(
      'GET',
      '/v1/school/public/exam-result-cards',
      undefined,
      {
        ...options,
        params: {
          ...options?.params,
          admission_no: requestParameters.query?.admissionNo,
          page_offset: requestParameters.query?.pageOffset,
          page_size: requestParameters.query?.pageSize,
        },
      },
    );
  }

  public examStudentServiceGetPublishedExamResultCardByAdmissionNo(
    requestParameters: ExamStudentServiceApiExamStudentServiceGetPublishedExamResultCardByAdmissionNoRequest,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1ExamStudentMarksheetReportReply>(
      'GET',
      `/v1/school/public/exams/${encodeURIComponent(
        String(requestParameters.examId),
      )}/marksheet-report`,
      undefined,
      {
        ...options,
        params: {
          ...options?.params,
          admission_no: requestParameters.query?.admissionNo,
        },
      },
    );
  }

  public examStudentServiceDownloadPublishedExamMarksheetPdfByAdmissionNo(
    requestParameters: ExamStudentServiceApiExamStudentServiceDownloadPublishedExamMarksheetPdfByAdmissionNoRequest,
    options?: AxiosRequestConfig,
  ) {
    return this.request<Blob>(
      'GET',
      `/v1/school/public/exams/${encodeURIComponent(
        String(requestParameters.examId),
      )}/marksheet.pdf`,
      undefined,
      {
        ...options,
        responseType: 'blob',
        params: {
          ...options?.params,
          admission_no: requestParameters.query?.admissionNo,
        },
      },
    );
  }

  public examStudentServiceListExamStudent2(
    requestParameters: ExamStudentServiceApiExamStudentServiceListExamStudent2Request,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1ListExamStudentReply>(
      'POST',
      '/v1/school/exam-student/list',
      requestParameters.body,
      options,
    );
  }

  public examStudentServiceSaveExamStudents(
    requestParameters: ExamStudentServiceApiExamStudentServiceSaveExamStudentsRequest,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1ExamStudentsReply>(
      'POST',
      `/v1/school/exam/${encodeURIComponent(String(requestParameters.examId))}/students`,
      requestParameters.body,
      options,
    );
  }

  public examStudentServiceUpdateExamStudent(
    requestParameters: ExamStudentServiceApiExamStudentServiceUpdateExamStudentRequest,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1ExamStudent>(
      'PUT',
      `/v1/school/exam-student/${encodeURIComponent(String(requestParameters.examStudentId))}`,
      requestParameters.body,
      options,
    );
  }

  public examStudentServiceUpdateExamStudent2(
    requestParameters: ExamStudentServiceApiExamStudentServiceUpdateExamStudent2Request,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1ExamStudent>(
      'PATCH',
      `/v1/school/exam-student/${encodeURIComponent(String(requestParameters.examStudentId))}`,
      requestParameters.body,
      options,
    );
  }
}
