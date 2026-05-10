import { DrawerForm, ProFormSelect, ProFormText, ProTable } from '@ant-design/pro-components';
import { FormattedMessage, useIntl } from '@umijs/max';
import { message } from 'antd';
import React, { useEffect, useState } from 'react';
import type {
  V1AcademicSession,
  V1ClassSection,
  V1Subject,
  V1SubjectGroup,
  V1SubjectGroupStudent,
} from '@gosaas/api';
import {
  AcademicSessionServiceApi,
  ClassSectionServiceApi,
  SubjectGroupServiceApi,
  SubjectServiceApi,
} from '@gosaas/api';
import ReferencePage from '../../Student/components/ReferencePage';

const service = new SubjectGroupServiceApi();
const sessionService = new AcademicSessionServiceApi();
const subjectService = new SubjectServiceApi();
const classSectionService = new ClassSectionServiceApi();

const keyedById = <T extends { id?: string }>(items: T[] = []) =>
  items.reduce<Record<string, T>>((ret, item) => {
    if (item.id) {
      ret[item.id] = item;
    }
    return ret;
  }, {});

const joinLabels = (ids: string[] = [], labels: Record<string, string>) =>
  ids.map((id) => labels[id] || id).join(', ') || '-';

const studentName = (record: V1SubjectGroupStudent) =>
  [record.firstName, record.middleName, record.lastName].filter(Boolean).join(' ') || '-';

