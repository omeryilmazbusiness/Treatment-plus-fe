"use client";

import React, { startTransition, useActionState, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, ArrowRight, CheckCircle2, Loader2 } from "lucide-react";

import { registerClinicAction, type RegisterActionState } from "./actions";

const initialState: RegisterActionState = {};
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type RegisterFieldErrors = Partial<
  Record<"name" | "signerName" | "email" | "phone" | "address" | "password", string>
>;

export function RegisterForm() {
  const router = useRouter();
  const [fields, setFields] = useState({
    name: "",
    signerName: "",
    email: "",
    phone: "",
    address: "",
    password: "",
  });
  const [fieldErrors, setFieldErrors] = useState<RegisterFieldErrors>({});

  const [state, formAction, isPending] = useActionState(
    async (prevState: RegisterActionState, formData: FormData) => {
      const result = await registerClinicAction(prevState, formData);
      if (!result.error) {
        router.replace("/app");
        router.refresh();
      }
      return result;
    },
    initialState
  );

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const errors: RegisterFieldErrors = {};
    if (!fields.name.trim()) {
      errors.name = "Klinik veya poliklinik adı zorunludur.";
    } else if (fields.name.trim().length < 2) {
      errors.name = "Klinik adı en az 2 karakter olmalıdır.";
    }
    if (!fields.signerName.trim()) {
      errors.signerName = "Yetkili hekim adı zorunludur.";
    }
    if (!fields.email.trim()) {
      errors.email = "Kurumsal e-posta adresi zorunludur.";
    } else if (!EMAIL_REGEX.test(fields.email.trim())) {
      errors.email = "Geçerli bir e-posta adresi giriniz.";
    }
    if (!fields.phone.trim()) {
      errors.phone = "Telefon numarası zorunludur.";
    }
    if (!fields.address.trim()) {
      errors.address = "Şehir / adres bilgisi zorunludur.";
    }
    if (!fields.password) {
      errors.password = "Şifre alanı zorunludur.";
    } else if (fields.password.length < 8) {
      errors.password = "Şifreniz en az 8 karakter olmalıdır.";
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});
    const formData = new FormData(e.currentTarget);
    startTransition(() => {
      formAction(formData);
    });
  };

  const inputCls = (hasErr: boolean) =>
    `mt-1.5 w-full rounded-xl border px-3.5 py-2.5 text-sm text-slate-900 shadow-xs transition-all focus:bg-white focus:outline-hidden ${
      hasErr
        ? "border-rose-300 bg-rose-50/40 focus:border-rose-500 focus:ring-3 focus:ring-rose-500/15"
        : "border-slate-200 bg-white focus:border-blue-600 focus:ring-3 focus:ring-blue-500/15"
    }`;

  return (
    <form
      action={formAction}
      onSubmit={handleSubmit}
      noValidate
      className="mt-8 space-y-4"
    >
      {state.error && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-2xl border border-rose-200/90 bg-gradient-to-r from-rose-50/95 via-red-50/85 to-orange-50/60 px-4 py-3 text-xs font-medium text-rose-700 shadow-xs"
        >
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-rose-100 text-rose-600 ring-1 ring-rose-200/70">
            <AlertCircle className="h-4 w-4" />
          </div>
          <div className="pt-0.5">
            <p className="font-bold text-rose-950">Kayıt Bilgilerini Kontrol Edin</p>
            <p className="mt-0.5 text-[11px] text-rose-700">{state.error}</p>
          </div>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="font-medium text-slate-800">Klinik / Poliklinik Adı</span>
          <input
            name="name"
            type="text"
            placeholder="Örn: Boğaziçi Diş Kliniği"
            required
            minLength={2}
            value={fields.name}
            onChange={(e) => {
              setFields((prev) => ({ ...prev, name: e.target.value }));
              if (fieldErrors.name) {
                setFieldErrors((prev) => ({ ...prev, name: undefined }));
              }
            }}
            className={inputCls(Boolean(fieldErrors.name))}
          />
          {fieldErrors.name && (
            <span className="mt-1 flex items-center gap-1 text-[11px] font-medium text-rose-600">
              <AlertCircle className="h-3 w-3 shrink-0" />
              {fieldErrors.name}
            </span>
          )}
        </label>

        <label className="block text-sm">
          <span className="font-medium text-slate-800">Yetkili Hekim Adı</span>
          <input
            name="signerName"
            type="text"
            placeholder="Örn: Dt. Ahmet Yılmaz"
            required
            value={fields.signerName}
            onChange={(e) => {
              setFields((prev) => ({ ...prev, signerName: e.target.value }));
              if (fieldErrors.signerName) {
                setFieldErrors((prev) => ({ ...prev, signerName: undefined }));
              }
            }}
            className={inputCls(Boolean(fieldErrors.signerName))}
          />
          {fieldErrors.signerName && (
            <span className="mt-1 flex items-center gap-1 text-[11px] font-medium text-rose-600">
              <AlertCircle className="h-3 w-3 shrink-0" />
              {fieldErrors.signerName}
            </span>
          )}
        </label>
      </div>

      <label className="block text-sm">
        <span className="font-medium text-slate-800">Kurumsal E-posta</span>
        <input
          name="email"
          type="email"
          placeholder="klinik@ornek.com"
          required
          value={fields.email}
          onChange={(e) => {
            setFields((prev) => ({ ...prev, email: e.target.value }));
            if (fieldErrors.email) {
              setFieldErrors((prev) => ({ ...prev, email: undefined }));
            }
          }}
          className={inputCls(Boolean(fieldErrors.email))}
        />
        {fieldErrors.email && (
          <span className="mt-1 flex items-center gap-1 text-[11px] font-medium text-rose-600">
            <AlertCircle className="h-3 w-3 shrink-0" />
            {fieldErrors.email}
          </span>
        )}
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="font-medium text-slate-800">Telefon</span>
          <input
            name="phone"
            type="tel"
            placeholder="+90 (212) 000 00 00"
            required
            value={fields.phone}
            onChange={(e) => {
              setFields((prev) => ({ ...prev, phone: e.target.value }));
              if (fieldErrors.phone) {
                setFieldErrors((prev) => ({ ...prev, phone: undefined }));
              }
            }}
            className={inputCls(Boolean(fieldErrors.phone))}
          />
          {fieldErrors.phone && (
            <span className="mt-1 flex items-center gap-1 text-[11px] font-medium text-rose-600">
              <AlertCircle className="h-3 w-3 shrink-0" />
              {fieldErrors.phone}
            </span>
          )}
        </label>

        <label className="block text-sm">
          <span className="font-medium text-slate-800">Şehir / Adres</span>
          <input
            name="address"
            type="text"
            placeholder="Şişli, İstanbul"
            required
            value={fields.address}
            onChange={(e) => {
              setFields((prev) => ({ ...prev, address: e.target.value }));
              if (fieldErrors.address) {
                setFieldErrors((prev) => ({ ...prev, address: undefined }));
              }
            }}
            className={inputCls(Boolean(fieldErrors.address))}
          />
          {fieldErrors.address && (
            <span className="mt-1 flex items-center gap-1 text-[11px] font-medium text-rose-600">
              <AlertCircle className="h-3 w-3 shrink-0" />
              {fieldErrors.address}
            </span>
          )}
        </label>
      </div>

      <label className="block text-sm">
        <span className="font-medium text-slate-800">Şifre (En az 8 karakter)</span>
        <input
          name="password"
          type="password"
          placeholder="••••••••"
          required
          minLength={8}
          value={fields.password}
          onChange={(e) => {
            setFields((prev) => ({ ...prev, password: e.target.value }));
            if (fieldErrors.password) {
              setFieldErrors((prev) => ({ ...prev, password: undefined }));
            }
          }}
          className={inputCls(Boolean(fieldErrors.password))}
        />
        {fieldErrors.password && (
          <span className="mt-1 flex items-center gap-1 text-[11px] font-medium text-rose-600">
            <AlertCircle className="h-3 w-3 shrink-0" />
            {fieldErrors.password}
          </span>
        )}
      </label>

      <button
        type="submit"
        disabled={isPending}
        className="mt-2 inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 py-3.5 text-sm font-semibold text-white shadow-md transition-all hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Klinik Hesabı Oluşturuluyor...</span>
          </>
        ) : (
          <>
            <span>Kayıt Ol ve Başla</span>
            <ArrowRight className="h-4 w-4" />
          </>
        )}
      </button>

      <div className="flex items-center justify-center gap-2 pt-2 text-xs text-slate-500">
        <CheckCircle2 className="h-4 w-4 text-blue-600" />
        <span>Kaydınız tamamlandığında doğrudan klinik panelinize yönlendirilirsiniz.</span>
      </div>
    </form>
  );
}

