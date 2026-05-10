import type { ProColumnType } from '@ant-design/pro-components';
import { ProFormText, ProFormTextArea } from '@ant-design/pro-components';
import { FormattedMessage, useIntl } from '@umijs/max';
import React from 'react';
import type { V1CreateRoomTypeRequest, V1RoomType } from '@gosaas/api';
import { RoomTypeServiceApi } from '@gosaas/api';
import ReferencePage from '../../Student/components/ReferencePage';

const service = new RoomTypeServiceApi();

const TableList: React.FC = () => {
  const intl = useIntl();

  const columns: ProColumnType<V1RoomType>[] = [
    {
      title: <FormattedMessage id="school.hostel.roomType" defaultMessage="Room Type" />,
      dataIndex: 'roomType',
      valueType: 'text',
    },
    {
      title: <FormattedMessage id="school.hostel.description" defaultMessage="Description" />,
      dataIndex: 'description',
      valueType: 'text',
    },
  ];

  return (
    <ReferencePage<V1RoomType>
      columns={columns}
      create={(fields: V1CreateRoomTypeRequest) =>
        service.roomTypeServiceCreateRoomType({ body: fields })
      }
      delete={(record) => service.roomTypeServiceDeleteRoomType({ id: record.id! })}
      get={async (id) => (await service.roomTypeServiceGetRoomType({ id })).data}
      list={async (req: any) => (await service.roomTypeServiceListRoomType2({ body: req })).data}
      title={(record) => record.roomType}
      update={(record, fields: any) =>
        service.roomTypeServiceUpdateRoomType2({
          roomTypeId: record.id!,
          body: { roomType: { id: record.id!, ...fields } },
        })
      }
      formItems={
        <>
          <ProFormText
            name="roomType"
            label={intl.formatMessage({
              id: 'school.hostel.roomType',
              defaultMessage: 'Room Type',
            })}
            rules={[{ required: true }]}
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
