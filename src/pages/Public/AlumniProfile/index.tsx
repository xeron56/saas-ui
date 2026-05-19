import { Link, useParams } from '@umijs/max';
import { Alert, Button, Empty, Spin, Tag } from 'antd';
import {
  ArrowLeftOutlined,
  BankOutlined,
  CalendarOutlined,
  EnvironmentOutlined,
  FacebookOutlined,
  IdcardOutlined,
  InstagramOutlined,
  LinkedinOutlined,
  MailOutlined,
  PhoneOutlined,
  TwitterOutlined,
} from '@ant-design/icons';
import { useEffect, useMemo, useState } from 'react';
import { contentImage, contentTitle, recordFromPayload, textValue } from '../content';
import PublicShell from '../PublicShell';
import { fetchPublicContent } from '../services';
import type { LegacyPayload, LegacyRecord } from '../types';

function firstText(...values: any[]) {
  for (const value of values) {
    const text = textValue(value);
    if (text) {
      return text;
    }
  }
  return '';
}

function visibleFlag(value: any) {
  return Number(value || 0) === 1;
}

function plainText(value: any) {
  return textValue(value)
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function customFieldRows(raw: any): Array<[string, any]> {
  if (!raw) {
    return [];
  }
  try {
    const fields = typeof raw === 'string' ? JSON.parse(raw) : raw;
    if (!Array.isArray(fields)) {
      return [];
    }
    return fields
      .map((field, index): [string, string] => {
        const label =
          textValue(field?.label) || textValue(field?.name) || `Custom Field ${index + 1}`;
        const userData = Array.isArray(field?.userData)
          ? field.userData.map(textValue).filter(Boolean).join(', ')
          : textValue(field?.userData ?? field?.value);
        return [label, userData];
      })
      .filter(([, value]) => textValue(value));
  } catch {
    return [];
  }
}

function InfoRows({ rows }: { rows: Array<[string, any]> }) {
  const visibleRows = rows.filter(([, value]) => textValue(value));
  if (visibleRows.length === 0) {
    return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />;
  }
  return (
    <dl className="public-profile-info">
      {visibleRows.map(([label, value]) => (
        <div key={label}>
          <dt>{label}</dt>
          <dd>{textValue(value)}</dd>
        </div>
      ))}
    </dl>
  );
}

function SocialLinks({ alumni }: { alumni: LegacyRecord }) {
  const links = [
    { key: 'facebook_url', icon: <FacebookOutlined />, label: 'Facebook' },
    { key: 'twitter_url', icon: <TwitterOutlined />, label: 'Twitter' },
    { key: 'linkedin_url', icon: <LinkedinOutlined />, label: 'LinkedIn' },
    { key: 'instagram_url', icon: <InstagramOutlined />, label: 'Instagram' },
  ];
  const visibleLinks = links.filter((item) => textValue(alumni?.[item.key]));
  if (visibleLinks.length === 0) {
    return null;
  }
  return (
    <div className="public-profile-social">
      {visibleLinks.map((item) => (
        <Button
          aria-label={item.label}
          href={textValue(alumni[item.key])}
          icon={item.icon}
          key={item.key}
          rel="noreferrer"
          shape="circle"
          target="_blank"
        />
      ))}
    </div>
  );
}

export default function AlumniProfile() {
  const params = useParams();
  const id = params.id;
  const [payload, setPayload] = useState<LegacyPayload>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    fetchPublicContent(`/alumni/profile/${encodeURIComponent(id)}`)
      .then((data) => setPayload(data))
      .catch((err) => setError(err?.message || 'Unable to load alumni profile.'))
      .finally(() => setLoading(false));
  }, [id]);

  const profile = useMemo(() => recordFromPayload(payload, 'alumni'), [payload]);
  const alumni = (profile?.alumni || {}) as LegacyRecord;
  const regForm = ((payload as LegacyRecord)?.reg_form ||
    (payload as LegacyRecord)?.regForm ||
    {}) as LegacyRecord;
  const institutions = Array.isArray(profile?.institutions) ? profile?.institutions : [];
  const membership = (profile?.current_membership ||
    profile?.currentMembership ||
    {}) as LegacyRecord;
  const title = profile ? contentTitle(profile) : 'Alumni Profile';
  const image = contentImage(profile);
  const designation = firstText(profile?.designation, alumni.company_designation);
  const company = firstText(profile?.company, alumni.company);
  const location = firstText(
    profile?.location,
    [alumni.city, alumni.state, alumni.country].map(textValue).filter(Boolean).join(', '),
  );
  const bio = plainText(profile?.bio || alumni.about_me);
  const dynamicRows = customFieldRows(alumni.custom_fields);

  const personalRows: Array<[string, any]> = [
    ['Full Name', profile?.name],
    ['Nick Name', profile?.nick_name],
    ['Email', visibleFlag(profile?.show_email_in_public) ? profile?.email : ''],
    ['Phone', visibleFlag(profile?.show_phone_in_public) ? profile?.mobile : ''],
    [
      'Batch',
      visibleFlag(regForm.enable_batch) ? firstText(profile?.batch_name, alumni.batch?.name) : '',
    ],
    [
      'Department',
      visibleFlag(regForm.enable_department)
        ? firstText(profile?.department_name, alumni.department?.name)
        : '',
    ],
    [
      'Passing Year',
      visibleFlag(regForm.enable_passing_year)
        ? firstText(profile?.passing_year_name, alumni.passing_year?.name)
        : '',
    ],
    ['Roll Number', visibleFlag(regForm.enable_role_number) ? alumni.id_number : ''],
    ['Blood Group', visibleFlag(regForm.enable_blood_group) ? alumni.blood_group : ''],
    ['Date of Birth', visibleFlag(regForm.enable_date_of_birth) ? alumni.date_of_birth : ''],
    ['Gender', visibleFlag(regForm.enable_gender) ? alumni.gender : ''],
    ['City', alumni.city],
    ['State', alumni.state],
    ['Country', alumni.country],
    ['Zip Code', alumni.zip],
    ...dynamicRows,
  ];

  return (
    <PublicShell title={title} description="Alumni profile">
      {error ? <Alert type="error" message={error} showIcon style={{ marginBottom: 16 }} /> : null}
      <Spin spinning={loading}>
        {!profile && !loading ? <Empty /> : null}
        {profile ? (
          <article className="public-profile">
            <section className="public-profile-summary">
              <Link to="/all-alumni">
                <Button icon={<ArrowLeftOutlined />}>Back</Button>
              </Link>
              <div className="public-profile-head">
                <div className="public-profile-photo">
                  {image ? <img alt={title} src={image} /> : title.slice(0, 1)}
                </div>
                <div>
                  <h2>{title}</h2>
                  {designation ? <p>{designation}</p> : null}
                  <div className="public-meta">
                    {company ? <Tag icon={<BankOutlined />}>{company}</Tag> : null}
                    {location ? <Tag icon={<EnvironmentOutlined />}>{location}</Tag> : null}
                    {textValue(membership.membership_title) ? (
                      <Tag icon={<IdcardOutlined />}>{textValue(membership.membership_title)}</Tag>
                    ) : null}
                  </div>
                  <SocialLinks alumni={alumni} />
                </div>
              </div>
              <div className="public-profile-contact">
                {textValue(profile.email) ? (
                  <Tag icon={<MailOutlined />}>{textValue(profile.email)}</Tag>
                ) : null}
                {textValue(profile.mobile) ? (
                  <Tag icon={<PhoneOutlined />}>{textValue(profile.mobile)}</Tag>
                ) : null}
              </div>
            </section>

            <section className="public-profile-section">
              <h3>Profile Bio</h3>
              {bio ? <p>{bio}</p> : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />}
            </section>

            <section className="public-profile-layout">
              <div className="public-profile-section">
                <h3>Personal Info</h3>
                <InfoRows rows={personalRows} />
              </div>
              <div className="public-profile-section">
                <h3>Educational Info</h3>
                {institutions.length === 0 ? <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} /> : null}
                <div className="public-profile-list">
                  {institutions.map((institution, index) => (
                    <div key={textValue(institution.id) || index}>
                      <strong>{textValue(institution.degree)}</strong>
                      <span>{textValue(institution.institute)}</span>
                      {textValue(institution.passing_year) ? (
                        <Tag icon={<CalendarOutlined />}>{textValue(institution.passing_year)}</Tag>
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>
              <div className="public-profile-section">
                <h3>Professional Info</h3>
                <InfoRows
                  rows={[
                    ['Company Name', company],
                    ['Designation', designation],
                    ['Office Address', alumni.company_address],
                  ]}
                />
              </div>
            </section>
          </article>
        ) : null}
      </Spin>
    </PublicShell>
  );
}
