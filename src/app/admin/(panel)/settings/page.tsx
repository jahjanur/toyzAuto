import { getSettings } from "@/lib/settings";
import { SettingsForm } from "@/components/admin/settings-form";

export default async function SettingsAdmin() {
  const s = await getSettings();
  return <SettingsForm s={s} />;
}
