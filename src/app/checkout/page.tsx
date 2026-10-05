import { redirect } from "next/navigation";
import { localizePath } from "@/i18n/config";
import { getLocale } from "@/i18n/server";

// Checkout starts from the cart drawer; old links to /checkout open the cart in the visitor's language.
export default async function CheckoutPage() {
  redirect(`${localizePath("/", await getLocale())}?cart=open`);
}
