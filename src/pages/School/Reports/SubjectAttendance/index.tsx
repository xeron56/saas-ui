import { SearchOutlined } from '@ant-design/icons';
import type { ProColumnType } from '@ant-design/pro-components';
import { PageContainer, ProTable } from '@ant-design/pro-components';
import { FormattedMessage, useIntl } from '@umijs/max';
import { Button, DatePicker, Select, Space, Statistic, Tag, Typography, message } from 'antd';
import React, { useEffect, useMemo, useState } from 'react';
import type {
  V1ClassSection,
  V1Staff,
  V1StudentAttendanceStatus,
  V1StudentSubjectAttendanceDateReportItem,
  V1StudentSubjectAttendanceDateReportMark,
  V1StudentSubjectAttendancePeriod,
  V1Subject,
} from '@gosaas/api';
import {
  ClassSectionServiceApi,
  StaffServiceApi,
  StudentAttendanceServiceApi,
  SubjectServiceApi,
} from '@gosaas/api';
import { dateUtil } from '@gosaas/core';

const attendanceService = new StudentAttendanceServiceApi();
const classSectionService = new ClassSectionServiceApi();
const subjectService = new SubjectServiceApi();
const staffService = new StaffServiceApi();

type SubjectAttendanceReportRow = V1StudentSubjectAttendanceDateReportItem & {
  key: string;
};

const statusIntlId: Record<V1StudentAttendanceStatus, string> = {
  STUDENT_ATTENDANCE_STATUS_UNSPECIFIED: 'school.student.attendance.unmarked',
  STUDENT_ATTENDANCE_STATUS_PRESENT: 'school.student.attendance.present',
  STUDENT_ATTENDANCE_STATUS_LATE_WITH_EXCUSE: 'school.student.attendance.lateWithExcuse',
  STUDENT_ATTENDANCE_STATUS_LATE: 'school.student.attendance.late',
  STUDENT_ATTENDANCE_STATUS_ABSENT: 'school.student.attendance.absent',
  STUDENT_ATTENDANCE_STATUS_HOLIDAY: 'school.student.attendance.holiday',
  STUDENT_ATTENDANCE_STATUS_HALF_DAY: 'school.student.attendance.halfDay',
  STUDENT_ATTENDANCE_STATUS_HALF_DAY_SECOND_SHIFT: 'school.student.attendance.halfDaySecondShift',
};

const keyedById = <T extends { id?: string }>(items: T[] = []) =>
  items.reduce<Record<string, T>>((ret, item) => {
    if (item.id) {
      ret[item.id] = item;
    }
    return ret;
  }, {});

const classSectionLabel = (item?: V1ClassSection) => {
  if (!item) {
    return '';
  }
  return [item.code, item.id].filter(Boolean).join(' - ');
};

const studentName = (row: V1StudentSubjectAttendanceDateReportItem) =>
  [row.firstName, row.middleName, row.lastName].filter(Boolean).join(' ') || '-';

const subjectLabel = (subject?: V1Subject, fallback?: string) =>
  subject
    ? [subject.code, subject.name].filter(Boolean).join(' - ') || subject.id
    : fallback || '-';

const staffLabel = (staff?: V1Staff, fallback?: string) =>
  staff
    ? [staff.employeeId, staff.firstName, staff.lastName].filter(Boolean).join(' ') || staff.id
    : fallback || '-';

const isMarkedStatus = (status?: V1StudentAttendanceStatus) =>
  !!status && status !== 'STUDENT_ATTENDANCE_STATUS_UNSPECIFIED';

const statusColor = (status?: V1StudentAttendanceStatus) => {
  if (status === 'STUDENT_ATTENDANCE_STATUS_PRESENT') {
    return 'success';
  }
  if (
    status === 'STUDENT_ATTENDANCE_STATUS_LATE' ||
    status === 'STUDENT_ATTENDANCE_STATUS_LATE_WITH_EXCUSE' ||
    status === 'STUDENT_ATTENDANCE_STATUS_HALF_DAY' ||
    status === 'STUDENT_ATTENDANCE_STATUS_HALF_DAY_SECOND_SHIFT'
  ) {
    return 'warning';
  }
  if (status === 'STUDENT_ATTENDANCE_STATUS_ABSENT') {
    return 'error';
  }
  if (status === 'STUDENT_ATTENDANCE_STATUS_HOLIDAY') {
    return 'processing';
  }
  return 'default';
};