const SubjectGroups: React.FC = () => {
  const intl = useIntl();
  const [sessions, setSessions] = useState<Record<string, V1AcademicSession>>({});
  const [subjects, setSubjects] = useState<Record<string, V1Subject>>({});
  const [classSections, setClassSections] = useState<Record<string, V1ClassSection>>({});
  const [studentDrawerOpen, setStudentDrawerOpen] = useState(false);
  const [currentSubjectGroup, setCurrentSubjectGroup] = useState<V1SubjectGroup>();
  const [selectedClassSectionId, setSelectedClassSectionId] = useState<string>();
  const [studentRows, setStudentRows] = useState<V1SubjectGroupStudent[]>([]);
  const [selectedEnrollmentIds, setSelectedEnrollmentIds] = useState<string[]>([]);
  const [studentLoading, setStudentLoading] = useState(false);

  useEffect(() => {
    Promise.all([
      sessionService.academicSessionServiceListAcademicSession2({
        body: { pageSize: 100, sort: ['code'] },
      }),
      subjectService.subjectServiceListSubject2({ body: { pageSize: 300, sort: ['name'] } }),
      classSectionService.classSectionServiceListClassSection2({
        body: { pageSize: 300, sort: ['code'] },
      }),
    ]).then(([sessionResp, subjectResp, classSectionResp]) => {
      setSessions(keyedById(sessionResp.data.items));
      setSubjects(keyedById(subjectResp.data.items));
      setClassSections(keyedById(classSectionResp.data.items));
    });
  }, []);

  useEffect(() => {
    if (!studentDrawerOpen || !currentSubjectGroup?.id || !selectedClassSectionId) {
      setStudentRows([]);
      setSelectedEnrollmentIds([]);
      return;
    }

    setStudentLoading(true);
    service
      .subjectGroupServiceListSubjectGroupStudents({
        subjectGroupId: currentSubjectGroup.id,
        classSectionId: selectedClassSectionId,
      })
      .then((resp) => {
        const items = resp.data.items || [];
        setStudentRows(items);
        setSelectedEnrollmentIds(
          items
            .filter((item) => item.assigned && item.studentEnrollmentId)
            .map((item) => item.studentEnrollmentId!),
        );
      })
      .finally(() => setStudentLoading(false));
  }, [currentSubjectGroup?.id, selectedClassSectionId, studentDrawerOpen]);

  const subjectLabels = Object.values(subjects).reduce<Record<string, string>>((ret, item) => {
    if (item.id) {
      ret[item.id] = [item.code, item.name].filter(Boolean).join(' - ') || item.id;
    }
    return ret;
  }, {});

  const classSectionLabels = Object.values(classSections).reduce<Record<string, string>>(
    (ret, item) => {
      if (item.id) {
        ret[item.id] = item.code || item.id;
      }
      return ret;
    },
    {},
  );

  const openStudentDrawer = (record: V1SubjectGroup) => {
    const classSectionId = record.classSectionIds?.[0];
    setCurrentSubjectGroup(record);
    setSelectedClassSectionId(classSectionId);
    setStudentRows([]);
    setSelectedEnrollmentIds([]);
    setStudentDrawerOpen(true);
  };

  const closeStudentDrawer = () => {
    setStudentDrawerOpen(false);
    setCurrentSubjectGroup(undefined);
    setSelectedClassSectionId(undefined);
    setStudentRows([]);
    setSelectedEnrollmentIds([]);
  };

  const handleSaveStudents = async () => {
    if (!currentSubjectGroup?.id || !selectedClassSectionId) {
      return false;
    }

    const hide = message.loading(
      intl.formatMessage({ id: 'common.saving', defaultMessage: 'Saving...' }),
    );
    try {
      await service.subjectGroupServiceAssignSubjectGroupStudents({
        subjectGroupId: currentSubjectGroup.id,
        body: {
          subjectGroupId: currentSubjectGroup.id,
          classSectionId: selectedClassSectionId,
          studentEnrollmentIds: selectedEnrollmentIds,
        },
      });
      hide();
      message.success(
        intl.formatMessage({ id: 'common.saved', defaultMessage: 'Saved Successfully' }),
      );
      closeStudentDrawer();
      return true;
    } catch (error) {
      hide();
      return false;
    }
  };

  return (
    <>
      <ReferencePage<V1SubjectGroup>
        columns={[
          {
            title: (
              <FormattedMessage id="school.academic.subjectGroup.name" defaultMessage="Name" />
            ),
            dataIndex: 'name',
          },
          {
            title: (
              <FormattedMessage
                id="school.academic.subjectGroup.academicSession"
                defaultMessage="Academic Session"
              />
            ),
            dataIndex: 'academicSessionId',
            render: (_, record) =>
              sessions[record.academicSessionId || '']?.code || record.academicSessionId || '-',
          },
          {
            title: (
              <FormattedMessage
                id="school.academic.subjectGroup.subjects"
                defaultMessage="Subjects"
              />
            ),
            dataIndex: 'subjectIds',
            render: (_, record) => joinLabels(record.subjectIds, subjectLabels),
          },
          {
            title: (
              <FormattedMessage
                id="school.academic.subjectGroup.classSections"
                defaultMessage="Class Sections"
              />
            ),
            dataIndex: 'classSectionIds',
            render: (_, record) => joinLabels(record.classSectionIds, classSectionLabels),
          },
          {
            title: (
              <FormattedMessage
                id="school.academic.subjectGroup.description"
                defaultMessage="Description"
              />
            ),
            dataIndex: 'description',
          },
          {
            title: (
              <FormattedMessage
                id="school.academic.subjectGroup.students"
                defaultMessage="Students"
              />
            ),
            valueType: 'option',
            render: (_, record) => [
              <a
                key="students"
                onClick={() => {
                  openStudentDrawer(record);
                }}
              >
                <FormattedMessage
                  id="school.academic.subjectGroup.manageStudents"
                  defaultMessage="Manage Students"
                />
              </a>,
            ],
          },
        ]}
        create={(fields) =>
          service.subjectGroupServiceCreateSubjectGroup({
            body: {
              academicSessionId: fields.academicSessionId,
              name: fields.name,
              description: fields.description,
              subjectIds: fields.subjectIds || [],
              classSectionIds: fields.classSectionIds || [],
            },
          })
        }
        delete={(record) => service.subjectGroupServiceDeleteSubjectGroup({ id: record.id! })}
        formItems={
          <>
            <ProFormSelect
              name="academicSessionId"
              label={intl.formatMessage({
                id: 'school.academic.subjectGroup.academicSession',
                defaultMessage: 'Academic Session',
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
            <ProFormText
              name="name"
              label={
                <FormattedMessage id="school.academic.subjectGroup.name" defaultMessage="Name" />
              }
              rules={[{ required: true }]}
            />
            <ProFormSelect
              name="subjectIds"
              label={intl.formatMessage({
                id: 'school.academic.subjectGroup.subjects',
                defaultMessage: 'Subjects',
              })}
              mode="multiple"
              rules={[{ required: true }]}
              request={async () => {
                const resp = await subjectService.subjectServiceListSubject2({
                  body: { pageSize: 300, sort: ['name'] },
                });
                return (resp.data.items || []).map((item) => ({
                  label: [item.code, item.name].filter(Boolean).join(' - ') || item.id,
                  value: item.id,
                }));
              }}
              showSearch
            />
            <ProFormSelect
              name="classSectionIds"
              label={intl.formatMessage({
                id: 'school.academic.subjectGroup.classSections',
                defaultMessage: 'Class Sections',
              })}
              mode="multiple"
              rules={[{ required: true }]}
              request={async () => {
                const resp = await classSectionService.classSectionServiceListClassSection2({
                  body: { pageSize: 300, sort: ['code'] },
                });
                return (resp.data.items || []).map((item) => ({
                  label: item.code || item.id,
                  value: item.id,
                }));
              }}
              showSearch
            />
            <ProFormText
              name="description"
              label={
                <FormattedMessage
                  id="school.academic.subjectGroup.description"
                  defaultMessage="Description"
                />
              }
            />
          </>
        }
        get={async (id) => (await service.subjectGroupServiceGetSubjectGroup({ id })).data}
        list={async (req) =>
          (await service.subjectGroupServiceListSubjectGroup2({ body: req })).data
        }
        title={(record) => record.name || record.id}
        update={(record, fields) =>
          service.subjectGroupServiceUpdateSubjectGroup2({
            subjectGroupId: record.id!,
            body: {
              subjectGroup: {
                id: record.id!,
                academicSessionId: fields.academicSessionId,
                name: fields.name,
                description: fields.description,
                subjectIds: fields.subjectIds || [],
                classSectionIds: fields.classSectionIds || [],
              },
            },
          })
        }
      />
      <DrawerForm
        title={intl.formatMessage({
          id: 'school.academic.subjectGroup.manageStudents',
          defaultMessage: 'Manage Students',
        })}
        width={760}
        open={studentDrawerOpen}
        onFinish={handleSaveStudents}
        drawerProps={{
          destroyOnClose: true,
          onClose: closeStudentDrawer,
        }}
      >
        <ProFormSelect
          name="classSectionId"
          label={intl.formatMessage({
            id: 'school.academic.subjectGroup.classSection',
            defaultMessage: 'Class Section',
          })}
          options={(currentSubjectGroup?.classSectionIds || []).map((id) => ({
            label: classSectionLabels[id] || id,
            value: id,
          }))}
          fieldProps={{
            value: selectedClassSectionId,
            onChange: (value) => {
              setSelectedClassSectionId(value as string);
              setStudentRows([]);
              setSelectedEnrollmentIds([]);
            },
          }}
          rules={[{ required: true }]}
        />
        <ProTable<V1SubjectGroupStudent>
          rowKey="studentEnrollmentId"
          search={false}
          options={false}
          loading={studentLoading}
          dataSource={studentRows}
          pagination={{ pageSize: 10 }}
          rowSelection={{
            selectedRowKeys: selectedEnrollmentIds,
            onChange: (keys) => setSelectedEnrollmentIds(keys.map(String)),
            getCheckboxProps: (record) => ({
              disabled: !record.studentEnrollmentId,
            }),
          }}
          columns={[
            {
              title: (
                <FormattedMessage
                  id="school.academic.subjectGroup.student.admissionNo"
                  defaultMessage="Admission No."
                />
              ),
              dataIndex: 'admissionNo',
            },
            {
              title: (
                <FormattedMessage
                  id="school.academic.subjectGroup.student.rollNo"
                  defaultMessage="Roll No."
                />
              ),
              dataIndex: 'rollNo',
            },
            {
              title: (
                <FormattedMessage
                  id="school.academic.subjectGroup.student.name"
                  defaultMessage="Student"
                />
              ),
              render: (_, record) => studentName(record),
            },
          ]}
        />
      </DrawerForm>
    </>
  );
};

export default SubjectGroups;
