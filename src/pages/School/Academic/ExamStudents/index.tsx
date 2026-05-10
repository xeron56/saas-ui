import { PageContainer, ProTable } from '@ant-design/pro-components';
import { FormattedMessage, useIntl, useParams } from '@umijs/max';
import { Button, Input, Select, Space, Tag, Typography, message } from 'antd';
import React, { useEffect, useMemo, useState } from 'react';
import type { V1ClassSection, V1Exam, V1ExamStudentRosterItem } from '@gosaas/api';
import { ClassSectionServiceApi, ExamServiceApi, ExamStudentServiceApi } from '@gosaas/api';

const classSectionService = new ClassSectionServiceApi();
const examService = new ExamServiceApi();
const examStudentService = new ExamStudentServiceApi();

const studentName = (record: V1ExamStudentRosterItem) =>
  [record.firstName, record.middleName, record.lastName].filter(Boolean).join(' ') ||
  record.studentId;

const ExamStudents: React.FC = () => {
  const intl = useIntl();
  const { examId } = useParams<{ examId: string }>();
  const [exam, setExam] = useState<V1Exam>();
  const [classSections, setClassSections] = useState<V1ClassSection[]>([]);
  const [classSectionId, setClassSectionId] = useState<string>();
  const [rows, setRows] = useState<V1ExamStudentRosterItem[]>([]);
  const [selectedEnrollmentIds, setSelectedEnrollmentIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!examId) {
      return;
    }
    examService.examServiceGetExam({ id: examId }).then((resp) => setExam(resp.data));
  }, [examId]);

  useEffect(() => {
    if (!exam?.academicSessionId) {
      return;
    }
    classSectionService
      .classSectionServiceListClassSection2({
        body: {
          pageSize: 500,
          sort: ['code'],
          filter: { academicSessionId: { $eq: exam.academicSessionId } },
        },
      })
      .then((resp) => {
        const items = resp.data.items || [];
        setClassSections(items);
        setClassSectionId((current) => current || items[0]?.id);
      });
  }, [exam?.academicSessionId]);

  useEffect(() => {
    if (!examId || !classSectionId) {
      setRows([]);
      setSelectedEnrollmentIds([]);
      return;
    }
    setLoading(true);
    examStudentService
      .examStudentServiceGetExamStudents({ examId, classSectionId })
      .then((resp) => {
        const items = resp.data.items || [];
        setRows(items);
        setSelectedEnrollmentIds(
          items
            .filter((item) => item.assigned && item.studentEnrollmentId)
            .map((item) => item.studentEnrollmentId!),
        );
      })
      .finally(() => setLoading(false));
  }, [examId, classSectionId]);

  const classSectionOptions = useMemo(
    () =>
      classSections.map((item) => ({
        label: item.code || item.id,
        value: item.id,
      })),
    [classSections],
  );

  const saveStudents = async () => {
    if (!examId || !classSectionId) {
      return;
    }
    setSaving(true);
    const hide = message.loading(
      intl.formatMessage({ id: 'common.saving', defaultMessage: 'Saving...' }),
    );
    try {
      const rowsByEnrollment = new Map(
        rows.filter((row) => row.studentEnrollmentId).map((row) => [row.studentEnrollmentId!, row]),
      );
      await examStudentService.examStudentServiceSaveExamStudents({
        examId,
        body: {
          examId,
          classSectionId,
          students: selectedEnrollmentIds.map((studentEnrollmentId) => {
            const row = rowsByEnrollment.get(studentEnrollmentId);
            return {
              studentEnrollmentId,
              examRollNo: row?.examRollNo,
              teacherRemark: row?.teacherRemark,
              rank: row?.rank,
              isActive: row?.isActive ?? true,
            };
          }),
        },
      });
      const savedResp = await examStudentService.examStudentServiceGetExamStudents({
        examId,
        classSectionId,
      });
      await Promise.all(
        (savedResp.data.items || [])
          .filter(
            (item) =>
              item.assigned &&
              item.examStudentId &&
              item.studentEnrollmentId &&
              selectedEnrollmentIds.includes(item.studentEnrollmentId),
          )
          .map((item) => {
            const row = rowsByEnrollment.get(item.studentEnrollmentId!);
            return examStudentService.examStudentServiceUpdateExamStudent2({
              examStudentId: item.examStudentId!,
              body: {
                examStudent: {
                  id: item.examStudentId!,
                  examRollNo: row?.examRollNo || '',
                  teacherRemark: row?.teacherRemark || '',
                  rank: item.rank || 0,
                  isActive: item.isActive ?? true,
                },
              },
            });
          }),
      );
      hide();
      message.success(
        intl.formatMessage({ id: 'common.saved', defaultMessage: 'Saved Successfully' }),
      );
      const resp = await examStudentService.examStudentServiceGetExamStudents({
        examId,
        classSectionId,
      });
      const items = resp.data.items || [];
      setRows(items);
      setSelectedEnrollmentIds(
        items
          .filter((item) => item.assigned && item.studentEnrollmentId)
          .map((item) => item.studentEnrollmentId!),
      );
    } catch (error) {
      hide();
    } finally {
      setSaving(false);
    }
  };

  const updateRow = (
    studentEnrollmentId: string | undefined,
    values: Partial<V1ExamStudentRosterItem>,
  ) => {
    if (!studentEnrollmentId) {
      return;
    }
    setRows((current) =>
      current.map((row) =>
        row.studentEnrollmentId === studentEnrollmentId ? { ...row, ...values } : row,
      ),
    );
  };

  const isEditable = (record: V1ExamStudentRosterItem) =>
    Boolean(
      !exam?.isPublish &&
        record.studentEnrollmentId &&
        selectedEnrollmentIds.includes(record.studentEnrollmentId),
    );

  return (
    <PageContainer
      title={exam?.name || intl.formatMessage({ id: 'school.academic.exam.students' })}
    >
      <Space direction="vertical" size={6} style={{ marginBottom: 16 }}>
        <Typography.Text>
          <FormattedMessage
            id="school.academic.examStudent.classSection"
            defaultMessage="Class Section"
          />
        </Typography.Text>
        <Select
          value={classSectionId}
          options={classSectionOptions}
          style={{ minWidth: 320 }}
          onChange={(value) => {
            setClassSectionId(value);
            setRows([]);
            setSelectedEnrollmentIds([]);
          }}
        />
      </Space>
      <ProTable<V1ExamStudentRosterItem>
        rowKey="studentEnrollmentId"
        search={false}
        options={false}
        loading={loading}
        dataSource={rows}
        pagination={{ pageSize: 20 }}
        rowSelection={{
          selectedRowKeys: selectedEnrollmentIds,
          onChange: (keys) => setSelectedEnrollmentIds(keys.map(String)),
          getCheckboxProps: (record) => ({
            disabled: !record.studentEnrollmentId || exam?.isPublish,
          }),
        }}
        toolBarRender={() => [
          <Space key="actions">
            <Tag>
              <FormattedMessage
                id="school.academic.examStudent.selectedCount"
                defaultMessage="{count} selected"
                values={{ count: selectedEnrollmentIds.length }}
              />
            </Tag>
            <Button
              type="primary"
              loading={saving}
              disabled={!classSectionId || exam?.isPublish}
              onClick={saveStudents}
            >
              <FormattedMessage id="common.save" defaultMessage="Save" />
            </Button>
          </Space>,
        ]}
        columns={[
          {
            title: (
              <FormattedMessage
                id="school.academic.examStudent.admissionNo"
                defaultMessage="Admission No."
              />
            ),
            dataIndex: 'admissionNo',
          },
          {
            title: (
              <FormattedMessage id="school.academic.examStudent.rollNo" defaultMessage="Roll No." />
            ),
            dataIndex: 'rollNo',
          },
          {
            title: (
              <FormattedMessage
                id="school.academic.examStudent.examRollNo"
                defaultMessage="Exam Roll No."
              />
            ),
            dataIndex: 'examRollNo',
            render: (_, record) => (
              <Input
                value={record.examRollNo}
                disabled={!isEditable(record)}
                onChange={(event) =>
                  updateRow(record.studentEnrollmentId, { examRollNo: event.target.value })
                }
              />
            ),
          },
          {
            title: (
              <FormattedMessage id="school.academic.examStudent.student" defaultMessage="Student" />
            ),
            renderText: (_, record) => studentName(record),
          },
          {
            title: (
              <FormattedMessage
                id="school.academic.examStudent.fatherName"
                defaultMessage="Father Name"
              />
            ),
            dataIndex: 'fatherName',
          },
          {
            title: (
              <FormattedMessage
                id="school.academic.examStudent.category"
                defaultMessage="Category"
              />
            ),
            dataIndex: 'category',
          },
          {
            title: (
              <FormattedMessage id="school.academic.examStudent.gender" defaultMessage="Gender" />
            ),
            dataIndex: 'gender',
          },
          {
            title: (
              <FormattedMessage
                id="school.academic.examStudent.teacherRemark"
                defaultMessage="Teacher Remark"
              />
            ),
            dataIndex: 'teacherRemark',
            render: (_, record) => (
              <Input.TextArea
                autoSize={{ minRows: 1, maxRows: 3 }}
                value={record.teacherRemark}
                disabled={!isEditable(record)}
                onChange={(event) =>
                  updateRow(record.studentEnrollmentId, { teacherRemark: event.target.value })
                }
              />
            ),
          },
          {
            title: <FormattedMessage id="school.academic.examStudent.rank" defaultMessage="Rank" />,
            dataIndex: 'rank',
            valueType: 'digit',
          },
          {
            title: (
              <FormattedMessage
                id="school.academic.examStudent.assigned"
                defaultMessage="Assigned"
              />
            ),
            dataIndex: 'assigned',
            render: (_, record) =>
              record.assigned ? (
                <Tag color="green">
                  <FormattedMessage id="common.yes" defaultMessage="Yes" />
                </Tag>
              ) : (
                <Tag>
                  <FormattedMessage id="common.no" defaultMessage="No" />
                </Tag>
              ),
          },
        ]}
      />
    </PageContainer>
  );
};

export default ExamStudents;
