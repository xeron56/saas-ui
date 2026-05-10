import { CheckOutlined, ClearOutlined, SaveOutlined, SearchOutlined } from '@ant-design/icons';
import type { ProColumnType } from '@ant-design/pro-components';
import { PageContainer, ProTable } from '@ant-design/pro-components';
import { FormattedMessage, useIntl } from '@umijs/max';
import { Button, DatePicker, Input, Select, Space, Statistic, Tag, message } from 'antd';
import React, { useEffect, useMemo, useState } from 'react';
import type {
  V1ClassSection,
  V1StudentAttendanceSource,
  V1StudentAttendanceStatus,
  V1StudentDailyAttendanceItem,
  V1StudentDailyAttendanceMark,
} from '@gosaas/api';
import { ClassSectionServiceApi, StudentAttendanceServiceApi } from '@gosaas/api';
import { dateUtil } from '@gosaas/core';

const attendanceService = new StudentAttendanceServiceApi();
const classSectionService = new ClassSectionServiceApi();

const statusValues: V1StudentAttendanceStatus[] = [
  'STUDENT_ATTENDANCE_STATUS_PRESENT',
  'STUDENT_ATTENDANCE_STATUS_ABSENT',
  'STUDENT_ATTENDANCE_STATUS_LATE',
  'STUDENT_ATTENDANCE_STATUS_LATE_WITH_EXCUSE',
  'STUDENT_ATTENDANCE_STATUS_HALF_DAY',
  'STUDENT_ATTENDANCE_STATUS_HALF_DAY_SECOND_SHIFT',
  'STUDENT_ATTENDANCE_STATUS_HOLIDAY',
];

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

const sourceIntlId: Record<V1StudentAttendanceSource, string> = {
  STUDENT_ATTENDANCE_SOURCE_UNSPECIFIED: 'school.student.attendance.unmarked',
  STUDENT_ATTENDANCE_SOURCE_MANUAL: 'school.student.attendance.manual',
  STUDENT_ATTENDANCE_SOURCE_QRCODE: 'school.student.attendance.qrcode',
  STUDENT_ATTENDANCE_SOURCE_BIOMETRIC: 'school.student.attendance.biometric',
};

type AttendanceRow = V1StudentDailyAttendanceItem & {
  key: string;
};

const studentName = (row: V1StudentDailyAttendanceItem) =>
  [row.firstName, row.middleName, row.lastName].filter(Boolean).join(' ') || '-';

const isMarkedStatus = (status?: V1StudentAttendanceStatus) =>
  !!status && status !== 'STUDENT_ATTENDANCE_STATUS_UNSPECIFIED';

const isTimeClearingStatus = (status?: V1StudentAttendanceStatus) =>
  status === 'STUDENT_ATTENDANCE_STATUS_ABSENT' || status === 'STUDENT_ATTENDANCE_STATUS_HOLIDAY';

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

const classSectionLabel = (item?: V1ClassSection) => {
  if (!item) {
    return '';
  }
  return [item.code, item.id].filter(Boolean).join(' - ');
};

const toRows = (items: V1StudentDailyAttendanceItem[] = []): AttendanceRow[] =>
  items.map((item) => ({
    ...item,
    key: item.studentEnrollmentId || item.studentId || item.attendanceId || '',
  }));

