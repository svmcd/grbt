import { getMessages } from "@/i18n/server";
import policyMessages from "@/i18n/messages/policies";
import commonMessages from "@/i18n/messages/common";
import { TextPage, TextSection } from "@/app/components/pages/TextPage";

export default async function TermsPage() {
  const t = (await getMessages(policyMessages)).terms;
  const common = await getMessages(commonMessages);
  return (
    <TextPage title={t.title} intro={<p>{t.intro}</p>}>
      <TextSection title={t.useTitle}>
        <p>{t.useText}</p>
      </TextSection>
      <TextSection title={t.ordersTitle}>
        <p>{t.ordersText}</p>
      </TextSection>
      <TextSection title={common.contact}>
        <p>{t.contactText}</p>
      </TextSection>
    </TextPage>
  );
}
