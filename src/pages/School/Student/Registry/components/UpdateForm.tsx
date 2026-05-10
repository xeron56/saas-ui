import type { ProFormInstance } from '@ant-design/pro-components';
import {
  DrawerForm,
  ProFormDatePicker,
  ProFormSelect,
  ProFormSwitch,
  ProFormText,
  ProFormTextArea,
} from '@ant-design/pro-components';
import { useIntl } from '@umijs/max';
import React, { useEffect, useRef } from 'react';
import type { V1CreateStudentRequest, V1Student, V1UpdateStudent } from '@gosaas/api';
import {
  ClassSectionServiceApi,
  HostelRoomServiceApi,
  RoutePickupPointServiceApi,
  StudentCategoryServiceApi,
  StudentHouseServiceApi,
  StudentServiceApi,
  VehicleRouteServiceApi,
} from '@gosaas/api';
import { dateUtil } from '@gosaas/core';

const service = new StudentServiceApi();
const classSectionService = new ClassSectionServiceApi();
const categoryService = new StudentCategoryServiceApi();
const houseService = new StudentHouseServiceApi();
const routePickupPointService = new RoutePickupPointServiceApi();
const vehicleRouteService = new VehicleRouteServiceApi();
const hostelRoomService = new HostelRoomServiceApi();

export type FormValueType = V1CreateStudentRequest & V1UpdateStudent;

export type UpdateFormProps = {
  onCancel: (flag?: boolean, formVals?: FormValueType) => void;
  onSubmit: (values: FormValueType) => Promise<void>;
  updateModalVisible: boolean;
  values: V1Student;
};

const toClassSectionOptions = (items: Array<{ id?: string; code?: string }> = []) =>
  items.map((item) => ({
    label: item.code || item.id,
    value: item.id,
  }));

const toNamedOptions = (items: Array<{ id?: string; name?: string }> = []) =>
  items.map((item) => ({
    label: item.name || item.id,
    value: item.id,
  }));

const toStudentOptions = (items: V1Student[] = [], currentId?: string) =>
  items
    .filter((item) => item.id && item.id !== currentId)
    .map((item) => ({
      label: [item.admissionNo, item.firstName, item.lastName].filter(Boolean).join(' - '),
      value: item.id,
    }));

const toRoutePickupPointOptions = (
  items: Array<{
    id?: string;
    transportRouteId?: string;
    pickupPointId?: string;
    pickupTime?: string;
  }> = [],
) =>
  items.map((item) => ({
    label: [item.transportRouteId, item.pickupPointId, item.pickupTime].filter(Boolean).join(' - '),
    value: item.id,
  }));

const toVehicleRouteOptions = (
  items: Array<{ id?: string; transportRouteId?: string; vehicleId?: string }> = [],
) =>
  items.map((item) => ({
    label: [item.transportRouteId, item.vehicleId].filter(Boolean).join(' - ') || item.id,
    value: item.id,
  }));

const toHostelRoomOptions = (items: Array<{ id?: string; roomNo?: string; title?: string }> = []) =>
  items.map((item) => ({
    label: [item.roomNo, item.title].filter(Boolean).join(' - ') || item.id,
    value: item.id,
  }));

const normalizeStudent = (student?: V1Student) => ({
  ...student,
  classSectionId: student?.enrollment?.classSectionId,
  rollNo: student?.enrollment?.rollNo || student?.rollNo,
  routePickupPointId: student?.enrollment?.routePickupPointId,
  vehicleRouteId: student?.enrollment?.vehicleRouteId,
  hostelRoomId: student?.enrollment?.hostelRoomId,
});

const normalizeDate = (value?: string | null) =>
  value ? dateUtil(value).toISOString() : undefined;

