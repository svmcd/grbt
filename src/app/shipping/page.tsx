import { getMessages } from "@/i18n/server";
import policyMessages from "@/i18n/messages/policies";
import { TextPage, TextSection } from "@/app/components/pages/TextPage";

export default async function ShippingPage() {
  const t = (await getMessages(policyMessages)).shipping;
  return (
    <TextPage title={t.title} intro={<p>{t.intro}</p>}>
      <TextSection title={t.processingTitle}>
        <p>{t.processingText}</p>
      </TextSection>
      <TextSection title={t.deliveryTitle}>
        <p>{t.deliveryText}</p>
      </TextSection>
      <TextSection title={t.customsTitle}>
        <p>{t.customsText}</p>
      </TextSection>
      <TextSection title={t.trackingTitle}>
        <p>{t.trackingText}</p>
      </TextSection>
    </TextPage>
  );
}
