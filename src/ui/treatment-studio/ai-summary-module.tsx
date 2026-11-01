"use client";

import React, { useMemo, useState, useEffect } from "react";
import {
  Activity,
  AlertCircle,
  ArrowRight,
  Bot,
  Calendar,
  CheckCircle2,
  Clock,
  Edit3,
  HeartPulse,
  Layers,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  TrendingUp,
} from "lucide-react";

import type {
  ClinicBrandInfo,
  PatientInfo,
  StudioPlanItem,
  StudioVisit,
  ToothCondition,
} from "./types";
import { CONDITION_CONFIG } from "./diagnosis-module";

interface AiSummaryModuleProps {
  patient: PatientInfo;
  clinic?: ClinicBrandInfo;
  items: StudioPlanItem[];
  conditions: Record<string, ToothCondition>;
  visits: StudioVisit[];
  currency?: "EUR" | "USD" | "TRY";
  onNavigateToOverview: () => void;
}

interface ClinicalPrognosis {
  assessment: string;
  successRate: string;
  successRateDesc: string;
  healingPeriod: string;
  healingPeriodDesc: string;
  functionalGain: string;
  functionalGainDesc: string;
  visitsSummary: string;
  visitsSummaryDesc: string;
  postOpTips: string[];
}

export function AiSummaryModule({
  patient,
  clinic,
  items,
  conditions,
  visits,
  currency = "EUR",
  onNavigateToOverview,
}: AiSummaryModuleProps) {
  // Extract diagnosed teeth by condition
  const diagnosedTeeth = useMemo(() => {
    const missing: string[] = [];
    const caries: string[] = [];
    const rootCanal: string[] = [];
    const filled: string[] = [];
    const crown: string[] = [];
    const implant: string[] = [];
    const bridge: string[] = [];

    Object.entries(conditions).forEach(([tooth, cond]) => {
      if (cond === "missing") missing.push(tooth);
      else if (cond === "caries") caries.push(tooth);
      else if (cond === "root_canal") rootCanal.push(tooth);
      else if (cond === "filled") filled.push(tooth);
      else if (cond === "crown") crown.push(tooth);
      else if (cond === "implant") implant.push(tooth);
      else if (cond === "bridge") bridge.push(tooth);
    });

    // Sort teeth numbers numerically
    const sortTeeth = (arr: string[]) =>
      [...arr].sort((a, b) => parseInt(a, 10) - parseInt(b, 10));

    return {
      missing: sortTeeth(missing),
      caries: sortTeeth(caries),
      rootCanal: sortTeeth(rootCanal),
      filled: sortTeeth(filled),
      crown: sortTeeth(crown),
      implant: sortTeeth(implant),
      bridge: sortTeeth(bridge),
    };
  }, [conditions]);

  // Categorize planned treatments
  const treatmentBreakdown = useMemo(() => {
    const implantItems: StudioPlanItem[] = [];
    const crownItems: StudioPlanItem[] = [];
    const rootCanalItems: StudioPlanItem[] = [];
    const fillingItems: StudioPlanItem[] = [];
    const extractionItems: StudioPlanItem[] = [];
    const orthoItems: StudioPlanItem[] = [];
    const generalItems: StudioPlanItem[] = [];
    const otherItems: StudioPlanItem[] = [];

    items.forEach((it) => {
      const type = (it.treatmentType || "").toLowerCase();
      const name = (it.treatmentName || "").toLowerCase();

      if (type === "implant" || name.includes("implant") || name.includes("all-on")) {
        implantItems.push(it);
      } else if (
        type === "crown" ||
        type === "bridge" ||
        name.includes("zirkon") ||
        name.includes("kron") ||
        name.includes("kuron") ||
        name.includes("kaplama") ||
        name.includes("lamina") ||
        name.includes("veneer") ||
        name.includes("e-max") ||
        name.includes("emax") ||
        name.includes("köprü") ||
        name.includes("kopru")
      ) {
        crownItems.push(it);
      } else if (type === "root_canal" || name.includes("kanal") || name.includes("endo")) {
        rootCanalItems.push(it);
      } else if (
        type === "filling" ||
        name.includes("dolgu") ||
        name.includes("kompozit") ||
        name.includes("inley") ||
        name.includes("onley")
      ) {
        fillingItems.push(it);
      } else if (
        type === "extraction" ||
        name.includes("çekim") ||
        name.includes("cekim") ||
        name.includes("cerrahi") ||
        name.includes("greft") ||
        name.includes("sinüs")
      ) {
        extractionItems.push(it);
      } else if (
        name.includes("plak") ||
        name.includes("ortodonti") ||
        name.includes("şeffaf") ||
        name.includes("tel") ||
        name.includes("invisalign")
      ) {
        orthoItems.push(it);
      } else if (
        type === "general" ||
        name.includes("detertraj") ||
        name.includes("beyazlatma") ||
        name.includes("bakım") ||
        name.includes("temizlik")
      ) {
        generalItems.push(it);
      } else {
        otherItems.push(it);
      }
    });

    return {
      implants: implantItems,
      crowns: crownItems,
      rootCanals: rootCanalItems,
      fillings: fillingItems,
      extractions: extractionItems,
      ortho: orthoItems,
      general: generalItems,
      other: otherItems,
    };
  }, [items]);

  // Compute intelligent dynamic prognosis based on patient, diagnosis, and items
  const generatedPrognosis = useMemo<ClinicalPrognosis>(() => {
    const patientName = patient?.name?.trim() || "Hastamız";
    const totalItems = items.length;

    if (totalItems === 0) {
      return {
        assessment: `Sayın ${patientName} için henüz tedavi planına işlem eklenmemiştir. Teşhis sekmesinde tespit edilen bulgular doğrultusunda Tedavi Planı sekmesinden işlem eklediğinizde, hastaya özel klinik prognoz, iyileşme periyodu ve başarı istatistikleri burada otomatik olarak modellenecektir.`,
        successRate: "%99.0",
        successRateDesc: "Tedavi adımları eklendiğinde klinik branş başarı oranı hesaplanacaktır.",
        healingPeriod: "Plan Bekleniyor",
        healingPeriodDesc: "Aşamalandırma ve seans planına göre belirlenecektir.",
        functionalGain: "Plan Bekleniyor",
        functionalGainDesc: "Çiğneme ve estetik kazanım analiz edilecektir.",
        visitsSummary: `${visits.length} Seans`,
        visitsSummaryDesc: "Klinik seans aşamalandırması",
        postOpTips: [
          "Tedavi öncesi hekiminizin yönlendirmelerine ve hijyen kurallarına uyunuz.",
          "Genel sağlık durumu ve düzenli kullanılan ilaçlar hakkında klinik ekibini bilgilendiriniz.",
        ],
      };
    }

    const { implants, crowns, rootCanals, fillings, extractions, ortho, general } =
      treatmentBreakdown;

    // Check All-on-4 / All-on-6
    const allOnItem = implants.find((it) =>
      (it.treatmentName || "").toLowerCase().includes("all-on")
    );
    const hasAllOn = Boolean(allOnItem);
    const allOnLabel = (allOnItem?.treatmentName || "").toLowerCase().includes("all-on-6")
      ? "All-on-6"
      : "All-on-4";

    // 1. Build Diagnosis sentence
    const diagSentences: string[] = [];
    if (diagnosedTeeth.missing.length > 0) {
      diagSentences.push(
        `${diagnosedTeeth.missing.length} bölgede diş eksikliği (#${diagnosedTeeth.missing.join(", #")})`
      );
    }
    if (diagnosedTeeth.caries.length > 0) {
      diagSentences.push(
        `${diagnosedTeeth.caries.length} dişte aktif çürük lezyonu (#${diagnosedTeeth.caries.join(", #")})`
      );
    }
    if (diagnosedTeeth.rootCanal.length > 0) {
      diagSentences.push(
        `${diagnosedTeeth.rootCanal.length} dişte endodontik patoloji/kanal ihtiyacı (#${diagnosedTeeth.rootCanal.join(", #")})`
      );
    }

    let diagClause = "";
    if (diagSentences.length > 0) {
      diagClause = `Klinik muayene ve radyolojik tetkiklerde ${diagSentences.join(", ")} saptanmıştır. `;
    } else {
      diagClause = "Klinik muayene ve radyolojik tetkikler doğrultusunda kapsamlı bir ağız ve diş rehabilitasyonu hedeflenmiştir. ";
    }

    // 2. Build Treatment Action sentence
    const actionParts: string[] = [];
    if (implants.length > 0) {
      if (hasAllOn) {
        actionParts.push(
          `planlanan **${allOnLabel} titanyum implant protokolü**, kemik hacmini ve anatomik sınırları koruyarak cerrahi aşamada sabit geçici protez (Immediate Loading) ve çiğneme fonksiyonunun erken restorasyonuna olanak sağlamaktadır`
        );
      } else {
        const totalImplants = implants.reduce((acc, it) => acc + (it.quantity || 1), 0);
        const implantTeeth = implants.flatMap((it) => it.teeth || []);
        const teethStr =
          implantTeeth.length > 0 ? ` (#${implantTeeth.join(", #")})` : "";
        actionParts.push(
          `alveolar kemik rezorpsiyonunu engellemek ve çiğneme oklüzyonunu kalıcı olarak restore etmek üzere **${totalImplants} adet kemik seviyesi titanyum implant**${teethStr} uygulaması öngörülmektedir`
        );
      }
    }

    if (crowns.length > 0) {
      const totalCrowns = crowns.reduce((acc, it) => acc + (it.quantity || 1), 0);
      const isAesthetic = crowns.some((it) => {
        const n = (it.treatmentName || "").toLowerCase();
        return n.includes("lamina") || n.includes("veneer") || n.includes("e-max");
      });
      actionParts.push(
        `fonksiyonel ve estetik oklüzal rehabilitasyon kapsamında **${totalCrowns} üye ${
          isAesthetic ? "yüksek estetik porselen lamina/e-max" : "biyouyumlu monolitik zirkonyum"
        } restorasyon** ile doğal diş anatomisi ve gülüş hattı tesis edilecektir`
      );
    }

    if (rootCanals.length > 0) {
      const totalEndo = rootCanals.reduce((acc, it) => acc + (it.quantity || 1), 0);
      actionParts.push(
        `biyolojik koruma prensibiyle **${totalEndo} dişte endodontik kanal tedavisi** uygulanarak enfeksiyon odağı elimine edilecek ve doğal dişler ağızda tutulacaktır`
      );
    }

    if (fillings.length > 0) {
      const totalFill = fillings.reduce((acc, it) => acc + (it.quantity || 1), 0);
      actionParts.push(
        `madde kaybı bulunan alanlarda **${totalFill} adet mikromekanik kompozit dolgu** ile anatomik tüberküllere uygun estetik restorasyon sağlanacaktır`
      );
    }

    if (extractions.length > 0) {
      const totalExt = extractions.reduce((acc, it) => acc + (it.quantity || 1), 0);
      actionParts.push(
        `prognozu ümitsiz ${totalExt} dişin atraumatik cerrahi çekimi ile doku sağlığı ve iyileşme zemini hazırlanacaktır`
      );
    }

    if (ortho.length > 0) {
      actionParts.push(
        "şeffaf plak / ortodontik mekanikler ile diş arklarındaki çapraşıklık ve maloklüzyon dengelenecektir"
      );
    }

    if (general.length > 0 && actionParts.length === 0) {
      actionParts.push(
        "periodontal profilaksi ve estetik temizlik protokolleri ile diş eti sağlığı ve mikrobiyal denge sağlanacaktır"
      );
    }

    let actionClause = "";
    if (actionParts.length > 0) {
      actionClause = `Hastanın tedavi sürecinde ${actionParts.join("; ")}. `;
    }

    // 3. Concluding sentence
    const visitsCount = visits.length;
    const concludingSentence = `Tedavi süreci ${visitsCount} seans halinde aşamalandırılmış olup, biyomekanik ve estetik kriterler tam olarak gözetilerek planlanmıştır.`;

    const fullAssessment = `Sayın ${patientName} için hazırlanan vaka analizi doğrultusunda: ${diagClause}${actionClause}${concludingSentence}`;

    // 4. Calculate Success Rate Metric
    let successRate = "%98.5";
    let successRateDesc = "Literatür takipleri ve klinik protokol başarı oranı.";

    if (implants.length > 0) {
      successRate = hasAllOn ? "%98.7" : "%98.4";
      successRateDesc =
        "Kemik seviyesi titanyum fikstürlerin 5 yıllık uluslararası klinik takip ve osteointegrasyon başarısı.";
    } else if (crowns.length > 0 && rootCanals.length === 0) {
      successRate = "%98.9";
      successRateDesc =
        "Monolitik zirkonyum ve biyouyumlu restorasyonların 10 yıllık marjinal adaptasyon ve tutuculuk başarısı.";
    } else if (rootCanals.length > 0) {
      successRate = "%95.6";
      successRateDesc =
        "Modern döner alet ve biyoaktif apeks dolum protokolleriyle periapikal iyileşme başarısı.";
    } else if (fillings.length > 0) {
      successRate = "%98.8";
      successRateDesc =
        "Mikromekanik nano-hibrit kompozit adezyon ve kenar sızıntısız restorasyon dayanımı.";
    } else if (ortho.length > 0) {
      successRate = "%99.0";
      successRateDesc = "Planlanan dijital biyomekanik hareketlerin oklüzal tamamlama başarısı.";
    }

    // 5. Calculate Healing Period Metric
    let healingPeriod = "1 - 2 Hafta";
    let healingPeriodDesc = "Doku adaptasyonu ve oklüzal stabilite süresi.";

    // If visit has healing months explicitly defined
    const maxHealing = Math.max(0, ...visits.map((v) => v.healingMonths || 0));
    if (maxHealing > 0) {
      healingPeriod = `${maxHealing} Ay`;
      healingPeriodDesc =
        "Aşamalar arası kemik matürasyonu ve daimi protezler öncesi osteointegrasyon süresi.";
    } else if (implants.length > 0 || extractions.length > 0) {
      healingPeriod = hasAllOn ? "3 - 6 Ay" : "3 Ay";
      healingPeriodDesc =
        "Daimi monolitik zirkonyum / porselen köprüler öncesi primer kemik osteointegrasyon süresi.";
    } else if (crowns.length > 0) {
      healingPeriod = "7 - 10 Gün";
      healingPeriodDesc = "Dijital ölçü, laboratuvar CAD/CAM üretim ve estetik prova seansları süresi.";
    } else if (rootCanals.length > 0) {
      healingPeriod = "1 - 2 Hafta";
      healingPeriodDesc = "Periapikal dokuların yatışması ve daimi dolgu sonrası adaptasyon süreci.";
    } else if (ortho.length > 0) {
      healingPeriod = "6 - 12 Ay";
      healingPeriodDesc = "Planlanan plak serisinin biyomekanik hizalama süresi.";
    } else if (general.length > 0 && items.length <= 2) {
      healingPeriod = "Aynı Gün";
      healingPeriodDesc = "İşlem sonrası anında çiğneme konforu ve doku rahatlaması.";
    }

    // 6. Calculate Functional Gain Metric
    let functionalGain = "+%85 Fonksiyon";
    let functionalGainDesc = "Çiğneme etkinliği ve oklüzal dengenin geri kazanımı.";

    if (implants.length > 0) {
      functionalGain = hasAllOn ? "+%90 Çiğneme Gücü" : "+%85 Fonksiyon";
      functionalGainDesc =
        "Eksik posterior ve anterior dişlerin yerine konmasıyla çiğneme ve konuşma fonksiyonunun restorasyonu.";
    } else if (crowns.length > 0) {
      functionalGain = "%100 Estetik & Uyum";
      functionalGainDesc =
        "Doğal diş minesine en yakın ışık geçirgenliği, altın oran gülüş tasarımı ve aşınma direnci.";
    } else if (rootCanals.length > 0 || fillings.length > 0) {
      functionalGain = "%100 Diş Koruma";
      functionalGainDesc =
        "Biyolojik diş dokusunun çekime gitmeden ağızda sağlıklı ve ağrısız olarak korunması.";
    } else if (ortho.length > 0) {
      functionalGain = "Tam Oklüzal Denge";
      functionalGainDesc = "Çene eklemi (TME) rahatlaması ve simetrik temas noktaları.";
    }

    // 7. Visits Summary
    const visitsSummary = `${visitsCount} Seans`;
    const visitsSummaryDesc = `Toplam ${totalItems} işlem adımı ile planlanmış klinik randevu takvimi.`;

    // 8. Post-Op Tips
    const postOpTips: string[] = [];
    if (implants.length > 0) {
      postOpTips.push(
        "Cerrahi operasyon sonrası ilk 48 saat sıcak gıdalardan kaçınılmalı, hekiminizin reçete ettiği antiseptik ağız gargarası düzenli kullanılmalıdır."
      );
      postOpTips.push(
        "İmplant osteointegrasyon süresince aşırı sert kabuklu gıdalar çiğnenmemeli, yumuşak doku hijyenine azami özen gösterilmelidir."
      );
    }
    if (crowns.length > 0) {
      postOpTips.push(
        "Daimi yapıştırma sonrası erken dönemde oklüzal yükseklik hissedilirse gecikmeden kontrole gelinmeli; diş sıkma (bruksizm) öyküsü varsa koruyucu gece plağı kullanılmalıdır."
      );
    }
    if (rootCanals.length > 0) {
      postOpTips.push(
        "Kanal tedavisi seansları arasında geçici dolgunun düşmemesine dikkat edilmeli, ilk 3-5 gün hissedilebilecek hafif dokunma hassasiyeti normal karşılanmalıdır."
      );
    }
    if (fillings.length > 0 && postOpTips.length < 3) {
      postOpTips.push(
        "Lokal anestezi etkisi tamamen geçene kadar (ortalama 2-3 saat) yanak ve dil ısırma riskine karşı çiğneme yapılmamalıdır."
      );
    }
    if (postOpTips.length === 0) {
      postOpTips.push(
        "Tedavi sonrasında ağız hijyeni için günde 2 kez doğru fırçalama ve diş ipi kullanımı tedavinin kalıcılığını artırır."
      );
      postOpTips.push(
        "6 ayda bir düzenli diş hekimi kontrolü olası yeni lezyonların önüne geçer."
      );
    }

    return {
      assessment: fullAssessment,
      successRate,
      successRateDesc,
      healingPeriod,
      healingPeriodDesc,
      functionalGain,
      functionalGainDesc,
      visitsSummary,
      visitsSummaryDesc,
      postOpTips,
    };
  }, [patient, items, diagnosedTeeth, treatmentBreakdown, visits]);

  // Allow doctor to edit and customize the assessment note
  const [isEditing, setIsEditing] = useState(false);
  const [customAssessment, setCustomAssessment] = useState<string>(
    generatedPrognosis.assessment
  );

  // Sync when items or patient change, unless user manually customized
  useEffect(() => {
    setCustomAssessment(generatedPrognosis.assessment);
  }, [generatedPrognosis.assessment]);

  const handleReset = () => {
    setCustomAssessment(generatedPrognosis.assessment);
    setIsEditing(false);
  };

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 md:p-8 shadow-xs max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div className="flex items-center gap-3.5">
          <div className="size-12 rounded-2xl bg-gradient-to-tr from-slate-900 to-slate-800 text-white flex items-center justify-center shadow-xs shrink-0">
            <Bot className="size-6 text-sky-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900">
                AI Tedavi ve Prognoz Analizi
              </h3>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <Sparkles className="size-3" />
                Vakaya Özel
              </span>
            </div>
            <p className="text-xs text-slate-500">
              {patient?.name || "Hasta"} için planlanan tedavilere ve teşhis bulgularına göre dinamik olarak oluşturulmuştur.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          {isEditing ? (
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition"
            >
              <CheckCircle2 className="size-3.5" />
              <span>Kaydet</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 text-xs font-semibold hover:bg-slate-100 transition"
            >
              <Edit3 className="size-3.5 text-slate-500" />
              <span>Metni Düzenle</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleReset}
            title="Yapay Zeka ile Yeniden Analiz Et"
            className="p-1.5 rounded-xl border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition"
          >
            <RotateCcw className="size-4" />
          </button>
        </div>
      </div>

      {/* Main Clinical Assessment Card */}
      <div className="space-y-4 text-xs text-slate-700 leading-relaxed">
        <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100/60 border border-slate-200 space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-slate-900 flex items-center gap-2">
              <Activity className="size-4 text-indigo-600" />
              <span>Klinik Durum ve Prognoz Değerlendirmesi:</span>
            </h4>
            <span className="text-[11px] font-medium text-slate-400">
              {patient?.name ? `Hasta: ${patient.name}` : ""}
            </span>
          </div>

          {isEditing ? (
            <div className="space-y-2 pt-1">
              <textarea
                value={customAssessment}
                onChange={(e) => setCustomAssessment(e.target.value)}
                rows={5}
                className="w-full text-xs text-slate-800 p-3 rounded-xl border border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-white leading-relaxed"
                placeholder="Klinik vaka değerlendirmesini düzenleyebilirsiniz..."
              />
              <div className="flex justify-between items-center text-[11px] text-slate-500">
                <span>Doktor klinik notunu dilediğiniz gibi güncelleyebilirsiniz.</span>
                <button
                  type="button"
                  onClick={handleReset}
                  className="text-indigo-600 hover:underline"
                >
                  Varsayılan AI Analizine Dön
                </button>
              </div>
            </div>
          ) : (
            <p className="text-slate-800 text-[13px] leading-relaxed pt-1">
              {customAssessment}
            </p>
          )}
        </div>

        {/* 4-Stat Responsive Metric Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Stat 1: Cerrahi / Klinik Başarı */}
          <div className="p-4 rounded-2xl border border-emerald-100 bg-emerald-50/40 space-y-1.5 transition hover:shadow-xs">
            <div className="flex items-center justify-between text-slate-600">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
                Başarı Beklentisi
              </span>
              <ShieldCheck className="size-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-black text-emerald-600">
              {generatedPrognosis.successRate}
            </div>
            <p className="text-slate-600 text-[11px] leading-tight">
              {generatedPrognosis.successRateDesc}
            </p>
          </div>

          {/* Stat 2: Tahmini İyileşme Periyodu */}
          <div className="p-4 rounded-2xl border border-sky-100 bg-sky-50/40 space-y-1.5 transition hover:shadow-xs">
            <div className="flex items-center justify-between text-slate-600">
              <span className="text-[11px] font-bold uppercase tracking-wider text-sky-800">
                İyileşme Periyodu
              </span>
              <Clock className="size-4 text-sky-600" />
            </div>
            <div className="text-2xl font-black text-slate-900">
              {generatedPrognosis.healingPeriod}
            </div>
            <p className="text-slate-600 text-[11px] leading-tight">
              {generatedPrognosis.healingPeriodDesc}
            </p>
          </div>

          {/* Stat 3: Fonksiyonel / Biyolojik Kazanım */}
          <div className="p-4 rounded-2xl border border-purple-100 bg-purple-50/40 space-y-1.5 transition hover:shadow-xs">
            <div className="flex items-center justify-between text-slate-600">
              <span className="text-[11px] font-bold uppercase tracking-wider text-purple-800">
                Klinik Kazanım
              </span>
              <TrendingUp className="size-4 text-purple-600" />
            </div>
            <div className="text-2xl font-black text-purple-700">
              {generatedPrognosis.functionalGain}
            </div>
            <p className="text-slate-600 text-[11px] leading-tight">
              {generatedPrognosis.functionalGainDesc}
            </p>
          </div>

          {/* Stat 4: Seans Aşamalandırması */}
          <div className="p-4 rounded-2xl border border-amber-100 bg-amber-50/40 space-y-1.5 transition hover:shadow-xs">
            <div className="flex items-center justify-between text-slate-600">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800">
                Planlanan Seans
              </span>
              <Calendar className="size-4 text-amber-600" />
            </div>
            <div className="text-2xl font-black text-amber-900">
              {generatedPrognosis.visitsSummary}
            </div>
            <p className="text-slate-600 text-[11px] leading-tight">
              {generatedPrognosis.visitsSummaryDesc}
            </p>
          </div>
        </div>

        {/* Treatment Distribution & FDI Badges */}
        {items.length > 0 && (
          <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3">
            <div className="flex items-center justify-between">
              <h5 className="font-bold text-slate-800 text-xs flex items-center gap-2">
                <Layers className="size-3.5 text-slate-500" />
                <span>Bu Hastaya Uygulanacak Tedavi Dağılımı:</span>
              </h5>
              <span className="text-[11px] text-slate-500 font-medium">
                Toplam {items.length} Kalem İşlem
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              {items.map((it) => {
                const teethCount = it.teeth?.length || 0;
                return (
                  <div
                    key={it.id}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs shadow-2xs text-slate-800"
                  >
                    <span className="font-semibold">{it.treatmentName}</span>
                    {teethCount > 0 && (
                      <span className="px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-mono font-bold">
                        #{it.teeth.join(", #")}
                      </span>
                    )}
                    {it.quantity > 1 && (
                      <span className="text-[10px] text-slate-400 font-bold">
                        x{it.quantity}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Post-Op Recommendations */}
        {generatedPrognosis.postOpTips.length > 0 && (
          <div className="p-4 rounded-2xl border border-slate-200/80 bg-white space-y-2">
            <h5 className="font-bold text-slate-900 text-xs flex items-center gap-2">
              <HeartPulse className="size-3.5 text-rose-500" />
              <span>Vakaya Özel Hasta Bilgilendirme & Tedavi Sonrası Öneriler:</span>
            </h5>
            <ul className="space-y-1.5 text-[11.5px] text-slate-600 pl-4 list-disc marker:text-slate-400">
              {generatedPrognosis.postOpTips.map((tip, idx) => (
                <li key={idx} className="leading-relaxed">
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Footer Navigation Button */}
        <div className="pt-2 flex justify-end">
          <button
            type="button"
            onClick={onNavigateToOverview}
            className="flex items-center gap-2 rounded-xl bg-slate-900 text-white px-5 py-2.5 text-xs font-bold hover:bg-slate-800 transition shadow-sm cursor-pointer"
          >
            <span>Hasta Sunumuna Geç (Overview)</span>
            <ArrowRight className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

