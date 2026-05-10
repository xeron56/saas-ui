/* tslint:disable */
/* eslint-disable */

import type { AxiosPromise, AxiosRequestConfig } from 'axios';
import { BaseAPI } from '../base';
import type {
  V1ListStaffAttendanceScheduleReply,
  V1ListStaffAttendanceScheduleRequest,
  V1SaveStaffAttendanceSchedulesRequest,
  V1SaveStaffDailyAttendanceRequest,
  V1StaffDailyAttendanceReply,
  V1StaffMonthlyAttendanceReportReply,
} from '../models';

export interface StaffAttendanceServiceApiStaffAttendanceServiceGetStaffDailyAttendanceRequest {
  readonly attendanceDate: string;
  readonly roleName?: string;
}

export interface StaffAttendanceServiceApiStaffAttendanceServiceGetStaffMonthlyAttendanceReportRequest {
  readonly fromDate: string;
  readonly toDate: string;
  readonly roleName?: string;
}

export interface StaffAttendanceServiceApiStaffAttendanceServiceSaveStaffDailyAttendanceRequest {
  readonly body: V1SaveStaffDailyAttendanceRequest;
}

export interface StaffAttendanceServiceApiStaffAttendanceServiceListStaffAttendanceScheduleRequest {
  readonly body?: V1ListStaffAttendanceScheduleRequest;
}

export interface StaffAttendanceServiceApiStaffAttendanceServiceSaveStaffAttendanceSchedulesRequest {
  readonly body: V1SaveStaffAttendanceSchedulesRequest;
}

export class StaffAttendanceServiceApi extends BaseAPI {
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

  public staffAttendanceServiceGetStaffDailyAttendance(
    requestParameters: StaffAttendanceServiceApiStaffAttendanceServiceGetStaffDailyAttendanceRequest,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1StaffDailyAttendanceReply>(
      'GET',
      '/v1/school/staff-attendance/daily',
      undefined,
      {
        ...options,
        params: {
          ...options?.params,
          attendanceDate: requestParameters.attendanceDate,
          roleName: requestParameters.roleName,
        },
      },
    );
  }

  public staffAttendanceServiceSaveStaffDailyAttendance(
    requestParameters: StaffAttendanceServiceApiStaffAttendanceServiceSaveStaffDailyAttendanceRequest,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1StaffDailyAttendanceReply>(
      'POST',
      '/v1/school/staff-attendance/daily',
      requestParameters.body,
      options,
    );
  }

  public staffAttendanceServiceListStaffAttendanceSchedule(
    requestParameters: StaffAttendanceServiceApiStaffAttendanceServiceListStaffAttendanceScheduleRequest = {},
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1ListStaffAttendanceScheduleReply>(
      'POST',
      '/v1/school/staff-attendance/schedules/list',
      requestParameters.body || {},
      options,
    );
  }

  public staffAttendanceServiceSaveStaffAttendanceSchedules(
    requestParameters: StaffAttendanceServiceApiStaffAttendanceServiceSaveStaffAttendanceSchedulesRequest,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1ListStaffAttendanceScheduleReply>(
      'POST',
      '/v1/school/staff-attendance/schedules',
      requestParameters.body,
      options,
    );
  }

  public staffAttendanceServiceGetStaffMonthlyAttendanceReport(
    requestParameters: StaffAttendanceServiceApiStaffAttendanceServiceGetStaffMonthlyAttendanceReportRequest,
    options?: AxiosRequestConfig,
  ) {
    return this.request<V1StaffMonthlyAttendanceReportReply>(
      'GET',
      '/v1/school/staff-attendance/monthly-report',
      undefined,
      {
        ...options,
        params: {
          ...options?.params,
          fromDate: requestParameters.fromDate,
          toDate: requestParameters.toDate,
          roleName: requestParameters.roleName,
        },
      },
    );
  }
}
