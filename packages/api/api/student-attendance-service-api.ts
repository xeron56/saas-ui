/* tslint:disable */
/* eslint-disable */

import type { AxiosPromise, AxiosRequestConfig } from 'axios';
import { BaseAPI } from '../base';
import type {
  V1SaveStudentDailyAttendanceRequest,
  V1SaveStudentSubjectAttendanceRequest,
  V1StudentDailyAttendanceReply,
  V1StudentMonthlyAttendanceReportReply,
  V1StudentSubjectAttendanceDateReportReply,
  V1StudentSubjectAttendanceReply,
} from '../models';

export interface StudentAttendanceServiceApiStudentAttendanceServiceGetStudentDailyAttendanceRequest {
  readonly classSectionId: string;
  readonly attendanceDate: string;
}

export interface StudentAttendanceServiceApiStudentAttendanceServiceGetStudentMonthlyAttendanceReportRequest {
  readonly classSectionId: string;
  readonly fromDate: string;
  readonly toDate: string;
}

export interface StudentAttendanceServiceApiStudentAttendanceServiceGetStudentSubjectAttendanceDateReportRequest {
  readonly classSectionId: string;
  readonly attendanceDate: string;
}

export interface StudentAttendanceServiceApiStudentAttendanceServiceSaveStudentDailyAttendanceRequest {
  readonly body: V1SaveStudentDailyAttendanceRequest;
}

export interface StudentAttendanceServiceApiStudentAttendanceServiceGetStudentSubjectAttendanceRequest {
  readonly subjectTimetableId: string;
  readonly attendanceDate: string;
}

export interface StudentAttendanceServiceApiStudentAttendanceServiceSaveStudentSubjectAttendanceRequest {
  readonly body: V1SaveStudentSubjectAttendanceRequest;
}

export class StudentAttendanceServiceApi extends BaseAPI {
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

  public studentAttendanceServiceGetStudentDailyAttendance(
    requestParameters: StudentAttendanceServiceApiStudentAttendanceServiceGetStudentDailyAttendanceRequest,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1StudentDailyAttendanceReply>(
      'GET',
      '/v1/school/student-attendance/daily',
      undefined,
      {
        ...options,
        params: {
          ...options?.params,
          classSectionId: requestParameters.classSectionId,
          attendanceDate: requestParameters.attendanceDate,
        },
      },
    );
  }

  public studentAttendanceServiceSaveStudentDailyAttendance(
    requestParameters: StudentAttendanceServiceApiStudentAttendanceServiceSaveStudentDailyAttendanceRequest,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1StudentDailyAttendanceReply>(
      'POST',
      '/v1/school/student-attendance/daily',
      requestParameters.body,
      options,
    );
  }

  public studentAttendanceServiceGetStudentMonthlyAttendanceReport(
    requestParameters: StudentAttendanceServiceApiStudentAttendanceServiceGetStudentMonthlyAttendanceReportRequest,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1StudentMonthlyAttendanceReportReply>(
      'GET',
      '/v1/school/student-attendance/monthly-report',
      undefined,
      {
        ...options,
        params: {
          ...options?.params,
          classSectionId: requestParameters.classSectionId,
          fromDate: requestParameters.fromDate,
          toDate: requestParameters.toDate,
        },
      },
    );
  }

  public studentAttendanceServiceGetStudentSubjectAttendanceDateReport(
    requestParameters: StudentAttendanceServiceApiStudentAttendanceServiceGetStudentSubjectAttendanceDateReportRequest,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1StudentSubjectAttendanceDateReportReply>(
      'GET',
      '/v1/school/student-subject-attendance/date-report',
      undefined,
      {
        ...options,
        params: {
          ...options?.params,
          classSectionId: requestParameters.classSectionId,
          attendanceDate: requestParameters.attendanceDate,
        },
      },
    );
  }

  public studentAttendanceServiceGetStudentSubjectAttendance(
    requestParameters: StudentAttendanceServiceApiStudentAttendanceServiceGetStudentSubjectAttendanceRequest,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1StudentSubjectAttendanceReply>(
      'GET',
      '/v1/school/student-subject-attendance/daily',
      undefined,
      {
        ...options,
        params: {
          ...options?.params,
          subjectTimetableId: requestParameters.subjectTimetableId,
          attendanceDate: requestParameters.attendanceDate,
        },
      },
    );
  }

  public studentAttendanceServiceSaveStudentSubjectAttendance(
    requestParameters: StudentAttendanceServiceApiStudentAttendanceServiceSaveStudentSubjectAttendanceRequest,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1StudentSubjectAttendanceReply>(
      'POST',
      '/v1/school/student-subject-attendance/daily',
      requestParameters.body,
      options,
    );
  }
}
