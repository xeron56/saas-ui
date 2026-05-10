import type { ProColumnType } from '@ant-design/pro-components';
import {
  ProFormDatePicker,
  ProFormSelect,
  ProFormSwitch,
  ProFormText,
  ProFormTextArea,
} from '@ant-design/pro-components';
import { FormattedMessage, useIntl } from '@umijs/max';
import React, { useEffect, useState } from 'react';
import type {
  V1AcademicSession,
  V1CreateSchoolHolidayRequest,
  V1HolidayType,
  V1SchoolHoliday,
} from '@gosaas/api';
import {
  AcademicSessionServiceApi,
  HolidayTypeServiceApi,
  SchoolHolidayServiceApi,
} from '@gosaas/api';
import { dateUtil } from '@gosaas/core';
import ReferencePage from '../../Student/components/ReferencePage';

const service = new SchoolHolidayServiceApi();
const sessionService = new AcademicSessionServiceApi();
const holidayTypeService = new HolidayTypeServiceApi();

const keyedById = <T extends { id?: string }>(items: T[] = []) =>
  items.reduce<Record<string, T>>((ret, item) => {
    if (item.id) {
      ret[item.id] = item;
    }
    return ret;
  }, {});

const normalizeHoliday = (fields: V1CreateSchoolHolidayRequest & V1SchoolHoliday) => ({
  ...fields,
  fromDate: fields.fromDate ? dateUtil(fields.fromDate).toISOString() : undefined,
  toDate: fields.toDate ? dateUtil(fields.toDate).toISOString() : undefined,
  color: fields.color || '#008000',
});

const TableList: React.FC = () => {
  const intl = useIntl();
  const [sessions, setSessions] = useState<Record<string, V1AcademicSession>>({});
  const [holidayTypes, setHolidayTypes] = useState<Record<string, V1HolidayType>>({});

  useEffect(() => {
    sessionService
      .academicSessionServiceListAcademicSession2({ body: { pageSize: 100, sort: ['code'] } })
      .then((resp) => setSessions(keyedById(resp.data.items)));
    holidayTypeService
      .holidayTypeServiceListHolidayType2({ body: { pageSize: 100, sort: ['name'] } })
      .then((resp) => setHolidayTypes(keyedById(resp.data.items)));
  }, []);

  const columns: ProColumnType<V1SchoolHoliday>[] = [
    {
      title: <FormattedMessage id="school.academic.sessions" defaultMessage="Academic Sessions" />,
      dataIndex: 'academicSessionId',
      valueType: 'text',
      render: (_, record) =>
        record.academicSessionId
          ? sessions[record.academicSessionId]?.code || record.academicSessionId
          : '-',
    },
    {
      title: <FormattedMessage id="school.academic.holidayType" defaultMessage="Holiday Type" />,
      dataIndex: 'holidayTypeId',
      valueType: 'text',
      render: (_, record) =>
        record.holidayTypeId
          ? holidayTypes[record.holidayTypeId]?.name || record.holidayTypeId
          : '-',
    },
    {
      title: <FormattedMessage id="school.academic.holiday.fromDate" defaultMessage="From Date" />,
      dataIndex: 'fromDate',
      valueType: 'date',
    },
    {
      title: <FormattedMessage id="school.academic.holiday.toDate" defaultMessage="To Date" />,
      dataIndex: 'toDate',
      valueType: 'date',
    },
    {
      title: (
        <FormattedMessage id="school.academic.holiday.description" defaultMessage="Description" />
      ),
      dataIndex: 'description',
      valueType: 'text',
      ellipsis: true,
    },
    {
      title: (
        <FormattedMessage id="school.academic.holiday.frontSite" defaultMessage="Front Site" />
      ),
      dataIndex: 'frontSite',
      valueType: 'switch',
    },
  ];

  return (
    <ReferencePage<V1SchoolHoliday>
      columns={columns}
      create={(fields: V1CreateSchoolHolidayRequest) =>
        service.schoolHolidayServiceCreateSchoolHoliday({ body: normalizeHoliday(fields as any) })
      }
      delete={(record) => service.schoolHolidayServiceDeleteSchoolHoliday({ id: record.id! })}
      get={async (id) => (await service.schoolHolidayServiceGetSchoolHoliday({ id })).data}
      list={async (req: any) =>
        (await service.schoolHolidayServiceListSchoolHoliday2({ body: req })).data
      }
      title={(record) => record.description || record.id}
      update={(record, fields: any) =>
        service.schoolHolidayServiceUpdateSchoolHoliday2({
          holidayId: record.id!,
          body: { holiday: { id: record.id!, ...normalizeHoliday(fields) } },
        })
      }
      formItems={
        <>
          <ProFormSelect
            name="academicSessionId"
            label={intl.formatMessage({
              id: 'school.academic.sessions',
              defaultMessage: 'Academic Sessions',
            })}
            rules={[{ required: true }]}
            request={async () => {
              const resp = await sessionService.academicSessionServiceListAcademicSession2({
                body: { pageSize: 100, sort: ['code'] },
              });
              return (resp.data.items || []).map((item) => ({
                label: item.code || item.name || item.id,
                value: item.id,
              }));
            }}
          />
          <ProFormSelect
            name="holidayTypeId"
            label={intl.formatMessage({
              id: 'school.academic.holidayType',
              defaultMessage: 'Holiday Type',
            })}
            rules={[{ required: true }]}
            request={async () => {
              const resp = await holidayTypeService.holidayTypeServiceListHolidayType2({
                body: { pageSize: 100, sort: ['name'] },
              });
              return (resp.data.items || []).map((item) => ({
                label: item.name || item.id,
                value: item.id,
              }));
            }}
          />
          <ProFormDatePicker
            name="fromDate"
            label={intl.formatMessage({
              id: 'school.academic.holiday.fromDate',
              defaultMessage: 'From Date',
            })}
            rules={[{ required: true }]}
          />
          <ProFormDatePicker
            name="toDate"
            label={intl.formatMessage({
              id: 'school.academic.holiday.toDate',
              defaultMessage: 'To Date',
            })}
            rules={[{ required: true }]}
          />
          <ProFormTextArea
            name="description"
            label={intl.formatMessage({
              id: 'school.academic.holiday.description',
              defaultMessage: 'Description',
            })}
            rules={[{ required: true }]}
          />
          <ProFormSwitch
            name="frontSite"
            label={intl.formatMessage({
              id: 'school.academic.holiday.frontSite',
              defaultMessage: 'Front Site',
            })}
          />
          <ProFormText
            name="color"
            label={intl.formatMessage({
              id: 'school.academic.holiday.color',
              defaultMessage: 'Color',
            })}
            fieldProps={{ placeholder: '#008000' }}
          />
        </>
      }
    />
  );
};

export default TableList;
