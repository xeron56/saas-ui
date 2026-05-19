import { DeleteOutlined, PlusOutlined, ReloadOutlined, SaveOutlined } from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { history, request, useParams } from '@umijs/max';
import {
  Alert,
  Button,
  Col,
  Divider,
  Form,
  Input,
  Row,
  Select,
  Space,
  Spin,
  Typography,
  message as toast,
} from 'antd';
import { useEffect, useMemo, useState } from 'react';

type LegacyRecord = Record<string, any>;

type OptionRow = {
  id?: number | string;
  name?: string;
  short_name?: string;
};

type AlumniEditResponse = {
  user?: LegacyRecord;
  batches?: OptionRow[];
  departments?: OptionRow[];
  passingYears?: OptionRow[];
  passing_years?: OptionRow[];
  status?: boolean;
  message?: string;
};

type InstitutionForm = {
  id?: string;
  degree?: string;
  passing_year?: string;
  institute?: string;
};

type AlumniForm = {
  name?: string;
  nick_name?: string;
  mobile?: string;
  blood_group?: string;
  batch_id?: string;
  department_id?: string;
  passing_year_id?: string;
  date_of_birth?: string;
  about_me?: string;
  linkedin_url?: string;
  facebook_url?: string;
  twitter_url?: string;
  instagram_url?: string;
  company?: string;
  company_designation?: string;
  company_address?: string;
  city?: string;
  state?: string;
  country?: string;
  zip?: string;
  address?: string;
  institutions?: InstitutionForm[];
};

const bloodGroups = ['O-', 'O+', 'A-', 'A+', 'A−', 'B-', 'B+', 'B−', 'AB-', 'AB+'];

function textValue(value: unknown) {
  if (value === null || value === undefined) {
    return '';
  }
  return String(value).trim();
}

function cleanDate(value: unknown) {
  const text = textValue(value);
  if (!text) {
    return '';
  }
  return text.split('T')[0].split(' ')[0];
}

function optionLabel(row: OptionRow) {
  return textValue(row.name) || textValue(row.short_name) || textValue(row.id);
}

function optionValue(row: OptionRow) {
  return textValue(row.id);
}

function field(user: LegacyRecord, alumni: LegacyRecord, key: string) {
  return textValue(user[key]) || textValue(alumni[key]);
}

function formValuesFromUser(user?: LegacyRecord): AlumniForm {
  const current = user || {};
  const alumni = (current.alumni || {}) as LegacyRecord;
  const institutions = Array.isArray(current.institutions) ? current.institutions : [];
  return {
    name: textValue(current.name),
    nick_name: textValue(current.nick_name),
    mobile: textValue(current.mobile || current.phone),
    blood_group: field(current, alumni, 'blood_group'),
    batch_id: field(current, alumni, 'batch_id'),
    department_id: field(current, alumni, 'department_id'),
    passing_year_id: field(current, alumni, 'passing_year_id'),
    date_of_birth: cleanDate(field(current, alumni, 'date_of_birth')),
    about_me: field(current, alumni, 'about_me'),
    linkedin_url: field(current, alumni, 'linkedin_url'),
    facebook_url: field(current, alumni, 'facebook_url'),
    twitter_url: field(current, alumni, 'twitter_url'),
    instagram_url: field(current, alumni, 'instagram_url'),
    company: field(current, alumni, 'company'),
    company_designation: field(current, alumni, 'company_designation'),
    company_address: field(current, alumni, 'company_address'),
    city: field(current, alumni, 'city'),
    state: field(current, alumni, 'state'),
    country: field(current, alumni, 'country'),
    zip: field(current, alumni, 'zip'),
    address: field(current, alumni, 'address'),
    institutions: institutions.map((item: LegacyRecord) => ({
      id: textValue(item.id),
      degree: textValue(item.degree),
      passing_year: textValue(item.passing_year),
      institute: textValue(item.institute),
    })),
  };
}

