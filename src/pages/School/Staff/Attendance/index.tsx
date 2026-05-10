import {
  CheckOutlined,
  ClearOutlined,
  DeleteOutlined,
  PlusOutlined,
  SaveOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import type { ProColumnType } from '@ant-design/pro-components';
import { PageContainer, ProTable } from '@ant-design/pro-components';
import { FormattedMessage, useIntl } from '@umijs/max';
import { Button, DatePicker, Input, Select, Space, Statistic, Tabs, Tag, message } from 'antd';
import React, { useEffect, useMemo, useState } from 'react';
import type {
  V1StaffAttendanceSource,
  V1StaffAttendanceSchedule,
  V1StaffAttendanceScheduleInput,
  V1StaffAttendanceStatus,
  V1StaffDailyAttendanceItem,
  V1StaffDailyAttendanceMark,
  V1StaffRole,
} from '@gosaas/api';
import { StaffAttendanceServiceApi, StaffServiceApi } from '@gosaas/api';
import { dateUtil } from '@gosaas/core';

const attendanceService = new StaffAttendanceServiceApi();
const staffService = new StaffServiceApi();

const statusValues: V1StaffAttendanceStatus[] = [
  'STAFF_ATTENDANCE_STATUS_PRESENT',
  'STAFF_ATTENDANCE_STATUS_ABSENT',
  'STAFF_ATTENDANCE_STATUS_LATE',
  'STAFF_ATTENDANCE_STATUS_HALF_DAY',
  'STAFF_ATTENDANCE_STATUS_HALF_DAY_SECOND_SHIFT',
  'STAFF_ATTENDANCE_STATUS_HOLIDAY',
];

const statusIntlId: Record<V1StaffAttendanceStatus, string> = {
  STAFF_ATTENDANCE_STATUS_UNSPECIFIED: 'school.staff.attendance.unmarked',
  STAFF_ATTENDANCE_STATUS_PRESENT: 'school.staff.attendance.present',
  STAFF_ATTENDANCE_STATUS_LATE: 'school.staff.attendance.late',
  STAFF_ATTENDANCE_STATUS_ABSENT: 'school.staff.attendance.absent',
  STAFF_ATTENDANCE_STATUS_HALF_DAY: 'school.staff.attendance.halfDay',
  STAFF_ATTENDANCE_STATUS_HOLIDAY: 'school.staff.attendance.holiday',
  STAFF_ATTENDANCE_STATUS_HALF_DAY_SECOND_SHIFT: 'school.staff.attendance.halfDaySecondShift',
};

const sourceIntlId: Record<V1StaffAttendanceSource, string> = {
  STAFF_ATTENDANCE_SOURCE_UNSPECIFIED: 'school.staff.attendance.unmarked',
  STAFF_ATTENDANCE_SOURCE_MANUAL: 'school.staff.attendance.manual',
  STAFF_ATTENDANCE_SOURCE_QRCODE: 'school.staff.attendance.qrcode',
  STAFF_ATTENDANCE_SOURCE_BIOMETRIC: 'school.staff.attendance.biometric',
};

type AttendanceRow = V1StaffDailyAttendanceItem & {
  key: string;
};

type ScheduleRow = V1StaffAttendanceSchedule & {
  key: string;
};

const staffName = (row: V1StaffDailyAttendanceItem) =>
  [row.firstName, row.lastName].filter(Boolean).join(' ') || '-';

const isMarkedStatus = (status?: V1StaffAttendanceStatus) =>
  !!status && status !== 'STAFF_ATTENDANCE_STATUS_UNSPECIFIED';

const isTimeClearingStatus = (status?: V1StaffAttendanceStatus) =>
  status === 'STAFF_ATTENDANCE_STATUS_ABSENT' || status === 'STAFF_ATTENDANCE_STATUS_HOLIDAY';

const toRows = (items: V1StaffDailyAttendanceItem[] = []): AttendanceRow[] =>
  items.map((item) => ({
    ...item,
    key: item.staffId || item.attendanceId || '',
  }));

const toScheduleRows = (items: V1StaffAttendanceSchedule[] = []): ScheduleRow[] =>
  items.map((item, index) => ({
    ...item,
    key: item.id || `schedule-${index}`,
  }));

const StaffAttendance: React.FC = () => {
  const intl = useIntl();
  const [roles, setRoles] = useState<V1StaffRole[]>([]);
  const [roleName, setRoleName] = useState<string>();
  const [attendanceDate, setAttendanceDate] = useState(dateUtil());
  const [rows, setRows] = useState<AttendanceRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [scheduleRoleName, setScheduleRoleName] = useState<string>();
  const [scheduleRows, setScheduleRows] = useState<ScheduleRow[]>([]);
  const [scheduleLoading, setScheduleLoading] = useState(false);
  const [scheduleSaving, setScheduleSaving] = useState(false);

  const attendanceDateISO = useMemo(
    () => attendanceDate.startOf('day').toISOString(),
    [attendanceDate],
  );

  const statusOptions = useMemo(
    () =>
      statusValues.map((value) => ({
        label: intl.formatMessage({ id: statusIntlId[value], defaultMessage: value }),
        value,
      })),
    [intl],
  );

  const markedCount = useMemo(
    () => rows.filter((row) => isMarkedStatus(row.status)).length,
    [rows],
  );

  const absentCount = useMemo(
    () => rows.filter((row) => row.status === 'STAFF_ATTENDANCE_STATUS_ABSENT').length,
    [rows],
  );

  const presentCount = useMemo(
    () => rows.filter((row) => row.status === 'STAFF_ATTENDANCE_STATUS_PRESENT').length,
    [rows],
  );

  useEffect(() => {
    staffService
      .staffServiceListStaffRole()
      .then((resp) => setRoles(resp.data.items || []))
      .catch(() => {
        message.error(
          intl.formatMessage({
            id: 'school.staff.attendance.referenceLoadFailed',
            defaultMessage: 'Failed to load staff roles.',
          }),
        );
      });
  }, [intl]);

  const updateRow = (staffId: string | undefined, patch: Partial<AttendanceRow>) => {
    if (!staffId) {
      return;
    }
    setRows((current) =>
      current.map((row) => {
        if (row.staffId !== staffId) {
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
    setLoading(true);
    try {
      const resp = await attendanceService.staffAttendanceServiceGetStaffDailyAttendance({
        attendanceDate: attendanceDateISO,
        roleName,
      });
      setRows(toRows(resp.data.items));
      message.success(
        intl.formatMessage({
          id: 'school.staff.attendance.loaded',
          defaultMessage: 'Attendance Loaded',
        }),
      );
    } catch (error) {
      message.error(
        intl.formatMessage({
          id: 'school.staff.attendance.loadFailed',
          defaultMessage: 'Failed to load attendance.',
        }),
      );
    } finally {
      setLoading(false);
    }
  };

  const saveAttendance = async () => {
    const items = rows
      .filter((row) => row.staffId && isMarkedStatus(row.status))
      .map<V1StaffDailyAttendanceMark>((row) => ({
        staffId: row.staffId!,
        status: row.status!,
        remark: row.remark || undefined,
        inTime: row.inTime || undefined,
        outTime: row.outTime || undefined,
      }));

    setSaving(true);
    try {
      const resp = await attendanceService.staffAttendanceServiceSaveStaffDailyAttendance({
        body: {
          attendanceDate: attendanceDateISO,
          roleName,
          items,
        },
      });
      setRows(toRows(resp.data.items));
      message.success(
        intl.formatMessage({
          id: 'school.staff.attendance.saved',
          defaultMessage: 'Attendance Saved',
        }),
      );
    } catch (error) {
      message.error(
        intl.formatMessage({
          id: 'school.staff.attendance.saveFailed',
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
        status: 'STAFF_ATTENDANCE_STATUS_PRESENT',
      })),
    );
  };

  const clearMarks = () => {
    setRows((current) =>
      current.map((row) => ({
        ...row,
        status: 'STAFF_ATTENDANCE_STATUS_UNSPECIFIED',
        remark: undefined,
        inTime: undefined,
        outTime: undefined,
      })),
    );
  };

  const updateScheduleRow = (key: string, patch: Partial<ScheduleRow>) => {
    setScheduleRows((current) =>
      current.map((row) => (row.key === key ? { ...row, ...patch } : row)),
    );
  };

  const loadSchedules = async () => {
    setScheduleLoading(true);
    try {
      const resp = await attendanceService.staffAttendanceServiceListStaffAttendanceSchedule({
        body: {
          filter: scheduleRoleName ? { roleName: { $eq: scheduleRoleName } } : undefined,
        },
      });
      setScheduleRows(toScheduleRows(resp.data.items));
      message.success(
        intl.formatMessage({
          id: 'school.staff.attendance.schedulesLoaded',
          defaultMessage: 'Schedules Loaded',
        }),
      );
    } catch (error) {
      message.error(
        intl.formatMessage({
          id: 'school.staff.attendance.schedulesLoadFailed',
          defaultMessage: 'Failed to load schedules.',
        }),
      );
    } finally {
      setScheduleLoading(false);
    }
  };

  const addScheduleRow = () => {
    setScheduleRows((current) => [
      ...current,
      {
        key: `new-${Date.now()}`,
        roleName: scheduleRoleName || roles[0]?.name,
        status: 'STAFF_ATTENDANCE_STATUS_PRESENT',
        entryTimeFrom: '08:00',
        entryTimeTo: '08:15',
        totalInstituteHour: '06:00',
      },
    ]);
  };

  const saveSchedules = async () => {
    const roleNames = scheduleRoleName
      ? [scheduleRoleName]
      : Array.from(new Set(scheduleRows.map((row) => row.roleName).filter(Boolean) as string[]));
    const items = scheduleRows.map<V1StaffAttendanceScheduleInput>((row) => ({
      roleName: row.roleName || '',
      status: row.status || 'STAFF_ATTENDANCE_STATUS_PRESENT',
      entryTimeFrom: row.entryTimeFrom || '',
      entryTimeTo: row.entryTimeTo || '',
      totalInstituteHour: row.totalInstituteHour || '',
    }));
    setScheduleSaving(true);
    try {
      const resp = await attendanceService.staffAttendanceServiceSaveStaffAttendanceSchedules({
        body: { roleNames, items },
      });
      setScheduleRows(toScheduleRows(resp.data.items));
      message.success(
        intl.formatMessage({
          id: 'school.staff.attendance.schedulesSaved',
          defaultMessage: 'Schedules Saved',
        }),
      );
    } catch (error) {
      message.error(
        intl.formatMessage({
          id: 'school.staff.attendance.schedulesSaveFailed',
          defaultMessage: 'Failed to save schedules.',
        }),
      );
    } finally {
      setScheduleSaving(false);
    }
  };

  const columns: ProColumnType<AttendanceRow>[] = [
    {
      title: <FormattedMessage id="school.staff.employeeId" defaultMessage="Employee ID" />,
      dataIndex: 'employeeId',
      width: 120,
    },
    {
      title: <FormattedMessage id="school.staff.name" defaultMessage="Name" />,
      renderText: (_, record) => staffName(record),
    },
    {
      title: <FormattedMessage id="school.staff.roleName" defaultMessage="Role" />,
      dataIndex: 'roleName',
      width: 120,
    },
    {
      title: <FormattedMessage id="school.staff.attendance.status" defaultMessage="Status" />,
      dataIndex: 'status',
      width: 220,
      render: (_, record) => (
        <Select
          style={{ width: 200 }}
          value={record.status || 'STAFF_ATTENDANCE_STATUS_UNSPECIFIED'}
          options={[
            {
              label: intl.formatMessage({
                id: 'school.staff.attendance.unmarked',
                defaultMessage: 'Unmarked',
              }),
              value: 'STAFF_ATTENDANCE_STATUS_UNSPECIFIED',
            },
            ...statusOptions,
          ]}
          onChange={(value) => updateRow(record.staffId, { status: value })}
        />
      ),
    },
    {
      title: <FormattedMessage id="school.staff.attendance.inTime" defaultMessage="In Time" />,
      dataIndex: 'inTime',
      width: 130,
      render: (_, record) => (
        <Input
          value={record.inTime}
          disabled={isTimeClearingStatus(record.status)}
          placeholder="08:00"
          onChange={(event) => updateRow(record.staffId, { inTime: event.target.value })}
        />
      ),
    },
    {
      title: <FormattedMessage id="school.staff.attendance.outTime" defaultMessage="Out Time" />,
      dataIndex: 'outTime',
      width: 130,
      render: (_, record) => (
        <Input
          value={record.outTime}
          disabled={isTimeClearingStatus(record.status)}
          placeholder="14:00"
          onChange={(event) => updateRow(record.staffId, { outTime: event.target.value })}
        />
      ),
    },
    {
      title: <FormattedMessage id="school.staff.attendance.remark" defaultMessage="Remark" />,
      dataIndex: 'remark',
      render: (_, record) => (
        <Input
          value={record.remark}
          onChange={(event) => updateRow(record.staffId, { remark: event.target.value })}
        />
      ),
    },
    {
      title: <FormattedMessage id="school.staff.attendance.source" defaultMessage="Source" />,
      dataIndex: 'source',
      width: 120,
      render: (_, record) => {
        const source: V1StaffAttendanceSource = record.source || 'STAFF_ATTENDANCE_SOURCE_MANUAL';
        return (
          <Tag>
            {intl.formatMessage({
              id: sourceIntlId[source],
              defaultMessage: source,
            })}
          </Tag>
        );
      },
    },
  ];

  const scheduleColumns: ProColumnType<ScheduleRow>[] = [
    {
      title: <FormattedMessage id="school.staff.roleName" defaultMessage="Role" />,
      dataIndex: 'roleName',
      width: 220,
      render: (_, record) => (
        <Select
          style={{ width: 200 }}
          value={record.roleName}
          options={roles.map((role) => ({ label: role.name, value: role.name }))}
          onChange={(value) => updateScheduleRow(record.key, { roleName: value })}
        />
      ),
    },
    {
      title: <FormattedMessage id="school.staff.attendance.status" defaultMessage="Status" />,
      dataIndex: 'status',
      width: 220,
      render: (_, record) => (
        <Select
          style={{ width: 200 }}
          value={record.status || 'STAFF_ATTENDANCE_STATUS_PRESENT'}
          options={statusOptions}
          onChange={(value) => updateScheduleRow(record.key, { status: value })}
        />
      ),
    },
    {
      title: (
        <FormattedMessage id="school.staff.attendance.entryFrom" defaultMessage="Entry From" />
      ),
      dataIndex: 'entryTimeFrom',
      width: 140,
      render: (_, record) => (
        <Input
          value={record.entryTimeFrom}
          placeholder="08:00"
          onChange={(event) => updateScheduleRow(record.key, { entryTimeFrom: event.target.value })}
        />
      ),
    },
    {
      title: <FormattedMessage id="school.staff.attendance.entryTo" defaultMessage="Entry To" />,
      dataIndex: 'entryTimeTo',
      width: 140,
      render: (_, record) => (
        <Input
          value={record.entryTimeTo}
          placeholder="08:15"
          onChange={(event) => updateScheduleRow(record.key, { entryTimeTo: event.target.value })}
        />
      ),
    },
    {
      title: (
        <FormattedMessage
          id="school.staff.attendance.totalInstituteHour"
          defaultMessage="Institute Hours"
        />
      ),
      dataIndex: 'totalInstituteHour',
      width: 160,
      render: (_, record) => (
        <Input
          value={record.totalInstituteHour}
          placeholder="06:00"
          onChange={(event) =>
            updateScheduleRow(record.key, { totalInstituteHour: event.target.value })
          }
        />
      ),
    },
    {
      title: <FormattedMessage id="pages.searchTable.titleOption" defaultMessage="Operating" />,
      valueType: 'option',
      width: 80,
      render: (_, record) => (
        <Button
          danger
          icon={<DeleteOutlined />}
          onClick={() =>
            setScheduleRows((current) => current.filter((row) => row.key !== record.key))
          }
        />
      ),
    },
  ];

  return (
    <PageContainer>
      <Tabs
        items={[
          {
            key: 'daily',
            label: <FormattedMessage id="school.staff.attendance.daily" defaultMessage="Daily" />,
            children: (
              <Space direction="vertical" size="large" style={{ width: '100%' }}>
                <Space wrap>
                  <Select
                    allowClear
                    style={{ width: 240 }}
                    placeholder={intl.formatMessage({
                      id: 'school.staff.attendance.allRoles',
                      defaultMessage: 'All Roles',
                    })}
                    value={roleName}
                    options={roles.map((role) => ({ label: role.name, value: role.name }))}
                    onChange={setRoleName}
                  />
                  <DatePicker
                    value={attendanceDate}
                    onChange={(value) => {
                      if (value) {
                        setAttendanceDate(value);
                      }
                    }}
                  />
                  <Button
                    icon={<SearchOutlined />}
                    loading={loading}
                    type="primary"
                    onClick={loadAttendance}
                  >
                    <FormattedMessage id="school.staff.attendance.load" defaultMessage="Load" />
                  </Button>
                  <Button icon={<CheckOutlined />} disabled={!rows.length} onClick={markAllPresent}>
                    <FormattedMessage
                      id="school.staff.attendance.markAllPresent"
                      defaultMessage="Mark Present"
                    />
                  </Button>
                  <Button icon={<ClearOutlined />} disabled={!rows.length} onClick={clearMarks}>
                    <FormattedMessage id="school.staff.attendance.clear" defaultMessage="Clear" />
                  </Button>
                  <Button
                    icon={<SaveOutlined />}
                    disabled={!rows.length}
                    loading={saving}
                    type="primary"
                    onClick={saveAttendance}
                  >
                    <FormattedMessage id="school.staff.attendance.save" defaultMessage="Save" />
                  </Button>
                </Space>
                <Space size="large" wrap>
                  <Statistic
                    title={
                      <FormattedMessage id="school.staff.attendance.staff" defaultMessage="Staff" />
                    }
                    value={rows.length}
                  />
                  <Statistic
                    title={
                      <FormattedMessage
                        id="school.staff.attendance.marked"
                        defaultMessage="Marked"
                      />
                    }
                    value={markedCount}
                  />
                  <Statistic
                    title={
                      <FormattedMessage
                        id="school.staff.attendance.present"
                        defaultMessage="Present"
                      />
                    }
                    value={presentCount}
                  />
                  <Statistic
                    title={
                      <FormattedMessage
                        id="school.staff.attendance.absent"
                        defaultMessage="Absent"
                      />
                    }
                    value={absentCount}
                  />
                </Space>
                <ProTable<AttendanceRow>
                  rowKey="key"
                  search={false}
                  loading={loading}
                  dataSource={rows}
                  columns={columns}
                  pagination={false}
                  toolBarRender={false}
                />
              </Space>
            ),
          },
          {
            key: 'schedules',
            label: (
              <FormattedMessage id="school.staff.attendance.schedules" defaultMessage="Schedules" />
            ),
            children: (
              <Space direction="vertical" size="large" style={{ width: '100%' }}>
                <Space wrap>
                  <Select
                    allowClear
                    style={{ width: 240 }}
                    placeholder={intl.formatMessage({
                      id: 'school.staff.attendance.allRoles',
                      defaultMessage: 'All Roles',
                    })}
                    value={scheduleRoleName}
                    options={roles.map((role) => ({ label: role.name, value: role.name }))}
                    onChange={setScheduleRoleName}
                  />
                  <Button
                    icon={<SearchOutlined />}
                    loading={scheduleLoading}
                    type="primary"
                    onClick={loadSchedules}
                  >
                    <FormattedMessage id="school.staff.attendance.load" defaultMessage="Load" />
                  </Button>
                  <Button icon={<PlusOutlined />} onClick={addScheduleRow}>
                    <FormattedMessage
                      id="school.staff.attendance.addSchedule"
                      defaultMessage="Add Schedule"
                    />
                  </Button>
                  <Button
                    icon={<SaveOutlined />}
                    loading={scheduleSaving}
                    type="primary"
                    onClick={saveSchedules}
                  >
                    <FormattedMessage id="school.staff.attendance.save" defaultMessage="Save" />
                  </Button>
                </Space>
                <ProTable<ScheduleRow>
                  rowKey="key"
                  search={false}
                  loading={scheduleLoading}
                  dataSource={scheduleRows}
                  columns={scheduleColumns}
                  pagination={false}
                  toolBarRender={false}
                />
              </Space>
            ),
          },
        ]}
      />
    </PageContainer>
  );
};

export default StaffAttendance;
