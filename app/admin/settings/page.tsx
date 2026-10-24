import { getSiteSettings } from "@/lib/settings";
import { siteConfig } from "@/lib/site.config";
import { getCurrentSiteId } from "@/lib/supabase";
import { PageHeader } from "../ui";
import SettingsForm from "./SettingsForm";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const [settings, siteId] = await Promise.all([
    getSiteSettings(),
    getCurrentSiteId(),
  ]);

  return (
    <>
      <PageHeader
        title="Settings"
        description="Brand, navigation and theme. These override the defaults in lib/site.config.ts."
      />
      <SettingsForm
        settings={settings}
        // Identity fields are deliberately read-only: the site slug and id key
        // every query in a database shared with other live sites.
        readOnly={{
          slug: siteConfig.slug,
          domain: siteConfig.domain,
          siteId,
        }}
      />
    </>
  );
}