function legacyPayload(id: string, values: AlumniForm) {
  const institutions = values.institutions || [];
  return {
    id,
    name: textValue(values.name),
    nick_name: textValue(values.nick_name),
    mobile: textValue(values.mobile),
    blood_group: textValue(values.blood_group),
    batch_id: textValue(values.batch_id),
    department_id: textValue(values.department_id),
    passing_year_id: textValue(values.passing_year_id),
    date_of_birth: textValue(values.date_of_birth),
    about_me: textValue(values.about_me),
    linkedin_url: textValue(values.linkedin_url),
    facebook_url: textValue(values.facebook_url),
    twitter_url: textValue(values.twitter_url),
    instagram_url: textValue(values.instagram_url),
    company: textValue(values.company),
    company_designation: textValue(values.company_designation),
    company_address: textValue(values.company_address),
    city: textValue(values.city),
    state: textValue(values.state),
    country: textValue(values.country),
    zip: textValue(values.zip),
    address: textValue(values.address),
    'institution[id][]': institutions.map((item) => textValue(item.id)),
    'institution[degree][]': institutions.map((item) => textValue(item.degree)),
    'institution[passing_year][]': institutions.map((item) => textValue(item.passing_year)),
    'institution[institute][]': institutions.map((item) => textValue(item.institute)),
  };
}

