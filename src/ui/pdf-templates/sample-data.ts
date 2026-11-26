import type { PdfPlanData, StatItem, ToothFinding, PlanVisit } from "./types";

export const SAMPLE_TREATMENT_ITEMS = [
  {
    name: "All-on-4 Cerrahi İmplant Protokolü (Grade 4 Titanyum)",
    description: "Alt ve üst çene 4'er adet açılı cerrahi implant yerleşimi ve multi-unit abutment montajı",
    toothNumber: "12, 14, 22, 24",
    quantity: 4,
    amount: 54000,
    session: "1. Seans",
  },
  {
    name: "Aynı Gün Sabit Geçici Hibrit Köprü",
    description: "Cerrahi sonrası 24 saat içinde vidalı geçici hibrit protez teslimi (Immediate Loading)",
    toothNumber: "Üst Çene",
    quantity: 1,
    amount: 18000,
    session: "1. Seans",
  },
  {
    name: "Monolitik Zirkonyum Kalıcı Protez Köprü (Prettau)",
    description: "14 üyeli tam ark vida tutuculu monolitik zirkonyum estetik hibrit köprü",
    toothNumber: "Üst Çene (14 Üye)",
    quantity: 14,
    amount: 98000,
    session: "2. Seans",
  },
  {
    name: "Özel CAD/CAM Titanyum Dayanak ve Oklüzyon Uyumu",
    description: "Dijital tork kontrolü, pasif uyum testi ve artikülatör kapanış optimizasyonu",
    toothNumber: "Tüm Ark",
    quantity: 1,
    amount: 12500,
    session: "2. Seans",
  },
];

export const SAMPLE_TREATMENT_ITEMS_EN = [
  {
    name: "All-on-4 Surgical Implant Protocol (Grade 4 Titanium)",
    description: "4 angled surgical dental implants and multi-unit abutment placement",
    toothNumber: "12, 14, 22, 24",
    quantity: 4,
    amount: 3200,
    session: "1st Visit",
  },
  {
    name: "Same-Day Fixed Provisional Hybrid Bridge",
    description: "Screw-retained immediate loading provisional bridge within 24 hours",
    toothNumber: "Upper Arch",
    quantity: 1,
    amount: 1100,
    session: "1st Visit",
  },
  {
    name: "Monolithic Zirconia Permanent Bridge (Prettau)",
    description: "14-unit full arch screw-retained monolithic zirconia aesthetic bridge",
    toothNumber: "Upper Arch (14 Units)",
    quantity: 14,
    amount: 5600,
    session: "2nd Visit",
  },
  {
    name: "Custom CAD/CAM Titanium Abutments & Occlusion Fit",
    description: "Digital torque control, passive seating check and dynamic articulation balancing",
    toothNumber: "Full Arch",
    quantity: 1,
    amount: 750,
    session: "2nd Visit",
  },
];

export const SAMPLE_CLINIC_HIGHLIGHTS: StatItem[] = [
  { value: "15+", label: "Yıllık Deneyim", description: "Ağız ve çene cerrahisinde uzmanlık" },
  { value: "5", label: "Modern Şube", description: "Tam donanımlı teknolojik klinikler" },
  { value: "60+", label: "Uzman Hekim", description: "Tüm diş hekimliği branşlarında kurul" },
  { value: "84+", label: "Diş Üniti", description: "Entegre sterilizasyon ve konfor" },
  { value: "150.000+", label: "Mutlu Hasta", description: "Dünyanın 42 ülkesinden hasta kabulü" },
  { value: "%98.6", label: "Memnuniyet Oranı", description: "Bağımsız hasta memnuniyet skoru" },
];

export const SAMPLE_CLINIC_HIGHLIGHTS_EN: StatItem[] = [
  { value: "15+", label: "Years Experience", description: "Oral and maxillofacial excellence" },
  { value: "5", label: "Modern Clinics", description: "Fully equipped state-of-the-art facilities" },
  { value: "60+", label: "Specialist Doctors", description: "Multidisciplinary clinical council" },
  { value: "84+", label: "Dental Units", description: "Integrated sterilization and comfort" },
  { value: "150,000+", label: "Happy Patients", description: "Patients from 42 countries worldwide" },
  { value: "98.6%", label: "Satisfaction Rate", description: "Independently audited patient satisfaction" },
];

