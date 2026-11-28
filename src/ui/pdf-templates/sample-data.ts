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

export const SAMPLE_TREATMENT_ITEMS_AR = [
  {
    name: "بروتوكول زراعة الأسنان الجراحي All-on-4 (تيتانيوم الدرجة 4)",
    description: "زراعة 4 غرسات جراحية مائلة وتركيب دعامات متعددة الوحدات",
    toothNumber: "12, 14, 22, 24",
    quantity: 4,
    amount: 3200,
    session: "الزيارة الأولى",
  },
  {
    name: "جسر هجين مؤقت ثابت في نفس اليوم",
    description: "تسليم جسر مؤقت مثبت بالبراغي (تحميل فوري) خلال 24 ساعة",
    toothNumber: "الفك العلوي",
    quantity: 1,
    amount: 1100,
    session: "الزيارة الأولى",
  },
  {
    name: "جسر زركونيا دائم متجانس (Prettau)",
    description: "جسر تجميلي كامل الفك من الزركونيا المتجانسة (14 وحدة)",
    toothNumber: "الفك العلوي (14 وحدة)",
    quantity: 14,
    amount: 5600,
    session: "الزيارة الثانية",
  },
  {
    name: "دعامات تيتانيوم مخصصة CAD/CAM وضبط الإطباق",
    description: "التحكم الرقمي في العزم وفحص التطابق السلبي وتوازن الإطباق",
    toothNumber: "الفك بالكامل",
    quantity: 1,
    amount: 750,
    session: "الزيارة الثانية",
  },
];