const StudentAttendance: React.FC = () => {
  const intl = useIntl();
  const [classSections, setClassSections] = useState<V1ClassSection[]>([]);
  const [classSectionId, setClassSectionId] = useState<string>();
  const [attendanceDate, setAttendanceDate] = useState(dateUtil());
  const [rows, setRows] = useState<AttendanceRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const attendanceDateISO = useMemo(
    () => attendanceDate.startOf('day').toISOString(),
    [attendanceDate],
  );

  const statusOptions = useMemo(
    () =>
      statusValues.map((value) => ({
        label: intl.formatMessage({
          id: statusIntlId[value],
          defaultMessage: value,
        }),
        value,
      })),
    [intl],
  );

  const markedCount = useMemo(
    () => rows.filter((row) => isMarkedStatus(row.status)).length,
    [rows],
  );

  const absentCount = useMemo(
    () => rows.filter((row) => row.status === 'STUDENT_ATTENDANCE_STATUS_ABSENT').length,
    [rows],
  );

  const presentCount = useMemo(
    () => rows.filter((row) => row.status === 'STUDENT_ATTENDANCE_STATUS_PRESENT').length,
    [rows],
  );

  useEffect(() => {
    classSectionService
      .classSectionServiceListClassSection2({
        body: { pageSize: 200, sort: ['code'] },
      })
      .then((resp) => {
        setClassSections(resp.data.items || []);
      });
  }, []);

  const updateRow = (studentEnrollmentId: string | undefined, patch: Partial<AttendanceRow>) => {
    if (!studentEnrollmentId) {
      return;
    }
    setRows((current) =>
      current.map((row) => {
        if (row.studentEnrollmentId !== studentEnrollmentId) {
          return row;
        }
        const next = { ...row, ...patch };
        if (isTimeClearingStatus(next.status)) {
          next.inTime = undefined;
          next.outTime = undefined;
        }
        return next;
      }),
    );
  };

  const loadAttendance = async () => {
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
      const resp = await attendanceService.studentAttendanceServiceGetStudentDailyAttendance({
        classSectionId,
        attendanceDate: attendanceDateISO,
      });
      setRows(toRows(resp.data.items));
      message.success(
        intl.formatMessage({
          id: 'school.student.attendance.loaded',
          defaultMessage: 'Attendance Loaded',
        }),
      );
    } catch (error) {
      message.error(
        intl.formatMessage({
          id: 'school.student.attendance.loadFailed',
          defaultMessage: 'Failed to load attendance.',
        }),
      );
    } finally {
      setLoading(false);
    }
  };

  const saveAttendance = async () => {
    if (!classSectionId) {
      message.warning(
        intl.formatMessage({
          id: 'school.student.attendance.selectClassSection',
          defaultMessage: 'Select a class section first.',
        }),
      );
      return;
    }

    const items = rows
      .filter((row) => row.studentEnrollmentId && isMarkedStatus(row.status))
      .map<V1StudentDailyAttendanceMark>((row) => ({
        studentEnrollmentId: row.studentEnrollmentId!,
        status: row.status!,
        remark: row.remark || undefined,
        inTime: row.inTime || undefined,
        outTime: row.outTime || undefined,
      }));

    if (!items.length) {
      message.warning(
        intl.formatMessage({
          id: 'school.student.attendance.noMarkedRows',
          defaultMessage: 'Mark at least one student before saving.',
        }),
      );
      return;
    }

    setSaving(true);
    try {
      const resp = await attendanceService.studentAttendanceServiceSaveStudentDailyAttendance({
        body: {
          classSectionId,
          attendanceDate: attendanceDateISO,
          items,
        },
      });
      setRows(toRows(resp.data.items));
      message.success(
        intl.formatMessage({
          id: 'school.student.attendance.saved',
          defaultMessage: 'Attendance Saved',
        }),
      );
    } catch (error) {
      message.error(
        intl.formatMessage({
          id: 'school.student.attendance.saveFailed',
          defaultMessage: 'Failed to save attendance.',
        }),
      );
    } finally {
      setSaving(false);
    }
  };

  const markAllPresent = () => {
    setRows((current) =>
      current.map((row) => ({
        ...row,
        status: 'STUDENT_ATTENDANCE_STATUS_PRESENT',
      })),
    );
  };

  const clearMarks = () => {
    setRows((current) =>
      current.map((row) => ({
        ...row,
        status: 'STUDENT_ATTENDANCE_STATUS_UNSPECIFIED',
        remark: undefined,
        inTime: undefined,
        outTime: undefined,
      })),
    );
  };

  const columns: ProColumnType<AttendanceRow>[] = [
    {
      title: <FormattedMessage id="school.student.admissionNo" defaultMessage="Admission No." />,
      dataIndex: 'admissionNo',
      width: 140,
      search: false,
    },
    {
      title: <FormattedMessage id="school.student.rollNo" defaultMessage="Roll No." />,
      dataIndex: 'rollNo',
      width: 110,
      search: false,
    },
    {
      title: <FormattedMessage id="school.student.name" defaultMessage="Name" />,
      dataIndex: 'firstName',
      search: false,
      render: (_, record) => studentName(record),
    },
    {
      title: <FormattedMessage id="school.student.attendance.status" defaultMessage="Status" />,
      dataIndex: 'status',
      width: 220,
      search: false,
      render: (_, record) => (
        <Select
          allowClear
          value={isMarkedStatus(record.status) ? record.status : undefined}
          placeholder={intl.formatMessage({
            id: 'school.student.attendance.unmarked',
            defaultMessage: 'Unmarked',
          })}
          options={statusOptions}
          style={{ width: '100%' }}
          onChange={(status) => updateRow(record.studentEnrollmentId, { status })}
        />
      ),
    },
    {
      title: <FormattedMessage id="school.student.attendance.inTime" defaultMessage="In Time" />,
      dataIndex: 'inTime',
      width: 130,
      search: false,
      render: (_, record) => (
        <Input
          allowClear
          disabled={isTimeClearingStatus(record.status)}
          placeholder="HH:mm"
          value={record.inTime}
          onChange={(event) =>
            updateRow(record.studentEnrollmentId, { inTime: event.target.value })
          }
        />
      ),
    },
    {
      title: <FormattedMessage id="school.student.attendance.outTime" defaultMessage="Out Time" />,
      dataIndex: 'outTime',
      width: 130,
      search: false,
      render: (_, record) => (
        <Input
          allowClear
          disabled={isTimeClearingStatus(record.status)}
          placeholder="HH:mm"
          value={record.outTime}
          onChange={(event) =>
            updateRow(record.studentEnrollmentId, { outTime: event.target.value })
          }
        />
      ),
    },
    {
      title: <FormattedMessage id="school.student.attendance.remark" defaultMessage="Remark" />,
      dataIndex: 'remark',
      search: false,
      render: (_, record) => (
        <Input
          allowClear
          value={record.remark}
          onChange={(event) =>
            updateRow(record.studentEnrollmentId, { remark: event.target.value })
          }
        />
      ),
    },
    {
      title: <FormattedMessage id="school.student.attendance.source" defaultMessage="Source" />,
      dataIndex: 'source',
      width: 130,
      search: false,
      render: (_, record) => (
        <Tag color={record.source === 'STUDENT_ATTENDANCE_SOURCE_MANUAL' ? 'blue' : 'default'}>
          {intl.formatMessage({
            id: sourceIntlId[record.source || 'STUDENT_ATTENDANCE_SOURCE_UNSPECIFIED'],
            defaultMessage: record.source || '-',
          })}
        </Tag>
      ),
    },
    {
      title: <FormattedMessage id="school.student.attendance.marked" defaultMessage="Marked" />,
      dataIndex: 'status',
      width: 120,
      search: false,
      render: (_, record) => (
        <Tag color={statusColor(record.status)}>
          {intl.formatMessage({
            id: statusIntlId[record.status || 'STUDENT_ATTENDANCE_STATUS_UNSPECIFIED'],
            defaultMessage: record.status || '-',
          })}
        </Tag>
      ),
    },
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
              setRows([]);
            }}
          />
          <DatePicker
            value={attendanceDate}
            allowClear={false}
            onChange={(value) => setAttendanceDate(value || dateUtil())}
          />
          <Button icon={<SearchOutlined />} loading={loading} onClick={loadAttendance}>
            <FormattedMessage
              id="school.student.attendance.load"
              defaultMessage="Load Attendance"
            />
          </Button>
          <Button icon={<CheckOutlined />} disabled={!rows.length} onClick={markAllPresent}>
            <FormattedMessage
              id="school.student.attendance.markPresent"
              defaultMessage="Mark Present"
            />
          </Button>
          <Button icon={<ClearOutlined />} disabled={!rows.length} onClick={clearMarks}>
            <FormattedMessage
              id="school.student.attendance.clearMarks"
              defaultMessage="Clear Marks"
            />
          </Button>
          <Button
            type="primary"
            icon={<SaveOutlined />}
            disabled={!rows.length}
            loading={saving}
            onClick={saveAttendance}
          >
            <FormattedMessage id="school.student.attendance.save" defaultMessage="Save Marks" />
          </Button>
        </Space>
        <Space wrap size={32}>
          <Statistic
            title={
              <FormattedMessage id="school.student.attendance.marked" defaultMessage="Marked" />
            }
            value={markedCount}
            suffix={`/ ${rows.length}`}
          />
          <Statistic
            title={
              <FormattedMessage id="school.student.attendance.present" defaultMessage="Present" />
            }
            value={presentCount}
          />
          <Statistic
            title={
              <FormattedMessage id="school.student.attendance.absent" defaultMessage="Absent" />
            }
            value={absentCount}
          />
        </Space>
        <ProTable<AttendanceRow>
          rowKey="key"
          search={false}
          options={false}
          loading={loading}
          dataSource={rows}
          pagination={{ defaultPageSize: 20 }}
          columns={columns}
        />
      </Space>
    </PageContainer>
  );
};

export default StudentAttendance;
