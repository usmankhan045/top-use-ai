import { permanentRedirect } from "next/navigation";

export default function LegacyWritingFinderPage() {
  permanentRedirect("/tools/content-creation");
}