export const SAMPLE_DOCTOR_STATS: StatItem[] = [
  { value: "15.000+", label: "Başarılı İmplant", description: "Belgelenmiş cerrahi vaka" },
  { value: "ITI Fellow", label: "Basel İsviçre", description: "Uluslararası İmplantoloji Konseyi" },
  { value: "DSD Master", label: "Gülüş Tasarımı", description: "Dijital estetik protetik uzmanı" },
];

export const SAMPLE_DOCTOR_STATS_EN: StatItem[] = [
  { value: "15,000+", label: "Implants Placed", description: "Documented surgical cases" },
  { value: "ITI Fellow", label: "Basel Switzerland", description: "International Team for Implantology" },
  { value: "DSD Master", label: "Smile Designer", description: "Digital aesthetic prosthetics" },
];

export const SAMPLE_TOOTH_DIAGNOSES: ToothFinding[] = [
  { toothNumber: "14", condition: "Kök Kırığı & İleri Kemik Kaybı", treatment: "Çekim & All-on-4 Açılı İmplant", status: "implant" },
  { toothNumber: "12", condition: "Eksik Diş (Agenezis)", treatment: "All-on-4 Ön Aks İmplantı", status: "missing" },
  { toothNumber: "11", condition: "İleri Derece Aşınma & Estetik Kayıp", treatment: "Monolitik Zirkonyum Restorasyon", status: "crown" },
  { toothNumber: "21", condition: "Kron Kırığı & Renkleşme", treatment: "Monolitik Zirkonyum Restorasyon", status: "crown" },
  { toothNumber: "22", condition: "Eksik Diş", treatment: "All-on-4 Ön Aks İmplantı", status: "missing" },
  { toothNumber: "24", condition: "Periapikal Lezyon", treatment: "Çekim & All-on-4 Açılı İmplant", status: "implant" },
  { toothNumber: "46", condition: "Eski Amalgam & Derin Çürük", treatment: "Kanal Yenileme & Estetik İnley", status: "cavity" },
  { toothNumber: "36", condition: "Sağlıklı Doğal Diş", treatment: "Koruyucu Flor & Rutin Kontrol", status: "healthy" },
];

export const SAMPLE_TOOTH_DIAGNOSES_EN: ToothFinding[] = [
  { toothNumber: "14", condition: "Root Fracture & Bone Defect", treatment: "Extraction & Angled Implant", status: "implant" },
  { toothNumber: "12", condition: "Missing Tooth", treatment: "All-on-4 Anterior Implant", status: "missing" },
  { toothNumber: "11", condition: "Severe Attrition & Shade Loss", treatment: "Monolithic Zirconia Restoration", status: "crown" },
  { toothNumber: "21", condition: "Crown Fracture & Discoloration", treatment: "Monolithic Zirconia Restoration", status: "crown" },
  { toothNumber: "22", condition: "Missing Tooth", treatment: "All-on-4 Anterior Implant", status: "missing" },
  { toothNumber: "24", condition: "Periapical Radiolucency", treatment: "Extraction & Angled Implant", status: "implant" },
  { toothNumber: "46", condition: "Failing Amalgam & Recurrent Caries", treatment: "Root Retreatment & Aesthetic Inlay", status: "cavity" },
  { toothNumber: "36", condition: "Intact Natural Tooth", treatment: "Preventive Fluoride & Monitoring", status: "healthy" },
];

export const SAMPLE_LAB_STATS: StatItem[] = [
  { value: "15+", label: "Usta Diş Teknisyeni", description: "CAD/CAM uzmanlığı" },
  { value: "27.000+", label: "Üretilen Zirkonyum", description: "Hassas frezeleme" },
  { value: "36 Saat", label: "Hızlı Teslimat", description: "Klinik içi dijital laboratuvar" },
  { value: "%100", label: "Orijinal Materyal", description: "İsviçre & Alman sertifikalı bloklar" },
];

export const SAMPLE_LAB_STATS_EN: StatItem[] = [
  { value: "15+", label: "Master Technicians", description: "CAD/CAM specialization" },
  { value: "27,000+", label: "Units Crafted", description: "5-axis robotic precision" },
  { value: "36 Hours", label: "Express Turnaround", description: "In-house digital laboratory" },
  { value: "100%", label: "Certified Materials", description: "Swiss & German zirconia blocks" },
];

