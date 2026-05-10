import { DeleteOutlined, EditOutlined, PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import type { ActionType, ProColumnType } from '@ant-design/pro-components';
import {
  DrawerForm,
  PageContainer,
  ProFormSelect,
  ProFormText,
  ProTable,
} from '@ant-design/pro-components';
import { FormattedMessage, useIntl } from '@umijs/max';
import { requestTransform } from '@gosaas/core';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type {
  V1AcademicSession,
  V1ClassSection,
  V1Staff,
  V1Subject,
  V1SubjectGroup,
  V1SubjectTimetable,
  V1SubjectTimetableFilter,
} from '@gosaas/api';
import {
  AcademicSessionServiceApi,
  ClassSectionServiceApi,
  StaffServiceApi,
  SubjectGroupServiceApi,
  SubjectServiceApi,
  SubjectTimetableServiceApi,
} from '@gosaas/api';
import {
  Button,
  Empty,
  Popconfirm,
  Select,
  Space,
  Spin,
  Tabs,
  Tag,
  Tooltip,
  Typography,
  message,
} from 'antd';

const service = new SubjectTimetableServiceApi();
const sessionService = new AcademicSessionServiceApi();
const classSectionService = new ClassSectionServiceApi();
const subjectGroupService = new SubjectGroupServiceApi();
const subjectService = new SubjectServiceApi();
const staffService = new StaffServiceApi();

const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const dayOptions = dayNames.map((day) => ({ label: day, value: day }));

const keyedById = <T extends { id?: string }>(items: T[] = []) =>
  items.reduce<Record<string, T>>((ret, item) => {
    if (item.id) {
      ret[item.id] = item;
    }
    return ret;
  }, {});

const staffLabel = (staff?: V1Staff, fallback?: string) =>
  staff
    ? [staff.employeeId, staff.firstName, staff.lastName].filter(Boolean).join(' ') || staff.id
    : fallback || '-';

const subjectLabel = (subject?: V1Subject, fallback?: string) =>
  subject
    ? [subject.code, subject.name].filter(Boolean).join(' - ') || subject.id
    : fallback || '-';

const optionFilter = (input: string, option?: { label?: React.ReactNode }) =>
  String(option?.label || '')
    .toLowerCase()
    .includes(input.toLowerCase());

type TimetableFormValues = {
  academicSessionId?: string;
  classSectionId?: string;
  subjectGroupId?: string;
  subjectId?: string;
  staffId?: string;
  day?: string;
  timeFrom?: string;
  timeTo?: string;
  roomNo?: string;
};

type GridFilters = Pick<
  TimetableFormValues,
  'academicSessionId' | 'classSectionId' | 'subjectGroupId'
>;

const Timetable: React.FC = () => {
  const intl = useIntl();
  const actionRef = useRef<ActionType>();
  const [sessions, setSessions] = useState<V1AcademicSession[]>([]);
  const [classSections, setClassSections] = useState<V1ClassSection[]>([]);
  const [subjectGroups, setSubjectGroups] = useState<V1SubjectGroup[]>([]);
  const [subjects, setSubjects] = useState<V1Subject[]>([]);
  const [staff, setStaff] = useState<V1Staff[]>([]);
  const [lookupsLoading, setLookupsLoading] = useState(false);
  const [gridLoading, setGridLoading] = useState(false);
  const [gridItems, setGridItems] = useState<V1SubjectTimetable[]>([]);
  const [gridFilters, setGridFilters] = useState<GridFilters>({});
  const [formVisible, setFormVisible] = useState(false);
  const [currentRow, setCurrentRow] = useState<V1SubjectTimetable>();
  const [formDefaults, setFormDefaults] = useState<TimetableFormValues>({});

  const sessionMap = useMemo(() => keyedById(sessions), [sessions]);
  const classSectionMap = useMemo(() => keyedById(classSections), [classSections]);
  const subjectGroupMap = useMemo(() => keyedById(subjectGroups), [subjectGroups]);
  const subjectMap = useMemo(() => keyedById(subjects), [subjects]);
  const staffMap = useMemo(() => keyedById(staff), [staff]);

  const sessionOptions = useMemo(
    () => sessions.map((item) => ({ label: item.code || item.name || item.id, value: item.id })),
    [sessions],
  );
  const classSectionOptions = useMemo(
    () => classSections.map((item) => ({ label: item.code || item.id, value: item.id })),
    [classSections],
  );
  const subjectGroupOptions = useMemo(
    () => subjectGroups.map((item) => ({ label: item.name || item.id, value: item.id })),
    [subjectGroups],
  );
  const subjectOptions = useMemo(
    () => subjects.map((item) => ({ label: subjectLabel(item, item.id), value: item.id })),
    [subjects],
  );
  const staffOptions = useMemo(
    () => staff.map((item) => ({ label: staffLabel(item, item.id), value: item.id })),
    [staff],
  );

  useEffect(() => {
    let mounted = true;
    setLookupsLoading(true);
    Promise.all([
      sessionService.academicSessionServiceListAcademicSession2({
        body: { pageSize: 100, sort: ['code'] },
      }),
      classSectionService.classSectionServiceListClassSection2({
        body: { pageSize: 300, sort: ['code'] },
      }),
      subjectGroupService.subjectGroupServiceListSubjectGroup2({
        body: { pageSize: 300, sort: ['name'] },
      }),
      subjectService.subjectServiceListSubject2({ body: { pageSize: 300, sort: ['name'] } }),
      staffService.staffServiceListStaff2({
        body: {
          pageSize: 300,
          sort: ['roleName', 'employeeId'],
          filter: { isActive: { $eq: true } },
        },
      }),
    ])
      .then(([sessionResp, classSectionResp, subjectGroupResp, subjectResp, staffResp]) => {
        if (!mounted) {
          return;
        }
        const nextSessions = sessionResp.data.items || [];
        const nextClassSections = classSectionResp.data.items || [];
        const nextSubjectGroups = subjectGroupResp.data.items || [];
        setSessions(nextSessions);
        setClassSections(nextClassSections);
        setSubjectGroups(nextSubjectGroups);
        setSubjects(subjectResp.data.items || []);
        setStaff(staffResp.data.items || []);
        setGridFilters((prev) => ({
          academicSessionId: prev.academicSessionId || nextSessions[0]?.id,
          classSectionId: prev.classSectionId || nextClassSections[0]?.id,
          subjectGroupId: prev.subjectGroupId || nextSubjectGroups[0]?.id,
        }));
      })
      .finally(() => {
        if (mounted) {
          setLookupsLoading(false);
        }
      });
    return () => {
      mounted = false;
    };
  }, []);

  const loadGrid = useCallback(async (filters: GridFilters) => {
    if (!filters.academicSessionId || !filters.classSectionId || !filters.subjectGroupId) {
      setGridItems([]);
      return;
    }
    setGridLoading(true);
    try {
      const resp = await service.subjectTimetableServiceListSubjectTimetable2({
        body: {
          pageSize: 1000,
          sort: ['day', 'timeFrom'],
          filter: {
            academicSessionId: { $eq: filters.academicSessionId },
            classSectionId: { $eq: filters.classSectionId },
            subjectGroupId: { $eq: filters.subjectGroupId },
          },
        },
      });
      setGridItems(resp.data.items || []);
    } finally {
      setGridLoading(false);
    }
  }, []);

  useEffect(() => {
    loadGrid(gridFilters);
  }, [gridFilters, loadGrid]);

  const openCreate = (defaults: TimetableFormValues = {}) => {
    setCurrentRow(undefined);
    setFormDefaults({
      academicSessionId: gridFilters.academicSessionId,
      classSectionId: gridFilters.classSectionId,
      subjectGroupId: gridFilters.subjectGroupId,
      ...defaults,
    });
    setFormVisible(true);
  };

  const openEdit = (record: V1SubjectTimetable) => {
    setCurrentRow(record);
    setFormDefaults(record);
    setFormVisible(true);
  };

  const afterMutation = async () => {
    actionRef.current?.reload();
    await loadGrid(gridFilters);
  };

  const handleSave = async (values: TimetableFormValues) => {
    const hide = message.loading(
      intl.formatMessage({ id: 'common.saving', defaultMessage: 'Saving...' }),
    );
    try {
      if (currentRow?.id) {
        await service.subjectTimetableServiceUpdateSubjectTimetable2({
          timetableId: currentRow.id,
          body: {
            timetable: {
              id: currentRow.id,
              academicSessionId: values.academicSessionId,
              classSectionId: values.classSectionId,
              subjectGroupId: values.subjectGroupId,
              subjectId: values.subjectId,
              staffId: values.staffId,
              day: values.day,
              timeFrom: values.timeFrom,
              timeTo: values.timeTo,
              roomNo: values.roomNo,
            },
          },
        });
      } else {
        await service.subjectTimetableServiceCreateSubjectTimetable({
          body: {
            academicSessionId: values.academicSessionId!,
            classSectionId: values.classSectionId!,
            subjectGroupId: values.subjectGroupId!,
            subjectId: values.subjectId!,
            staffId: values.staffId!,
            day: values.day!,
            timeFrom: values.timeFrom!,
            timeTo: values.timeTo!,
            roomNo: values.roomNo,
          },
        });
      }
      hide();
      message.success(intl.formatMessage({ id: 'common.saved', defaultMessage: 'Saved' }));
      setFormVisible(false);
      setCurrentRow(undefined);
      await afterMutation();
      return true;
    } catch (error) {
      hide();
      return false;
    }
  };

  const handleRemove = async (record: V1SubjectTimetable) => {
    if (!record.id) {
      return;
    }
    const hide = message.loading(
      intl.formatMessage({ id: 'common.deleting', defaultMessage: 'Deleting...' }),
    );
    try {
      await service.subjectTimetableServiceDeleteSubjectTimetable({ id: record.id });
      hide();
      message.success(
        intl.formatMessage({ id: 'common.deleted', defaultMessage: 'Delete Successfully' }),
      );
      await afterMutation();
    } catch (error) {
      hide();
    }
  };

  const columns: ProColumnType<V1SubjectTimetable>[] = [
    {
      title: <FormattedMessage id="school.academic.timetable.day" defaultMessage="Day" />,
      dataIndex: 'day',
    },
    {
      title: (
        <FormattedMessage
          id="school.academic.timetable.academicSession"
          defaultMessage="Academic Session"
        />
      ),
      dataIndex: 'academicSessionId',
      render: (_, record) =>
        sessionMap[record.academicSessionId || '']?.code || record.academicSessionId || '-',
    },
    {
      title: (
        <FormattedMessage
          id="school.academic.timetable.classSection"
          defaultMessage="Class Section"
        />
      ),
      dataIndex: 'classSectionId',
      render: (_, record) =>
        classSectionMap[record.classSectionId || '']?.code || record.classSectionId || '-',
    },
    {
      title: (
        <FormattedMessage
          id="school.academic.timetable.subjectGroup"
          defaultMessage="Subject Group"
        />
      ),
      dataIndex: 'subjectGroupId',
      render: (_, record) =>
        subjectGroupMap[record.subjectGroupId || '']?.name || record.subjectGroupId || '-',
    },
    {
      title: <FormattedMessage id="school.academic.timetable.subject" defaultMessage="Subject" />,
      dataIndex: 'subjectId',
      render: (_, record) => subjectLabel(subjectMap[record.subjectId || ''], record.subjectId),
    },
    {
      title: <FormattedMessage id="school.academic.timetable.staff" defaultMessage="Staff" />,
      dataIndex: 'staffId',
      render: (_, record) => staffLabel(staffMap[record.staffId || ''], record.staffId),
    },
    {
      title: <FormattedMessage id="school.academic.timetable.time" defaultMessage="Time" />,
      dataIndex: 'timeFrom',
      render: (_, record) => [record.timeFrom, record.timeTo].filter(Boolean).join(' - ') || '-',
    },
    {
      title: <FormattedMessage id="school.academic.timetable.roomNo" defaultMessage="Room No." />,
      dataIndex: 'roomNo',
    },
    {
      title: <FormattedMessage id="common.operate" defaultMessage="Operate" />,
      key: 'option',
      valueType: 'option',
      render: (_, record) => (
        <Space>
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => openEdit(record)}>
            <FormattedMessage id="common.edit" defaultMessage="Edit" />
          </Button>
          <Popconfirm
            title={intl.formatMessage({ id: 'common.delete', defaultMessage: 'Delete' })}
            onConfirm={() => handleRemove(record)}
          >
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>
              <FormattedMessage id="common.delete" defaultMessage="Delete" />
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const getData = requestTransform<V1SubjectTimetable, V1SubjectTimetableFilter>(
    async (req) => (await service.subjectTimetableServiceListSubjectTimetable2({ body: req })).data,
  );

  const groupedGridItems = useMemo(
    () =>
      dayNames.map((day) => ({
        day,
        items: gridItems
          .filter((item) => item.day === day)
          .sort((a, b) =>
            [a.timeFrom || '', a.timeTo || '', a.id || '']
              .join('|')
              .localeCompare([b.timeFrom || '', b.timeTo || '', b.id || ''].join('|')),
          ),
      })),
    [gridItems],
  );

  const renderFormItems = () => (
    <>
      <ProFormSelect
        name="academicSessionId"
        label={intl.formatMessage({
          id: 'school.academic.timetable.academicSession',
          defaultMessage: 'Academic Session',
        })}
        rules={[{ required: true }]}
        options={sessionOptions}
        showSearch
        fieldProps={{ filterOption: optionFilter }}
      />
      <ProFormSelect
        name="classSectionId"
        label={intl.formatMessage({
          id: 'school.academic.timetable.classSection',
          defaultMessage: 'Class Section',
        })}
        rules={[{ required: true }]}
        options={classSectionOptions}
        showSearch
        fieldProps={{ filterOption: optionFilter }}
      />
      <ProFormSelect
        name="subjectGroupId"
        label={intl.formatMessage({
          id: 'school.academic.timetable.subjectGroup',
          defaultMessage: 'Subject Group',
        })}
        rules={[{ required: true }]}
        options={subjectGroupOptions}
        showSearch
        fieldProps={{ filterOption: optionFilter }}
      />
      <ProFormSelect
        name="subjectId"
        label={intl.formatMessage({
          id: 'school.academic.timetable.subject',
          defaultMessage: 'Subject',
        })}
        rules={[{ required: true }]}
        options={subjectOptions}
        showSearch
        fieldProps={{ filterOption: optionFilter }}
      />
      <ProFormSelect
        name="staffId"
        label={intl.formatMessage({
          id: 'school.academic.timetable.staff',
          defaultMessage: 'Staff',
        })}
        rules={[{ required: true }]}
        options={staffOptions}
        showSearch
        fieldProps={{ filterOption: optionFilter }}
      />
      <ProFormSelect
        name="day"
        label={intl.formatMessage({
          id: 'school.academic.timetable.day',
          defaultMessage: 'Day',
        })}
        options={dayOptions}
        rules={[{ required: true }]}
      />
      <ProFormText
        name="timeFrom"
        label={<FormattedMessage id="school.academic.timetable.timeFrom" defaultMessage="From" />}
        fieldProps={{ type: 'time', step: 60 }}
        rules={[{ required: true }]}
      />
      <ProFormText
        name="timeTo"
        label={<FormattedMessage id="school.academic.timetable.timeTo" defaultMessage="To" />}
        fieldProps={{ type: 'time', step: 60 }}
        rules={[{ required: true }]}
      />
      <ProFormText
        name="roomNo"
        label={<FormattedMessage id="school.academic.timetable.roomNo" defaultMessage="Room No." />}
      />
    </>
  );

  const gridView = (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <Space wrap>
        <Select
          style={{ minWidth: 180 }}
          loading={lookupsLoading}
          placeholder={intl.formatMessage({
            id: 'school.academic.timetable.academicSession',
            defaultMessage: 'Academic Session',
          })}
          options={sessionOptions}
          showSearch
          filterOption={optionFilter}
          value={gridFilters.academicSessionId}
          onChange={(value) => setGridFilters((prev) => ({ ...prev, academicSessionId: value }))}
        />
        <Select
          style={{ minWidth: 220 }}
          loading={lookupsLoading}
          placeholder={intl.formatMessage({
            id: 'school.academic.timetable.classSection',
            defaultMessage: 'Class Section',
          })}
          options={classSectionOptions}
          showSearch
          filterOption={optionFilter}
          value={gridFilters.classSectionId}
          onChange={(value) => setGridFilters((prev) => ({ ...prev, classSectionId: value }))}
        />
        <Select
          style={{ minWidth: 220 }}
          loading={lookupsLoading}
          placeholder={intl.formatMessage({
            id: 'school.academic.timetable.subjectGroup',
            defaultMessage: 'Subject Group',
          })}
          options={subjectGroupOptions}
          showSearch
          filterOption={optionFilter}
          value={gridFilters.subjectGroupId}
          onChange={(value) => setGridFilters((prev) => ({ ...prev, subjectGroupId: value }))}
        />
        <Tooltip
          title={intl.formatMessage({
            id: 'school.academic.timetable.refreshGrid',
            defaultMessage: 'Refresh grid',
          })}
        >
          <Button icon={<ReloadOutlined />} onClick={() => loadGrid(gridFilters)} />
        </Tooltip>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => openCreate()}>
          <FormattedMessage id="school.academic.timetable.newPeriod" defaultMessage="New Period" />
        </Button>
      </Space>
      <Spin spinning={gridLoading}>
        {gridItems.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={intl.formatMessage({
              id: 'school.academic.timetable.emptyGrid',
              defaultMessage: 'No timetable periods',
            })}
          />
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <div
              style={{
                display: 'grid',
                gap: 12,
                gridTemplateColumns: 'repeat(7, minmax(180px, 1fr))',
                minWidth: 1260,
              }}
            >
              {groupedGridItems.map(({ day, items }) => (
                <div
                  key={day}
                  style={{
                    border: '1px solid #f0f0f0',
                    borderRadius: 8,
                    minHeight: 320,
                    padding: 12,
                  }}
                >
                  <Space
                    align="center"
                    style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}
                  >
                    <Typography.Text strong>{day}</Typography.Text>
                    <Tooltip
                      title={intl.formatMessage({
                        id: 'school.academic.timetable.newPeriod',
                        defaultMessage: 'New Period',
                      })}
                    >
                      <Button
                        size="small"
                        icon={<PlusOutlined />}
                        onClick={() => openCreate({ day })}
                      />
                    </Tooltip>
                  </Space>
                  <Space direction="vertical" size="small" style={{ width: '100%' }}>
                    {items.map((item) => (
                      <div
                        key={item.id}
                        style={{
                          border: '1px solid #d9d9d9',
                          borderRadius: 8,
                          padding: 10,
                          width: '100%',
                        }}
                      >
                        <Space direction="vertical" size={4} style={{ width: '100%' }}>
                          <Space style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography.Text strong>
                              {[item.timeFrom, item.timeTo].filter(Boolean).join(' - ')}
                            </Typography.Text>
                            <Space size={0}>
                              <Tooltip
                                title={intl.formatMessage({
                                  id: 'common.edit',
                                  defaultMessage: 'Edit',
                                })}
                              >
                                <Button
                                  type="text"
                                  size="small"
                                  icon={<EditOutlined />}
                                  onClick={() => openEdit(item)}
                                />
                              </Tooltip>
                              <Popconfirm
                                title={intl.formatMessage({
                                  id: 'common.delete',
                                  defaultMessage: 'Delete',
                                })}
                                onConfirm={() => handleRemove(item)}
                              >
                                <Button type="text" size="small" danger icon={<DeleteOutlined />} />
                              </Popconfirm>
                            </Space>
                          </Space>
                          <Typography.Text>
                            {subjectLabel(subjectMap[item.subjectId || ''], item.subjectId)}
                          </Typography.Text>
                          <Typography.Text type="secondary">
                            {staffLabel(staffMap[item.staffId || ''], item.staffId)}
                          </Typography.Text>
                          {item.roomNo && <Tag>{item.roomNo}</Tag>}
                        </Space>
                      </div>
                    ))}
                  </Space>
                </div>
              ))}
            </div>
          </div>
        )}
      </Spin>
    </Space>
  );

  return (
    <PageContainer>
      <Tabs
        items={[
          {
            key: 'grid',
            label: <FormattedMessage id="school.academic.timetable.grid" defaultMessage="Grid" />,
            children: gridView,
          },
          {
            key: 'rows',
            label: <FormattedMessage id="school.academic.timetable.rows" defaultMessage="Rows" />,
            children: (
              <ProTable<V1SubjectTimetable>
                actionRef={actionRef}
                rowKey="id"
                search={false}
                pagination={{ defaultPageSize: 10 }}
                toolBarRender={() => [
                  <Button type="primary" key="primary" onClick={() => openCreate()}>
                    <PlusOutlined />{' '}
                    <FormattedMessage
                      id="school.academic.timetable.newPeriod"
                      defaultMessage="New Period"
                    />
                  </Button>,
                ]}
                type="table"
                request={getData}
                columns={columns}
              />
            ),
          },
        ]}
      />
      <DrawerForm<TimetableFormValues>
        key={currentRow?.id || JSON.stringify(formDefaults)}
        title={
          currentRow
            ? intl.formatMessage({
                id: 'school.academic.timetable.editPeriod',
                defaultMessage: 'Edit Period',
              })
            : intl.formatMessage({
                id: 'school.academic.timetable.newPeriod',
                defaultMessage: 'New Period',
              })
        }
        open={formVisible}
        drawerProps={{
          destroyOnClose: true,
          onClose: () => {
            setCurrentRow(undefined);
            setFormVisible(false);
          },
        }}
        initialValues={currentRow || formDefaults}
        onOpenChange={setFormVisible}
        onFinish={handleSave}
      >
        {renderFormItems()}
      </DrawerForm>
    </PageContainer>
  );
};

export default Timetable;