const UpdateForm: React.FC<UpdateFormProps> = (props) => {
  const intl = useIntl();
  const formRef = useRef<ProFormInstance>();

  useEffect(() => {
    if (props.values?.id && props.updateModalVisible) {
      service.studentServiceGetStudent({ id: props.values.id }).then((resp) => {
        formRef?.current?.setFieldsValue(normalizeStudent(resp.data));
      });
    }
  }, [props]);

  return (
    <DrawerForm
      formRef={formRef}
      initialValues={normalizeStudent(props.values)}
      open={props.updateModalVisible}
      onFinish={async (formData) => {
        const data = formData as FormValueType;
        await props.onSubmit({
          ...data,
          id: props.values?.id,
          dob: normalizeDate(data.dob),
          admissionDate: normalizeDate(data.admissionDate),
        });
      }}
      drawerProps={{
        onClose: () => {
          props.onCancel();
        },
        destroyOnClose: true,
      }}
    >
      <ProFormText
        name="admissionNo"
        label={intl.formatMessage({
          id: 'school.student.admissionNo',
          defaultMessage: 'Admission No.',
        })}
        rules={[{ required: true }]}
      />
      <ProFormText
        name="rollNo"
        label={intl.formatMessage({ id: 'school.student.rollNo', defaultMessage: 'Roll No.' })}
      />
      <ProFormSelect
        name="classSectionId"
        label={intl.formatMessage({
          id: 'school.student.classSection',
          defaultMessage: 'Class Section',
        })}
        rules={[{ required: true }]}
        request={async () => {
          const resp = await classSectionService.classSectionServiceListClassSection2({
            body: { pageSize: 100, sort: ['code'] },
          });
          return toClassSectionOptions(resp.data.items);
        }}
      />
      <ProFormText
        name="firstName"
        label={intl.formatMessage({ id: 'school.student.firstName', defaultMessage: 'First Name' })}
        rules={[{ required: true }]}
      />
      <ProFormText
        name="middleName"
        label={intl.formatMessage({
          id: 'school.student.middleName',
          defaultMessage: 'Middle Name',
        })}
      />
      <ProFormText
        name="lastName"
        label={intl.formatMessage({ id: 'school.student.lastName', defaultMessage: 'Last Name' })}
      />
      <ProFormSelect
        name="gender"
        label={intl.formatMessage({ id: 'school.student.gender', defaultMessage: 'Gender' })}
        valueEnum={{
          Male: {
            text: intl.formatMessage({ id: 'school.student.gender.male', defaultMessage: 'Male' }),
          },
          Female: {
            text: intl.formatMessage({
              id: 'school.student.gender.female',
              defaultMessage: 'Female',
            }),
          },
          Other: {
            text: intl.formatMessage({
              id: 'school.student.gender.other',
              defaultMessage: 'Other',
            }),
          },
        }}
      />
      <ProFormDatePicker
        name="dob"
        label={intl.formatMessage({ id: 'school.student.dob', defaultMessage: 'Date of Birth' })}
      />
      <ProFormDatePicker
        name="admissionDate"
        label={intl.formatMessage({
          id: 'school.student.admissionDate',
          defaultMessage: 'Admission Date',
        })}
      />
      <ProFormText
        name="mobileNo"
        label={intl.formatMessage({ id: 'school.student.mobileNo', defaultMessage: 'Mobile No.' })}
      />
      <ProFormText
        name="email"
        label={intl.formatMessage({ id: 'school.student.email', defaultMessage: 'Email' })}
      />
      <ProFormSelect
        name="categoryId"
        label={intl.formatMessage({ id: 'school.student.category', defaultMessage: 'Category' })}
        request={async () => {
          const resp = await categoryService.studentCategoryServiceListStudentCategory2({
            body: { pageSize: 100, sort: ['name'] },
          });
          return toNamedOptions(resp.data.items);
        }}
      />
      <ProFormSelect
        name="houseId"
        label={intl.formatMessage({ id: 'school.student.house', defaultMessage: 'House' })}
        request={async () => {
          const resp = await houseService.studentHouseServiceListStudentHouse2({
            body: { pageSize: 100, sort: ['name'] },
          });
          return toNamedOptions(resp.data.items);
        }}
      />
      <ProFormSelect
        name="routePickupPointId"
        label={intl.formatMessage({
          id: 'school.student.routePickupPoint',
          defaultMessage: 'Route Pickup Point',
        })}
        showSearch
        request={async () => {
          const resp = await routePickupPointService.routePickupPointServiceListRoutePickupPoint2({
            body: { pageSize: 100, sort: ['order_number'] },
          });
          return toRoutePickupPointOptions(resp.data.items);
        }}
      />
      <ProFormSelect
        name="vehicleRouteId"
        label={intl.formatMessage({
          id: 'school.student.vehicleRoute',
          defaultMessage: 'Vehicle Route',
        })}
        showSearch
        request={async () => {
          const resp = await vehicleRouteService.vehicleRouteServiceListVehicleRoute2({
            body: { pageSize: 100, sort: ['created_at'] },
          });
          return toVehicleRouteOptions(resp.data.items);
        }}
      />
      <ProFormSelect
        name="hostelRoomId"
        label={intl.formatMessage({
          id: 'school.student.hostelRoom',
          defaultMessage: 'Hostel Room',
        })}
        showSearch
        request={async () => {
          const resp = await hostelRoomService.hostelRoomServiceListHostelRoom2({
            body: { pageSize: 100, sort: ['room_no'] },
          });
          return toHostelRoomOptions(resp.data.items);
        }}
      />
      <ProFormText
        name="guardianName"
        label={intl.formatMessage({
          id: 'school.student.guardianName',
          defaultMessage: 'Guardian Name',
        })}
      />
      <ProFormSelect
        name="guardianIs"
        label={intl.formatMessage({
          id: 'school.student.guardianIs',
          defaultMessage: 'Guardian Is',
        })}
        valueEnum={{
          father: {
            text: intl.formatMessage({
              id: 'school.student.guardianIs.father',
              defaultMessage: 'Father',
            }),
          },
          mother: {
            text: intl.formatMessage({
              id: 'school.student.guardianIs.mother',
              defaultMessage: 'Mother',
            }),
          },
          other: {
            text: intl.formatMessage({
              id: 'school.student.guardianIs.other',
              defaultMessage: 'Other',
            }),
          },
        }}
      />
      <ProFormText
        name="guardianRelation"
        label={intl.formatMessage({
          id: 'school.student.guardianRelation',
          defaultMessage: 'Guardian Relation',
        })}
      />
      <ProFormText
        name="guardianPhone"
        label={intl.formatMessage({
          id: 'school.student.guardianPhone',
          defaultMessage: 'Guardian Phone',
        })}
      />
      <ProFormText
        name="guardianEmail"
        label={intl.formatMessage({
          id: 'school.student.guardianEmail',
          defaultMessage: 'Guardian Email',
        })}
      />
      <ProFormText
        name="guardianOccupation"
        label={intl.formatMessage({
          id: 'school.student.guardianOccupation',
          defaultMessage: 'Guardian Occupation',
        })}
      />
      <ProFormTextArea
        name="guardianAddress"
        label={intl.formatMessage({
          id: 'school.student.guardianAddress',
          defaultMessage: 'Guardian Address',
        })}
      />
      <ProFormText
        name="fatherName"
        label={intl.formatMessage({
          id: 'school.student.fatherName',
          defaultMessage: 'Father Name',
        })}
      />
      <ProFormText
        name="fatherPhone"
        label={intl.formatMessage({
          id: 'school.student.fatherPhone',
          defaultMessage: 'Father Phone',
        })}
      />
      <ProFormText
        name="fatherOccupation"
        label={intl.formatMessage({
          id: 'school.student.fatherOccupation',
          defaultMessage: 'Father Occupation',
        })}
      />
      <ProFormText
        name="motherName"
        label={intl.formatMessage({
          id: 'school.student.motherName',
          defaultMessage: 'Mother Name',
        })}
      />
      <ProFormText
        name="motherPhone"
        label={intl.formatMessage({
          id: 'school.student.motherPhone',
          defaultMessage: 'Mother Phone',
        })}
      />
      <ProFormText
        name="motherOccupation"
        label={intl.formatMessage({
          id: 'school.student.motherOccupation',
          defaultMessage: 'Mother Occupation',
        })}
      />
      <ProFormSelect
        name="siblingStudentId"
        label={intl.formatMessage({
          id: 'school.student.siblingStudent',
          defaultMessage: 'Sibling Student',
        })}
        showSearch
        debounceTime={300}
        request={async ({ keyWords }) => {
          const resp = await service.studentServiceListStudent2({
            body: { pageSize: 50, search: keyWords, sort: ['admission_no'] },
          });
          return toStudentOptions(resp.data.items, props.values?.id);
        }}
      />
      {props.values?.id && (
        <ProFormSwitch
          name="clearSiblings"
          label={intl.formatMessage({
            id: 'school.student.clearSiblings',
            defaultMessage: 'Clear Siblings',
          })}
        />
      )}
      <ProFormTextArea
        name="currentAddress"
        label={intl.formatMessage({
          id: 'school.student.currentAddress',
          defaultMessage: 'Current Address',
        })}
      />
      <ProFormTextArea
        name="permanentAddress"
        label={intl.formatMessage({
          id: 'school.student.permanentAddress',
          defaultMessage: 'Permanent Address',
        })}
      />
    </DrawerForm>
  );
};

export default UpdateForm;
