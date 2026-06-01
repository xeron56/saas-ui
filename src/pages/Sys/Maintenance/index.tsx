import {
  CloudSyncOutlined,
  DatabaseOutlined,
  DeleteOutlined,
  FileZipOutlined,
  InboxOutlined,
  SafetyCertificateOutlined,
} from '@ant-design/icons';
import type { ProColumnType } from '@ant-design/pro-components';
import { PageContainer, ProCard, ProTable } from '@ant-design/pro-components';
import { request, useIntl } from '@umijs/max';
import {
  Alert,
  Button,
  Descriptions,
  Form,
  Input,
  message,
  Popconfirm,
  Space,
  Switch,
  Tag,
  Timeline,
  Typography,
  Upload,
} from 'antd';
import React, { useEffect, useState } from 'react';

type UpdateRun = {
  id?: string;
  target_version?: string;
  targetVersion?: string;
  runtime_version?: string;
  runtimeVersion?: string;
  previous_version?: string;
  previousVersion?: string;
  status?: string;
  dry_run?: boolean;
  dryRun?: boolean;
  force?: boolean;
  started_at?: string;
  startedAt?: string;
  finished_at?: string;
  finishedAt?: string;
  error_message?: string;
  errorMessage?: string;
  applied_steps?: Record<string, any>;
  appliedSteps?: Record<string, any>;
};

type StatusReply = {
  runtime_version?: string;
  runtimeVersion?: string;
  current_version?: string;
  currentVersion?: string;
  latest_run?: UpdateRun;
  latestRun?: UpdateRun;
  available_steps?: string[];
  availableSteps?: string[];
  backfill_plan?: BackfillPlanStep[];
  backfillPlan?: BackfillPlanStep[];
};

type RunListReply = {
  data?: UpdateRun[];
  meta?: {
    current_page?: number;
    last_page?: number;
    per_page?: number;
    total?: number;
  };
};

type ApplyReply = StatusReply & {
  target_version?: string;
  targetVersion?: string;
  status?: string;
  dry_run?: boolean;
  dryRun?: boolean;
  steps?: string[];
  run?: UpdateRun;
};

type MaintenanceArchiveReply = {
  message?: string;
  archive_id?: string;
  archiveId?: string;
  file_name?: string;
  fileName?: string;
  created_at?: string;
  createdAt?: string;
  file_count?: number;
  fileCount?: number;
  total_bytes?: number;
  totalBytes?: number;
  staged_path?: string;
  stagedPath?: string;
  feature_enabled?: boolean;
  featureEnabled?: boolean;
  dry_run?: boolean;
  dryRun?: boolean;
  backup_dir?: string;
  backupDir?: string;
  applied_entries?: ArchiveEntry[];
  appliedEntries?: ArchiveEntry[];
  validated_entries?: ArchiveEntry[];
  validatedEntries?: ArchiveEntry[];
  next?: string;
};

type ArchiveEntry = {
  path?: string;
  size?: number;
  hash?: string;
};

type ArchiveListReply = {
  data?: MaintenanceArchiveReply[];
};

type BackfillPlanStep = {
  step?: string;
  label?: string;
  description?: string;
  run_stage?: string;
  runStage?: string;
  source_tables?: string[];
  sourceTables?: string[];
  target_tables?: string[];
  targetTables?: string[];
  idempotent?: boolean;
};

type BackfillPlanReply = {
  data?: BackfillPlanStep[];
  skipped_legacy_flows?: string[];
  skippedLegacyFlows?: string[];
};

const field = <T,>(
  value: Record<string, any> | undefined,
  snake: string,
  camel: string,
): T | undefined => {
  if (!value) {
    return undefined;
  }
  return (value[snake] ?? value[camel]) as T | undefined;
};

