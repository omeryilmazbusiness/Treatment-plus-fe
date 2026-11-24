type Triple<T> = readonly [T, T, T];

export interface PlanCopy {
  readonly name: string;
  readonly tag: string;
  readonly subtitle: string;
  readonly perks: readonly [string, string, string, string];
  readonly cta: string;
}

/** Landing sayfasındaki tüm kullanıcıya görünen metinler (dil başına bir sözlük). */
export interface LandingDictionary {
  readonly meta: {
    readonly title: string;
    readonly description: string;
  };
  readonly header: {
    readonly tagline: string;
    readonly login: string;
    readonly register: string;
    readonly languageMenuLabel: string;
    readonly homeAriaLabel: string;
  };
  readonly hero: {
    readonly titlePrefix: string;
    readonly titleHighlight: string;
    readonly subtitle: string;
    readonly demoCta: string;
    readonly demoMailSubject: string;
    readonly plansAriaLabel: string;
    readonly sampleCta: string;
    readonly professionalCta: string;
    readonly metrics: Triple<{ readonly title: string; readonly caption: string }>;
  };
  readonly clients: {
    readonly ariaLabel: string;
    readonly title: string;
  };
  readonly features: {
    readonly title: string;
    readonly items: Triple<{ readonly title: string; readonly description: string }>;
    readonly toothAriaLabel: string;
    readonly toothFallbackAlt: string;
    readonly dragHint: string;
  };
  readonly stats: {
    readonly ariaLabel: string;
    readonly eyebrow: string;
    readonly headlinePrefix: string;
    readonly headlineHighlight: string;
    readonly description: string;
    readonly items: Triple<{
      readonly value: string;
      readonly label: string;
      readonly detail: string;
    }>;
    readonly quote: string;
    readonly quoteSource: string;
  };
  readonly workflow: {
    readonly eyebrow: string;
    readonly title: string;
    readonly subtitle: string;
    readonly stepLabel: string;
    readonly steps: Triple<{
      readonly badge: string;
      readonly title: string;
      readonly description: string;
    }>;
  };
  readonly pricing: {
    readonly eyebrow: string;
    readonly title: string;
    readonly subtitle: string;
    readonly recommended: string;
    readonly classic: PlanCopy;
    readonly ultimate: PlanCopy;
  };
  readonly cta: {
    readonly eyebrow: string;
    readonly title: string;
    readonly description: string;
    readonly register: string;
    readonly login: string;
  };
  readonly footer: {
    readonly description: string;
    readonly platformTitle: string;
    readonly contactTitle: string;
    readonly classicLink: string;
    readonly ultimateLink: string;
    readonly register: string;
    readonly login: string;
    readonly rights: string;
    readonly status: string;
    readonly newClinic: string;
    readonly address: string;
  };
}