export function getSamplePdfData(overrides?: Partial<PdfPlanData>): PdfPlanData {
  const isEn = overrides?.locale === "en";
  const currency = overrides?.currency || (isEn ? "EUR" : "TRY");
  const items = isEn ? SAMPLE_TREATMENT_ITEMS_EN : SAMPLE_TREATMENT_ITEMS;
  const grandTotal = items.reduce((sum, item) => sum + item.amount, 0);

  const visits: PlanVisit[] = [
    {
      id: "v1",
      title: isEn ? "1st Visit: Surgical & Provisional Phase" : "1. Seans: Cerrahi ve Geçici Diş Aşaması",
      phaseLabel: isEn ? "Day 1 - 3" : "1. - 3. Gün",
      duration: isEn ? "3 Days Stay" : "3 Günlük Süreç",
      healingPeriod: isEn ? "3 Months Osseointegration" : "3 Aylık Kemik Kaynaşma Dönemi",
      items: items.filter((it) => it.session?.includes("1")),
      subtotal: items.filter((it) => it.session?.includes("1")).reduce((s, it) => s + it.amount, 0),
      note: isEn
        ? "Caries removal, surgical placement of angled implants, and delivery of screw-retained aesthetic provisional bridge."
        : "Cerrahi implantların hassas yerleşimi, dikişlerin uygulanması ve 24 saat içinde sabit estetik geçici dişlerin montajı.",
    },
    {
      id: "v2",
      title: isEn ? "2nd Visit: Permanent Prosthetic Delivery" : "2. Seans: Kalıcı Zirkonyum Teslim Aşaması",
      phaseLabel: isEn ? "After 3 Months" : "3 Ay Sonra",
      duration: isEn ? "5 Days Stay" : "5 Günlük Süreç",
      items: items.filter((it) => it.session?.includes("2")),
      subtotal: items.filter((it) => it.session?.includes("2")).reduce((s, it) => s + it.amount, 0),
      note: isEn
        ? "Final digital impressions, dynamic bite registration, try-in, and final torque delivery of permanent monolithic bridge."
        : "Kemikleşme kontrolü, mikron hassasiyetinde dijital ölçü, estetik prova ve kalıcı monolitik zirkonyum köprünün teslimi.",
    },
  ];

  return {
    templateId: "klinik-minimal",
    palette: "navy",
    paletteKey: "navy",
    clinicName: "Wise Dental Oral & Maxillofacial Center",
    slogan: isEn ? "Where Precision Meets Aesthetic Perfection" : "Gülüşünüzün Mükemmelliği İçin Uzman Dokunuş",
    logoUrl: "",
    phone: "+90 (212) 555 01 23",
    email: "info@wisedentalclinic.com",
    website: "www.wisedentalclinic.com",
    address: isEn ? "Bagdat Avenue No: 142/A Kadikoy, Istanbul" : "Bağdat Caddesi No: 142/A Kadıköy, İstanbul",
    doctorName: "Dr. Dt. Selin Arslan",
    doctorTitle: isEn ? "Chief Oral Surgeon & Implantologist" : "Ağız, Diş ve Çene Cerrahisi Uzmanı",
    doctorBio: isEn
      ? "Graduated with honors from Marmara University Faculty of Dentistry, followed by advanced surgical and implantology fellowship at ITI Center in Basel, Switzerland. With over 15 years of surgical excellence, Dr. Arslan has successfully placed more than 15,000 implants with a 99.2% success rate."
      : "Marmara Üniversitesi Diş Hekimliği Fakültesi'nden dereceyle mezun olduktan sonra İsviçre Basel ITI Merkezi'nde ileri cerrahi ve implantoloji ihtisasını tamamlamıştır. 15 yılı aşkın cerrahi tecrübesiyle 15.000'den fazla başarılı implant operasyonu gerçekleştirmiştir.",
    doctorStats: isEn ? SAMPLE_DOCTOR_STATS_EN : SAMPLE_DOCTOR_STATS,
    aboutText: isEn
      ? "Wise Dental is a state-of-the-art international center for oral and maxillofacial surgery, aesthetic smile design, and advanced implantology. Our facility combines 3D CBCT tomography, robotic 5-axis CAD/CAM milling, and hospital-grade sterilization to provide world-class dental care."
      : "Wise Dental, ileri implant cerrahisi, dijital gülüş tasarımı ve estetik diş hekimliğinde uluslararası standartlarda hizmet sunan öncü bir merkezdir. Kliniğimiz, 3D Konik Işınlı Tomografi, 5 eksenli robotik CAD/CAM kazıma merkezi ve A sınıfı sterilizasyon altyapısıyla donatılmıştır.",
    highlights: isEn ? SAMPLE_CLINIC_HIGHLIGHTS_EN : SAMPLE_CLINIC_HIGHLIGHTS,
    diagnoses: isEn ? SAMPLE_TOOTH_DIAGNOSES_EN : SAMPLE_TOOTH_DIAGNOSES,
    visits,
    labStats: isEn ? SAMPLE_LAB_STATS_EN : SAMPLE_LAB_STATS,
    hotelDetails: {
      name: isEn ? "Radisson Blu Bosphorus 5-Star Residence" : "Radisson Blu Bosphorus 5 Yıldızlı Rezidans",
      text: isEn
        ? "Luxury suite accommodation with panoramic views, complimentary breakfast, and dedicated clinic concierge located 5 minutes from our facility."
        : "Kliniğimize 5 dakika mesafede, Boğaz manzaralı lüks süit konaklama, açık büfe kahvaltı ve kliniğe özel 7/24 misafir danışmanı hizmeti.",
    },
    patientName: "Kemal Yılmaz",
    planNo: "TP-2026-0842",
    dateStr: isEn ? "November 25, 2026" : "25 Kasım 2026",
    locale: isEn ? "en" : "tr",
    currency,
    welcomeText: isEn
      ? "Dear Kemal Yılmaz, thank you for choosing our clinic. We have conducted a thorough clinical analysis and designed this personalized comprehensive treatment roadmap to restore both the full masticatory function and the natural beauty of your smile."
      : "Sayın Kemal Yılmaz, kliniğimizi tercih ettiğiniz için teşekkür ederiz. Ağız ve diş sağlığınızı en üst düzeye çıkarmak ve estetik gülüş tasarımınızı hayata geçirmek amacıyla tüm klinik verileriniz incelenmiş ve size özel kapsamlı tedavi yol haritanız hazırlanmıştır.",
    welcomeBody: isEn
      ? "Dear Kemal Yılmaz, thank you for choosing our clinic. We have conducted a thorough clinical analysis and designed this personalized comprehensive treatment roadmap to restore both the full masticatory function and the natural beauty of your smile."
      : "Sayın Kemal Yılmaz, kliniğimizi tercih ettiğiniz için teşekkür ederiz. Ağız ve diş sağlığınızı en üst düzeye çıkarmak ve estetik gülüş tasarımınızı hayata geçirmek amacıyla tüm klinik verileriniz incelenmiş ve size özel kapsamlı tedavi yol haritanız hazırlanmıştır.",
    kvkkText: isEn
      ? "This treatment plan is prepared following comprehensive clinical and radiological examination. All procedures adhere to international healthcare safety protocols. Prices are valid for 30 calendar days."
      : "İşbu kapsamlı tedavi planı ve fiyatlandırma, hekim muayenesi ve radyolojik inceleme sonrası hazırlanmıştır. Sunulan tedavi protokolü ve maliyetler 30 takvim günü boyunca geçerlidir.",
    legalText: isEn
      ? "This treatment plan is prepared following comprehensive clinical and radiological examination. All procedures adhere to international healthcare safety protocols. Prices are valid for 30 calendar days."
      : "İşbu kapsamlı tedavi planı ve fiyatlandırma, hekim muayenesi ve radyolojik inceleme sonrası hazırlanmıştır. Sunulan tedavi protokolü ve maliyetler 30 takvim günü boyunca geçerlidir.",
    showMotifs: true,
    format: "booklet",
    items,
    grandTotal,
    shareUrl: "https://treatmentplus.app/p/TP-2026-0842",
    simulationUrl: "https://treatmentplus.app/p/TP-2026-0842?viz=1",
    ...overrides,
  };
}