export const SAMPLE_TREATMENT_ITEMS_RU = [
  {
    name: "Хирургический протокол имплантации All-on-4 (Титан Grade 4)",
    description: "Установка 4 угловых дентальных имплантатов и мультиюнит-абатментов",
    toothNumber: "12, 14, 22, 24",
    quantity: 4,
    amount: 3200,
    session: "1-й Визит",
  },
  {
    name: "Несъемный временный гибридный мост в день операции",
    description: "Винтовая фиксация временного протеза в течение 24 часов (немедленная нагрузка)",
    toothNumber: "Верхняя челюсть",
    quantity: 1,
    amount: 1100,
    session: "1-й Визит",
  },
  {
    name: "Постоянный монолитный циркониевый мост (Prettau)",
    description: "Полный эстетический мост из монолитного циркония на 14 единиц с винтовой фиксацией",
    toothNumber: "Верхняя челюсть (14 ед.)",
    quantity: 14,
    amount: 5600,
    session: "2-й Визит",
  },
  {
    name: "Индивидуальные титановые абатменты CAD/CAM и выверка окклюзии",
    description: "Цифровой контроль торка, тест пассивной посадки и балансировка прикуса",
    toothNumber: "Вся дуга",
    quantity: 1,
    amount: 750,
    session: "2-й Визит",
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

export const SAMPLE_CLINIC_HIGHLIGHTS_AR: StatItem[] = [
  { value: "15+", label: "سنوات الخبرة", description: "التميز في جراحة الفم والفكين" },
  { value: "5", label: "فروع حديثة", description: "مرافق مجهزة بالكامل بأحدث التقنيات" },
  { value: "60+", label: "طبيب متخصص", description: "مجلس طبي متعدد التخصصات" },
  { value: "84+", label: "وحدة أسنان", description: "تعقيم متكامل وراحة قصوى" },
  { value: "150,000+", label: "مريض سعيد", description: "مرضى من 42 دولة حول العالم" },
  { value: "98.6%", label: "نسبة الرضا", description: "تقييم مستقل لرضا المرضى" },
];

export const SAMPLE_CLINIC_HIGHLIGHTS_RU: StatItem[] = [
  { value: "15+", label: "Лет опыта", description: "Мастерство челюстно-лицевой хирургии" },
  { value: "5", label: "Клиник", description: "Полностью оснащенные современные центры" },
  { value: "60+", label: "Врачей", description: "Мультидисциплинарный консилиум" },
  { value: "84+", label: "Установки", description: "Интегрированная стерилизация и комфорт" },
  { value: "150,000+", label: "Пациентов", description: "Пациенты из 42 стран мира" },
  { value: "98.6%", label: "Довольных", description: "Независимый рейтинг удовлетворенности" },
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

export const SAMPLE_DOCTOR_STATS_AR: StatItem[] = [
  { value: "15,000+", label: "زراعة ناجحة", description: "حالات جراحية موثقة" },
  { value: "ITI Fellow", label: "بازل سويسرا", description: "الفريق الدولي لزراعة الأسنان" },
  { value: "DSD Master", label: "تصميم الابتسامة", description: "أخصائي التركيبات التجميلية الرقمية" },
];

export const SAMPLE_DOCTOR_STATS_RU: StatItem[] = [
  { value: "15,000+", label: "Имплантатов", description: "Документированные операции" },
  { value: "ITI Fellow", label: "Базель, Швейцария", description: "Международный совет имплантологов" },
  { value: "DSD Master", label: "Дизайн улыбки", description: "Цифровая эстетическая ортопедия" },
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

export const SAMPLE_LAB_STATS_AR: StatItem[] = [
  { value: "15+", label: "فني أسنان خبير", description: "تخصص في تقنية CAD/CAM" },
  { value: "27,000+", label: "وحدة مصنعة", description: "دقة روبوتية خماسية المحاور" },
  { value: "36 ساعة", label: "تسليم سريع", description: "مختبر رقمي داخلي في العيادة" },
  { value: "100%", label: "مواد معتمدة", description: "بلوكات زركونيا سويسرية وألمانية" },
];

export const SAMPLE_LAB_STATS_RU: StatItem[] = [
  { value: "15+", label: "Зубных техников", description: "Специализация CAD/CAM" },
  { value: "27,000+", label: "Реставраций", description: "5-осевая роботизированная точность" },
  { value: "36 часов", label: "Срок изготовления", description: "Собственная цифровая лаборатория" },
  { value: "100%", label: "Сертификация", description: "Швейцарские и немецкие блоки циркония" },
];

export function getSamplePdfData(overrides?: Partial<PdfPlanData>): PdfPlanData {
  const loc = overrides?.locale || "tr";
  const isEn = loc === "en";
  const isAr = loc === "ar";
  const isRu = loc === "ru";
  const currency = overrides?.currency || (loc !== "tr" ? "EUR" : "TRY");
  const items = isAr
    ? SAMPLE_TREATMENT_ITEMS_AR
    : isRu
    ? SAMPLE_TREATMENT_ITEMS_RU
    : isEn
    ? SAMPLE_TREATMENT_ITEMS_EN
    : SAMPLE_TREATMENT_ITEMS;
  const grandTotal = items.reduce((sum, item) => sum + item.amount, 0);

  const visits: PlanVisit[] = [
    {
      id: "v1",
      title: isAr
        ? "الزيارة الأولى: المرحلة الجراحية والأسنان المؤقتة"
        : isRu
        ? "1-й Визит: Хирургический этап и временный протез"
        : isEn
        ? "1st Visit: Surgical & Provisional Phase"
        : "1. Seans: Cerrahi ve Geçici Diş Aşaması",
      phaseLabel: isAr ? "اليوم 1 - 3" : isRu ? "День 1 - 3" : isEn ? "Day 1 - 3" : "1. - 3. Gün",
      duration: isAr ? "إقامة 3 أيام" : isRu ? "3 дня пребывания" : isEn ? "3 Days Stay" : "3 Günlük Süreç",
      healingPeriod: isAr
        ? "3 أشهر لاندماج العظام"
        : isRu
        ? "3 месяца остеоинтеграции"
        : isEn
        ? "3 Months Osseointegration"
        : "3 Aylık Kemik Kaynaşma Dönemi",
      items: items.slice(0, 2),
      subtotal: items.slice(0, 2).reduce((s, it) => s + it.amount, 0),
      note: isAr
        ? "وضع الغرسات الجراحية المائلة بدقة وتركيب الجسر التجميلي المؤقت الثابت خلال 24 ساعة."
        : isRu
        ? "Точная установка угловых имплантатов и фиксация эстетического временного моста в течение 24 часов."
        : isEn
        ? "Caries removal, surgical placement of angled implants, and delivery of screw-retained aesthetic provisional bridge."
        : "Cerrahi implantların hassas yerleşimi, dikişlerin uygulanması ve 24 saat içinde sabit estetik geçici dişlerin montajı.",
    },
    {
      id: "v2",
      title: isAr
        ? "الزيارة الثانية: تسليم تركيبة الزركونيا الدائمة"
        : isRu
        ? "2-й Визит: Установка постоянного циркониевого протеза"
        : isEn
        ? "2nd Visit: Permanent Prosthetic Delivery"
        : "2. Seans: Kalıcı Zirkonyum Teslim Aşaması",
      phaseLabel: isAr ? "بعد 3 أشهر" : isRu ? "Через 3 месяца" : isEn ? "After 3 Months" : "3 Ay Sonra",
      duration: isAr ? "إقامة 5 أيام" : isRu ? "5 дней пребывания" : isEn ? "5 Days Stay" : "5 Günlük Süreç",
      items: items.slice(2),
      subtotal: items.slice(2).reduce((s, it) => s + it.amount, 0),
      note: isAr
        ? "الطبعات الرقمية النهائية، وتجربة الإطباق، والتسليم النهائي لجسر الزركونيا الدائم."
        : isRu
        ? "Финальные цифровые слепки, регистрация прикуса, примерка и окончательная фиксация монолитного моста."
        : isEn
        ? "Final digital impressions, dynamic bite registration, try-in, and final torque delivery of permanent monolithic bridge."
        : "Kemikleşme kontrolü, mikron hassasiyetinde dijital ölçü, estetik prova ve kalıcı monolitik zirkonyum köprünün teslimi.",
    },
  ];

  return {
    templateId: "klinik-minimal",
    palette: "navy",
    paletteKey: "navy",
    clinicName: "Wise Dental Oral & Maxillofacial Center",
    slogan: isAr
      ? "حيث تلتقي الدقة بالكمال الجمالي"
      : isRu
      ? "Где точность встречается с эстетическим совершенством"
      : isEn
      ? "Where Precision Meets Aesthetic Perfection"
      : "Gülüşünüzün Mükemmelliği İçin Uzman Dokunuş",
    logoUrl: "",
    phone: "+90 (212) 555 01 23",
    email: "info@wisedentalclinic.com",
    website: "www.wisedentalclinic.com",
    address: isAr
      ? "شارع بغداد رقم 142/A كاديكوي، إسطنبول"
      : isRu
      ? "Багдад авеню 142/A, Кадыкёй, Стамбул"
      : isEn
      ? "Bagdat Avenue No: 142/A Kadikoy, Istanbul"
      : "Bağdat Caddesi No: 142/A Kadıköy, İstanbul",
    doctorName: "Dr. Dt. Selin Arslan",
    doctorTitle: isAr
      ? "كبير جراحي الفم وزراعة الأسنان"
      : isRu
      ? "Главный челюстно-лицевой хирург и имплантолог"
      : isEn
      ? "Chief Oral Surgeon & Implantologist"
      : "Ağız, Diş ve Çene Cerrahisi Uzmanı",
    doctorBio: isAr
      ? "تخرجت بمرتبة الشرف من كلية طب الأسنان بجامعة مرمرة، تلتها زمالة متقدمة في الجراحة وزراعة الأسنان في مركز ITI في بازل، سويسرا. بخبرة جراحية تزيد عن 15 عاماً، أجرت الدكتورة أرسلان أكثر من 15,000 عملية زراعة ناجحة."
      : isRu
      ? "С отличием окончила стоматологический факультет Университета Мармара, прошла стажировку по хирургии и имплантологии в центре ITI в Базеле, Швейцария. За 15+ лет практики успешно установила более 15 000 имплантатов."
      : isEn
      ? "Graduated with honors from Marmara University Faculty of Dentistry, followed by advanced surgical and implantology fellowship at ITI Center in Basel, Switzerland. With over 15 years of surgical excellence, Dr. Arslan has successfully placed more than 15,000 implants with a 99.2% success rate."
      : "Marmara Üniversitesi Diş Hekimliği Fakültesi'nden dereceyle mezun olduktan sonra İsviçre Basel ITI Merkezi'nde ileri cerrahi ve implantoloji ihtisasını tamamlamıştır. 15 yılı aşkın cerrahi tecrübesiyle 15.000'den fazla başarılı implant operasyonu gerçekleştirmiştir.",
    doctorStats: isAr
      ? SAMPLE_DOCTOR_STATS_AR
      : isRu
      ? SAMPLE_DOCTOR_STATS_RU
      : isEn
      ? SAMPLE_DOCTOR_STATS_EN
      : SAMPLE_DOCTOR_STATS,
    aboutText: isAr
      ? "مركز وايز لطب الأسنان هو مركز دولي متطور لجراحة الفم والفكين، وتصميم الابتسامة التجميلية، وزراعة الأسنان المتقدمة باستخدام التصوير ثلاثي الأبعاد وأنظمة CAD/CAM الروبوتية."
      : isRu
      ? "Wise Dental — современный международный центр челюстно-лицевой хирургии, эстетического дизайна улыбки и имплантологии, оснащенный 3D КЛКТ-томографией и 5-осевыми системами CAD/CAM."
      : isEn
      ? "Wise Dental is a state-of-the-art international center for oral and maxillofacial surgery, aesthetic smile design, and advanced implantology. Our facility combines 3D CBCT tomography, robotic 5-axis CAD/CAM milling, and hospital-grade sterilization to provide world-class dental care."
      : "Wise Dental, ileri implant cerrahisi, dijital gülüş tasarımı ve estetik diş hekimliğinde uluslararası standartlarda hizmet sunan öncü bir merkezdir. Kliniğimiz, 3D Konik Işınlı Tomografi, 5 eksenli robotik CAD/CAM kazıma merkezi ve A sınıfı sterilizasyon altyapısıyla donatılmıştır.",
    highlights: isAr
      ? SAMPLE_CLINIC_HIGHLIGHTS_AR
      : isRu
      ? SAMPLE_CLINIC_HIGHLIGHTS_RU
      : isEn
      ? SAMPLE_CLINIC_HIGHLIGHTS_EN
      : SAMPLE_CLINIC_HIGHLIGHTS,
    diagnoses: isEn || isAr || isRu ? SAMPLE_TOOTH_DIAGNOSES_EN : SAMPLE_TOOTH_DIAGNOSES,
    visits,
    labStats: isAr
      ? SAMPLE_LAB_STATS_AR
      : isRu
      ? SAMPLE_LAB_STATS_RU
      : isEn
      ? SAMPLE_LAB_STATS_EN
      : SAMPLE_LAB_STATS,
    hotelDetails: {
      name: isAr
        ? "فندق راديسون بلو البوسفور 5 نجوم"
        : isRu
        ? "Резиденция Radisson Blu Bosphorus 5*"
        : isEn
        ? "Radisson Blu Bosphorus 5-Star Residence"
        : "Radisson Blu Bosphorus 5 Yıldızlı Rezidans",
      text: isAr
        ? "إقامة فاخرة بإطلالة بانورامية مع إفطار مجاني وخدمة كونسيرج مخصصة على بعد 5 دقائق من العيادة."
        : isRu
        ? "Проживание в люксе с панорамным видом, завтраком и персональным консьержем в 5 минутах от нашей клиники."
        : isEn
        ? "Luxury suite accommodation with panoramic views, complimentary breakfast, and dedicated clinic concierge located 5 minutes from our facility."
        : "Kliniğimize 5 dakika mesafede, Boğaz manzaralı lüks süit konaklama, açık büfe kahvaltı ve kliniğe özel 7/24 misafir danışmanı hizmeti.",
    },
    patientName: "Kemal Yılmaz",
    planNo: "TP-2026-0842",
    dateStr: isAr
      ? "25 نوفمبر 2026"
      : isRu
      ? "25 ноября 2026 г."
      : isEn
      ? "November 25, 2026"
      : "25 Kasım 2026",
    locale: loc,
    currency,
    welcomeText: isAr
      ? "عزيزي المريض، شكراً لاختيارك عيادتنا. لقد أجرينا تحليلاً سريرياً شاملاً وصممنا خارطة طريق العلاج المخصصة هذه لاستعادة الوظيفة الكاملة والجمال الطبيعي لابتسامتك."
      : isRu
      ? "Уважаемый пациент, благодарим вас за выбор нашей клиники. Мы провели тщательный клинический анализ и разработали этот персональный план лечения для восстановления функции и естественной красоты вашей улыбки."
      : isEn
      ? "Dear Kemal Yılmaz, thank you for choosing our clinic. We have conducted a thorough clinical analysis and designed this personalized comprehensive treatment roadmap to restore both the full masticatory function and the natural beauty of your smile."
      : "Sayın Kemal Yılmaz, kliniğimizi tercih ettiğiniz için teşekkür ederiz. Ağız ve diş sağlığınızı en üst düzeye çıkarmak ve estetik gülüş tasarımınızı hayata geçirmek amacıyla tüm klinik verileriniz incelenmiş ve size özel kapsamlı tedavi yol haritanız hazırlanmıştır.",
    welcomeBody: isAr
      ? "عزيزي المريض، شكراً لاختيارك عيادتنا. لقد أجرينا تحليلاً سريرياً شاملاً وصممنا خارطة طريق العلاج المخصصة هذه لاستعادة الوظيفة الكاملة والجمال الطبيعي لابتسامتك."
      : isRu
      ? "Уважаемый пациент, благодарим вас за выбор нашей клиники. Мы провели тщательный клинический анализ и разработали этот персональный план лечения для восстановления функции и естественной красоты вашей улыбки."
      : isEn
      ? "Dear Kemal Yılmaz, thank you for choosing our clinic. We have conducted a thorough clinical analysis and designed this personalized comprehensive treatment roadmap to restore both the full masticatory function and the natural beauty of your smile."
      : "Sayın Kemal Yılmaz, kliniğimizi tercih ettiğiniz için teşekkür ederiz. Ağız ve diş sağlığınızı en üst düzeye çıkarmak ve estetik gülüş tasarımınızı hayata geçirmek amacıyla tüm klinik verileriniz incelenmiş ve size özel kapsamlı tedavi yol haritanız hazırlanmıştır.",
    kvkkText: isAr
      ? "تم إعداد خطة العلاج هذه بعد فحص سريري وإشعاعي شامل. جميع الإجراءات تتبع بروتوكولات السلامة الصحية الدولية. الأسعار صالحة لمدة 30 يوماً."
      : isRu
      ? "Данный план лечения составлен на основе комплексного клинического и рентгенологического обследования. Все процедуры соответствуют международным протоколам безопасности. Цены действительны 30 дней."
      : isEn
      ? "This treatment plan is prepared following comprehensive clinical and radiological examination. All procedures adhere to international healthcare safety protocols. Prices are valid for 30 calendar days."
      : "İşbu kapsamlı tedavi planı ve fiyatlandırma, hekim muayenesi ve radyolojik inceleme sonrası hazırlanmıştır. Sunulan tedavi protokolü ve maliyetler 30 takvim günü boyunca geçerlidir.",
    legalText: isAr
      ? "تم إعداد خطة العلاج هذه بعد فحص سريري وإشعاعي شامل. جميع الإجراءات تتبع بروتوكولات السلامة الصحية الدولية. الأسعار صالحة لمدة 30 يوماً."
      : isRu
      ? "Данный план лечения составлен на основе комплексного клинического и рентгенологического обследования. Все процедуры соответствуют международным протоколам безопасности. Цены действительны 30 дней."
      : isEn
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
