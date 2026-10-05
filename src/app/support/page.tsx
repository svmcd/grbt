import { getMessages } from "@/i18n/server";
import policyMessages from "@/i18n/messages/policies";
import { TextPage, TextSection } from "@/app/components/pages/TextPage";

export default async function SupportPage() {
  const t = (await getMessages(policyMessages)).support;
  return (
    <TextPage title={t.title} intro={<p>{t.intro}</p>}>
      <TextSection title={t.faqTitle}>
        <div className="divide-y divide-line border-y border-line">
          {t.faq.map((item) => (
            <details key={item.q} className="group py-4">
              <summary className="flex cursor-pointer list-none items-start justify-between gap-4 text-[14px] font-medium leading-[1.5] text-ink [&::-webkit-details-marker]:hidden">
                <span>{item.q}</span>
                <span aria-hidden className="mt-[2px] shrink-0 text-[16px] leading-none transition-transform group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="mt-3 pr-8 text-[14px] leading-[1.7] text-ink">{item.a}</p>
            </details>
          ))}
        </div>
      </TextSection>
    </TextPage>
  );
}
