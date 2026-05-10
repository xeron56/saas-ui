import { PlusOutlined } from '@ant-design/icons';
import type { ActionType, ProColumnType } from '@ant-design/pro-components';
import {
  ModalForm,
  PageContainer,
  ProDescriptions,
  ProForm,
  ProFormSelect,
  ProFormSwitch,
  ProFormText,
  ProFormTextArea,
  ProTable,
  TableDropdown,
} from '@ant-design/pro-components';
import { FormattedMessage, useIntl } from '@umijs/max';
import { Button, Drawer, message } from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import type {
  StudentServiceUpdateStudentRequest,
  V1ClassSection,
  V1CreateStudentUserLinkRequest,
  V1CreateStudentRequest,
  V1DisableReason,
  V1DisableStudentRequest,
  V1HostelRoom,
  V1PickupPoint,
  V1RoutePickupPoint,
  V1Student,
  V1StudentUserLink,
  V1StudentCategory,
  V1StudentFilter,
  V1StudentHouse,
  V1TransportRoute,
  V1Vehicle,
  V1VehicleRoute,
} from '@gosaas/api';
import {
  ClassSectionServiceApi,
  DisableReasonServiceApi,
  HostelRoomServiceApi,
  PickupPointServiceApi,
  RoutePickupPointServiceApi,
  StudentCategoryServiceApi,
  StudentHouseServiceApi,
  StudentServiceApi,
  StudentUserLinkServiceApi,
  TransportRouteServiceApi,
  VehicleRouteServiceApi,
  VehicleServiceApi,
} from '@gosaas/api';
import { requestTransform } from '@gosaas/core';
import Userselect from '@/components/Userselect/Userselect';
import type { UserselectValue } from '@/components/Userselect/Userselect';
import UpdateForm from './components/UpdateForm';

const service = new StudentServiceApi();
const studentUserLinkService = new StudentUserLinkServiceApi();
const classSectionService = new ClassSectionServiceApi();
const categoryService = new StudentCategoryServiceApi();
const houseService = new StudentHouseServiceApi();
const disableReasonService = new DisableReasonServiceApi();
const routePickupPointService = new RoutePickupPointServiceApi();
const transportRouteService = new TransportRouteServiceApi();
const pickupPointService = new PickupPointServiceApi();
const vehicleRouteService = new VehicleRouteServiceApi();
const vehicleService = new VehicleServiceApi();
const hostelRoomService = new HostelRoomServiceApi();

const keyedById = <T extends { id?: string }>(items: T[] = []) =>
  items.reduce<Record<string, T>>((ret, item) => {
    if (item.id) {
      ret[item.id] = item;
    }
    return ret;
  }, {});

const normalizeForCreate = (fields: V1CreateStudentRequest) => ({
  ...fields,
  categoryId: fields.categoryId || undefined,
  houseId: fields.houseId || undefined,
  siblingStudentId: fields.siblingStudentId || undefined,
  routePickupPointId: fields.routePickupPointId || undefined,
  vehicleRouteId: fields.vehicleRouteId || undefined,
  hostelRoomId: fields.hostelRoomId || undefined,
});

const normalizeForUpdate = (fields: V1Student) => ({
  ...fields,
  categoryId: fields.categoryId || undefined,
  houseId: fields.houseId || undefined,
  siblingStudentId: fields.siblingStudentId || undefined,
  routePickupPointId: fields.routePickupPointId || undefined,
  vehicleRouteId: fields.vehicleRouteId || undefined,
  hostelRoomId: fields.hostelRoomId || undefined,
});

type StudentUserLinkForm = Omit<V1CreateStudentUserLinkRequest, 'studentId' | 'userId'> & {
  user?: UserselectValue;
};

