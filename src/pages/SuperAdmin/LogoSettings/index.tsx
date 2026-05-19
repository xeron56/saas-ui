import LogoSettingsForm from '@/components/LogoSettingsForm';

export default function SuperAdminLogoSettings() {
  return (
    <LogoSettingsForm
      pagePath="/super-admin/setting/logo-settings"
      updatePath="/super-admin/setting/application-settings-update"
    />
  );
}