const statusColor = (status?: string) => {
  switch (status?.toUpperCase()) {
    case 'SUCCESS':
      return 'green';
    case 'FAILED':
      return 'red';
    case 'RUNNING':
      return 'blue';
    case 'SKIPPED':
      return 'gold';
    default:
      return 'default';
  }
};

const stepStatusColor = (status?: string) => {
  switch (status?.toLowerCase()) {
    case 'success':
      return 'green';
    case 'failed':
      return 'red';
    case 'skipped':
      return 'gold';
    default:
      return 'blue';
  }
};

const prettyStepName = (name: string) => name.replace(/_/g, ' ');

const renderTagList = (values?: string[]) => (
  <Space size={[0, 4]} wrap>
    {(values ?? []).map((value) => (
      <Tag key={value}>{value}</Tag>
    ))}
  </Space>
);

const runStepResults = (run?: UpdateRun) => {
  const applied = field<Record<string, any>>(run, 'applied_steps', 'appliedSteps');
  const stepResults = applied?.step_results ?? applied?.stepResults;
  if (!stepResults || typeof stepResults !== 'object') {
    return [];
  }
  return Object.entries(stepResults).map(([name, raw]) => ({
    name,
    result: (raw || {}) as Record<string, any>,
  }));
};

const renderStepTimeline = (entries: ReturnType<typeof runStepResults>) => (
  <Timeline
    items={entries.map(({ name, result }) => {
      const status = String(result.status || '').toLowerCase();
      const affected = result.affected;
      const messageText = result.message ? String(result.message) : '';
      return {
        color: stepStatusColor(status),
        children: (
          <Space direction="vertical" size={2}>
            <Space wrap>
              <Typography.Text>{prettyStepName(name)}</Typography.Text>
              {status && <Tag color={stepStatusColor(status)}>{status.toUpperCase()}</Tag>}
              {affected !== undefined && <Tag>affected: {String(affected)}</Tag>}
            </Space>
            {messageText && <Typography.Text type="danger">{messageText}</Typography.Text>}
          </Space>
        ),
      };
    })}
  />
);

