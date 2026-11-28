import React from "react";
import type { PdfPalette, PdfPlanData } from "../types";
import { WisePageWrapper, WiseHeader, WiseFooter, getThemeColor } from "../wise-frame";

export function Booklet24Page20Awards({
  data,
  palette,
}: {
  data: PdfPlanData;
  palette: PdfPalette;
}) {
  const isEn = data.locale === "en";
  const isAr = data.locale === "ar";
  const isRu = data.locale === "ru";
  const themeColor = getThemeColor(palette, "#0b2938");

  return (
    <WisePageWrapper
      bgImage="/pdf-assets/wise/page_20.jpg"
      className="flex flex-col justify-between"
    >
      {/* 1. Eğimli Başlık Bandı (80.1mm) */}
      <WiseHeader
        eyebrow={
          isAr
            ? "اعتماداتنا الدولية"
            : isRu
            ? "НАШИ ДОСТИЖЕНИЯ"
            : isEn
            ? "OUR RECOGNITIONS"
            : "AKREDİTASYONLARIMIZ"
        }
        title={
          isAr
            ? "الجوائز"
            : isRu
            ? "НАГРАДЫ"
            : isEn
            ? "AWARDS"
            : "ÖDÜLLERİMİZ"
        }
        themeColor={themeColor}
      />

      {/* 2. Açıklama Metni (temizlenmiş page_20.jpg üzerinde y: 340..715 aralığında yer alır) */}
      <div className="flex-1 px-[76px] pt-[18px] select-none z-10 space-y-5 text-[15px] leading-[1.58] text-[#222222] text-justify">
        <p>
          {isAr ? (
            <>
              في عيادتنا،{" "}
              <span className="font-bold text-black">
                التميز ليس مجرد وعد — بل هو معيار مثبت.
              </span>{" "}
              تقديراً لرعايتنا الفائقة للمرضى وخبرتنا في طب الأسنان، حصلنا على جوائز دولية مرموقة تميزنا في مجال السياحة العلاجية.
            </>
          ) : isRu ? (
            <>
              В нашей клинике{" "}
              <span className="font-bold text-black">
                совершенство — это не просто обещание, а доказанный стандарт.
              </span>{" "}
              Благодаря высокому уровню заботы о пациентах и профессионализму мы удостоены престижных международных наград.
            </>
          ) : isEn ? (
            <>
              {"At our clinic, "}
              <span className="font-bold text-black">
                {"excellence isn't just a promise—it's a proven standard."}
              </span>{" "}
              Recognized for outstanding patient care and dental expertise, we have earned prestigious awards that set us apart in the field of dental tourism.
            </>
          ) : (
            <>
              Kliniğimizde{" "}
              <span className="font-bold text-black">
                mükemmeliyet yalnızca bir vaat değil, kanıtlanmış bir standarttır.
              </span>{" "}
              Üstün hasta bakımı ve dental uzmanlığımız sayesinde sağlık turizmi alanında bizi öne çıkaran prestijli uluslararası ödüllere layık görüldük.
            </>
          )}
        </p>

        <p>
          {isAr ? (
            <>
              إن التزامنا بالجودة مدعوم{" "}
              <span className="font-bold text-black">
                بشهادات اعتماد دولية،
              </span>{" "}
              مما يضمن أن كل علاج يلبي أعلى معايير السلامة والتعقيم والدقة.{" "}
              <span className="font-bold text-black">
                نحن نلتزم ببروتوكولات صارمة ونستخدم فقط المواد المعتمدة من الدرجة الأولى.
              </span>
            </>
          ) : isRu ? (
            <>
              Наша приверженность качеству подтверждена{" "}
              <span className="font-bold text-black">
                международными сертификатами аккредитации,
              </span>{" "}
              гарантирующими высочайшие стандарты безопасности, стерильности и точности.{" "}
              <span className="font-bold text-black">
                Мы следуем строгим протоколам и используем только сертифицированные материалы премиум-класса.
              </span>
            </>
          ) : isEn ? (
            <>
              Our commitment to quality is backed by{" "}
              <span className="font-bold text-black">
                internationally accredited certifications,
              </span>{" "}
              ensuring that every treatment meets the highest standards of safety, hygiene, and precision. We adhere to{" "}
              <span className="font-bold text-black">
                strict protocols, use only premium materials,
              </span>{" "}
              and stay ahead with cutting-edge technology. Because{" "}
              <span className="font-bold text-black">
                when it comes to your smile, only the best will do.
              </span>
            </>
          ) : (
            <>
              Kaliteye olan bağlılığımız{" "}
              <span className="font-bold text-black">
                uluslararası akreditasyon sertifikalarıyla
              </span>{" "}
              desteklenmekte olup her tedavinin en yüksek güvenlik, hijyen ve hassasiyet standartlarını karşılamasını sağlar.{" "}
              <span className="font-bold text-black">
                Katı klinik protokollere bağlı kalıyor, yalnızca birinci sınıf materyaller kullanıyoruz.
              </span>
            </>
          )}
        </p>
      </div>

      {/* Akreditasyon Logoları Alanı (temizlenmiş page_20.jpg üzerinde y: 745..1065 aralığında yer alır) */}
      <div className="h-[96mm] shrink-0" />

      {/* 3. Çift Sayfa Sağ Alt Köşe Takozu */}
      <WiseFooter
        clinicName={data.clinicName || "Wise Dental"}
        slogan={data.slogan || data.clinicSlogan || "Every Smile Matters!!"}
        logoUrl={data.logoUrl}
        themeColor={themeColor}
        variant="even"
      />
    </WisePageWrapper>
  );
}
