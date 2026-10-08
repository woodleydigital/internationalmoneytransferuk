/** Official help/product URLs discovered from provider links and public search.
 * Configuration only: facts are fetched and extracted, never entered here.
 */
export const SERVICE_PAGES: Record<string, string[]> = {
  hsbc: ["https://www.hsbc.co.uk/international/money-transfer/"],
  "post-office": ["https://www.postoffice.co.uk/international-money-transfer", "https://www.postoffice.co.uk/help-support/money-transfer/faqs"],
  "virgin-money": ["https://uk.virginmoney.com/current-accounts/making-payments/"],
  paypal: ["https://www.paypal.com/uk/digital-wallet/paypal-consumer-fees", "https://www.paypal.com/uk/legalhub/useragreement-full"],
  barclays: ["https://www.barclays.co.uk/ways-to-bank/international-bank-transfers/sending-international-payments/"],
  "co-op-bank": ["https://www.co-operativebank.co.uk/help-and-support/payments/international-payments/"],
  "western-union": ["https://www.westernunion.com/gb/en/kyc/faq.html", "https://www.westernunion.com/gb/en/bank-transfer.html", "https://www.westernunion.com/gb/en/receive-money.html"],
  "lloyds-bank": ["https://www.lloydsbank.com/help-guidance/everyday-banking/payments-and-transfers/send-international-payment.html"],
  tsb: ["https://www.tsb.co.uk/help-and-support/online-banking/international-payments.html", "https://www.tsb.co.uk/help-and-support/fx-international-payment-margins.html"],
  ofx: ["https://www.ofx.com/en-gb/faqs/", "https://www.ofx.com/en-gb/faqs/are-there-any-transfer-fees/"],
  "key-currency": ["https://www.keycurrency.co.uk/how-it-works/", "https://www.keycurrency.co.uk/terms-and-conditions.pdf"],
  ramsdens: ["https://www.ramsdenscurrency.co.uk/international-money-transfers"],
  wise: ["https://wise.com/help/articles/2932148/guide-to-gbp-transfers"],
  santander: ["https://www.santander.co.uk/personal/support/ways-to-bank/payments-and-transfers"],
  natwest: ["https://www.natwest.com/banking-with-natwest/how-to/send-money-abroad.html", "https://www.natwest.com/support-centre/banking-from-home/make-payments/how-can-i-make-an-international-payment.html"],
  skrill: ["https://www.skrill.com/en/support/question/59/what-is-skrill-money-transfer-and-how-do-i-use-it/", "https://www.skrill.com/en/support/question/56/what-is-the-skrill-money-transfer-verification/"],
  monzo: ["https://monzo.com/help/payments-getting-started/sending-int-payments-web", "https://monzo.com/help/payments-getting-started/international-transfers-local-currency", "https://monzo.com/help/payments-getting-started/1-percent-euro-fee-breakdown"],
  "chase-uk": ["https://www.chase.co.uk/gb/en/support/international-payments/"],
  revolut: ["https://www.revolut.com/en-GB/international-transfers/", "https://www.revolut.com/en-GB/legal/standard-fees/"],
  "bank-of-ireland-uk": ["https://www.bankofirelanduk.com/rates-and-fees/international-payments/"],
  halifax: ["https://www.halifax.co.uk/helpcentre/everyday-banking/payments-and-transfers/international-payments/send-money-guide.html"],
  "john-lewis-finance": ["https://help.internationalpayments.johnlewismoney.com/hc/en-gb", "https://help.internationalpayments.johnlewismoney.com/hc/en-gb/articles/33666685406225-Are-there-fees-for-sending-money", "https://help.internationalpayments.johnlewismoney.com/hc/en-gb/articles/33373689201553", "https://help.internationalpayments.johnlewismoney.com/hc/en-gb/articles/33665806979345", "https://help.internationalpayments.johnlewismoney.com/hc/en-gb/articles/33666867368977"],
  mukuru: ["https://www.mukuru.com/en-uk/services/send-money/", "https://www.mukuru.com/en-uk/help-support/faqs/", "https://www.mukuru.com/en-uk/legal/mukuru-money-transfer-service/"],
  nationwide: ["https://www.nationwide.co.uk/help/payments/swift-sepa-international-payments", "https://www.nationwide.co.uk/help/payments/transfer-limits-and-timescales/"],
  remitly: ["https://www.remitly.com/gb/en/landing/send-limits", "https://www.remitly.com/gb/en/money-transfer/large-amounts"],
  "first-direct": ["https://www.firstdirect.com/travel-and-international/international-payments/", "https://www.firstdirect.com/rates-and-charges/charges/"],
  "metro-bank": ["https://www.metrobankonline.co.uk/ways-to-bank/i-want-some-information-about/international-payments-personal-accounts/"],
  ria: ["https://www.riamoneytransfer.com/en-gb/send-money-online/", "https://www.riamoneytransfer.com/en-gb/send-money/", "https://www.riamoneytransfer.com/en-gb/terms/", "https://help.riamoneytransfer.com/hc/en-us/articles/4407752015249-How-our-fees-and-exchange-rates-work"],
  sendwave: ["https://www.sendwave.com/en/support"],
  lemfi: ["https://support.lemfi.com/hc/en-us/articles/45780629399185-Are-there-country-specific-rules-or-limits", "https://support.lemfi.com/hc/en-us/sections/45803934965649-Limits-settings", "https://www.lemfi.com/en-gb/legal/terms"],
  worldremit: ["https://www.worldremit.com/en/faq/bank-transfers"],
  xe: ["https://help.xe.com/hc/en-gb/articles/360019847837-What-are-the-limits-on-how-much-I-can-send", "https://help.xe.com/hc/en-gb/articles/360019791837-Sending-British-Pounds-GBP", "https://help.xe.com/hc/en-gb/articles/11368585652497-How-to-send-money-to-a-mobile-wallet-with-Xe", "https://help.xe.com/hc/en-gb/articles/360019613418-What-rate-will-I-get-when-sending-money"],
  torfx: ["https://www.torfx.com/faqs", "https://www.torfx.com/everyday-transfers", "https://www.torfx.com/our-app", "https://www.torfx.com/help"],
  "currencies-direct": ["https://help.currenciesdirect.com/en/sending-money/do-i-pay-any-fees-for-sending-money-needs-check", "https://help.currenciesdirect.com/en/sending-money/do-you-limit-how-much-i-can-send", "https://help.currenciesdirect.com/en/sending-money/how-long-does-a-transfer-take", "https://help.currenciesdirect.com/en/privacy-and-security/how-is-my-money-protected", "https://help.currenciesdirect.com/en/money-in-your-account/what-currencies-can-i-add-keep-or-receive-in-my-currencies-direct-wallets"],
  moneycorp: ["https://www.moneycorp.com/en-gb/help-support/personal-faq/", "https://www.moneycorp.com/en-gb/personal/moneycorp-online/"],
  "currency-solutions": ["https://www.currencysolutions.com/regulatory/", "https://www.currencysolutions.com/"],
  "cambridge-currencies": ["https://cambridgecurrencies.com/fees/", "https://cambridgecurrencies.com/international-money-transfer/"],
  "halo-financial": ["https://www.halofinancial.com/money-transfer-services/currency-volatility-management", "https://www.halofinancial.com/money-transfer-services/regular-currency-trade"],
  "smart-currency-exchange": ["https://www.smartcurrencyexchange.com/money-transfer-faq/", "https://www.smartcurrencyexchange.com/smart-currency-online-faq/"],
  "equals-money": ["https://equalsmoney.com/faqs/what-currencies-do-you-offer-for-international-payments", "https://equalsmoney.com/business-payments/mass-payments"],
  transfergo: ["https://support.transfergo.com/hc/en-gb/articles/4408088383892-Sending-limits"],
  paysend: ["https://help.paysend.com/hc/en-gb/articles/29196188595741-Understanding-Paysend-fees", "https://help.paysend.com/hc/en-gb/categories/5092697897501-Sending-money"],
  "taptap-send": ["https://help.taptapsend.com/en/sending-countries/how-do-i-send-money-from-the-uk", "https://www.taptapsend.com/en/legal/uk/user-agreement-uk"],
  "starling-bank": ["https://www.starlingbank.com/send-money-abroad/", "https://www.starlingbank.com/send-money-abroad/country-fees/", "https://help.starlingbank.com/personal/topics/international-payments/how-much-does-it-cost-to-make-an-international-payment/"],
  "royal-bank-of-scotland": ["https://www.rbs.co.uk/support-centre/banking-from-home/make-payments/how-can-i-make-an-international-payment.html"],
  "bank-of-scotland": ["https://www.bankofscotland.co.uk/helpcentre/everyday-banking/payments-and-transfers/international-payments/send-money-guide.html"],
  "ulster-bank": ["https://www.ulsterbank.co.uk/support-centre/banking-from-home/make-payments/how-can-i-make-an-international-payment.html"],
  caxton: ["https://resources.caxton.io/help/personal-international-payments", "https://resources.caxton.io/help/personal/does-caxton-have-handling-transferring-fee", "https://caxton.io/legal-hub/terms-and-conditions/caxton-international-payments"],
  "danske-bank": ["https://danskebank.co.uk/personal/help/payments/foreign-payments"],
  "aib-ni": ["https://www.aibni.co.uk/ways-to-bank/making-and-receiving-payments/international-payments", "https://www.aibni.co.uk/content/dam/aibni/personal/personal-docs/ways-to-bank/international-payments/international-payments-terms.pdf", "https://www.aibni.co.uk/help-and-guidance/frequently-asked-questions/international-payments-faqs"],
  handelsbanken: ["https://www.handelsbanken.co.uk/en/about-us/important-information/international-payments-restricted-countries", "https://www.handelsbanken.co.uk/tron/gbpu/info/contents/v1/document/52-270372"],
  coutts: ["https://www.coutts.com/help-centre/my-coutts/payments/international-payments.html", "https://www.coutts.com/help-centre/my-coutts/payments/international-payments/What-are-the-cut-off-times-and-credit-value-dates-for-international-payments.html"],
};

/** Exact website host or one of its subdomains; no lookalike suffixes. */
// The provider's former FAQ redirects to this branded help centre. Permit
// the observed alias explicitly; never infer that every cross-domain redirect
// is the same provider or that a successor's products belong to an old brand.
const SOURCE_HOSTS: Record<string, string[]> = {
  "john-lewis-finance": ["johnlewismoney.com"],
  // Linked explicitly as its own transfer service on Ramsdens' services page.
  ramsdens: ["ramsdenscurrency.co.uk"],
  // The former .co.uk homepage redirects here; both state company 04864491.
  "currency-solutions": ["currencysolutions.com"],
};

export function isProviderSource(url: string, website: string, slug?: string): boolean {
  try {
    const target = new URL(url);
    const hosts = [new URL(website).hostname.replace(/^www\./, ""), ...(slug ? SOURCE_HOSTS[slug] ?? [] : [])];
    return /^https?:$/.test(target.protocol) && hosts.some((host) =>
      target.hostname.replace(/^www\./, "") === host || target.hostname.endsWith(`.${host}`));
  } catch { return false; }
}
