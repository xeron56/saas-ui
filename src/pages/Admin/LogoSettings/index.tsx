import LogoSettingsForm from '@/components/LogoSettingsForm';

export default function AdminLogoSettings() {
  return (
    <LogoSettingsForm
      pagePath="/admin/setting/logo-settings"
      updatePath="/admin/setting/application-settings-update"
    />
  );
}
