import type { LandingDictionary } from "./dictionary";

export const tr: LandingDictionary = {
  meta: {
    title: "Treatment+ | Diş Klinikleri İçin 3D Tedavi Sunum Platformu",
    description:
      "Hastalarınıza tedavi planlarını interaktif 3D odontogramlar üzerinde gösterin. Animasyonlu prosedürler ve mobil uyumlu, güvenli paylaşılabilir planlarla vaka kabul oranınızı artırın.",
  },
  header: {
    tagline: "3D Dental SaaS",
    login: "Giriş Yap",
    register: "Kayıt Ol",
    languageMenuLabel: "Dil seçimi",
    homeAriaLabel: "Treatment+ ana sayfa",
  },
  hero: {
    titlePrefix: "Tedavi Planlamasında",
    titleHighlight: "3 Boyutlu Dönüşüm",
    subtitle:
      "Karmaşık röntgenleri ve anlaşılması güç fiyat listelerini geride bırakın. Hastalarınıza tedavi süreçlerini interaktif 3D odontogramlar üzerinde gösterin; klinik güvenini ve vaka kabul oranlarını ilk muayenede artırın.",
    demoCta: "Get your demo",
    demoMailSubject: "Treatment+ demo talebi",
    plansAriaLabel: "Örnek planlar",
    sampleCta: "Örnek Planı İncele",
    professionalCta: "Profesyonel Planı İncele",
    metrics: [
      { title: "60 FPS WebGL", caption: "Tarayıcıda kurulumsuz 3D" },
      { title: "+%42 Onay", caption: "İlk muayenede vaka kabulü" },
      { title: "KVKK Uyumlu", caption: "İzole klinik veri güvenliği" },
    ],
  },
  clients: {
    ariaLabel: "Müşterilerimiz",
    title: "Bizi tercih eden klinikler",
  },
  features: {
    title: "Hastanız Tedaviyi Görünce Güvenle Onaylar",
    items: [
      {
        title: "İnteraktif 3D Odontogramlar",
        description: "360° döndürülebilir çene modelinde bulguları ve planı gösterin.",
      },
      {
        title: "Animasyonlu Tedavi Prosedürleri",
        description: "İmplant, kanal ve protez aşamalarını adım adım izletin.",
      },
      {
        title: "Mobil Uyumlu & Paylaşılabilir Raporlar",
        description: "PDF yerine hastaya özel güvenli bir bağlantı gönderin.",
      },
    ],
    toothAriaLabel: "Sürükleyerek döndürülebilen interaktif 3D diş modeli",
    toothFallbackAlt: "Beyaz diş illüstrasyonu",
    dragHint: "Sürükleyerek döndürün",
  },
  stats: {
    ariaLabel: "Klinik İstatistikleri ve Sosyal Kanıt",
    eyebrow: "Ölçülebilir Klinik Dönüşümü",
    headlinePrefix: "Kliniklerin hasta kabul oranını",
    headlineHighlight: "ortalama %42 artırıyor",
    description:
      "Hastalar anlamadıkları tedavi planlarını erteleme eğilimindedir. 3 boyutlu görsel konsültasyon, fiyat odaklı tereddütleri şeffaf klinik güvene dönüştürür.",
    items: [
      {
        value: "%42",
        label: "Daha Yüksek Vaka Kabul Oranı",
        detail: "Çok aşamalı implant ve estetik protetik tedavi planlarında",
      },
      {
        value: "2.4x",
        label: "Daha Hızlı Hasta Karar Süreci",
        detail: "Mobil paylaşılabilir interaktif 3D hasta sunumu ile",
      },
      {
        value: "%50",
        label: "Daha Kısa Konsültasyon Süresi",
        detail: "Karmaşık röntgen anlatımı yerine doğrudan 3D simülasyon",
      },
    ],
    quote:
      "Hastalarımız 3D model üzerinde implant açısını ve zirkonyum restorasyonu gördüğünde, tedavi sürecine çok daha yüksek bir güvenle onay veriyor.",
    quoteSource: "Ağız & Diş Sağlığı Poliklinikleri",
  },
  workflow: {
    eyebrow: "Klinik İş Akışı",
    title: "3 Adımda İnteraktif Tedavi Planlama",
    subtitle:
      "Mevcut klinik iş akışınızı yavaşlatmadan dakikalar içinde 3D sunum hazırlayın.",
    stepLabel: "Adım",
    steps: [
      {
        badge: "Katalog & Planlama",
        title: "Teşhis ve Tedaviyi İşaretleyin",
        description:
          "Klinik kataloğunuzdan diş numaralarını ve prosedürleri seçin; çok fazlı tedavi planını saniyeler içinde oluşturun.",
      },
      {
        badge: "3D Görsel Sunum",
        title: "3D Odontogramda Anlatın",
        description:
          "Muayene koltuğunda veya konsültasyon ekranında hastanıza uygulanacak işlemi 3 boyutlu model üzerinde döndürerek gösterin.",
      },
      {
        badge: "Mobil Paylaşım",
        title: "Dijital Paylaşın ve Onay Alın",
        description:
          "PDF çıktısına gerek kalmadan güvenli hasta bağlantısını paylaşın; hastanız mobil cihazından planı inceleyip onaylasın.",
      },
    ],
  },
  pricing: {
    eyebrow: "Klinik Çözüm Paketleri",
    title: "Kliniğinize Uygun Sunum Paketini Keşfedin",
    subtitle:
      "Örnek hasta sunumlarını inceleyerek kliniğiniz için en uygun paketi seçin.",
    recommended: "Önerilen",
    classic: {
      name: "Communication Paket",
      tag: "3D Tedavi Filmi",
      subtitle:
        "Tedavi planını 3 boyutlu film olarak sunmak ve hastayı hızla bilgilendirmek isteyen klinikler için.",
      perks: [
        "Hastaya özel 3D tedavi filmi (3D movie)",
        "Faz bazlı yapılandırılmış tedavi ve işlem planı",
        "Klinik logosu, hekim profili ve karşılama mektubu",
        "Mobil uyumlu paylaşılabilir hasta planı bağlantısı",
      ],
      cta: "Örnekleri Gör",
    },
    ultimate: {
      name: "Professional Paket",
      tag: "3D Film + Web Sitesi",
      subtitle:
        "3D tedavi filmine ek olarak planı hastaya özel bir web sitesi olarak sunmak isteyen klinikler için.",
      perks: [
        "Communication Paket'in tüm özellikleri (3D tedavi filmi dahil)",
        "Hastaya özel, kliniğinize ait web sitesi olarak sunum",
        "Klinik tanıtımı, laboratuvar, ödüller ve konaklama bölümleri",
        "Çoklu dil, özel renk paleti ve gelişmiş hasta onay ekranı",
      ],
      cta: "Örnekleri Gör",
    },
  },
  cta: {
    eyebrow: "Hızlı Klinik Kurulumu",
    title: "Dakikalar içinde 3D tedavi planlamaya başlayın",
    description:
      "Klinik hesabınızı açın, kataloğunuzu tanımlayın ve hastalarınıza interaktif 3D planlar sunun.",
    register: "Hemen Kayıt Ol",
    login: "Giriş Yap",
  },
  footer: {
    description:
      "Diş klinikleri ve poliklinikler için geliştirilen 3 boyutlu interaktif tedavi planlama, prosedür simülasyonu ve hasta onay platformu.",
    platformTitle: "Platform",
    contactTitle: "İletişim",
    classicLink: "Communication Paket Örnekleri",
    ultimateLink: "Professional Paket Örnekleri",
    register: "Kayıt Ol",
    login: "Giriş Yap",
    rights: "Tüm hakları saklıdır.",
    status: "Sistem Durumu",
    newClinic: "Yeni Klinik Kaydı",
    address: "Büyükdere Cad. No: 199, Levent / İstanbul",
  },
};