const rowKey = (item: V1StudentSubjectAttendanceDateReportItem) =>
  item.studentEnrollmentId || item.studentId || item.admissionNo || '';

const markForPeriod = (
  row: V1StudentSubjectAttendanceDateReportItem,
  period: V1StudentSubjectAttendancePeriod,
) => row.marks?.find((mark) => mark.subjectTimetableId === period.subjectTimetableId);

const SubjectAttendanceReport: React.FC = () => {
  const intl = useIntl();
  const [classSections, setClassSections] = useState<V1ClassSection[]>([]);
  const [subjects, setSubjects] = useState<Record<string, V1Subject>>({});
  const [staff, setStaff] = useState<Record<string, V1Staff>>({});
  const [classSectionId, setClassSectionId] = useState<string>();
  const [attendanceDate, setAttendanceDate] = useState(dateUtil());
  const [periods, setPeriods] = useState<V1StudentSubjectAttendancePeriod[]>([]);
  const [rows, setRows] = useState<SubjectAttendanceReportRow[]>([]);
  const [loading, setLoading] = useState(false);

  const attendanceDateISO = useMemo(
    () => attendanceDate.startOf('day').toISOString(),
    [attendanceDate],
  );

  const summary = useMemo(() => {
    const totalCells = rows.length * periods.length;
    const marked = rows.reduce(
      (ret, row) => ret + (row.marks || []).filter((mark) => isMarkedStatus(mark.status)).length,
      0,
    );
    return {
      students: rows.length,
      periods: periods.length,
      marked,
      unmarked: totalCells - marked,
    };
  }, [periods.length, rows]);

  useEffect(() => {
    Promise.all([
      classSectionService.classSectionServiceListClassSection2({
        body: { pageSize: 200, sort: ['code'] },
      }),
      subjectService.subjectServiceListSubject2({ body: { pageSize: 500, sort: ['code'] } }),
      staffService.staffServiceListStaff2({ body: { pageSize: 500, sort: ['employee_id'] } }),
    ])
      .then(([classSectionResp, subjectResp, staffResp]) => {
        setClassSections(classSectionResp.data.items || []);
        setSubjects(keyedById(subjectResp.data.items || []));
        setStaff(keyedById(staffResp.data.items || []));
      })
      .catch(() => {
        message.error(
          intl.formatMessage({
            id: 'school.report.attendance.referenceLoadFailed',
            defaultMessage: 'Failed to load report reference data.',
          }),
        );
      });
  }, [intl]);

  const clearReport = () => {
    setPeriods([]);
    setRows([]);
  };

  const loadReport = async () => {
    if (!classSectionId) {
      message.warning(
        intl.formatMessage({
          id: 'school.student.attendance.selectClassSection',
          defaultMessage: 'Select a class section first.',
        }),
      );
      return;
    }

    setLoading(true);
    try {
      const resp =
        await attendanceService.studentAttendanceServiceGetStudentSubjectAttendanceDateReport({
          classSectionId,
          attendanceDate: attendanceDateISO,
        });
      setPeriods(resp.data.periods || []);
      setRows(
        (resp.data.items || []).map((item) => ({
          ...item,
          key: rowKey(item),
        })),
      );
    } catch (error) {
      message.error(
        intl.formatMessage({
          id: 'school.report.subjectAttendance.loadFailed',
          defaultMessage: 'Failed to load subject attendance report.',
        }),
      );
    } finally {
      setLoading(false);
    }
  };

  const renderMark = (mark?: V1StudentSubjectAttendanceDateReportMark) => {
    if (!isMarkedStatus(mark?.status)) {
      return (
        <Tag color="error">
          <FormattedMessage
            id="school.report.subjectAttendance.notAvailable"
            defaultMessage="N/A"
          />
        </Tag>
      );
    }
    return (
      <Space direction="vertical" size={0}>
        <Tag color={statusColor(mark?.status)}>
          <FormattedMessage id={statusIntlId[mark!.status!]} defaultMessage={mark!.status} />
        </Tag>
        {mark?.remark ? (
          <Typography.Text type="secondary" style={{ maxWidth: 150 }} ellipsis>
            {mark.remark}
          </Typography.Text>
        ) : null}
      </Space>
    );
  };

  const columns: ProColumnType<SubjectAttendanceReportRow>[] = [
    {
      title: <FormattedMessage id="school.student.admissionNo" defaultMessage="Admission No." />,
      dataIndex: 'admissionNo',
      width: 140,
      fixed: 'left',
      search: false,
    },
    {
      title: <FormattedMessage id="school.student.rollNo" defaultMessage="Roll No." />,
      dataIndex: 'rollNo',
      width: 110,
      fixed: 'left',
      search: false,
    },
    {
      title: <FormattedMessage id="school.student.name" defaultMessage="Name" />,
      dataIndex: 'firstName',
      width: 190,
      fixed: 'left',
      search: false,
      render: (_, record) => studentName(record),
    },
    ...periods.map<ProColumnType<SubjectAttendanceReportRow>>((period) => ({
      title: (
        <Space direction="vertical" size={0}>
          <Typography.Text strong>
            {subjectLabel(subjects[period.subjectId || ''], period.subjectId)}
          </Typography.Text>
          <Typography.Text type="secondary">
            {[period.timeFrom, period.timeTo].filter(Boolean).join(' - ')}
          </Typography.Text>
          <Typography.Text type="secondary">
            {staffLabel(staff[period.staffId || ''], period.staffId)}
          </Typography.Text>
        </Space>
      ),
      dataIndex: period.subjectTimetableId,
      width: 190,
      search: false,
      render: (_, record) => renderMark(markForPeriod(record, period)),
    })),
  ];

  return (
    <PageContainer>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Space wrap>
          <Select
            showSearch
            allowClear
            value={classSectionId}
            placeholder={intl.formatMessage({
              id: 'school.student.classSection',
              defaultMessage: 'Class Section',
            })}
            options={classSections.map((item) => ({
              label: classSectionLabel(item),
              value: item.id!,
            }))}
            optionFilterProp="label"
            style={{ minWidth: 260 }}
            onChange={(value) => {
              setClassSectionId(value);
              clearReport();
            }}
          />
          <DatePicker
            value={attendanceDate}
            allowClear={false}
            onChange={(value) => {
              setAttendanceDate(value || dateUtil());
              clearReport();
            }}
          />
          <Button type="primary" icon={<SearchOutlined />} loading={loading} onClick={loadReport}>
            <FormattedMessage id="school.report.attendance.load" defaultMessage="Load Report" />
          </Button>
        </Space>
        <Space wrap size={32}>
          <Statistic
            title={
              <FormattedMessage id="school.report.attendance.students" defaultMessage="Students" />
            }
            value={summary.students}
          />
          <Statistic
            title={
              <FormattedMessage
                id="school.report.subjectAttendance.periods"
                defaultMessage="Periods"
              />
            }
            value={summary.periods}
          />
          <Statistic
            title={
              <FormattedMessage
                id="school.report.subjectAttendance.marked"
                defaultMessage="Marked"
              />
            }
            value={summary.marked}
          />
          <Statistic
            title={
              <FormattedMessage
                id="school.report.subjectAttendance.unmarked"
                defaultMessage="Unmarked"
              />
            }
            value={summary.unmarked}
          />
        </Space>
        <ProTable<SubjectAttendanceReportRow>
          rowKey="key"
          search={false}
          options={false}
          loading={loading}
          dataSource={rows}
          pagination={{ defaultPageSize: 20 }}
          columns={columns}
          scroll={{ x: 440 + periods.length * 190 }}
        />
      </Space>
    </PageContainer>
  );
};

export default SubjectAttendanceReport;
