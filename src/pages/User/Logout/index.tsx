import React from 'react';
import { message, Spin } from 'antd';
import { useModel } from '@umijs/max';
import { useMount } from 'ahooks';
import { useEmotionCss } from '@ant-design/use-emotion-css';
import { history } from '@umijs/max';
import { setAccessToken, setPermission, setSettingTenantId, setUserInfo } from '@gosaas/core';
import { loginOut } from '@/utils/auth';
import styles from './index.less';

export default function Page() {
  const { setInitialState } = useModel('@@initialState');
  const containerClassName = useEmotionCss(() => {
    return {
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      gap: 12,
      background: 'linear-gradient(180deg, #f6f8fb 0%, #eef2ff 100%)',
    };
  });

  useMount(async () => {
    try {
      setInitialState?.((s) => ({ ...s, currentUser: undefined }));
      setAccessToken(undefined);
      setUserInfo(undefined);
      setSettingTenantId(undefined);
      setPermission(undefined);
      await loginOut();
    } catch (error) {
      message.error('注销失败，正在返回登录页');
      history.replace('/user/login');
    }
  });

  return (
    <div className={containerClassName}>
      <Spin size="large" />
      <h1 className={styles.title}>正在退出登录…</h1>
    </div>
  );
}
