import { ArrowLeftOutlined, SaveOutlined } from '@ant-design/icons';
import { PageContainer, ProTable } from '@ant-design/pro-components';
import { FormattedMessage, Link, useIntl, useParams } from '@umijs/max';
import { Button, InputNumber, Space, Switch, Tag, Typography, message } from 'antd';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import type { SchoolExamConnection, V1ExamGroup } from '@gosaas/api';
import { ExamGroupServiceApi, ExamServiceApi } from '@gosaas/api';

type ExamConnectionRow = SchoolExamConnection & {
  key: string;
};

const examGroupService = new ExamGroupServiceApi();
const examService = new ExamServiceApi();

const ExamConnections: React.FC = () => {
  const intl = useIntl();
  const { examGroupId } = useParams<{ examGroupId: string }>();
  const [examGroup, setExamGroup] = useState<V1ExamGroup>();
  const [rows, setRows] = useState<ExamConnectionRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadConnections = useCallback(async () => {
    if (!examGroupId) {
      return;
    }
    setLoading(true);
    try {
      const [groupResp, examsResp, connectionsResp] = await Promise.all([
        examGroupService.examGroupServiceGetExamGroup({ id: examGroupId }),
        examService.examServiceListExam2({
          body: {
            pageSize: 500,
            sort: ['name'],
            filter: { examGroupId: { $eq: examGroupId } },
          },
        }),
        examService.examServiceListExamConnections({ examGroupId }),
      ]);
      setExamGroup(groupResp.data);
      const examItems = examsResp.data.items || [];
      const connectionByExam = (connectionsResp.data.items || []).reduce<
        Record<string, SchoolExamConnection>
      >((ret, item) => {
        if (item.examId) {
          ret[item.examId] = item;
        }
        return ret;
      }, {});
      setRows(
        examItems.map((exam) => {
          const connection = exam.id ? connectionByExam[exam.id] : undefined;
          return {
            key: exam.id || '',
            examId: exam.id,
            examGroupId,
            examName: exam.name,
            examWeightage: connection?.examWeightage ?? 0,
            isActive: connection?.isActive ?? false,
            totalSubjects: connection?.totalSubjects,
            id: connection?.id,
          };
        }),
      );
    } finally {
      setLoading(false);
    }
  }, [examGroupId]);

  useEffect(() => {
    loadConnections();
  }, [loadConnections]);

  const activeRows = useMemo(() => rows.filter((row) => row.isActive), [rows]);
  const totalWeight = useMemo(
    () => activeRows.reduce((sum, row) => sum + Number(row.examWeightage || 0), 0),
    [activeRows],
  );
  const totalStatus = Math.abs(totalWeight - 100) <= 0.001 ? 'success' : 'error';

  const updateRow = (examId: string | undefined, patch: Partial<ExamConnectionRow>) => {
    if (!examId) {
      return;
    }
    setRows((current) =>
      current.map((row) => (row.examId === examId ? { ...row, ...patch } : row)),
    );
  };

  const saveConnections = async () => {
    if (!examGroupId) {
      return;
    }
    if (activeRows.length < 2) {
      message.error(
        intl.formatMessage({
          id: 'school.academic.examConnection.selectTwo',
          defaultMessage: 'Select at least two exams.',
        }),
      );
      return;
    }
    if (Math.abs(totalWeight - 100) > 0.001) {
      message.error(
        intl.formatMessage({
          id: 'school.academic.examConnection.totalRequired',
          defaultMessage: 'Exam weightage must total 100.',
        }),
      );
      return;
    }
    setSaving(true);
    const hide = message.loading(
      intl.formatMessage({ id: 'common.saving', defaultMessage: 'Saving...' }),
    );
    try {
      const resp = await examService.examServiceSaveExamConnections({
        examGroupId,
        body: {
          items: activeRows.map((row) => ({
            examId: row.examId,
            examWeightage: row.examWeightage || 0,
            isActive: true,
          })),
        },
      });
      const savedByExam = (resp.data.items || []).reduce<Record<string, SchoolExamConnection>>(
        (ret, item) => {
          if (item.examId) {
            ret[item.examId] = item;
          }
          return ret;
        },
        {},
      );
      setRows((current) =>
        current.map((row) => {
          const saved = row.examId ? savedByExam[row.examId] : undefined;
          return saved ? { ...row, ...saved, key: row.key } : { ...row, id: undefined };
        }),
      );
      hide();
      message.success(
        intl.formatMessage({
          id: 'school.academic.examConnection.saved',
          defaultMessage: 'Exam connections saved.',
        }),
      );
    } catch (error) {
      hide();
      message.error(
        intl.formatMessage({
          id: 'school.academic.examConnection.saveFailed',
          defaultMessage: 'Unable to save exam connections.',
        }),
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageContainer
      title={
        examGroup?.name || (
          <FormattedMessage
            id="school.academic.examConnection.title"
            defaultMessage="Exam Connections"
          />
        )
      }
      extra={[
        <Link key="back" to="/school/academic/exam-groups">
          <Button icon={<ArrowLeftOutlined />}>
            <FormattedMessage id="common.back" defaultMessage="Back" />
          </Button>
        </Link>,
        <Button
          key="save"
          icon={<SaveOutlined />}
          loading={saving}
          type="primary"
          onClick={saveConnections}
        >
          <FormattedMessage id="school.academic.examConnection.save" defaultMessage="Save" />
        </Button>,
      ]}
    >
      <ProTable<ExamConnectionRow>
        rowKey="key"
        search={false}
        loading={loading}
        dataSource={rows}
        pagination={false}
        options={false}
        toolBarRender={() => [
          <Space key="summary" size="middle">
            <Typography.Text>
              <FormattedMessage
                id="school.academic.examConnection.selectedCount"
                defaultMessage="{count} selected"
                values={{ count: activeRows.length }}
              />
            </Typography.Text>
            <Tag color={totalStatus === 'success' ? 'green' : 'red'}>
              <FormattedMessage
                id="school.academic.examConnection.totalWeight"
                defaultMessage="Total: {total}%"
                values={{ total: Number(totalWeight.toFixed(2)) }}
              />
            </Tag>
          </Space>,
        ]}
        columns={[
          {
            title: (
              <FormattedMessage id="school.academic.examConnection.active" defaultMessage="Use" />
            ),
            dataIndex: 'isActive',
            width: 96,
            render: (_, record) => (
              <Switch
                checked={!!record.isActive}
                onChange={(checked) => updateRow(record.examId, { isActive: checked })}
              />
            ),
          },
          {
            title: <FormattedMessage id="school.academic.exam.name" defaultMessage="Name" />,
            dataIndex: 'examName',
          },
          {
            title: (
              <FormattedMessage
                id="school.academic.examConnection.subjects"
                defaultMessage="Subjects"
              />
            ),
            dataIndex: 'totalSubjects',
            width: 120,
            renderText: (value) => value ?? '-',
          },
          {
            title: (
              <FormattedMessage
                id="school.academic.examConnection.weightage"
                defaultMessage="Weightage"
              />
            ),
            dataIndex: 'examWeightage',
            width: 180,
            render: (_, record) => (
              <InputNumber
                min={0}
                max={100}
                precision={2}
                addonAfter="%"
                disabled={!record.isActive}
                value={record.examWeightage}
                onChange={(value) => updateRow(record.examId, { examWeightage: value || 0 })}
              />
            ),
          },
        ]}
        locale={{
          emptyText: intl.formatMessage({
            id: 'school.academic.examConnection.noExams',
            defaultMessage: 'No exams in this group',
          }),
        }}
      />
    </PageContainer>
  );
};

export default ExamConnections;
