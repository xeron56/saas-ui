import {
  FileSearchOutlined,
  FilterOutlined,
  FolderOpenOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { history, useIntl, useParams } from '@umijs/max';
import {
  Button,
  Checkbox,
  Col,
  DatePicker,
  Empty,
  Row,
  Segmented,
  Select,
  Space,
  Table,
  Tag,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import React, { useEffect, useMemo, useState } from 'react';
import { getCustomReport, listCustomReports } from '../Report/service';
import type { ReportCustomTemplate, ReportDuration, ReportFieldDefinition } from '../Report/types';

const { RangePicker } = DatePicker;

const durationOptions: ReportDuration[] = [
  'today',
  'yesterday',
  'last_seven_days',
  'last_thirty_days',
  'current_month',
  'last_month',
  'current_year',
  'custom_date',
];

const panelStyle: React.CSSProperties = {
  marginTop: 16,
  padding: 16,
  background: '#fff',
  border: '1px solid #f0f0f0',
  borderRadius: 8,
};

const CustomReportPage: React.FC = () => {
  const intl = useIntl();
  const params = useParams<{ slug?: string }>();
  const [templates, setTemplates] = useState<ReportCustomTemplate[]>([]);
  const [selectedSlug, setSelectedSlug] = useState<string>();
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [duration, setDuration] = useState<ReportDuration>('last_thirty_days');
  const [customRange, setCustomRange] = useState<[string, string]>();
  const [loading, setLoading] = useState(false);
  const t = (id: string, fallback: string) => intl.formatMessage({ id, defaultMessage: fallback });

  const selectedTemplate = useMemo(
    () => templates.find((template) => template.slug === selectedSlug),
    [selectedSlug, templates],
  );

  const loadTemplates = async (preferredSlug?: string) => {
    setLoading(true);
    try {
      const listResp = await listCustomReports();
      let nextTemplates = listResp.items || listResp.data || [];
      if (preferredSlug) {
        const detail = await getCustomReport(preferredSlug);
        if (detail.data && !nextTemplates.some((template) => template.slug === detail.data?.slug)) {
          nextTemplates = [detail.data, ...nextTemplates];
        }
      }
      setTemplates(nextTemplates);
      const nextSlug =
        preferredSlug && nextTemplates.some((template) => template.slug === preferredSlug)
          ? preferredSlug
          : nextTemplates[0]?.slug;
      setSelectedSlug(nextSlug);
      const nextTemplate = nextTemplates.find((template) => template.slug === nextSlug);
      setSelectedFields(nextTemplate?.default_fields || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTemplates(params.slug);
  }, [params.slug]);

  useEffect(() => {
    if (selectedTemplate) {
      setSelectedFields(selectedTemplate.default_fields || []);
    }
  }, [selectedTemplate?.slug]);

  const openReport = () => {
    if (!selectedTemplate?.route_path) {
      return;
    }
    const query = new URLSearchParams({ duration });
    if (duration === 'custom_date' && customRange?.[0] && customRange?.[1]) {
      query.set('from_date', customRange[0]);
      query.set('to_date', customRange[1]);
    }
    if (selectedFields.length) {
      query.set('fields', selectedFields.map(String).join(','));
    }
    history.push(`${selectedTemplate.route_path}?${query.toString()}`);
  };

  const fieldColumns: ColumnsType<ReportFieldDefinition> = [
    {
      title: t('retail.report.field', 'Field'),
      dataIndex: 'label',
      render: (value: string, record) => value || record.key,
    },
    {
      title: t('retail.report.key', 'Key'),
      dataIndex: 'key',
      width: 240,
      render: (value: string) => <Tag>{value}</Tag>,
    },
    {
      title: t('retail.report.type', 'Type'),
      dataIndex: 'type',
      width: 140,
      render: (value: string) => <Tag color="geekblue">{value || 'string'}</Tag>,
    },
  ];

  return (
    <PageContainer>
      <div style={panelStyle}>
        <Row gutter={[12, 12]} align="middle">
          <Col xs={24} lg={8}>
            <Select
              showSearch
              value={selectedSlug}
              loading={loading}
              style={{ width: '100%' }}
              optionFilterProp="label"
              onChange={(value) => {
                setSelectedSlug(value);
                history.replace(`/retail/reports/custom/${value}`);
              }}
              options={templates.map((template) => ({
                label: template.name || template.slug,
                value: template.slug,
              }))}
            />
          </Col>
          <Col xs={24} lg={10}>
            <Space wrap>
              <Segmented
                value={duration}
                onChange={(value) => setDuration(value as ReportDuration)}
                options={durationOptions.map((value) => ({
                  label: t(`product.report.duration.${value}`, value),
                  value,
                }))}
              />
              {duration === 'custom_date' && (
                <RangePicker onChange={(_, values) => setCustomRange(values as [string, string])} />
              )}
            </Space>
          </Col>
          <Col xs={24} lg={6}>
            <Space wrap>
              <Button
                icon={<ReloadOutlined />}
                loading={loading}
                onClick={() => loadTemplates(selectedSlug)}
              >
                {t('retail.report.refresh', 'Refresh')}
              </Button>
              <Button
                type="primary"
                icon={<FilterOutlined />}
                disabled={!selectedTemplate || (duration === 'custom_date' && !customRange)}
                onClick={openReport}
              >
                {t('retail.report.open', 'Open')}
              </Button>
            </Space>
          </Col>
        </Row>
      </div>

      {selectedTemplate ? (
        <>
          <div style={panelStyle}>
            <Space direction="vertical" size={8}>
              <Space wrap>
                <FileSearchOutlined />
                <strong>{selectedTemplate.name}</strong>
                <Tag color="blue">
                  {selectedTemplate.source_label || selectedTemplate.source_key}
                </Tag>
              </Space>
              <span style={{ color: '#595959' }}>{selectedTemplate.description}</span>
              <Checkbox.Group
                value={selectedFields}
                onChange={(values) => setSelectedFields(values.map(String))}
                options={(selectedTemplate.fields || []).map((field) => ({
                  label: field.label || field.key,
                  value: field.key,
                }))}
              />
            </Space>
          </div>

          <div style={panelStyle}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: 12,
                marginBottom: 12,
              }}
            >
              <Space>
                <FolderOpenOutlined />
                <strong>{t('retail.report.selectedFields', 'Selected fields')}</strong>
              </Space>
              <Tag color="geekblue">{selectedFields.length}</Tag>
            </div>
            <Table<ReportFieldDefinition>
              rowKey="key"
              size="small"
              columns={fieldColumns}
              dataSource={(selectedTemplate.fields || []).filter((field) =>
                selectedFields.includes(field.key),
              )}
              pagination={false}
            />
          </div>
        </>
      ) : (
        <div style={panelStyle}>
          <Empty />
        </div>
      )}
    </PageContainer>
  );
};

export default CustomReportPage;
