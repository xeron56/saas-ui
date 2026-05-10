import type { ProColumnType } from '@ant-design/pro-components';
import { ProFormText, ProFormTextArea } from '@ant-design/pro-components';
import { FormattedMessage, useIntl } from '@umijs/max';
import React from 'react';
import type { V1CreateVehicleRequest, V1Vehicle } from '@gosaas/api';
import { VehicleServiceApi } from '@gosaas/api';
import ReferencePage from '../../Student/components/ReferencePage';

const service = new VehicleServiceApi();

const TableList: React.FC = () => {
  const intl = useIntl();

  const columns: ProColumnType<V1Vehicle>[] = [
    {
      title: <FormattedMessage id="school.transport.vehicleNo" defaultMessage="Vehicle No." />,
      dataIndex: 'vehicleNo',
      valueType: 'text',
    },
    {
      title: <FormattedMessage id="school.transport.vehicleModel" defaultMessage="Model" />,
      dataIndex: 'vehicleModel',
      valueType: 'text',
    },
    {
      title: (
        <FormattedMessage
          id="school.transport.registrationNumber"
          defaultMessage="Registration No."
        />
      ),
      dataIndex: 'registrationNumber',
      valueType: 'text',
    },
    {
      title: <FormattedMessage id="school.transport.driverName" defaultMessage="Driver" />,
      dataIndex: 'driverName',
      valueType: 'text',
    },
    {
      title: <FormattedMessage id="school.transport.driverContact" defaultMessage="Contact" />,
      dataIndex: 'driverContact',
      valueType: 'text',
    },
  ];

  return (
    <ReferencePage<V1Vehicle>
      columns={columns}
      create={(fields: V1CreateVehicleRequest) =>
        service.vehicleServiceCreateVehicle({ body: fields })
      }
      delete={(record) => service.vehicleServiceDeleteVehicle({ id: record.id! })}
      get={async (id) => (await service.vehicleServiceGetVehicle({ id })).data}
      list={async (req: any) => (await service.vehicleServiceListVehicle2({ body: req })).data}
      title={(record) => record.vehicleNo}
      update={(record, fields: any) =>
        service.vehicleServiceUpdateVehicle2({
          vehicleId: record.id!,
          body: { vehicle: { id: record.id!, ...fields } },
        })
      }
      formItems={
        <>
          <ProFormText
            name="vehicleNo"
            label={intl.formatMessage({
              id: 'school.transport.vehicleNo',
              defaultMessage: 'Vehicle No.',
            })}
            rules={[{ required: true }]}
          />
          <ProFormText
            name="vehicleModel"
            label={intl.formatMessage({
              id: 'school.transport.vehicleModel',
              defaultMessage: 'Model',
            })}
          />
          <ProFormText
            name="vehiclePhoto"
            label={intl.formatMessage({
              id: 'school.transport.vehiclePhoto',
              defaultMessage: 'Vehicle Photo',
            })}
          />
          <ProFormText
            name="manufactureYear"
            label={intl.formatMessage({
              id: 'school.transport.manufactureYear',
              defaultMessage: 'Manufacture Year',
            })}
          />
          <ProFormText
            name="registrationNumber"
            label={intl.formatMessage({
              id: 'school.transport.registrationNumber',
              defaultMessage: 'Registration No.',
            })}
          />
          <ProFormText
            name="chasisNumber"
            label={intl.formatMessage({
              id: 'school.transport.chasisNumber',
              defaultMessage: 'Chassis No.',
            })}
          />
          <ProFormText
            name="maxSeatingCapacity"
            label={intl.formatMessage({
              id: 'school.transport.maxSeatingCapacity',
              defaultMessage: 'Max Seating Capacity',
            })}
          />
          <ProFormText
            name="driverName"
            label={intl.formatMessage({
              id: 'school.transport.driverName',
              defaultMessage: 'Driver',
            })}
          />
          <ProFormText
            name="driverLicence"
            label={intl.formatMessage({
              id: 'school.transport.driverLicence',
              defaultMessage: 'Driver Licence',
            })}
          />
          <ProFormText
            name="driverContact"
            label={intl.formatMessage({
              id: 'school.transport.driverContact',
              defaultMessage: 'Contact',
            })}
          />
          <ProFormTextArea
            name="note"
            label={intl.formatMessage({ id: 'school.transport.note', defaultMessage: 'Note' })}
          />
        </>
      }
    />
  );
};

export default TableList;