const TableList: React.FC = () => {
  const [updateModalVisible, handleUpdateModalVisible] = useState<boolean>(false);
  const [showDetail, setShowDetail] = useState<boolean>(false);
  const actionRef = useRef<ActionType>();
  const linkActionRef = useRef<ActionType>();
  const [currentRow, setCurrentRow] = useState<V1Student | undefined | null>(undefined);
  const [disableRow, setDisableRow] = useState<V1Student | undefined | null>(undefined);
  const [disableModalVisible, handleDisableModalVisible] = useState<boolean>(false);
  const [linkRow, setLinkRow] = useState<V1Student | undefined | null>(undefined);
  const [linkModalVisible, handleLinkModalVisible] = useState<boolean>(false);
  const [classSections, setClassSections] = useState<Record<string, V1ClassSection>>({});
  const [categories, setCategories] = useState<Record<string, V1StudentCategory>>({});
  const [houses, setHouses] = useState<Record<string, V1StudentHouse>>({});
  const [disableReasons, setDisableReasons] = useState<Record<string, V1DisableReason>>({});
  const [routePickupPoints, setRoutePickupPoints] = useState<Record<string, V1RoutePickupPoint>>(
    {},
  );
  const [transportRoutes, setTransportRoutes] = useState<Record<string, V1TransportRoute>>({});
  const [pickupPoints, setPickupPoints] = useState<Record<string, V1PickupPoint>>({});
  const [vehicleRoutes, setVehicleRoutes] = useState<Record<string, V1VehicleRoute>>({});
  const [vehicles, setVehicles] = useState<Record<string, V1Vehicle>>({});
  const [hostelRooms, setHostelRooms] = useState<Record<string, V1HostelRoom>>({});
  const intl = useIntl();

  useEffect(() => {
    Promise.all([
      classSectionService.classSectionServiceListClassSection2({
        body: { pageSize: 100, sort: ['code'] },
      }),
      categoryService.studentCategoryServiceListStudentCategory2({
        body: { pageSize: 100, sort: ['name'] },
      }),
      houseService.studentHouseServiceListStudentHouse2({
        body: { pageSize: 100, sort: ['name'] },
      }),
      disableReasonService.disableReasonServiceListDisableReason2({
        body: { pageSize: 100, sort: ['reason'] },
      }),
      routePickupPointService.routePickupPointServiceListRoutePickupPoint2({
        body: { pageSize: 100, sort: ['order_number'] },
      }),
      transportRouteService.transportRouteServiceListTransportRoute2({
        body: { pageSize: 100, sort: ['route_title'] },
      }),
      pickupPointService.pickupPointServiceListPickupPoint2({
        body: { pageSize: 100, sort: ['name'] },
      }),
      vehicleRouteService.vehicleRouteServiceListVehicleRoute2({
        body: { pageSize: 100, sort: ['created_at'] },
      }),
      vehicleService.vehicleServiceListVehicle2({
        body: { pageSize: 100, sort: ['vehicle_no'] },
      }),
      hostelRoomService.hostelRoomServiceListHostelRoom2({
        body: { pageSize: 100, sort: ['room_no'] },
      }),
    ]).then(
      ([
        classSectionResp,
        categoryResp,
        houseResp,
        disableReasonResp,
        routePickupPointResp,
        transportRouteResp,
        pickupPointResp,
        vehicleRouteResp,
        vehicleResp,
        hostelRoomResp,
      ]) => {
        setClassSections(keyedById(classSectionResp.data.items));
        setCategories(keyedById(categoryResp.data.items));
        setHouses(keyedById(houseResp.data.items));
        setDisableReasons(keyedById(disableReasonResp.data.items));
        setRoutePickupPoints(keyedById(routePickupPointResp.data.items));
        setTransportRoutes(keyedById(transportRouteResp.data.items));
        setPickupPoints(keyedById(pickupPointResp.data.items));
        setVehicleRoutes(keyedById(vehicleRouteResp.data.items));
        setVehicles(keyedById(vehicleResp.data.items));
        setHostelRooms(keyedById(hostelRoomResp.data.items));
      },
    );
  }, []);

  const handleAdd = async (fields: V1CreateStudentRequest) => {
    const hide = message.loading(
      intl.formatMessage({ id: 'common.creating', defaultMessage: 'Creating...' }),
    );
    try {
      await service.studentServiceCreateStudent({ body: normalizeForCreate(fields) });
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

  const handleUpdate = async (fields: StudentServiceUpdateStudentRequest) => {
    const hide = message.loading(
      intl.formatMessage({ id: 'common.updating', defaultMessage: 'Updating...' }),
    );
    try {
      await service.studentServiceUpdateStudent2({
        body: fields,
        studentId: currentRow!.id!,
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

  const handleRemove = async (selectedRow: V1Student) => {
    const hide = message.loading(
      intl.formatMessage({ id: 'common.deleting', defaultMessage: 'Deleting...' }),
    );
    try {
      await service.studentServiceDeleteStudent({ id: selectedRow.id! });
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

  const handleDisable = async (selectedRow: V1Student, fields: V1DisableStudentRequest) => {
    const hide = message.loading(
      intl.formatMessage({ id: 'school.student.disabling', defaultMessage: 'Disabling...' }),
    );
    try {
      await service.studentServiceDisableStudent({
        id: selectedRow.id!,
        body: { ...fields, id: selectedRow.id! },
      });
      hide();
      message.success(
        intl.formatMessage({ id: 'school.student.disabled', defaultMessage: 'Student Disabled' }),
      );
      return true;
    } catch (error) {
      hide();
      return false;
    }
  };

  const handleReactivate = async (selectedRow: V1Student) => {
    const hide = message.loading(
      intl.formatMessage({ id: 'school.student.reactivating', defaultMessage: 'Reactivating...' }),
    );
    try {
      await service.studentServiceReactivateStudent({
        id: selectedRow.id!,
        body: { id: selectedRow.id! },
      });
      hide();
      message.success(
        intl.formatMessage({
          id: 'school.student.reactivated',
          defaultMessage: 'Student Reactivated',
        }),
      );
      return true;
    } catch (error) {
      hide();
      return false;
    }
  };

  const handleRemoveLink = async (selectedRow: V1StudentUserLink) => {
    const hide = message.loading(
      intl.formatMessage({ id: 'common.deleting', defaultMessage: 'Deleting...' }),
    );
    try {
      await studentUserLinkService.studentUserLinkServiceDeleteStudentUserLink({
        id: selectedRow.id!,
      });
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

  const renderRoutePickupPoint = (id?: string) => {
    if (!id) {
      return '-';
    }
    const point = routePickupPoints[id];
    if (!point) {
      return id;
    }
    return (
      [
        transportRoutes[point.transportRouteId || '']?.routeTitle || point.transportRouteId,
        pickupPoints[point.pickupPointId || '']?.name || point.pickupPointId,
        point.pickupTime,
      ]
        .filter(Boolean)
        .join(' - ') || id
    );
  };

  const renderHostelRoom = (id?: string) => {
    if (!id) {
      return '-';
    }
    const room = hostelRooms[id];
    return room ? [room.roomNo, room.title].filter(Boolean).join(' - ') || id : id;
  };

  const renderVehicleRoute = (id?: string) => {
    if (!id) {
      return '-';
    }
    const vehicleRoute = vehicleRoutes[id];
    if (!vehicleRoute) {
      return id;
    }
    return (
      [
        transportRoutes[vehicleRoute.transportRouteId || '']?.routeTitle ||
          vehicleRoute.transportRouteId,
        vehicles[vehicleRoute.vehicleId || '']?.vehicleNo || vehicleRoute.vehicleId,
      ]
        .filter(Boolean)
        .join(' - ') || id
    );
  };

  const columns: ProColumnType<V1Student>[] = [
    {
      title: <FormattedMessage id="school.student.admissionNo" defaultMessage="Admission No." />,
      dataIndex: 'admissionNo',
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
      title: <FormattedMessage id="school.student.rollNo" defaultMessage="Roll No." />,
      dataIndex: ['enrollment', 'rollNo'],
      valueType: 'text',
    },
    {
      title: <FormattedMessage id="school.student.firstName" defaultMessage="First Name" />,
      dataIndex: 'firstName',
      valueType: 'text',
    },
    {
      title: <FormattedMessage id="school.student.lastName" defaultMessage="Last Name" />,
      dataIndex: 'lastName',
      valueType: 'text',
    },
    {
      title: <FormattedMessage id="school.student.gender" defaultMessage="Gender" />,
      dataIndex: 'gender',
      valueType: 'text',
    },
    {
      title: <FormattedMessage id="school.student.classSection" defaultMessage="Class Section" />,
      dataIndex: ['enrollment', 'classSectionId'],
      valueType: 'text',
      ellipsis: true,
      render: (_, entity) => {
        const id = entity.enrollment?.classSectionId;
        return id ? classSections[id]?.code || id : '-';
      },
    },
    {
      title: <FormattedMessage id="school.student.category" defaultMessage="Category" />,
      dataIndex: 'categoryId',
      valueType: 'text',
      ellipsis: true,
      render: (_, entity) =>
        entity.categoryId ? categories[entity.categoryId]?.name || entity.categoryId : '-',
    },
    {
      title: <FormattedMessage id="school.student.house" defaultMessage="House" />,
      dataIndex: 'houseId',
      valueType: 'text',
      ellipsis: true,
      render: (_, entity) =>
        entity.houseId ? houses[entity.houseId]?.name || entity.houseId : '-',
    },
    {
      title: (
        <FormattedMessage
          id="school.student.routePickupPoint"
          defaultMessage="Route Pickup Point"
        />
      ),
      dataIndex: ['enrollment', 'routePickupPointId'],
      valueType: 'text',
      ellipsis: true,
      render: (_, entity) => renderRoutePickupPoint(entity.enrollment?.routePickupPointId),
    },
    {
      title: <FormattedMessage id="school.student.vehicleRoute" defaultMessage="Vehicle Route" />,
      dataIndex: ['enrollment', 'vehicleRouteId'],
      valueType: 'text',
      ellipsis: true,
      render: (_, entity) => renderVehicleRoute(entity.enrollment?.vehicleRouteId),
    },
    {
      title: <FormattedMessage id="school.student.hostelRoom" defaultMessage="Hostel Room" />,
      dataIndex: ['enrollment', 'hostelRoomId'],
      valueType: 'text',
      ellipsis: true,
      render: (_, entity) => renderHostelRoom(entity.enrollment?.hostelRoomId),
    },
    {
      title: <FormattedMessage id="school.student.isActive" defaultMessage="Active" />,
      dataIndex: 'isActive',
      valueType: 'switch',
    },
    {
      title: <FormattedMessage id="school.student.disableReason" defaultMessage="Disable Reason" />,
      dataIndex: 'disableReasonId',
      valueType: 'text',
      ellipsis: true,
      hideInTable: true,
      render: (_, entity) =>
        entity.disableReasonId
          ? disableReasons[entity.disableReasonId]?.reason || entity.disableReasonId
          : '-',
    },
    {
      title: <FormattedMessage id="school.student.disableNote" defaultMessage="Disable Note" />,
      dataIndex: 'disableNote',
      valueType: 'text',
      hideInTable: true,
    },
    {
      title: <FormattedMessage id="school.student.familyId" defaultMessage="Family ID" />,
      dataIndex: 'familyId',
      valueType: 'text',
      hideInTable: true,
    },
    {
      title: <FormattedMessage id="school.student.guardianName" defaultMessage="Guardian Name" />,
      dataIndex: 'guardianName',
      valueType: 'text',
      hideInTable: true,
    },
    {
      title: <FormattedMessage id="school.student.guardianIs" defaultMessage="Guardian Is" />,
      dataIndex: 'guardianIs',
      valueType: 'text',
      hideInTable: true,
    },
    {
      title: (
        <FormattedMessage id="school.student.guardianRelation" defaultMessage="Guardian Relation" />
      ),
      dataIndex: 'guardianRelation',
      valueType: 'text',
      hideInTable: true,
    },
    {
      title: <FormattedMessage id="school.student.guardianPhone" defaultMessage="Guardian Phone" />,
      dataIndex: 'guardianPhone',
      valueType: 'text',
      hideInTable: true,
    },
    {
      title: <FormattedMessage id="school.student.guardianEmail" defaultMessage="Guardian Email" />,
      dataIndex: 'guardianEmail',
      valueType: 'text',
      hideInTable: true,
    },
    {
      title: (
        <FormattedMessage
          id="school.student.guardianOccupation"
          defaultMessage="Guardian Occupation"
        />
      ),
      dataIndex: 'guardianOccupation',
      valueType: 'text',
      hideInTable: true,
    },
    {
      title: (
        <FormattedMessage id="school.student.guardianAddress" defaultMessage="Guardian Address" />
      ),
      dataIndex: 'guardianAddress',
      valueType: 'text',
      hideInTable: true,
    },
    {
      title: <FormattedMessage id="school.student.fatherName" defaultMessage="Father Name" />,
      dataIndex: 'fatherName',
      valueType: 'text',
      hideInTable: true,
    },
    {
      title: <FormattedMessage id="school.student.fatherPhone" defaultMessage="Father Phone" />,
      dataIndex: 'fatherPhone',
      valueType: 'text',
      hideInTable: true,
    },
    {
      title: (
        <FormattedMessage id="school.student.fatherOccupation" defaultMessage="Father Occupation" />
      ),
      dataIndex: 'fatherOccupation',
      valueType: 'text',
      hideInTable: true,
    },
    {
      title: <FormattedMessage id="school.student.motherName" defaultMessage="Mother Name" />,
      dataIndex: 'motherName',
      valueType: 'text',
      hideInTable: true,
    },
    {
      title: <FormattedMessage id="school.student.motherPhone" defaultMessage="Mother Phone" />,
      dataIndex: 'motherPhone',
      valueType: 'text',
      hideInTable: true,
    },
    {
      title: (
        <FormattedMessage id="school.student.motherOccupation" defaultMessage="Mother Occupation" />
      ),
      dataIndex: 'motherOccupation',
      valueType: 'text',
      hideInTable: true,
    },
    {
      title: <FormattedMessage id="school.student.disabledAt" defaultMessage="Disabled At" />,
      dataIndex: 'disabledAt',
      valueType: 'dateTime',
      hideInTable: true,
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
            } else if (key === 'disable') {
              setDisableRow(record);
              handleDisableModalVisible(true);
            } else if (key === 'reactivate') {
              const ok = await handleReactivate(record);
              if (ok && actionRef.current) {
                actionRef.current.reload();
              }
            } else if (key === 'linkUser') {
              setLinkRow(record);
              handleLinkModalVisible(true);
            }
          }}
          menus={[
            {
              key: 'linkUser',
              name: (
                <FormattedMessage id="school.student.manageLogin" defaultMessage="Manage Login" />
              ),
            },
            record.isActive
              ? {
                  key: 'disable',
                  name: <FormattedMessage id="school.student.disable" defaultMessage="Disable" />,
                }
              : {
                  key: 'reactivate',
                  name: (
                    <FormattedMessage id="school.student.reactivate" defaultMessage="Reactivate" />
                  ),
                },
            {
              key: 'delete',
              name: <FormattedMessage id="common.delete" defaultMessage="Delete" />,
            },
          ]}
        />,
      ],
    },
  ];

  const getData = requestTransform<V1Student, V1StudentFilter>(async (req) => {
    const resp = await service.studentServiceListStudent2({ body: req });
    return resp.data;
  });

  return (
    <PageContainer>
      <ProTable<V1Student>
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
          <ProDescriptions<V1Student>
            column={1}
            title={currentRow?.admissionNo || currentRow?.id}
            request={async () => {
              const resp = await service.studentServiceGetStudent({ id: currentRow.id! });
              return { data: resp.data };
            }}
            params={{ id: currentRow?.id }}
            columns={columns}
          />
        )}
        {currentRow?.id && (
          <ProTable<V1Student>
            rowKey="id"
            search={false}
            pagination={false}
            toolBarRender={false}
            options={false}
            headerTitle={intl.formatMessage({
              id: 'school.student.siblings',
              defaultMessage: 'Siblings',
            })}
            request={async () => {
              const resp = await service.studentServiceListStudentSibling({
                studentId: currentRow.id!,
              });
              return {
                data: resp.data.items || [],
                total: resp.data.items?.length || 0,
                success: true,
              };
            }}
            columns={[
              {
                title: (
                  <FormattedMessage
                    id="school.student.admissionNo"
                    defaultMessage="Admission No."
                  />
                ),
                dataIndex: 'admissionNo',
              },
              {
                title: (
                  <FormattedMessage id="school.student.firstName" defaultMessage="First Name" />
                ),
                dataIndex: 'firstName',
              },
              {
                title: <FormattedMessage id="school.student.lastName" defaultMessage="Last Name" />,
                dataIndex: 'lastName',
              },
              {
                title: (
                  <FormattedMessage
                    id="school.student.classSection"
                    defaultMessage="Class Section"
                  />
                ),
                dataIndex: ['enrollment', 'classSectionId'],
                render: (_, entity) => {
                  const id = entity.enrollment?.classSectionId;
                  return id ? classSections[id]?.code || id : '-';
                },
              },
            ]}
          />
        )}
      </Drawer>
      <UpdateForm
        onSubmit={async (value) => {
          const success = currentRow
            ? await handleUpdate({
                student: normalizeForUpdate({
                  ...value,
                  isActive: currentRow.isActive,
                  disableReasonId: currentRow.disableReasonId,
                  disableNote: currentRow.disableNote,
                  disabledAt: currentRow.disabledAt,
                }),
              })
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
        values={(currentRow as V1Student) || {}}
      />
      <ModalForm<StudentUserLinkForm>
        title={intl.formatMessage({
          id: 'school.student.manageLogin',
          defaultMessage: 'Manage Login',
        })}
        open={linkModalVisible}
        modalProps={{
          destroyOnClose: true,
          onCancel: () => {
            handleLinkModalVisible(false);
            setLinkRow(undefined);
          },
        }}
        initialValues={{ relation: 'guardian', canLogin: true }}
        onFinish={async (value) => {
          if (!linkRow?.id || !value.user?.user?.id) {
            message.error(
              intl.formatMessage({
                id: 'school.student.userRequired',
                defaultMessage: 'Select an existing user.',
              }),
            );
            return false;
          }
          const hide = message.loading(
            intl.formatMessage({ id: 'common.saving', defaultMessage: 'Saving...' }),
          );
          try {
            await studentUserLinkService.studentUserLinkServiceCreateStudentUserLink({
              body: {
                studentId: linkRow.id,
                userId: value.user.user.id,
                relation: value.relation,
                isPrimary: value.isPrimary,
                canLogin: value.canLogin,
                sourceParentId: value.sourceParentId,
                note: value.note,
              },
            });
            hide();
            message.success(
              intl.formatMessage({ id: 'common.saved', defaultMessage: 'Saved Successfully' }),
            );
            handleLinkModalVisible(false);
            setLinkRow(undefined);
            return true;
          } catch (error) {
            hide();
            return false;
          }
        }}
      >
        {linkRow?.id && (
          <ProTable<V1StudentUserLink>
            actionRef={linkActionRef}
            rowKey="id"
            search={false}
            pagination={false}
            options={false}
            toolBarRender={false}
            style={{ marginBottom: 16 }}
            request={async () => {
              const resp = await studentUserLinkService.studentUserLinkServiceListStudentUserLink2({
                body: {
                  pageSize: 50,
                  filter: { studentId: { $eq: linkRow.id } },
                },
              });
              return {
                data: resp.data.items || [],
                total: resp.data.items?.length || 0,
                success: true,
              };
            }}
            columns={[
              {
                title: (
                  <FormattedMessage id="school.student.linkedUser" defaultMessage="Linked User" />
                ),
                dataIndex: 'userId',
                ellipsis: true,
              },
              {
                title: <FormattedMessage id="school.student.relation" defaultMessage="Relation" />,
                dataIndex: 'relation',
              },
              {
                title: <FormattedMessage id="school.student.canLogin" defaultMessage="Login" />,
                dataIndex: 'canLogin',
                valueType: 'switch',
              },
              {
                title: <FormattedMessage id="common.operate" defaultMessage="Operate" />,
                valueType: 'option',
                render: (_, record) => [
                  <a
                    key="delete"
                    onClick={async () => {
                      const ok = await handleRemoveLink(record);
                      if (ok) {
                        linkActionRef.current?.reload();
                      }
                    }}
                  >
                    <FormattedMessage id="common.delete" defaultMessage="Delete" />
                  </a>,
                ],
              },
            ]}
          />
        )}
        <ProForm.Item
          name="user"
          label={intl.formatMessage({
            id: 'school.student.linkedUser',
            defaultMessage: 'Linked User',
          })}
          rules={[
            {
              validator: async (_, value?: UserselectValue) => {
                if (value?.user?.id) {
                  return;
                }
                throw new Error(
                  intl.formatMessage({
                    id: 'school.student.userRequired',
                    defaultMessage: 'Select an existing user.',
                  }),
                );
              },
            },
          ]}
        >
          <Userselect />
        </ProForm.Item>
        <ProFormSelect
          name="relation"
          label={intl.formatMessage({ id: 'school.student.relation', defaultMessage: 'Relation' })}
          valueEnum={{
            guardian: intl.formatMessage({
              id: 'school.student.relation.guardian',
              defaultMessage: 'Guardian',
            }),
            father: intl.formatMessage({
              id: 'school.student.relation.father',
              defaultMessage: 'Father',
            }),
            mother: intl.formatMessage({
              id: 'school.student.relation.mother',
              defaultMessage: 'Mother',
            }),
            student: intl.formatMessage({
              id: 'school.student.relation.student',
              defaultMessage: 'Student',
            }),
          }}
        />
        <ProFormSwitch
          name="isPrimary"
          label={intl.formatMessage({ id: 'school.student.isPrimary', defaultMessage: 'Primary' })}
        />
        <ProFormSwitch
          name="canLogin"
          label={intl.formatMessage({ id: 'school.student.canLogin', defaultMessage: 'Login' })}
        />
        <ProFormText
          name="sourceParentId"
          label={intl.formatMessage({
            id: 'school.student.sourceParentId',
            defaultMessage: 'Source Parent ID',
          })}
        />
        <ProFormTextArea
          name="note"
          label={intl.formatMessage({ id: 'school.student.linkNote', defaultMessage: 'Note' })}
        />
      </ModalForm>
      <ModalForm<V1DisableStudentRequest>
        title={intl.formatMessage({
          id: 'school.student.disable',
          defaultMessage: 'Disable',
        })}
        open={disableModalVisible}
        modalProps={{
          destroyOnClose: true,
          onCancel: () => {
            handleDisableModalVisible(false);
            setDisableRow(undefined);
          },
        }}
        onFinish={async (value) => {
          if (!disableRow) {
            return false;
          }
          const success = await handleDisable(disableRow, value);
          if (success) {
            handleDisableModalVisible(false);
            setDisableRow(undefined);
            actionRef.current?.reload();
          }
          return success;
        }}
      >
        <ProFormSelect
          name="disableReasonId"
          label={intl.formatMessage({
            id: 'school.student.disableReason',
            defaultMessage: 'Disable Reason',
          })}
          rules={[{ required: true }]}
          request={async () => {
            const resp = await disableReasonService.disableReasonServiceListDisableReason2({
              body: { pageSize: 100, sort: ['reason'] },
            });
            return (resp.data.items || []).map((item) => ({
              label: item.reason || item.id,
              value: item.id,
            }));
          }}
        />
        <ProFormTextArea
          name="disableNote"
          label={intl.formatMessage({
            id: 'school.student.disableNote',
            defaultMessage: 'Disable Note',
          })}
        />
      </ModalForm>
    </PageContainer>
  );
};

export default TableList;