const MaintenancePage: React.FC = () => {
  const intl = useIntl();
  const [form] = Form.useForm();
  const [status, setStatus] = useState<StatusReply>();
  const [lastApply, setLastApply] = useState<ApplyReply>();
  const [stagedArchive, setStagedArchive] = useState<MaintenanceArchiveReply>();
  const [archiveList, setArchiveList] = useState<MaintenanceArchiveReply[]>([]);
  const [backfillPlan, setBackfillPlan] = useState<BackfillPlanStep[]>([]);
  const [skippedLegacyFlows, setSkippedLegacyFlows] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [applying, setApplying] = useState(false);
  const [archiveUploading, setArchiveUploading] = useState(false);
  const [archiveApplying, setArchiveApplying] = useState(false);

  const loadStatus = async () => {
    setLoading(true);
    try {
      const resp = await request<StatusReply>('/v1/sys/maintenance/update/status');
      setStatus(resp);
      const statusPlan = field<BackfillPlanStep[]>(resp, 'backfill_plan', 'backfillPlan');
      if (statusPlan?.length) {
        setBackfillPlan(statusPlan);
      }
      const runtimeVersion = field<string>(resp, 'runtime_version', 'runtimeVersion');
      if (runtimeVersion && !form.getFieldValue('target_version')) {
        form.setFieldsValue({ target_version: runtimeVersion });
      }
    } finally {
      setLoading(false);
    }
  };

  const loadArchives = async () => {
    const resp = await request<ArchiveListReply>('/v1/sys/maintenance/update/archive');
    setArchiveList(resp.data ?? []);
  };

  const loadBackfillPlan = async () => {
    const resp = await request<BackfillPlanReply>('/v1/sys/maintenance/update/backfill-plan');
    setBackfillPlan(resp.data ?? []);
    setSkippedLegacyFlows(
      field<string[]>(resp, 'skipped_legacy_flows', 'skippedLegacyFlows') ?? [],
    );
  };

  useEffect(() => {
    loadStatus();
    loadArchives();
    loadBackfillPlan();
  }, []);

  const latestRun = field<UpdateRun>(status, 'latest_run', 'latestRun');
  const currentVersion = field<string>(status, 'current_version', 'currentVersion') || '-';
  const runtimeVersion = field<string>(status, 'runtime_version', 'runtimeVersion') || '-';
  const steps = field<string[]>(status, 'available_steps', 'availableSteps') || [];
  const latestStatus = field<string>(latestRun, 'status', 'status');
  const latestStepResults = runStepResults(latestRun);
  const stagedArchiveId = field<string>(stagedArchive, 'archive_id', 'archiveId');
  const stagedArchiveName = field<string>(stagedArchive, 'file_name', 'fileName') || '-';
  const stagedArchiveCount = field<number>(stagedArchive, 'file_count', 'fileCount');
  const stagedArchiveBytes = field<number>(stagedArchive, 'total_bytes', 'totalBytes');
  const stagedArchiveCreatedAt = field<string>(stagedArchive, 'created_at', 'createdAt');
  const stagedArchiveBackupDir = field<string>(stagedArchive, 'backup_dir', 'backupDir');
  const stagedArchiveEntries =
    field<ArchiveEntry[]>(stagedArchive, 'validated_entries', 'validatedEntries') ?? [];
  const stagedArchiveAppliedEntries =
    field<ArchiveEntry[]>(stagedArchive, 'applied_entries', 'appliedEntries') ?? [];
  const archiveFeatureEnabled =
    field<boolean>(stagedArchive, 'feature_enabled', 'featureEnabled') ?? false;
  const applyArchive = async (dryRun: boolean) => {
    if (!stagedArchiveId) {
      message.warning('Upload an archive first.');
      return;
    }
    setArchiveApplying(true);
    try {
      const resp = await request<MaintenanceArchiveReply>(
        `/v1/sys/maintenance/update/archive/${encodeURIComponent(stagedArchiveId)}/apply`,
        {
          method: 'POST',
          data: {
            target_version: form.getFieldValue('target_version'),
            dry_run: dryRun,
            force: form.getFieldValue('force'),
          },
        },
      );
      setStagedArchive(resp);
      await loadArchives();
      message.success(resp.message || 'Archive request completed.');
    } finally {
      setArchiveApplying(false);
    }
  };

  const deleteArchive = async (archiveId?: string) => {
    if (!archiveId) {
      return;
    }
    await request<MaintenanceArchiveReply>(
      `/v1/sys/maintenance/update/archive/${encodeURIComponent(archiveId)}`,
      { method: 'DELETE' },
    );
    if (stagedArchiveId === archiveId) {
      setStagedArchive(undefined);
    }
    await loadArchives();
    message.success('Archive removed.');
  };

  const archiveColumns: ProColumnType<MaintenanceArchiveReply>[] = [
    {
      title: 'Archive',
      dataIndex: 'file_name',
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Typography.Text>
            <FileZipOutlined /> {field<string>(record, 'file_name', 'fileName') || '-'}
          </Typography.Text>
          <Typography.Text type="secondary" copyable>
            {field<string>(record, 'archive_id', 'archiveId')}
          </Typography.Text>
        </Space>
      ),
    },
    {
      title: 'Created',
      dataIndex: 'created_at',
      valueType: 'dateTime',
      renderText: (_, record) => field<string>(record, 'created_at', 'createdAt'),
    },
    {
      title: 'Files',
      dataIndex: 'file_count',
      renderText: (_, record) => field<number>(record, 'file_count', 'fileCount') ?? 0,
    },
    {
      title: 'Bytes',
      dataIndex: 'total_bytes',
      renderText: (_, record) => field<number>(record, 'total_bytes', 'totalBytes') ?? 0,
    },
    {
      title: 'Action',
      valueType: 'option',
      render: (_, record) => {
        const archiveId = field<string>(record, 'archive_id', 'archiveId');
        return [
          <a key="select" onClick={() => setStagedArchive(record)}>
            Select
          </a>,
          <Popconfirm
            key="delete"
            title="Remove staged archive?"
            onConfirm={() => deleteArchive(archiveId)}
          >
            <a>
              <DeleteOutlined /> Remove
            </a>
          </Popconfirm>,
        ];
      },
    },
  ];

  const archiveEntryColumns: ProColumnType<ArchiveEntry>[] = [
    { title: 'Path', dataIndex: 'path', ellipsis: true },
    { title: 'Size', dataIndex: 'size', width: 100 },
    { title: 'SHA-256', dataIndex: 'hash', ellipsis: true },
  ];

  const backfillPlanColumns: ProColumnType<BackfillPlanStep>[] = [
    {
      title: 'Step',
      dataIndex: 'label',
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Typography.Text>{record.label || prettyStepName(record.step || '')}</Typography.Text>
          <Typography.Text type="secondary">{record.step}</Typography.Text>
        </Space>
      ),
    },
    {
      title: 'Source',
      dataIndex: 'source_tables',
      render: (_, record) =>
        renderTagList(field<string[]>(record, 'source_tables', 'sourceTables')),
    },
    {
      title: 'Target',
      dataIndex: 'target_tables',
      render: (_, record) =>
        renderTagList(field<string[]>(record, 'target_tables', 'targetTables')),
    },
    {
      title: 'Stage',
      dataIndex: 'run_stage',
      render: (_, record) => (
        <Tag color="blue">{field<string>(record, 'run_stage', 'runStage') || '-'}</Tag>
      ),
    },
    {
      title: 'Safe rerun',
      dataIndex: 'idempotent',
      render: (_, record) => (
        <Tag color={record.idempotent ? 'green' : 'gold'}>
          {record.idempotent ? 'YES' : 'CHECK'}
        </Tag>
      ),
    },
    {
      title: 'Notes',
      dataIndex: 'description',
      ellipsis: true,
    },
  ];

  const runColumns: ProColumnType<UpdateRun>[] = [
    {
      title: 'Status',
      dataIndex: 'status',
      render: (_, record) => (
        <Tag color={statusColor(field<string>(record, 'status', 'status'))}>
          {field<string>(record, 'status', 'status') || '-'}
        </Tag>
      ),
    },
    {
      title: 'Target',
      dataIndex: 'target_version',
      render: (_, record) => field<string>(record, 'target_version', 'targetVersion') || '-',
    },
    {
      title: 'Previous',
      dataIndex: 'previous_version',
      render: (_, record) => field<string>(record, 'previous_version', 'previousVersion') || '-',
    },
    {
      title: 'Started',
      dataIndex: 'started_at',
      valueType: 'dateTime',
      renderText: (_, record) => field<string>(record, 'started_at', 'startedAt'),
    },
    {
      title: 'Finished',
      dataIndex: 'finished_at',
      valueType: 'dateTime',
      renderText: (_, record) => field<string>(record, 'finished_at', 'finishedAt'),
    },
    {
      title: 'Dry run',
      dataIndex: 'dry_run',
      valueType: 'switch',
      renderText: (_, record) => field<boolean>(record, 'dry_run', 'dryRun'),
    },
  ];

  return (
    <PageContainer>
      <ProCard split="vertical" gutter={12}>
        <ProCard colSpan="60%" title="System Update" loading={loading}>
          <Space direction="vertical" size={16} style={{ width: '100%' }}>
            <Alert
              type="info"
              showIcon
              icon={<SafetyCertificateOutlined />}
              message="Host maintenance"
            />
            <Descriptions bordered column={1} size="small">
              <Descriptions.Item label="Current version">{currentVersion}</Descriptions.Item>
              <Descriptions.Item label="Runtime version">{runtimeVersion}</Descriptions.Item>
              <Descriptions.Item label="Latest status">
                <Tag color={statusColor(latestStatus)}>{latestStatus || 'NOT RUN'}</Tag>
              </Descriptions.Item>
            </Descriptions>
            <Form
              form={form}
              layout="vertical"
              initialValues={{ dry_run: true, force: false }}
              onFinish={async (values) => {
                setApplying(true);
                try {
                  const resp = await request<ApplyReply>('/v1/sys/maintenance/update', {
                    method: 'POST',
                    data: {
                      target_version: values.target_version,
                      dry_run: values.dry_run,
                      force: values.force,
                    },
                  });
                  setLastApply(resp);
                  message.success(
                    intl.formatMessage({
                      id: 'sys.maintenance.update.submitted',
                      defaultMessage: 'Maintenance request completed.',
                    }),
                  );
                  await Promise.all([loadStatus(), loadBackfillPlan()]);
                } finally {
                  setApplying(false);
                }
              }}
            >
              <Form.Item
                name="target_version"
                label="Target version"
                rules={[{ required: true, whitespace: true }]}
              >
                <Input placeholder="6.1.0" />
              </Form.Item>
              <Form.Item name="dry_run" label="Dry run" valuePropName="checked">
                <Switch />
              </Form.Item>
              <Form.Item name="force" label="Force rerun" valuePropName="checked">
                <Switch />
              </Form.Item>
              <Space>
                <Button
                  type="primary"
                  icon={<CloudSyncOutlined />}
                  loading={applying}
                  onClick={() => form.submit()}
                >
                  Run update
                </Button>
                <Button
                  loading={loading}
                  onClick={async () => {
                    await Promise.all([loadStatus(), loadBackfillPlan()]);
                  }}
                >
                  Refresh
                </Button>
              </Space>
            </Form>
            <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: 16 }}>
              <Space direction="vertical" size={12} style={{ width: '100%' }}>
                <Typography.Title level={5} style={{ margin: 0 }}>
                  Code Archive
                </Typography.Title>
                <Upload.Dragger
                  maxCount={1}
                  accept=".zip"
                  showUploadList={false}
                  disabled={archiveUploading || archiveApplying}
                  beforeUpload={async (file) => {
                    if (!file.name.toLowerCase().endsWith('.zip')) {
                      message.error('ZIP archive required.');
                      return Upload.LIST_IGNORE;
                    }
                    const data = new FormData();
                    data.append('file', file);
                    setArchiveUploading(true);
                    try {
                      const resp = await request<MaintenanceArchiveReply>(
                        '/v1/sys/maintenance/update/archive',
                        {
                          method: 'POST',
                          data,
                        },
                      );
                      setStagedArchive(resp);
                      await loadArchives();
                      message.success(resp.message || 'Archive staged.');
                    } finally {
                      setArchiveUploading(false);
                    }
                    return Upload.LIST_IGNORE;
                  }}
                >
                  <p className="ant-upload-drag-icon">
                    <InboxOutlined />
                  </p>
                  <p className="ant-upload-text">Stage update ZIP</p>
                </Upload.Dragger>
                {stagedArchive && (
                  <Descriptions bordered column={1} size="small">
                    <Descriptions.Item label="Archive">{stagedArchiveName}</Descriptions.Item>
                    <Descriptions.Item label="Created">
                      {stagedArchiveCreatedAt || '-'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Files">{stagedArchiveCount ?? 0}</Descriptions.Item>
                    <Descriptions.Item label="Bytes">{stagedArchiveBytes ?? 0}</Descriptions.Item>
                    {stagedArchiveBackupDir && (
                      <Descriptions.Item label="Backup">{stagedArchiveBackupDir}</Descriptions.Item>
                    )}
                    <Descriptions.Item label="Apply enabled">
                      <Tag color={archiveFeatureEnabled ? 'green' : 'gold'}>
                        {archiveFeatureEnabled ? 'YES' : 'NO'}
                      </Tag>
                    </Descriptions.Item>
                  </Descriptions>
                )}
                <Space wrap>
                  <Button
                    disabled={!stagedArchiveId || !archiveFeatureEnabled}
                    loading={archiveApplying}
                    onClick={() => applyArchive(true)}
                  >
                    Dry run archive
                  </Button>
                  <Button
                    type="primary"
                    disabled={!stagedArchiveId || !archiveFeatureEnabled}
                    loading={archiveApplying}
                    onClick={() => applyArchive(false)}
                  >
                    Apply archive
                  </Button>
                </Space>
                {!!stagedArchiveEntries.length && (
                  <ProTable<ArchiveEntry>
                    rowKey="path"
                    search={false}
                    size="small"
                    options={false}
                    pagination={{ pageSize: 5 }}
                    dataSource={
                      stagedArchiveAppliedEntries.length
                        ? stagedArchiveAppliedEntries
                        : stagedArchiveEntries
                    }
                    columns={archiveEntryColumns}
                  />
                )}
                <ProTable<MaintenanceArchiveReply>
                  rowKey={(record) => field<string>(record, 'archive_id', 'archiveId') || ''}
                  headerTitle="Staged Archives"
                  search={false}
                  size="small"
                  options={false}
                  pagination={false}
                  dataSource={archiveList}
                  columns={archiveColumns}
                />
              </Space>
            </div>
          </Space>
        </ProCard>
        <ProCard title="Update Steps">
          {latestStepResults.length > 0 ? (
            renderStepTimeline(latestStepResults)
          ) : (
            <Timeline
              items={steps.map((step) => ({
                color: 'blue',
                children: step,
              }))}
            />
          )}
          {lastApply && (
            <Descriptions bordered column={1} size="small">
              <Descriptions.Item label="Last request">
                <Tag color={statusColor(field<string>(lastApply, 'status', 'status'))}>
                  {field<string>(lastApply, 'status', 'status') || '-'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Target">
                {field<string>(lastApply, 'target_version', 'targetVersion') || '-'}
              </Descriptions.Item>
            </Descriptions>
          )}
        </ProCard>
      </ProCard>
      <ProCard title="Backfill Plan" style={{ marginTop: 16 }}>
        <ProTable<BackfillPlanStep>
          rowKey={(record) => record.step || record.label || ''}
          headerTitle={
            <Space>
              <DatabaseOutlined />
              Data Mapping
            </Space>
          }
          search={false}
          size="small"
          options={false}
          pagination={false}
          dataSource={backfillPlan}
          columns={backfillPlanColumns}
        />
        {!!skippedLegacyFlows.length && (
          <Descriptions bordered column={1} size="small" style={{ marginTop: 12 }}>
            <Descriptions.Item label="Skipped legacy flows">
              {renderTagList(skippedLegacyFlows)}
            </Descriptions.Item>
          </Descriptions>
        )}
      </ProCard>
      <ProCard title="Update History" style={{ marginTop: 16 }}>
        <ProTable<UpdateRun>
          rowKey="id"
          search={false}
          columns={runColumns}
          expandable={{
            expandedRowRender: (record) => {
              const entries = runStepResults(record);
              if (entries.length === 0) {
                return <Typography.Text type="secondary">-</Typography.Text>;
              }
              return renderStepTimeline(entries);
            },
          }}
          pagination={{ defaultPageSize: 10 }}
          request={async (params) => {
            const resp = await request<RunListReply>('/v1/sys/maintenance/update/runs', {
              params: {
                page: params.current,
                per_page: params.pageSize,
              },
            });
            return {
              data: resp.data ?? [],
              success: true,
              total: resp.meta?.total ?? 0,
            };
          }}
        />
      </ProCard>
    </PageContainer>
  );
};

export default MaintenancePage;
