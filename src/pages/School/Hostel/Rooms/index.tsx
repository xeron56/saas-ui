import type { ProColumnType } from '@ant-design/pro-components';
import {
  ProFormDigit,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
} from '@ant-design/pro-components';
import { FormattedMessage, useIntl } from '@umijs/max';
import React, { useEffect, useState } from 'react';
import type { V1CreateHostelRoomRequest, V1Hostel, V1HostelRoom, V1RoomType } from '@gosaas/api';
import { HostelRoomServiceApi, HostelServiceApi, RoomTypeServiceApi } from '@gosaas/api';
import ReferencePage from '../../Student/components/ReferencePage';

const service = new HostelRoomServiceApi();
const hostelService = new HostelServiceApi();
const roomTypeService = new RoomTypeServiceApi();

const keyedById = <T extends { id?: string }>(items: T[] = []) =>
  items.reduce<Record<string, T>>((ret, item) => {
    if (item.id) {
      ret[item.id] = item;
    }
    return ret;
  }, {});

const TableList: React.FC = () => {
  const intl = useIntl();
  const [hostels, setHostels] = useState<Record<string, V1Hostel>>({});
  const [roomTypes, setRoomTypes] = useState<Record<string, V1RoomType>>({});

  useEffect(() => {
    Promise.all([
      hostelService.hostelServiceListHostel2({ body: { pageSize: 100, sort: ['hostel_name'] } }),
      roomTypeService.roomTypeServiceListRoomType2({
        body: { pageSize: 100, sort: ['room_type'] },
      }),
    ]).then(([hostelResp, roomTypeResp]) => {
      setHostels(keyedById(hostelResp.data.items));
      setRoomTypes(keyedById(roomTypeResp.data.items));
    });
  }, []);

  const columns: ProColumnType<V1HostelRoom>[] = [
    {
      title: <FormattedMessage id="school.hostel.roomNo" defaultMessage="Room No." />,
      dataIndex: 'roomNo',
      valueType: 'text',
    },
    {
      title: <FormattedMessage id="school.hostel.hostel" defaultMessage="Hostel" />,
      dataIndex: 'hostelId',
      valueType: 'text',
      render: (_, record) =>
        record.hostelId ? hostels[record.hostelId]?.hostelName || record.hostelId : '-',
    },
    {
      title: <FormattedMessage id="school.hostel.roomType" defaultMessage="Room Type" />,
      dataIndex: 'roomTypeId',
      valueType: 'text',
      render: (_, record) =>
        record.roomTypeId ? roomTypes[record.roomTypeId]?.roomType || record.roomTypeId : '-',
    },
    {
      title: <FormattedMessage id="school.hostel.noOfBed" defaultMessage="Beds" />,
      dataIndex: 'noOfBed',
      valueType: 'digit',
    },
    {
      title: <FormattedMessage id="school.hostel.costPerBed" defaultMessage="Cost Per Bed" />,
      dataIndex: 'costPerBed',
      valueType: 'money',
    },
  ];

  return (
    <ReferencePage<V1HostelRoom>
      columns={columns}
      create={(fields: V1CreateHostelRoomRequest) =>
        service.hostelRoomServiceCreateHostelRoom({ body: fields })
      }
      delete={(record) => service.hostelRoomServiceDeleteHostelRoom({ id: record.id! })}
      get={async (id) => (await service.hostelRoomServiceGetHostelRoom({ id })).data}
      list={async (req: any) =>
        (await service.hostelRoomServiceListHostelRoom2({ body: req })).data
      }
      title={(record) => record.roomNo}
      update={(record, fields: any) =>
        service.hostelRoomServiceUpdateHostelRoom2({
          roomId: record.id!,
          body: { room: { id: record.id!, ...fields } },
        })
      }
      formItems={
        <>
          <ProFormSelect
            name="hostelId"
            label={intl.formatMessage({ id: 'school.hostel.hostel', defaultMessage: 'Hostel' })}
            rules={[{ required: true }]}
            request={async () => {
              const resp = await hostelService.hostelServiceListHostel2({
                body: { pageSize: 100, sort: ['hostel_name'] },
              });
              return (resp.data.items || []).map((item) => ({
                label: item.hostelName || item.id,
                value: item.id,
              }));
            }}
          />
          <ProFormSelect
            name="roomTypeId"
            label={intl.formatMessage({
              id: 'school.hostel.roomType',
              defaultMessage: 'Room Type',
            })}
            rules={[{ required: true }]}
            request={async () => {
              const resp = await roomTypeService.roomTypeServiceListRoomType2({
                body: { pageSize: 100, sort: ['room_type'] },
              });
              return (resp.data.items || []).map((item) => ({
                label: item.roomType || item.id,
                value: item.id,
              }));
            }}
          />
          <ProFormText
            name="roomNo"
            label={intl.formatMessage({ id: 'school.hostel.roomNo', defaultMessage: 'Room No.' })}
            rules={[{ required: true }]}
          />
          <ProFormDigit
            name="noOfBed"
            label={intl.formatMessage({ id: 'school.hostel.noOfBed', defaultMessage: 'Beds' })}
            min={0}
            fieldProps={{ precision: 0 }}
          />
          <ProFormDigit
            name="costPerBed"
            label={intl.formatMessage({
              id: 'school.hostel.costPerBed',
              defaultMessage: 'Cost Per Bed',
            })}
            min={0}
          />
          <ProFormText
            name="title"
            label={intl.formatMessage({ id: 'school.hostel.title', defaultMessage: 'Title' })}
          />
          <ProFormTextArea
            name="description"
            label={intl.formatMessage({
              id: 'school.hostel.description',
              defaultMessage: 'Description',
            })}
          />
        </>
      }
    />
  );
};

export default TableList;
