import { getMessages } from "@/i18n/server";
import policyMessages from "@/i18n/messages/policies";
import { TextPage, TextSection } from "@/app/components/pages/TextPage";

export default async function ReturnsPage() {
  const t = (await getMessages(policyMessages)).returns;
  return (
    <TextPage title={t.title}>
      <TextSection title={t.withdrawalTitle}>
        <p>{t.withdrawalText}</p>
      </TextSection>
      <TextSection title={t.howTitle}>
        <p>{t.howText}</p>
      </TextSection>
      <TextSection title={t.refundsTitle}>
        <p>{t.refundsText}</p>
      </TextSection>
      <TextSection title={t.exceptionsTitle}>
        <p>{t.exceptionsText}</p>
      </TextSection>
    </TextPage>
  );
}
