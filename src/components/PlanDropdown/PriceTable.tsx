import { type V1Plan, type V1Price } from '@gosaas/api';
import styles from './index.less';
import React from 'react';
import { Button, message, Radio } from 'antd';
import { ProCard } from '@ant-design/pro-components';
import { history, useIntl, useModel } from '@umijs/max';

export type PriceTableProps = {
  data: Map<string, Array<{ plan: V1Plan; price: V1Price }>>;
  currentPeriod: string;
  onPeriodChange: (v: string) => void;
  onConfirm: (v: { plan: V1Plan; price: V1Price }) => void;
};

const PriceTable: React.FC<PriceTableProps> = (props) => {
  const groupedData = props.data;
  const currentPeriod = props.currentPeriod;

  const intl = useIntl();
  const { initialState } = useModel('@@initialState');

  let btnMsg = intl.formatMessage({
    id: 'product.price.subscribeNow',
    defaultMessage: 'Subscribe Now',
  });
  if (props.currentPeriod === 'one-time') {
    btnMsg = intl.formatMessage({ id: 'product.price.buyNow', defaultMessage: 'Buy Now' });
  }
  return (
    <>
      <div className={styles['price-table']}>
        <Radio.Group
          value={currentPeriod}
          onChange={({ target: { value } }) => {
            props.onPeriodChange(value);
          }}
          size="large"
          optionType="button"
          buttonStyle="solid"
        >
          {Array.from(groupedData.keys()).map((p) => (
            <Radio.Button value={p} key={p}>
              {intl.formatMessage({
                id: 'product.price.recurringInterval.' + p,
                defaultMessage: p,
              })}
            </Radio.Button>
          ))}
        </Radio.Group>

        <ProCard gutter={8}>
          {(groupedData.get(currentPeriod || '') ?? []).map((p) => (
            <ProCard key={p.price.id} layout="center" title={p.plan.displayName} bordered>
              {p.price.discounted?.text ?? p.price.default?.text}
              <Button
                type="primary"
                onClick={() => {
                  const tenantId = initialState?.currentTenant?.tenant?.id;
                  const paymentKey = p.price.id || p.plan.key;
                  if (!paymentKey || !tenantId) {
                    message.error(
                      intl.formatMessage({
                        id: 'payment.checkout.unavailable',
                        defaultMessage: 'Checkout is unavailable for this plan.',
                      }),
                    );
                    return;
                  }
                  props.onConfirm(p);
                  history.push(
                    `/checkout/sslcommerz/${encodeURIComponent(paymentKey)}/${encodeURIComponent(
                      tenantId,
                    )}`,
                  );
                }}
              >
                {btnMsg}
              </Button>
            </ProCard>
          ))}
        </ProCard>
      </div>
    </>
  );
};

export default PriceTable;