export default function AdminAlumniProfileEdit() {
  const params = useParams();
  const alumniID = textValue(params.id);
  const [form] = Form.useForm<AlumniForm>();
  const [payload, setPayload] = useState<AlumniEditResponse>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const batches = payload.batches || [];
  const departments = payload.departments || [];
  const passingYears = payload.passingYears || payload.passing_years || [];
  const user = payload.user || {};
  const title = useMemo(() => {
    const name = textValue(user.name);
    return name ? `Edit ${name}` : 'Edit Alumni Profile';
  }, [user.name]);

  const loadProfile = () => {
    if (!alumniID) {
      return;
    }
    setLoading(true);
    setError('');
    request<AlumniEditResponse>(`/admin/alumni/alumni-profile-edit/${encodeURIComponent(alumniID)}`)
      .then((response) => {
        setPayload(response || {});
        form.setFieldsValue(formValuesFromUser(response?.user));
      })
      .catch((err) => setError(err?.message || 'Alumni profile could not be loaded.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [alumniID]);

  const saveProfile = async (values: AlumniForm) => {
    if (!alumniID) {
      return;
    }
    setSaving(true);
    setError('');
    try {
      const response = await request<AlumniEditResponse>('/admin/alumni/alumni-profile-update', {
        method: 'POST',
        data: legacyPayload(alumniID, values),
      });
      if (response.status === false) {
        setError(textValue(response.message) || 'Alumni profile could not be updated.');
        return;
      }
      toast.success(textValue(response.message) || 'Alumni profile updated.');
      await loadProfile();
    } catch (err: any) {
      setError(err?.message || 'Alumni profile could not be updated.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageContainer
      title={title}
      onBack={() => history.push('/admin/alumni/list-search-with-filter')}
      extra={
        <Button icon={<ReloadOutlined />} loading={loading} onClick={loadProfile}>
          Refresh
        </Button>
      }
    >
      {error ? <Alert type="error" message={error} showIcon style={{ marginBottom: 16 }} /> : null}
      <Spin spinning={loading}>
        <Form
          form={form}
          layout="vertical"
          onFinish={saveProfile}
          requiredMark={false}
          style={{ maxWidth: 1040 }}
        >
          <Typography.Title level={5}>Personal Info</Typography.Title>
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item name="name" label="Full Name" rules={[{ required: true }]}>
                <Input placeholder="Full name" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="nick_name" label="Nick Name">
                <Input placeholder="Nick name" />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="blood_group" label="Blood Group">
                <Select
                  allowClear
                  options={bloodGroups.map((group) => ({ label: group, value: group }))}
                  placeholder="Blood group"
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="batch_id" label="Batch">
                <Select
                  allowClear
                  options={batches.map((row) => ({
                    label: optionLabel(row),
                    value: optionValue(row),
                  }))}
                  placeholder="Batch"
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="department_id" label="Department">
                <Select
                  allowClear
                  options={departments.map((row) => ({
                    label: optionLabel(row),
                    value: optionValue(row),
                  }))}
                  placeholder="Department"
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="passing_year_id" label="Passing Year">
                <Select
                  allowClear
                  options={passingYears.map((row) => ({
                    label: optionLabel(row),
                    value: optionValue(row),
                  }))}
                  placeholder="Passing year"
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="date_of_birth" label="Birth Date">
                <Input type="date" />
              </Form.Item>
            </Col>
            <Col xs={24}>
              <Form.Item name="about_me" label="About Me">
                <Input.TextArea rows={4} placeholder="About this alumni" />
              </Form.Item>
            </Col>
          </Row>

          <Divider />
          <Typography.Title level={5}>Contact Info</Typography.Title>
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item name="mobile" label="Phone Number">
                <Input placeholder="Phone number" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="Email">
                <Input disabled value={textValue(user.email)} />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="linkedin_url" label="LinkedIn URL">
                <Input placeholder="LinkedIn profile URL" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="facebook_url" label="Facebook URL">
                <Input placeholder="Facebook profile URL" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="twitter_url" label="Twitter URL">
                <Input placeholder="Twitter profile URL" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="instagram_url" label="Instagram URL">
                <Input placeholder="Instagram profile URL" />
              </Form.Item>
            </Col>
          </Row>

          <Divider />
          <Space align="center" style={{ width: '100%', justifyContent: 'space-between' }}>
            <Typography.Title level={5} style={{ marginBottom: 0 }}>
              Educational Info
            </Typography.Title>
          </Space>
          <Form.List name="institutions">
            {(fields, { add, remove }) => (
              <Space direction="vertical" size={12} style={{ width: '100%', marginTop: 12 }}>
                {fields.map((item, index) => (
                  <div
                    key={item.key}
                    style={{
                      border: '1px solid #d9d9d9',
                      borderRadius: 6,
                      padding: 16,
                    }}
                  >
                    <Form.Item name={[item.name, 'id']} hidden>
                      <Input />
                    </Form.Item>
                    <Row gutter={16} align="middle">
                      <Col xs={24} md={7}>
                        <Form.Item name={[item.name, 'degree']} label="Degree">
                          <Input placeholder="Degree" />
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={7}>
                        <Form.Item name={[item.name, 'passing_year']} label="Passing Year">
                          <Input placeholder="Passing year" />
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={7}>
                        <Form.Item name={[item.name, 'institute']} label="Institute">
                          <Input placeholder="Institute" />
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={3}>
                        <Button
                          danger
                          icon={<DeleteOutlined />}
                          onClick={() => remove(item.name)}
                          style={{ marginTop: 6 }}
                        >
                          Delete
                        </Button>
                      </Col>
                    </Row>
                    <Typography.Text type="secondary">Education #{index + 1}</Typography.Text>
                  </div>
                ))}
                <Button
                  icon={<PlusOutlined />}
                  onClick={() => add({ id: '', degree: '', passing_year: '', institute: '' })}
                >
                  Add Education
                </Button>
              </Space>
            )}
          </Form.List>

          <Divider />
          <Typography.Title level={5}>Professional Info</Typography.Title>
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item name="company" label="Company Name">
                <Input placeholder="Current company" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="company_designation" label="Designation">
                <Input placeholder="Current designation" />
              </Form.Item>
            </Col>
            <Col xs={24}>
              <Form.Item name="company_address" label="Company Address">
                <Input placeholder="Company address" />
              </Form.Item>
            </Col>
          </Row>

          <Divider />
          <Typography.Title level={5}>Address</Typography.Title>
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item name="city" label="City">
                <Input placeholder="City" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="state" label="State">
                <Input placeholder="State" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="country" label="Country">
                <Input placeholder="Country" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="zip" label="Zip Code">
                <Input placeholder="Zip code" />
              </Form.Item>
            </Col>
            <Col xs={24}>
              <Form.Item name="address" label="Address">
                <Input placeholder="Address" />
              </Form.Item>
            </Col>
          </Row>

          <Space>
            <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={saving}>
              Save Changes
            </Button>
            <Button onClick={() => history.push('/admin/alumni/list-search-with-filter')}>
              Cancel
            </Button>
          </Space>
        </Form>
      </Spin>
    </PageContainer>
  );
}
