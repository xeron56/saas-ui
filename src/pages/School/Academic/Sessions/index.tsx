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
  AcademicSessionServiceUpdateAcademicSessionRequest,
  V1AcademicSession,
  V1AcademicSessionFilter,
  V1CreateAcademicSessionRequest,
} from '@gosaas/api';
import { AcademicSessionServiceApi } from '@gosaas/api';
import { requestTransform } from '@gosaas/core';
import UpdateForm from './components/UpdateForm';

const service = new AcademicSessionServiceApi();

const TableList: React.FC = () => {
  const [updateModalVisible, handleUpdateModalVisible] = useState<boolean>(false);
  const [showDetail, setShowDetail] = useState<boolean>(false);
  const actionRef = useRef<ActionType>();
  const [currentRow, setCurrentRow] = useState<V1AcademicSession | undefined | null>(undefined);
  const intl = useIntl();

  const handleAdd = async (fields: V1CreateAcademicSessionRequest) => {
    const hide = message.loading(
      intl.formatMessage({ id: 'common.creating', defaultMessage: 'Creating...' }),
    );
    try {
      await service.academicSessionServiceCreateAcademicSession({ body: fields });
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

  const handleUpdate = async (fields: AcademicSessionServiceUpdateAcademicSessionRequest) => {
    const hide = message.loading(
      intl.formatMessage({ id: 'common.updating', defaultMessage: 'Updating...' }),
    );
    try {
      await service.academicSessionServiceUpdateAcademicSession2({
        body: fields,
        sessionId: currentRow!.id!,
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

  const handleRemove = async (selectedRow: V1AcademicSession) => {
    const hide = message.loading(
      intl.formatMessage({ id: 'common.deleting', defaultMessage: 'Deleting...' }),
    );
    try {
      await service.academicSessionServiceDeleteAcademicSession({ id: selectedRow.id! });
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

  const columns: ProColumnType<V1AcademicSession>[] = [
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
          {dom}
        </a>
      ),
    },
    {
      title: <FormattedMessage id="school.academic.name" defaultMessage="Name" />,
      dataIndex: 'name',
      valueType: 'text',
    },
    {
      title: <FormattedMessage id="school.academic.session.startsAt" defaultMessage="Starts At" />,
      dataIndex: 'startsAt',
      valueType: 'dateTime',
    },
    {
      title: <FormattedMessage id="school.academic.session.endsAt" defaultMessage="Ends At" />,
      dataIndex: 'endsAt',
      valueType: 'dateTime',
    },
    {
      title: <FormattedMessage id="school.academic.session.isActive" defaultMessage="Active" />,
      dataIndex: 'isActive',
      valueType: 'switch',
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

  const getData = requestTransform<V1AcademicSession, V1AcademicSessionFilter>(async (req) => {
    const resp = await service.academicSessionServiceListAcademicSession2({ body: req });
    return resp.data;
  });

  return (
    <PageContainer>
      <ProTable<V1AcademicSession>
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
          <ProDescriptions<V1AcademicSession>
            column={1}
            title={currentRow?.code}
            request={async () => {
              const resp = await service.academicSessionServiceGetAcademicSession({
                id: currentRow.id!,
              });
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
            ? await handleUpdate({ session: value })
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
