type Pair<T> = readonly [T, T];
type Triple<T> = readonly [T, T, T];
type Quad<T> = readonly [T, T, T, T];
type Sextuple<T> = readonly [T, T, T, T, T, T];

export interface PlanCopy {
  readonly name: string;
  readonly tag: string;
  readonly subtitle: string;
  readonly perks: readonly [string, string, string, string];
  readonly cta: string;
}

/** Bölüm başlığı: küçük üst etiket + koyu başlık + (isteğe bağlı) gri ikinci satır. */
export interface SectionHeading {
  readonly eyebrow: string;
  readonly title: string;
  readonly titleMuted: string;
}

export interface TitledText {
  readonly title: string;
  readonly description: string;
}

export interface NoticeCopy {
  readonly title: string;
  readonly caption: string;
}

export interface FaqItem {
  readonly question: string;
  readonly answer: string;
}

/** Landing sayfasındaki tüm kullanıcıya görünen metinler (dil başına bir sözlük). */
export interface LandingDictionary {
  readonly meta: {
    readonly title: string;
    readonly description: string;
  };
  readonly header: {
    readonly login: string;
    readonly pricing: string;
    readonly faq: string;
    readonly languageMenuLabel: string;
    readonly homeAriaLabel: string;
    readonly navAriaLabel: string;
  };
  readonly hero: {
    readonly eyebrow: string;
    readonly titlePrefix: string;
    readonly titleHighlight: string;
    readonly tagline: string;
    readonly demoCta: string;
    readonly demoNote: string;
    readonly demoMailSubject: string;
    readonly plansAriaLabel: string;
    readonly sampleCta: string;
    readonly professionalCta: string;
    readonly scene: {
      readonly ariaLabel: string;
      readonly planLabel: string;
      readonly planTitle: string;
      readonly preparedFor: string;
      readonly viewPlan: string;
      readonly coverTitle: string;
      readonly patientName: string;
      readonly approved: NoticeCopy;
      readonly movie: NoticeCopy;
      readonly language: NoticeCopy;
      readonly shared: NoticeCopy;
    };
  };
  readonly trust: {
    readonly ariaLabel: string;
    readonly lead: string;
    readonly leadMuted: string;
    readonly items: Triple<{
      readonly value: string;
      readonly label: string;
      readonly detail: string;
    }>;
    readonly clientsAriaLabel: string;
    readonly clientsTitle: string;
  };
  readonly madeFor: {
    readonly heading: SectionHeading;
    readonly description: string;
    readonly you: string;
    readonly cards: Pair<TitledText>;
  };
  readonly showcase: {
    readonly heading: SectionHeading;
    readonly formatsAriaLabel: string;
    readonly tabsAriaLabel: string;
    readonly formats: {
      readonly pdf: string;
      readonly desktop: string;
      readonly mobile: string;
    };
    readonly tabs: Sextuple<TitledText>;
  };
  readonly flow: {
    readonly heading: SectionHeading;
    readonly options: Pair<{
      readonly title: string;
      readonly lead: string;
      readonly text: string;
    }>;
    readonly tiles: Pair<string>;
    readonly channelsLabel: string;
    readonly channels: Quad<string>;
  };
  readonly features: {
    readonly heading: SectionHeading;
    readonly createdIn: string;
    readonly odontogram: TitledText;
    readonly plans: TitledText & { readonly unit: string; readonly ready: string };
    readonly movie: TitledText;
    readonly mobile: TitledText & {
      readonly approve: string;
      readonly approved: string;
    };
    readonly strip: Quad<string>;
    readonly toothAriaLabel: string;
    readonly toothFallbackAlt: string;
    readonly dragHint: string;
  };
  readonly languages: {
    readonly heading: SectionHeading;
    readonly description: string;
    readonly cardsAriaLabel: string;
    readonly map: {
      readonly ariaLabel: string;
      readonly growing: string;
      readonly fresh: string;
    };
  };
  readonly quote: {
    readonly heading: SectionHeading;
    readonly quote: string;
    readonly source: string;
    readonly link: string;
  };
  readonly pricing: {
    readonly heading: SectionHeading;
    readonly subtitle: string;
    readonly recommended: string;
    readonly classic: PlanCopy;
    readonly ultimate: PlanCopy;
    readonly includedLabel: string;
    readonly included: Sextuple<{
      readonly title: string;
      readonly caption: string;
    }>;
    readonly demo: {
      readonly title: string;
      readonly titleMuted: string;
      readonly text: string;
      readonly questionsLabel: string;
      readonly questions: Triple<string>;
      readonly cta: string;
    };
  };
  readonly workflow: {
    readonly heading: SectionHeading;
    readonly stepLabel: string;
    readonly steps: Triple<{
      readonly badge: string;
      readonly title: string;
      readonly description: string;
    }>;
  };
  readonly security: {
    readonly heading: SectionHeading;
    readonly description: string;
    readonly panelLabel: string;
    readonly protectedLabel: string;
    readonly items: Quad<TitledText>;
  };
  readonly faq: {
    readonly heading: SectionHeading;
    readonly items: readonly FaqItem[];
    readonly askTitle: string;
    readonly askText: string;
    readonly askCta: string;
    readonly askMailSubject: string;
  };
  readonly cta: {
    readonly eyebrow: string;
    readonly title: string;
    readonly titleMuted: string;
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
