import { SearchOutlined } from '@ant-design/icons';
import type { ProColumnType } from '@ant-design/pro-components';
import { PageContainer, ProTable } from '@ant-design/pro-components';
import { FormattedMessage, useIntl } from '@umijs/max';
import { Button, DatePicker, Select, Space, Statistic, message } from 'antd';
import React, { useEffect, useMemo, useState } from 'react';
import type { V1ClassSection, V1StudentMonthlyAttendanceReportItem } from '@gosaas/api';
import { ClassSectionServiceApi, StudentAttendanceServiceApi } from '@gosaas/api';
import { dateUtil } from '@gosaas/core';

const attendanceService = new StudentAttendanceServiceApi();
const classSectionService = new ClassSectionServiceApi();

type AttendanceReportRow = V1StudentMonthlyAttendanceReportItem & {
  key: string;
};

const classSectionLabel = (item?: V1ClassSection) => {
  if (!item) {
    return '';
  }
  return [item.code, item.id].filter(Boolean).join(' - ');
};

const studentName = (row: V1StudentMonthlyAttendanceReportItem) =>
  [row.firstName, row.middleName, row.lastName].filter(Boolean).join(' ') || '-';

const numberValue = (value?: number) => Number(value || 0);

const StudentAttendanceReport: React.FC = () => {
  const intl = useIntl();
  const [classSections, setClassSections] = useState<V1ClassSection[]>([]);
  const [classSectionId, setClassSectionId] = useState<string>();
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
        ret.students += 1;
        ret.marked += numberValue(row.totalMarked);
        ret.present += numberValue(row.present);
        ret.late += numberValue(row.late);
        ret.lateWithExcuse += numberValue(row.lateWithExcuse);
        ret.absent += numberValue(row.absent);
        ret.halfDay += numberValue(row.halfDay);
        return ret;
      },
      {
        students: 0,
        marked: 0,
        present: 0,
        late: 0,
        lateWithExcuse: 0,
        absent: 0,
        halfDay: 0,
      },
    );
    const presentEquivalent = totals.present + totals.late + totals.lateWithExcuse + totals.halfDay;
    const denominator = presentEquivalent + totals.absent;
    return {
      ...totals,
      presentPercentage: denominator > 0 ? (presentEquivalent * 100) / denominator : 0,
    };
  }, [rows]);

  useEffect(() => {
    classSectionService
      .classSectionServiceListClassSection2({
        body: { pageSize: 200, sort: ['code'] },
      })
      .then((resp) => {
        setClassSections(resp.data.items || []);
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
        await attendanceService.studentAttendanceServiceGetStudentMonthlyAttendanceReport({
          classSectionId,
          fromDate: range.fromDate,
          toDate: range.toDate,
        });
      setRows(
        (resp.data.items || []).map((item) => ({
          ...item,
          key: item.studentEnrollmentId || item.studentId || '',
        })),
      );
    } catch (error) {
      message.error(
        intl.formatMessage({
          id: 'school.report.attendance.loadFailed',
          defaultMessage: 'Failed to load student attendance report.',
        }),
      );
    } finally {
      setLoading(false);
    }
  };

  const columns: ProColumnType<AttendanceReportRow>[] = [
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
      title: <FormattedMessage id="school.report.attendance.marked" defaultMessage="Marked Days" />,
      dataIndex: 'totalMarked',
      valueType: 'digit',
      width: 120,
      search: false,
    },
    {
      title: <FormattedMessage id="school.report.attendance.present" defaultMessage="Present" />,
      dataIndex: 'present',
      valueType: 'digit',
      width: 100,
      search: false,
    },
    {
      title: <FormattedMessage id="school.report.attendance.late" defaultMessage="Late" />,
      dataIndex: 'late',
      valueType: 'digit',
      width: 90,
      search: false,
      renderText: (_, record) => numberValue(record.late) + numberValue(record.lateWithExcuse),
    },
    {
      title: <FormattedMessage id="school.report.attendance.absent" defaultMessage="Absent" />,
      dataIndex: 'absent',
      valueType: 'digit',
      width: 100,
      search: false,
    },
    {
      title: <FormattedMessage id="school.report.attendance.holiday" defaultMessage="Holiday" />,
      dataIndex: 'holiday',
      valueType: 'digit',
      width: 100,
      search: false,
    },
    {
      title: <FormattedMessage id="school.report.attendance.halfDay" defaultMessage="Half Day" />,
      dataIndex: 'halfDay',
      valueType: 'digit',
      width: 110,
      search: false,
    },
    {
      title: (
        <FormattedMessage
          id="school.report.attendance.presentPercentage"
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
            picker="month"
            value={month}
            allowClear={false}
            onChange={(value) => setMonth(value || dateUtil())}
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
              <FormattedMessage id="school.report.attendance.marked" defaultMessage="Marked Days" />
            }
            value={summary.marked}
          />
          <Statistic
            title={
              <FormattedMessage
                id="school.report.attendance.presentPercentage"
                defaultMessage="Present %"
              />
            }
            value={summary.presentPercentage}
            precision={2}
            suffix="%"
          />
          <Statistic
            title={
              <FormattedMessage id="school.report.attendance.absent" defaultMessage="Absent" />
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

export default StudentAttendanceReport;
