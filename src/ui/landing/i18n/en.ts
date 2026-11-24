import type { LandingDictionary } from "./dictionary";

export const en: LandingDictionary = {
  meta: {
    title: "Treatment+ | 3D Treatment Presentation Platform for Dental Clinics",
    description:
      "Show patients their treatment plans on interactive 3D odontograms. Raise case acceptance with animated procedures and secure, mobile-friendly plans you can share.",
  },
  header: {
    tagline: "3D Dental SaaS",
    login: "Log In",
    register: "Sign Up",
    languageMenuLabel: "Select language",
    homeAriaLabel: "Treatment+ home",
  },
  hero: {
    titlePrefix: "Treatment Planning,",
    titleHighlight: "Transformed in 3D",
    subtitle:
      "Leave complex X-rays and confusing price lists behind. Walk your patients through every treatment on interactive 3D odontograms, and raise clinical trust and case acceptance from the very first consultation.",
    demoCta: "Get your demo",
    demoMailSubject: "Treatment+ demo request",
    plansAriaLabel: "Sample plans",
    sampleCta: "Explore Sample Plan",
    professionalCta: "Explore Professional Plan",
    metrics: [
      { title: "60 FPS WebGL", caption: "Install-free 3D in the browser" },
      { title: "+42% Acceptance", caption: "Case acceptance at first visit" },
      { title: "KVKK Compliant", caption: "Isolated clinic data security" },
    ],
  },
  clients: {
    ariaLabel: "Our clients",
    title: "Clinics that trust us",
  },
  features: {
    title: "Patients Approve With Confidence When They See Their Treatment",
    items: [
      {
        title: "Interactive 3D Odontograms",
        description:
          "Show findings and treatment plans on a 360° rotatable jaw model.",
      },
      {
        title: "Animated Treatment Procedures",
        description:
          "Walk through implant, root canal and prosthetic stages step by step.",
      },
      {
        title: "Mobile-Friendly, Shareable Reports",
        description: "Send a secure, patient-specific link instead of a PDF.",
      },
    ],
    toothAriaLabel: "Interactive 3D tooth model you can rotate by dragging",
    toothFallbackAlt: "Illustration of a white tooth",
    dragHint: "Drag to rotate",
  },
  stats: {
    ariaLabel: "Clinical statistics and social proof",
    eyebrow: "Measurable Clinical Impact",
    headlinePrefix: "Clinics raise patient acceptance by",
    headlineHighlight: "an average of 42%",
    description:
      "Patients tend to postpone treatment plans they don't understand. 3D visual consultation turns price-driven hesitation into transparent clinical trust.",
    items: [
      {
        value: "42%",
        label: "Higher Case Acceptance Rate",
        detail: "In multi-stage implant and aesthetic prosthetic treatment plans",
      },
      {
        value: "2.4x",
        label: "Faster Patient Decisions",
        detail: "With mobile-shareable, interactive 3D patient presentations",
      },
      {
        value: "50%",
        label: "Shorter Consultations",
        detail: "Direct 3D simulation instead of explaining complex X-rays",
      },
    ],
    quote:
      "When our patients see the implant angle and the zirconia restoration on a 3D model, they approve treatment with far greater confidence.",
    quoteSource: "Oral & Dental Health Polyclinics",
  },
  workflow: {
    eyebrow: "Clinical Workflow",
    title: "Interactive Treatment Planning in 3 Steps",
    subtitle:
      "Prepare a 3D presentation in minutes without slowing down your existing clinical workflow.",
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
  pricing: {
    eyebrow: "Clinical Solution Packages",
    title: "Find the Presentation Package That Fits Your Clinic",
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
  },
  cta: {
    eyebrow: "Quick Clinic Setup",
    title: "Start 3D treatment planning in minutes",
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
