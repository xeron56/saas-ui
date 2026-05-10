import { ProFormDatePicker, ProFormSwitch, ProFormText } from '@ant-design/pro-components';
import { FormattedMessage } from '@umijs/max';
import React from 'react';
import type { V1Staff } from '@gosaas/api';
import { StaffServiceApi } from '@gosaas/api';
import ReferencePage from '../../Student/components/ReferencePage';

const service = new StaffServiceApi();

const StaffDirectory: React.FC = () => (
  <ReferencePage<V1Staff>
    columns={[
      {
        title: <FormattedMessage id="school.staff.employeeId" defaultMessage="Employee ID" />,
        dataIndex: 'employeeId',
      },
      {
        title: <FormattedMessage id="school.staff.firstName" defaultMessage="First Name" />,
        dataIndex: 'firstName',
      },
      {
        title: <FormattedMessage id="school.staff.lastName" defaultMessage="Last Name" />,
        dataIndex: 'lastName',
      },
      {
        title: <FormattedMessage id="school.staff.roleName" defaultMessage="Role" />,
        dataIndex: 'roleName',
      },
      {
        title: <FormattedMessage id="school.staff.contactNo" defaultMessage="Contact No." />,
        dataIndex: 'contactNo',
      },
      {
        title: <FormattedMessage id="school.staff.email" defaultMessage="Email" />,
        dataIndex: 'email',
      },
      {
        title: <FormattedMessage id="school.staff.isActive" defaultMessage="Active" />,
        dataIndex: 'isActive',
        valueType: 'switch',
      },
    ]}
    create={(fields) =>
      service.staffServiceCreateStaff({
        body: {
          employeeId: fields.employeeId,
          firstName: fields.firstName,
          lastName: fields.lastName,
          roleName: fields.roleName,
          gender: fields.gender,
          dob: fields.dob,
          dateOfJoining: fields.dateOfJoining,
          contactNo: fields.contactNo,
          email: fields.email,
          qualification: fields.qualification,
          workExperience: fields.workExperience,
          localAddress: fields.localAddress,
          permanentAddress: fields.permanentAddress,
          note: fields.note,
        },
      })
    }
    delete={(record) => service.staffServiceDeleteStaff({ id: record.id! })}
    formItems={
      <>
        <ProFormText
          name="employeeId"
          label={<FormattedMessage id="school.staff.employeeId" defaultMessage="Employee ID" />}
          rules={[{ required: true }]}
        />
        <ProFormText
          name="firstName"
          label={<FormattedMessage id="school.staff.firstName" defaultMessage="First Name" />}
          rules={[{ required: true }]}
        />
        <ProFormText
          name="lastName"
          label={<FormattedMessage id="school.staff.lastName" defaultMessage="Last Name" />}
        />
        <ProFormText
          name="roleName"
          label={<FormattedMessage id="school.staff.roleName" defaultMessage="Role" />}
          rules={[{ required: true }]}
        />
        <ProFormText
          name="gender"
          label={<FormattedMessage id="school.staff.gender" defaultMessage="Gender" />}
        />
        <ProFormDatePicker
          name="dob"
          label={<FormattedMessage id="school.staff.dob" defaultMessage="Date of Birth" />}
        />
        <ProFormDatePicker
          name="dateOfJoining"
          label={
            <FormattedMessage id="school.staff.dateOfJoining" defaultMessage="Date of Joining" />
          }
        />
        <ProFormText
          name="contactNo"
          label={<FormattedMessage id="school.staff.contactNo" defaultMessage="Contact No." />}
        />
        <ProFormText
          name="email"
          label={<FormattedMessage id="school.staff.email" defaultMessage="Email" />}
        />
        <ProFormText
          name="qualification"
          label={
            <FormattedMessage id="school.staff.qualification" defaultMessage="Qualification" />
          }
        />
        <ProFormText
          name="workExperience"
          label={
            <FormattedMessage id="school.staff.workExperience" defaultMessage="Work Experience" />
          }
        />
        <ProFormText
          name="localAddress"
          label={<FormattedMessage id="school.staff.localAddress" defaultMessage="Local Address" />}
        />
        <ProFormText
          name="permanentAddress"
          label={
            <FormattedMessage
              id="school.staff.permanentAddress"
              defaultMessage="Permanent Address"
            />
          }
        />
        <ProFormText
          name="note"
          label={<FormattedMessage id="school.staff.note" defaultMessage="Note" />}
        />
        <ProFormSwitch
          name="isActive"
          label={<FormattedMessage id="school.staff.isActive" defaultMessage="Active" />}
          initialValue
        />
      </>
    }
    get={async (id) => (await service.staffServiceGetStaff({ id })).data}
    list={async (req) => (await service.staffServiceListStaff2({ body: req })).data}
    title={(record) =>
      [record.employeeId, record.firstName, record.lastName].filter(Boolean).join(' ')
    }
    update={(record, fields) =>
      service.staffServiceUpdateStaff({
        staffId: record.id!,
        body: {
          staff: {
            id: record.id!,
            employeeId: fields.employeeId,
            firstName: fields.firstName,
            lastName: fields.lastName,
            roleName: fields.roleName,
            gender: fields.gender,
            dob: fields.dob,
            dateOfJoining: fields.dateOfJoining,
            contactNo: fields.contactNo,
            email: fields.email,
            qualification: fields.qualification,
            workExperience: fields.workExperience,
            localAddress: fields.localAddress,
            permanentAddress: fields.permanentAddress,
            note: fields.note,
            isActive: fields.isActive,
          },
        },
      })
    }
  />
);

export default StaffDirectory;
