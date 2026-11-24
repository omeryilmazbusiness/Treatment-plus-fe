import type { LandingDictionary } from "./dictionary";

export const en: LandingDictionary = {
  meta: {
    title: "Treatment+ | 3D Treatment Presentation Platform for Dental Clinics",
    description:
      "Present treatment plans to patients as a 3D movie and a patient-specific website. Raise case acceptance with animated procedures and secure, mobile-friendly plans you can share.",
  },
  header: {
    login: "Log In",
    pricing: "Packages",
    faq: "FAQ",
    languageMenuLabel: "Select language",
    homeAriaLabel: "Treatment+ home",
    navAriaLabel: "Main navigation",
  },
  hero: {
    eyebrow: "3D treatment presentation for dental clinics",
    titlePrefix: "Treatment Planning,",
    titleHighlight: "Transformed in 3D",
    tagline: "Create it once. Present it as a 3D movie, a website and a mobile link.",
    demoCta: "Get your demo",
    demoNote: "30 minutes · No obligation · Free demo",
    demoMailSubject: "Treatment+ demo request",
    plansAriaLabel: "Sample plans",
    sampleCta: "Explore Sample Plan",
    professionalCta: "Explore Professional Plan",
    scene: {
      ariaLabel: "Treatment+ patient presentation samples: desktop, mobile and PDF",
      planLabel: "Treatment plan",
      planTitle: "Your new smile",
      preparedFor: "Prepared for Ms. Jane Smith",
      viewPlan: "View your plan",
      coverTitle: "Your personal treatment plan",
      patientName: "Ms. Jane Smith",
      approved: { title: "Plan approved", caption: "Ms. Jane Smith · on mobile" },
      movie: { title: "3D movie ready", caption: "Treatment journey · 02:10" },
      language: { title: "Sent in Arabic", caption: "Every patient in their language" },
      shared: { title: "Secure link", caption: "WhatsApp · just now" },
    },
  },
  trust: {
    ariaLabel: "Treatment+ trust indicators",
    lead: "Treatment+ is the 3D treatment presentation platform for dental clinics,",
    leadMuted: "built to speed up patient decisions.",
    items: [
      {
        value: "42%",
        label: "Higher case acceptance",
        detail: "In multi-stage implant and aesthetic prosthetic plans",
      },
      {
        value: "2.4x",
        label: "Faster patient decisions",
        detail: "With mobile-shareable 3D patient presentations",
      },
      {
        value: "50%",
        label: "Shorter consultations",
        detail: "Direct 3D simulation instead of explaining X-rays",
      },
    ],
    clientsAriaLabel: "Our clients",
    clientsTitle: "Clinics that trust us",
  },
  madeFor: {
    heading: {
      eyebrow: "Made for",
      title: "Big decisions.",
      titleMuted: "",
    },
    description:
      "Multi-stage treatments cost thousands, so patients compare quotes at home and abroad. Your plan has to show why you're the right choice.",
    you: "You",
    cards: [
      {
        title: "Dental tourism",
        description: "Multilingual, mobile-friendly presentations for patients from abroad.",
      },
      {
        title: "Local patients",
        description: "For clinics doing full-mouth and high-end aesthetic treatments.",
      },
    ],
  },
  showcase: {
    heading: {
      eyebrow: "What's inside",
      title: "Be remarkable.",
      titleMuted: "Every reason to choose you.",
    },
    formatsAriaLabel: "View format",
    tabsAriaLabel: "Presentation sections",
    formats: { pdf: "PDF", desktop: "Desktop", mobile: "Mobile" },
    tabs: [
      { title: "Cover page", description: "A welcome made for the patient" },
      { title: "Clinic and dentists", description: "Introduce your clinic and team" },
      { title: "3D treatment movie", description: "The whole treatment journey" },
      { title: "Treatment plan and prices", description: "Phase-based, item by item" },
      { title: "Patient website", description: "Exclusive to the Professional package" },
      { title: "Approval and contact", description: "Patients approve on their phone" },
    ],
  },
  flow: {
    heading: {
      eyebrow: "Your packages",
      title: "Start with the 3D movie,",
      titleMuted: "add a website if you like.",
    },
    options: [
      {
        title: "Communication Package",
        lead: "3D treatment movie.",
        text: "Present your plan as a patient-specific 3D movie, with the phase-based plan and price breakdown alongside it.",
      },
      {
        title: "Professional Package",
        lead: "Movie + website.",
        text: "Everything in Communication, plus the plan presented as a patient-specific website under your clinic's brand.",
      },
    ],
    tiles: ["3D movie", "Website"],
    channelsLabel: "One link, every channel",
    channels: ["WhatsApp", "Email", "PDF", "QR"],
  },
  features: {
    heading: {
      eyebrow: "Smart features",
      title: "Fast for you.",
      titleMuted: "Clear for your patients.",
    },
    createdIn: "Created in Treatment+",
    odontogram: {
      title: "Interactive 3D odontograms",
      description: "Show findings and treatment plans on a 360° rotatable jaw model.",
    },
    plans: {
      title: "Plans in minutes.",
      description: "Save a plan once. Reuse it for every patient.",
      unit: "procedures",
      ready: "Ready to send",
    },
    movie: {
      title: "Animated treatment procedures",
      description: "Walk through implant, root canal and prosthetic stages step by step.",
    },
    mobile: {
      title: "Mobile-friendly and shareable",
      description: "Send a secure, patient-specific link instead of a PDF.",
      approve: "Approve plan",
      approved: "Approved",
    },
    strip: [
      "Any language & currency",
      "Phase by phase",
      "One secure link",
      "Your clinic's brand",
    ],
    toothAriaLabel: "Interactive 3D tooth model you can rotate by dragging",
    toothFallbackAlt: "Illustration of a white tooth",
    dragHint: "Drag to rotate",
  },
  languages: {
    heading: {
      eyebrow: "Multilingual presentations",
      title: "Every patient,",
      titleMuted: "in their own language.",
    },
    description:
      "In dental tourism, trust grows when patients read their plan in their own language. Create it once and present it in the language they understand.",
    cardsAriaLabel: "Supported languages",
    map: {
      ariaLabel: "Treatment+ clinic network world map",
      growing: "Where our clinics keep growing",
      fresh: "Newly launched regions",
    },
  },
  quote: {
    heading: {
      eyebrow: "Patient approval",
      title: "Patients approve with confidence",
      titleMuted: "when they see the treatment.",
    },
    quote:
      "When our patients see the implant angle and the zirconia restoration on a 3D model, they approve treatment with far greater confidence.",
    source: "Oral & Dental Health Polyclinics",
    link: "Explore the samples",
  },
  pricing: {
    heading: {
      eyebrow: "Clinical solution packages",
      title: "Choose the presentation",
      titleMuted: "package that fits your clinic.",
    },
    subtitle:
      "Explore sample patient presentations and choose the best package for your clinic.",
    recommended: "Recommended",
    classic: {
      name: "Communication Package",
      tag: "3D Treatment Movie",
      subtitle:
        "For clinics that want to present the treatment plan as a 3D movie and brief patients quickly.",
      perks: [
        "Patient-specific 3D treatment movie",
        "Phase-based, structured treatment and procedure plan",
        "Clinic logo, physician profile and welcome letter",
        "Mobile-friendly, shareable patient plan link",
      ],
      cta: "View Samples",
    },
    ultimate: {
      name: "Professional Package",
      tag: "3D Movie + Website",
      subtitle:
        "For clinics that want to present the plan as a dedicated patient website, in addition to the 3D treatment movie.",
      perks: [
        "Everything in the Communication Package, including the 3D treatment movie",
        "Presentation as a patient-specific website under your clinic's brand",
        "Clinic profile, laboratory, awards and accommodation sections",
        "Multi-language support, custom color palette and advanced patient approval screen",
      ],
      cta: "View Samples",
    },
    includedLabel: "Included in every package",
    included: [
      { title: "3D treatment movie", caption: "Made for each patient" },
      { title: "Install-free 3D", caption: "In the browser, 60 FPS WebGL" },
      { title: "Three formats", caption: "PDF, desktop and mobile" },
      { title: "Multilingual", caption: "And multi-currency" },
      { title: "Your clinic's brand", caption: "Logo, profile, welcome letter" },
      { title: "KVKK compliant", caption: "Isolated clinic data" },
    ],
    demo: {
      title: "Talk to us.",
      titleMuted: "One-to-one demo.",
      text: "If you'd like, we'll schedule a 30-minute demo made for your clinic.",
      questionsLabel: "Some questions you might ask",
      questions: [
        "How long does it take to prepare a 3D movie?",
        "Can we use our own logo?",
        "Where is patient data stored and how is it protected?",
      ],
      cta: "Get your demo",
    },
  },
  workflow: {
    heading: {
      eyebrow: "Clinical workflow",
      title: "Interactive treatment",
      titleMuted: "planning in 3 steps.",
    },
    stepLabel: "Step",
    steps: [
      {
        badge: "Catalog & Planning",
        title: "Mark the Diagnosis and Treatment",
        description:
          "Select tooth numbers and procedures from your clinic catalog, and build a multi-phase treatment plan in seconds.",
      },
      {
        badge: "3D Visual Presentation",
        title: "Explain on the 3D Odontogram",
        description:
          "At the chair or on a consultation screen, rotate the 3D model to show your patient the planned procedure.",
      },
      {
        badge: "Mobile Sharing",
        title: "Share Digitally and Get Approval",
        description:
          "Skip the PDF: share a secure patient link and let your patient review and approve the plan on their phone.",
      },
    ],
  },
  security: {
    heading: {
      eyebrow: "Privacy and security",
      title: "Your data stays yours.",
      titleMuted: "Always.",
    },
    description: "Patient data is sensitive, so we treat it that way.",
    panelLabel: "Your clinic's data",
    protectedLabel: "Protected",
    items: [
      {
        title: "KVKK compliant.",
        description: "Patient data is processed within the KVKK framework.",
      },
      {
        title: "Isolated per clinic.",
        description: "Each clinic's data is kept separate from all others.",
      },
      {
        title: "Never cached.",
        description: "Patient pages are not stored in any CDN or cache.",
      },
      {
        title: "Sessions stay in your browser.",
        description: "Session cookies stay on this domain only.",
      },
    ],
  },
  faq: {
    heading: {
      eyebrow: "FAQ",
      title: "Big questions.",
      titleMuted: "Short answers.",
    },
    items: [
      {
        question: "What is Treatment+?",
        answer:
          "A 3D treatment presentation platform for dental clinics. It lets you present treatment plans as a patient-specific 3D movie and website, share them on mobile and collect approval.",
      },
      {
        question: "What's the difference between Communication and Professional?",
        answer:
          "Communication includes a patient-specific 3D treatment movie and the phase-based plan. Professional adds everything in Communication, plus the plan presented as a patient-specific website under your clinic's brand.",
      },
      {
        question: "Do we need to install anything?",
        answer:
          "No. The 3D presentation runs in the browser, so nothing has to be installed at the clinic or on the patient's phone.",
      },
      {
        question: "How do patients receive the plan?",
        answer:
          "You send a secure, patient-specific link. It opens on any phone or computer, so there's no need to send a PDF.",
      },
      {
        question: "Can we use our own logo and colors?",
        answer:
          "Yes. Your logo, physician profile and welcome letter are part of the presentation. The Professional package also supports a custom color palette.",
      },
      {
        question: "Which languages can we present in?",
        answer:
          "The Professional package supports multiple languages. Contact us for the available language options.",
      },
      {
        question: "Is patient data safe?",
        answer:
          "Yes. The platform is KVKK compliant, each clinic's data is isolated from the others, and patient pages are never cached.",
      },
      {
        question: "How do I get started?",
        answer:
          "Write to us through Get your demo and we'll plan a demo for your clinic. After that you can open your clinic account and prepare your first plan in minutes.",
      },
    ],
    askTitle: "Didn't find your question?",
    askText: "Ask us anything. We're happy to help.",
    askCta: "Ask us",
    askMailSubject: "A question about Treatment+",
  },
  cta: {
    eyebrow: "Quick clinic setup",
    title: "Start 3D treatment",
    titleMuted: "planning in minutes.",
    description:
      "Open your clinic account, define your catalog and present interactive 3D plans to your patients.",
    register: "Sign Up Now",
    login: "Log In",
  },
  footer: {
    description:
      "A 3D interactive treatment planning, procedure simulation and patient approval platform built for dental clinics and polyclinics.",
    platformTitle: "Platform",
    contactTitle: "Contact",
    classicLink: "Communication Package Samples",
    ultimateLink: "Professional Package Samples",
    register: "Sign Up",
    login: "Log In",
    rights: "All rights reserved.",
    status: "System Status",
    newClinic: "New Clinic Registration",
    address: "Büyükdere Cad. No: 199, Levent / Istanbul, Türkiye",
  },
};
