import { getMessages } from "@/i18n/server";
import policyMessages from "@/i18n/messages/policies";
import { TextPage, TextSection } from "@/app/components/pages/TextPage";

export default async function SupportPage() {
  const t = (await getMessages(policyMessages)).support;
  return (
    <TextPage title={t.title} intro={<p>{t.intro}</p>}>
      <TextSection title={t.faqTitle}>
        <p>{t.faqText}</p>
      </TextSection>
    </TextPage>
  );
}
