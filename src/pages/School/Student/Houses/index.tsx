import type { ProColumnType } from '@ant-design/pro-components';
import { ProFormText, ProFormTextArea } from '@ant-design/pro-components';
import { FormattedMessage, useIntl } from '@umijs/max';
import React from 'react';
import type { V1CreateStudentHouseRequest, V1StudentHouse } from '@gosaas/api';
import { StudentHouseServiceApi } from '@gosaas/api';
import ReferencePage from '../components/ReferencePage';

const service = new StudentHouseServiceApi();

const TableList: React.FC = () => {
  const intl = useIntl();

  const columns: ProColumnType<V1StudentHouse>[] = [
    {
      title: <FormattedMessage id="school.student.name" defaultMessage="Name" />,
      dataIndex: 'name',
      valueType: 'text',
    },
    {
      title: (
        <FormattedMessage id="school.student.house.description" defaultMessage="Description" />
      ),
      dataIndex: 'description',
      valueType: 'text',
    },
  ];

  return (
    <ReferencePage<V1StudentHouse>
      columns={columns}
      create={(fields: V1CreateStudentHouseRequest) =>
        service.studentHouseServiceCreateStudentHouse({ body: fields })
      }
      delete={(record) => service.studentHouseServiceDeleteStudentHouse({ id: record.id! })}
      get={async (id) => (await service.studentHouseServiceGetStudentHouse({ id })).data}
      list={async (req: any) =>
        (await service.studentHouseServiceListStudentHouse2({ body: req })).data
      }
      title={(record) => record.name}
      update={(record, fields: any) =>
        service.studentHouseServiceUpdateStudentHouse2({
          houseId: record.id!,
          body: { house: { id: record.id!, ...fields } },
        })
      }
      formItems={
        <>
          <ProFormText
            name="name"
            label={intl.formatMessage({ id: 'school.student.name', defaultMessage: 'Name' })}
            rules={[{ required: true }]}
          />
          <ProFormTextArea
            name="description"
            label={intl.formatMessage({
              id: 'school.student.house.description',
              defaultMessage: 'Description',
            })}
          />
        </>
      }
    />
  );
};

export default TableList;
