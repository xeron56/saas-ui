import { PlusOutlined } from '@ant-design/icons';
import type { ActionType, ProColumnType, ProFormInstance } from '@ant-design/pro-components';
import {
  DrawerForm,
  PageContainer,
  ProDescriptions,
  ProTable,
  TableDropdown,
} from '@ant-design/pro-components';
import { FormattedMessage, useIntl } from '@umijs/max';
import { Button, Drawer, message } from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import { requestTransform } from '@gosaas/core';

type ReferenceRecord = {
  id?: string;
  createdAt?: string | null;
  updatedAt?: string | null;
  [key: string]: any;
};

export type ReferencePageProps<T extends ReferenceRecord> = {
  columns: ProColumnType<T>[];
  create: (fields: any) => Promise<unknown>;
  delete: (record: T) => Promise<unknown>;
  extraActions?: (record: T, action?: ActionType) => React.ReactNode[];
  formItems: React.ReactNode;
  get: (id: string) => Promise<T>;
  list: (req: any) => Promise<{ totalSize?: number; filterSize?: number; items?: T[] }>;
  title: (record: T) => React.ReactNode;
  update: (record: T, fields: any) => Promise<unknown>;
};

const ReferencePage = <T extends ReferenceRecord>(props: ReferencePageProps<T>) => {
  const [updateModalVisible, handleUpdateModalVisible] = useState<boolean>(false);
  const [showDetail, setShowDetail] = useState<boolean>(false);
  const actionRef = useRef<ActionType>();
  const formRef = useRef<ProFormInstance>();
  const [currentRow, setCurrentRow] = useState<T | undefined | null>(undefined);
  const intl = useIntl();

  useEffect(() => {
    if (currentRow?.id && updateModalVisible) {
      props.get(currentRow.id).then((data) => {
        formRef?.current?.setFieldsValue(data);
      });
    }
  }, [currentRow, props, updateModalVisible]);

  const handleAdd = async (fields: any) => {
    const hide = message.loading(
      intl.formatMessage({ id: 'common.creating', defaultMessage: 'Creating...' }),
    );
    try {
      await props.create(fields);
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

  const handleUpdate = async (fields: any) => {
    const hide = message.loading(
      intl.formatMessage({ id: 'common.updating', defaultMessage: 'Updating...' }),
    );
    try {
      await props.update(currentRow!, fields);
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

  const handleRemove = async (selectedRow: T) => {
    const hide = message.loading(
      intl.formatMessage({ id: 'common.deleting', defaultMessage: 'Deleting...' }),
    );
    try {
      await props.delete(selectedRow);
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

  const detailColumns = props.columns.map((column, index) => {
    if (index !== 0) {
      return column;
    }
    return {
      ...column,
      render: (dom: React.ReactNode, record: T) => (
        <a
          onClick={() => {
            setCurrentRow(record);
            setShowDetail(true);
          }}
        >
          {dom}
        </a>
      ),
    };
  });

  const columns: ProColumnType<T>[] = [
    ...detailColumns,
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
        ...(props.extraActions?.(record, actionRef.current) || []),
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

  const getData = requestTransform<T, any>(async (req) => props.list(req));

  return (
    <PageContainer>
      <ProTable<T>
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
          <ProDescriptions<T>
            column={1}
            title={props.title(currentRow)}
            request={async () => ({ data: await props.get(currentRow.id!) })}
            params={{ id: currentRow?.id }}
            columns={columns}
          />
        )}
      </Drawer>
      <DrawerForm
        formRef={formRef}
        initialValues={currentRow || {}}
        open={updateModalVisible}
        onFinish={async (formData) => {
          const success = currentRow ? await handleUpdate(formData) : await handleAdd(formData);
          if (success) {
            handleUpdateModalVisible(false);
            setCurrentRow(undefined);
            actionRef.current?.reload();
          }
        }}
        drawerProps={{
          onClose: () => {
            handleUpdateModalVisible(false);
            if (!showDetail) {
              setCurrentRow(undefined);
            }
          },
          destroyOnClose: true,
        }}
      >
        {props.formItems}
      </DrawerForm>
    </PageContainer>
  );
};

export default ReferencePage;
