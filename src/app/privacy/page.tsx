import { getMessages } from "@/i18n/server";
import policyMessages from "@/i18n/messages/policies";
import commonMessages from "@/i18n/messages/common";
import { TextPage, TextSection } from "@/app/components/pages/TextPage";

export default async function PrivacyPage() {
  const t = (await getMessages(policyMessages)).privacy;
  const common = await getMessages(commonMessages);
  return (
    <TextPage title={t.title} intro={<p>{t.intro}</p>}>
      <TextSection title={t.collectionTitle}>
        <p>{t.collectionText}</p>
      </TextSection>
      <TextSection title={t.useTitle}>
        <p>{t.useText}</p>
      </TextSection>
      <TextSection title={t.cookiesTitle}>
        <p>{t.cookiesText}</p>
      </TextSection>
      <TextSection title={common.contact}>
        <p>{t.contactText}</p>
      </TextSection>
    </TextPage>
  );
}
