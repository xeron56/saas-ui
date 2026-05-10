import type { ProColumnType } from '@ant-design/pro-components';
import { ProFormSwitch, ProFormText } from '@ant-design/pro-components';
import { FormattedMessage, useIntl } from '@umijs/max';
import React from 'react';
import type { V1CreateStudentCategoryRequest, V1StudentCategory } from '@gosaas/api';
import { StudentCategoryServiceApi } from '@gosaas/api';
import ReferencePage from '../components/ReferencePage';

const service = new StudentCategoryServiceApi();

const TableList: React.FC = () => {
  const intl = useIntl();

  const columns: ProColumnType<V1StudentCategory>[] = [
    {
      title: <FormattedMessage id="school.student.name" defaultMessage="Name" />,
      dataIndex: 'name',
      valueType: 'text',
    },
    {
      title: <FormattedMessage id="school.student.category.isActive" defaultMessage="Active" />,
      dataIndex: 'isActive',
      valueType: 'switch',
    },
  ];

  return (
    <ReferencePage<V1StudentCategory>
      columns={columns}
      create={(fields: V1CreateStudentCategoryRequest) =>
        service.studentCategoryServiceCreateStudentCategory({ body: fields })
      }
      delete={(record) => service.studentCategoryServiceDeleteStudentCategory({ id: record.id! })}
      get={async (id) => (await service.studentCategoryServiceGetStudentCategory({ id })).data}
      list={async (req: any) =>
        (await service.studentCategoryServiceListStudentCategory2({ body: req })).data
      }
      title={(record) => record.name}
      update={(record, fields: any) =>
        service.studentCategoryServiceUpdateStudentCategory2({
          categoryId: record.id!,
          body: { category: { id: record.id!, ...fields } },
        })
      }
      formItems={
        <>
          <ProFormText
            name="name"
            label={intl.formatMessage({ id: 'school.student.name', defaultMessage: 'Name' })}
            rules={[{ required: true }]}
          />
          <ProFormSwitch
            name="isActive"
            label={intl.formatMessage({
              id: 'school.student.category.isActive',
              defaultMessage: 'Active',
            })}
          />
        </>
      }
    />
  );
};

export default TableList;
