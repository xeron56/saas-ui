import { SearchOutlined } from '@ant-design/icons';
import type { ProColumnType } from '@ant-design/pro-components';
import { PageContainer, ProTable } from '@ant-design/pro-components';
import { FormattedMessage, useIntl } from '@umijs/max';
import { Button, DatePicker, Select, Space, Statistic, message } from 'antd';
import React, { useEffect, useMemo, useState } from 'react';
import type { V1StaffMonthlyAttendanceReportItem, V1StaffRole } from '@gosaas/api';
import { StaffAttendanceServiceApi, StaffServiceApi } from '@gosaas/api';
import { dateUtil } from '@gosaas/core';

const attendanceService = new StaffAttendanceServiceApi();
const staffService = new StaffServiceApi();

type AttendanceReportRow = V1StaffMonthlyAttendanceReportItem & {
  key: string;
};

const staffName = (row: V1StaffMonthlyAttendanceReportItem) =>
  [row.firstName, row.lastName].filter(Boolean).join(' ') || '-';

const numberValue = (value?: number) => Number(value || 0);

const StaffAttendanceReport: React.FC = () => {
  const intl = useIntl();
  const [roles, setRoles] = useState<V1StaffRole[]>([]);
  const [roleName, setRoleName] = useState<string>();
  const [month, setMonth] = useState(dateUtil());
  const [rows, setRows] = useState<AttendanceReportRow[]>([]);
  const [loading, setLoading] = useState(false);

  const range = useMemo(
    () => ({
      fromDate: month.startOf('month').toISOString(),
      toDate: month.endOf('month').toISOString(),
    }),
    [month],
  );

  const summary = useMemo(() => {
    const totals = rows.reduce(
      (ret, row) => {
        ret.staff += 1;
        ret.marked += numberValue(row.totalMarked);
        ret.present += numberValue(row.present);
        ret.late += numberValue(row.late);
        ret.absent += numberValue(row.absent);
        ret.halfDay += numberValue(row.halfDay);
        return ret;
      },
      {
        staff: 0,
        marked: 0,
        present: 0,
        late: 0,
        absent: 0,
        halfDay: 0,
      },
    );
    const presentEquivalent = totals.present + totals.late + totals.halfDay;
    const denominator = presentEquivalent + totals.absent;
    return {
      ...totals,
      presentPercentage: denominator > 0 ? (presentEquivalent * 100) / denominator : 0,
    };
  }, [rows]);

  useEffect(() => {
    staffService
      .staffServiceListStaffRole()
      .then((resp) => setRoles(resp.data.items || []))
      .catch(() => {
        message.error(
          intl.formatMessage({
            id: 'school.report.staffAttendance.referenceLoadFailed',
            defaultMessage: 'Failed to load staff roles.',
          }),
        );
      });
  }, [intl]);

  const loadReport = async () => {
    setLoading(true);
    try {
      const resp = await attendanceService.staffAttendanceServiceGetStaffMonthlyAttendanceReport({
        roleName,
        fromDate: range.fromDate,
        toDate: range.toDate,
      });
      setRows(
        (resp.data.items || []).map((item) => ({
          ...item,
          key: item.staffId || item.employeeId || '',
        })),
      );
    } catch (error) {
      message.error(
        intl.formatMessage({
          id: 'school.report.staffAttendance.loadFailed',
          defaultMessage: 'Failed to load staff attendance report.',
        }),
      );
    } finally {
      setLoading(false);
    }
  };

  const columns: ProColumnType<AttendanceReportRow>[] = [
    {
      title: <FormattedMessage id="school.staff.employeeId" defaultMessage="Employee ID" />,
      dataIndex: 'employeeId',
      width: 140,
      search: false,
    },
    {
      title: <FormattedMessage id="school.staff.name" defaultMessage="Name" />,
      dataIndex: 'firstName',
      search: false,
      render: (_, record) => staffName(record),
    },
    {
      title: <FormattedMessage id="school.staff.roleName" defaultMessage="Role" />,
      dataIndex: 'roleName',
      width: 120,
      search: false,
    },
    {
      title: (
        <FormattedMessage id="school.report.staffAttendance.marked" defaultMessage="Marked Days" />
      ),
      dataIndex: 'totalMarked',
      valueType: 'digit',
      width: 120,
      search: false,
    },
    {
      title: (
        <FormattedMessage id="school.report.staffAttendance.present" defaultMessage="Present" />
      ),
      dataIndex: 'present',
      valueType: 'digit',
      width: 100,
      search: false,
    },
    {
      title: <FormattedMessage id="school.report.staffAttendance.late" defaultMessage="Late" />,
      dataIndex: 'late',
      valueType: 'digit',
      width: 90,
      search: false,
    },
    {
      title: <FormattedMessage id="school.report.staffAttendance.absent" defaultMessage="Absent" />,
      dataIndex: 'absent',
      valueType: 'digit',
      width: 100,
      search: false,
    },
    {
      title: (
        <FormattedMessage id="school.report.staffAttendance.holiday" defaultMessage="Holiday" />
      ),
      dataIndex: 'holiday',
      valueType: 'digit',
      width: 100,
      search: false,
    },
    {
      title: (
        <FormattedMessage id="school.report.staffAttendance.halfDay" defaultMessage="Half Day" />
      ),
      dataIndex: 'halfDay',
      valueType: 'digit',
      width: 110,
      search: false,
    },
    {
      title: (
        <FormattedMessage
          id="school.report.staffAttendance.presentPercentage"
          defaultMessage="Present %"
        />
      ),
      dataIndex: 'presentPercentage',
      valueType: 'percent',
      width: 120,
      search: false,
      renderText: (value) => `${Number(value || 0).toFixed(2)}%`,
    },
  ];

  return (
    <PageContainer>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Space wrap>
          <Select
            showSearch
            allowClear
            value={roleName}
            placeholder={intl.formatMessage({
              id: 'school.staff.attendance.allRoles',
              defaultMessage: 'All Roles',
            })}
            options={roles.map((role) => ({
              label: role.name,
              value: role.name,
            }))}
            optionFilterProp="label"
            style={{ minWidth: 260 }}
            onChange={(value) => {
              setRoleName(value);
              setRows([]);
            }}
          />
          <DatePicker
            picker="month"
            value={month}
            allowClear={false}
            onChange={(value) => setMonth(value || dateUtil())}
          />
          <Button type="primary" icon={<SearchOutlined />} loading={loading} onClick={loadReport}>
            <FormattedMessage
              id="school.report.staffAttendance.load"
              defaultMessage="Load Report"
            />
          </Button>
        </Space>
        <Space wrap size={32}>
          <Statistic
            title={
              <FormattedMessage id="school.report.staffAttendance.staff" defaultMessage="Staff" />
            }
            value={summary.staff}
          />
          <Statistic
            title={
              <FormattedMessage
                id="school.report.staffAttendance.marked"
                defaultMessage="Marked Days"
              />
            }
            value={summary.marked}
          />
          <Statistic
            title={
              <FormattedMessage
                id="school.report.staffAttendance.presentPercentage"
                defaultMessage="Present %"
              />
            }
            value={summary.presentPercentage}
            precision={2}
            suffix="%"
          />
          <Statistic
            title={
              <FormattedMessage id="school.report.staffAttendance.absent" defaultMessage="Absent" />
            }
            value={summary.absent}
          />
        </Space>
        <ProTable<AttendanceReportRow>
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

export default StaffAttendanceReport;
