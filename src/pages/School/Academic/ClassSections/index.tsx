import { PlusOutlined } from '@ant-design/icons';
import type { ActionType, ProColumnType } from '@ant-design/pro-components';
import {
  PageContainer,
  ProDescriptions,
  ProTable,
  TableDropdown,
} from '@ant-design/pro-components';
import { FormattedMessage, useIntl } from '@umijs/max';
import { Button, Drawer, message } from 'antd';
import React, { useRef, useState } from 'react';
import type {
  ClassSectionServiceUpdateClassSectionRequest,
  V1ClassSection,
  V1ClassSectionFilter,
  V1CreateClassSectionRequest,
} from '@gosaas/api';
import { ClassSectionServiceApi } from '@gosaas/api';
import { requestTransform } from '@gosaas/core';
import UpdateForm from './components/UpdateForm';

const service = new ClassSectionServiceApi();

const TableList: React.FC = () => {
  const [updateModalVisible, handleUpdateModalVisible] = useState<boolean>(false);
  const [showDetail, setShowDetail] = useState<boolean>(false);
  const actionRef = useRef<ActionType>();
  const [currentRow, setCurrentRow] = useState<V1ClassSection | undefined | null>(undefined);
  const intl = useIntl();

  const handleAdd = async (fields: V1CreateClassSectionRequest) => {
    const hide = message.loading(
      intl.formatMessage({ id: 'common.creating', defaultMessage: 'Creating...' }),
    );
    try {
      await service.classSectionServiceCreateClassSection({ body: fields });
      hide();
      message.success(
        intl.formatMessage({ id: 'common.created', defaultMessage: 'Created Successfully' }),
      );
      return true;
    } catch (error) {
      hide();
      return false;
    }
  };

  const handleUpdate = async (fields: ClassSectionServiceUpdateClassSectionRequest) => {
    const hide = message.loading(
      intl.formatMessage({ id: 'common.updating', defaultMessage: 'Updating...' }),
    );
    try {
      await service.classSectionServiceUpdateClassSection2({
        body: fields,
        classSectionId: currentRow!.id!,
      });
      hide();
      message.success(
        intl.formatMessage({ id: 'common.updated', defaultMessage: 'Update Successfully' }),
      );
      return true;
    } catch (error) {
      hide();
      return false;
    }
  };

  const handleRemove = async (selectedRow: V1ClassSection) => {
    const hide = message.loading(
      intl.formatMessage({ id: 'common.deleting', defaultMessage: 'Deleting...' }),
    );
    try {
      await service.classSectionServiceDeleteClassSection({ id: selectedRow.id! });
      hide();
      message.success(
        intl.formatMessage({ id: 'common.deleted', defaultMessage: 'Delete Successfully' }),
      );
      return true;
    } catch (error) {
      hide();
      return false;
    }
  };

  const columns: ProColumnType<V1ClassSection>[] = [
    {
      title: <FormattedMessage id="school.academic.code" defaultMessage="Code" />,
      dataIndex: 'code',
      valueType: 'text',
      render: (dom, entity) => (
        <a
          onClick={() => {
            setCurrentRow(entity);
            setShowDetail(true);
          }}
        >
          {dom || entity.id}
        </a>
      ),
    },
    {
      title: (
        <FormattedMessage
          id="school.academic.classSection.academicSession"
          defaultMessage="Academic Session"
        />
      ),
      dataIndex: 'academicSessionId',
      valueType: 'text',
      ellipsis: true,
    },
    {
      title: <FormattedMessage id="school.academic.classSection.class" defaultMessage="Class" />,
      dataIndex: 'classId',
      valueType: 'text',
      ellipsis: true,
    },
    {
      title: (
        <FormattedMessage id="school.academic.classSection.section" defaultMessage="Section" />
      ),
      dataIndex: 'sectionId',
      valueType: 'text',
      ellipsis: true,
    },
    {
      title: (
        <FormattedMessage id="school.academic.classSection.capacity" defaultMessage="Capacity" />
      ),
      dataIndex: 'capacity',
      valueType: 'digit',
    },
    {
      title: <FormattedMessage id="common.createdAt" defaultMessage="CreatedAt" />,
      dataIndex: 'createdAt',
      valueType: 'dateTime',
    },
    {
      title: <FormattedMessage id="common.updatedAt" defaultMessage="UpdatedAt" />,
      dataIndex: 'updatedAt',
      valueType: 'dateTime',
    },
    {
      title: <FormattedMessage id="common.operate" defaultMessage="Operate" />,
      key: 'option',
      valueType: 'option',
      render: (_, record) => [
        <a
          key="editable"
          onClick={() => {
            setCurrentRow(record);
            setShowDetail(false);
            handleUpdateModalVisible(true);
          }}
        >
          <FormattedMessage id="common.edit" defaultMessage="Edit" />
        </a>,
        <TableDropdown
          key="actionGroup"
          onSelect={async (key) => {
            if (key === 'delete') {
              const ok = await handleRemove(record);
              if (ok && actionRef.current) {
                actionRef.current.reload();
              }
            }
          }}
          menus={[
            {
              key: 'delete',
              name: <FormattedMessage id="common.delete" defaultMessage="Delete" />,
            },
          ]}
        />,
      ],
    },
  ];

  const getData = requestTransform<V1ClassSection, V1ClassSectionFilter>(async (req) => {
    const resp = await service.classSectionServiceListClassSection2({ body: req });
    return resp.data;
  });

  return (
    <PageContainer>
      <ProTable<V1ClassSection>
        actionRef={actionRef}
        rowKey="id"
        search={false}
        pagination={{ defaultPageSize: 10 }}
        toolBarRender={() => [
          <Button
            type="primary"
            key="primary"
            onClick={() => {
              setCurrentRow(undefined);
              handleUpdateModalVisible(true);
            }}
          >
            <PlusOutlined /> <FormattedMessage id="pages.searchTable.new" defaultMessage="New" />
          </Button>,
        ]}
        type="table"
        request={getData}
        columns={columns}
      />
      <Drawer
        width={800}
        open={showDetail}
        onClose={() => {
          setCurrentRow(undefined);
          setShowDetail(false);
        }}
        closable={false}
        destroyOnClose
      >
        {currentRow?.id && (
          <ProDescriptions<V1ClassSection>
            column={1}
            title={currentRow?.code || currentRow?.id}
            request={async () => {
              const resp = await service.classSectionServiceGetClassSection({ id: currentRow.id! });
              return { data: resp.data };
            }}
            params={{ id: currentRow?.id }}
            columns={columns}
          />
        )}
      </Drawer>
      <UpdateForm
        onSubmit={async (value) => {
          const success = currentRow
            ? await handleUpdate({ classSection: value })
            : await handleAdd(value);
          if (success) {
            handleUpdateModalVisible(false);
            setCurrentRow(undefined);
            actionRef.current?.reload();
          }
        }}
        onCancel={() => {
          handleUpdateModalVisible(false);
          if (!showDetail) {
            setCurrentRow(undefined);
          }
        }}
        updateModalVisible={updateModalVisible}
        values={(currentRow as any) || {}}
      />
    </PageContainer>
  );
};

export default TableList;
