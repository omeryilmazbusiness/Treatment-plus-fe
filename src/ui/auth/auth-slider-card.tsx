"use client";

import React, {
  startTransition,
  useActionState,
  useEffect,
  useState,
} from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowRight,
  Building2,
  CheckCircle2,
  Loader2,
  Lock,
  Mail,
  MapPin,
  Phone,
  Sparkles,
  User,
  X,
} from "lucide-react";

import {
  loginClinicAction,
  type LoginActionState,
} from "@/app/login/actions";
import {
  registerClinicAction,
  type RegisterActionState,
} from "@/app/register/actions";
import { Mark } from "@/ui/mark";

export interface AuthSliderCardProps {
  readonly initialMode?: "login" | "register";
}

const initialLoginState: LoginActionState = {};
const initialRegisterState: RegisterActionState = {};

type LoginFieldErrors = Partial<Record<"email" | "password", string>>;
type RegisterFieldErrors = Partial<
  Record<"name" | "signerName" | "email" | "phone" | "address" | "password", string>
>;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function AuthAlertBanner({
  title,
  message,
  onDismiss,
}: {
  readonly title: string;
  readonly message: string;
  readonly onDismiss?: () => void;
}) {
  return (
    <div
      role="alert"
      className="mb-3.5 flex items-start gap-3 rounded-2xl border border-rose-200/90 bg-gradient-to-r from-rose-50/95 via-red-50/85 to-orange-50/60 px-3.5 py-3 shadow-xs shadow-rose-900/5 transition-all"
    >
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-rose-100 text-rose-600 ring-1 ring-rose-200/70">
        <AlertCircle className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1 pt-0.5">
        <p className="text-xs font-bold text-rose-950">{title}</p>
        <p className="mt-0.5 text-[11px] font-medium leading-relaxed text-rose-700">
          {message}
        </p>
      </div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Uyarıyı kapat"
          className="cursor-pointer rounded-lg p-1 text-rose-400 transition-colors hover:bg-rose-100/80 hover:text-rose-700"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}

function FieldErrorText({ error }: { readonly error?: string }) {
  if (!error) return null;
  return (
    <p className="mt-1 flex items-center gap-1 pl-1 text-[11px] font-medium text-rose-600">
      <AlertCircle className="h-3 w-3 shrink-0" />
      <span>{error}</span>
    </p>
  );
}

function inputClassName(hasError: boolean, extra = "py-3 font-medium"): string {
  return `w-full rounded-xl border ${extra} pr-4 pl-11 text-sm text-slate-900 transition-all placeholder:text-slate-400 focus:bg-white focus:outline-hidden ${
    hasError
      ? "border-rose-300 bg-rose-50/40 focus:border-rose-500 focus:ring-3 focus:ring-rose-500/15"
      : "border-slate-200 bg-slate-50/80 focus:border-blue-600 focus:ring-3 focus:ring-blue-500/15"
  }`;
}

function iconClassName(hasError: boolean): string {
  return `pointer-events-none absolute top-3.5 left-4 h-4 w-4 transition-colors ${
    hasError ? "text-rose-500" : "text-slate-400"
  }`;
}

function SocialLoginRow({ label }: { readonly label: string }) {
  return (
    <div className="my-4 flex flex-col items-center">
      <div className="flex items-center justify-center gap-3">
        {/* Google */}
        <button
          type="button"
          aria-label="Google ile devam et"
          title="Google"
          className="inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-xl border border-slate-200/90 bg-white text-slate-600 shadow-2xs transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-300 hover:bg-blue-50/50 hover:text-blue-600"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
            <path
              fill="currentColor"
              d="M21.35 11.1h-9.17v2.73h6.51c-.33 3.81-3.5 5.44-6.5 5.44C8.36 19.27 5 15.64 5 12c0-3.64 3.36-7.27 7.2-7.27c2.09 0 3.66.99 4.5 1.82l2.11-2.08C17.07 2.89 14.8 2 12.19 2C6.65 2 2.15 6.48 2.15 12s4.5 10 10.04 10c5.8 0 9.61-4.08 9.61-9.82c0-.49-.07-1.08-.45-1.08Z"
            />
          </svg>
        </button>

        {/* Apple */}
        <button
          type="button"
          aria-label="Apple ile devam et"
          title="Apple"
          className="inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-xl border border-slate-200/90 bg-white text-slate-600 shadow-2xs transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-400 hover:bg-slate-100 hover:text-slate-900"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
            <path
              fill="currentColor"
              d="M17.05 20.28c-.98.95-2.05.8-3.08.35c-1.09-.46-2.09-.48-3.24 0c-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8c1.18-.24 2.31-.93 3.57-.84c1.51.12 2.65.72 3.4 1.8c-3.12 1.87-2.38 5.98.48 7.13c-.57 1.5-1.31 2.99-2.53 4.08ZM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25c.29 2.58-2.34 4.5-3.74 4.25Z"
            />
          </svg>
        </button>

        {/* LinkedIn */}
        <button
          type="button"
          aria-label="LinkedIn ile devam et"
          title="LinkedIn"
          className="inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-xl border border-slate-200/90 bg-white text-slate-600 shadow-2xs transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-300 hover:bg-blue-50/50 hover:text-blue-700"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
            <path
              fill="currentColor"
              d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77Z"
            />
          </svg>
        </button>

        {/* Microsoft */}
        <button
          type="button"
          aria-label="Microsoft ile devam et"
          title="Microsoft"
          className="inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-xl border border-slate-200/90 bg-white text-slate-600 shadow-2xs transition-all duration-200 hover:-translate-y-0.5 hover:border-cyan-300 hover:bg-cyan-50/50 hover:text-cyan-700"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
            <path
              fill="currentColor"
              d="M2 3h9v9H2V3m9 19H2v-9h9v9M21 3v9h-9V3h9m0 19h-9v-9h9v9Z"
            />
          </svg>
        </button>
      </div>
      <span className="mt-3 text-xs text-slate-400">{label}</span>
    </div>
  );
}

export function AuthSliderCard({
  initialMode = "login",
}: AuthSliderCardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const routeIsRegister =
    pathname === "/register"
      ? true
      : pathname === "/login"
        ? false
        : initialMode === "register";

  const [isActive, setIsActive] = useState(routeIsRegister);
  const [lastPathname, setLastPathname] = useState(pathname);

  if (lastPathname !== pathname) {
    setLastPathname(pathname);
    setIsActive(routeIsRegister);
  }

  useEffect(() => {
    const frameId = window.requestAnimationFrame(() => {
      setIsActive(routeIsRegister);
    });
    return () => window.cancelAnimationFrame(frameId);
  }, [routeIsRegister]);

  const [loginFields, setLoginFields] = useState({
    email: "",
    password: "",
  });
  const [loginFieldErrors, setLoginFieldErrors] = useState<LoginFieldErrors>({});
  const [loginBannerError, setLoginBannerError] = useState<string | undefined>(
    undefined
  );

  const [registerFields, setRegisterFields] = useState({
    name: "",
    signerName: "",
    email: "",
    phone: "",
    address: "",
    password: "",
  });
  const [registerFieldErrors, setRegisterFieldErrors] =
    useState<RegisterFieldErrors>({});
  const [registerBannerError, setRegisterBannerError] = useState<
    string | undefined
  >(undefined);

  const [loginState, loginFormAction, isLoginPending] = useActionState(
    async (prevState: LoginActionState, formData: FormData) => {
      const result = await loginClinicAction(prevState, formData);
      if (!result.error) {
        router.replace("/app");
        router.refresh();
      } else {
        setLoginBannerError(result.error);
      }
      return result;
    },
    initialLoginState
  );

  const [registerState, registerFormAction, isRegisterPending] = useActionState(
    async (prevState: RegisterActionState, formData: FormData) => {
      const result = await registerClinicAction(prevState, formData);
      if (!result.error) {
        router.replace("/app");
        router.refresh();
      } else {
        setRegisterBannerError(result.error);
      }
      return result;
    },
    initialRegisterState
  );

  const handleRegisterSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const errors: RegisterFieldErrors = {};
    const nameTrim = registerFields.name.trim();
    const signerTrim = registerFields.signerName.trim();
    const emailTrim = registerFields.email.trim();
    const phoneTrim = registerFields.phone.trim();
    const addressTrim = registerFields.address.trim();

    if (!nameTrim) {
      errors.name = "Klinik veya poliklinik adı zorunludur.";
    } else if (nameTrim.length < 2) {
      errors.name = "Klinik adı en az 2 karakter olmalıdır.";
    }

    if (!signerTrim) {
      errors.signerName = "Yetkili hekim adı zorunludur.";
    }

    if (!emailTrim) {
      errors.email = "Kurumsal e-posta adresi zorunludur.";
    } else if (!EMAIL_REGEX.test(emailTrim)) {
      errors.email = "Geçerli bir e-posta adresi giriniz (örn. klinik@ornek.com).";
    }

    if (!phoneTrim) {
      errors.phone = "Telefon numarası zorunludur.";
    } else if (phoneTrim.replace(/\D/g, "").length < 7) {
      errors.phone = "Geçerli bir telefon numarası giriniz.";
    }

    if (!addressTrim) {
      errors.address = "Şehir / ilçe bilgisi zorunludur.";
    }

    if (!registerFields.password) {
      errors.password = "Şifre alanı zorunludur.";
    } else if (registerFields.password.length < 8) {
      errors.password = "Şifreniz en az 8 karakter olmalıdır.";
    }

    if (Object.keys(errors).length > 0) {
      setRegisterFieldErrors(errors);
      setRegisterBannerError(
        "Lütfen işaretli alanları kontrol ederek tekrar deneyin."
      );
      return;
    }

    setRegisterFieldErrors({});
    setRegisterBannerError(undefined);
    const formData = new FormData(e.currentTarget);
    startTransition(() => {
      registerFormAction(formData);
    });
  };

  const handleLoginSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const errors: LoginFieldErrors = {};
    const emailTrim = loginFields.email.trim();

    if (!emailTrim) {
      errors.email = "E-posta adresi zorunludur.";
    } else if (!EMAIL_REGEX.test(emailTrim)) {
      errors.email = "Geçerli bir e-posta adresi giriniz.";
    }

    if (!loginFields.password) {
      errors.password = "Lütfen şifrenizi giriniz.";
    }

    if (Object.keys(errors).length > 0) {
      setLoginFieldErrors(errors);
      setLoginBannerError("Lütfen giriş bilgilerinizi eksiksiz doldurun.");
      return;
    }

    setLoginFieldErrors({});
    setLoginBannerError(undefined);
    const formData = new FormData(e.currentTarget);
    startTransition(() => {
      loginFormAction(formData);
    });
  };

  const activeRegisterBanner = registerBannerError ?? registerState.error;
  const activeLoginBanner = loginBannerError ?? loginState.error;

  return (
    <div
      id="auth-container"
      className={`auth-card relative flex min-h-dvh w-full flex-col overflow-hidden bg-gradient-to-br from-white via-slate-50/60 to-blue-50/40 font-sans text-slate-900 md:h-dvh ${
        isActive ? "active" : ""
      }`}
    >
      {/* Mobil Görünüm İçin Üst Sekme Anahtarı */}
      <div className="flex items-center justify-center pt-6 md:hidden">
        <div className="flex rounded-2xl border border-slate-200/80 bg-white p-1 shadow-xs">
          <button
            type="button"
            onClick={() => setIsActive(false)}
            className={`cursor-pointer rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
              !isActive
                ? "bg-[#172647] text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Giriş Yap
          </button>
          <button
            type="button"
            onClick={() => setIsActive(true)}
            className={`cursor-pointer rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
              isActive
                ? "bg-[#172647] text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Kayıt Ol
          </button>
        </div>
      </div>

      {/* ============================================================
          KAYIT OL FORMU (Sign-Up Container)
          ============================================================ */}
      <div
        className={`form-container sign-up-container flex flex-1 flex-col justify-center px-6 py-10 transition-all duration-700 ease-[cubic-bezier(0.65,0,0.35,1)] md:absolute md:top-0 md:left-0 md:h-full md:w-1/2 md:px-16 lg:px-24 ${
          isActive
            ? "relative z-20 opacity-100 md:translate-x-full"
            : "hidden opacity-0 md:pointer-events-none md:z-10 md:flex md:translate-x-0"
        }`}
      >
        <form
          action={registerFormAction}
          onSubmit={handleRegisterSubmit}
          noValidate
          className="mx-auto flex w-full max-w-lg flex-col"
        >
          <div className="text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3.5 py-1 text-xs font-bold tracking-wide text-blue-700 uppercase">
              Yeni Klinik Kaydı
            </span>
            <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Hesap Oluşturun
            </h1>
          </div>

          <SocialLoginRow label="veya klinik e-postanız ile kayıt olun" />

          {activeRegisterBanner && (
            <AuthAlertBanner
              title="Kayıt Bilgilerini Kontrol Edin"
              message={activeRegisterBanner}
              onDismiss={() => setRegisterBannerError("")}
            />
          )}

          <div className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <div className="relative">
                  <Building2
                    className={iconClassName(Boolean(registerFieldErrors.name))}
                  />
                  <input
                    name="name"
                    type="text"
                    placeholder="Klinik / Poliklinik Adı"
                    required
                    minLength={2}
                    value={registerFields.name}
                    onChange={(e) => {
                      const val = e.target.value;
                      setRegisterFields((prev) => ({ ...prev, name: val }));
                      if (registerFieldErrors.name) {
                        setRegisterFieldErrors((prev) => ({
                          ...prev,
                          name: undefined,
                        }));
                      }
                    }}
                    aria-label="Klinik veya Poliklinik Adı"
                    aria-invalid={Boolean(registerFieldErrors.name)}
                    className={inputClassName(Boolean(registerFieldErrors.name))}
                  />
                </div>
                <FieldErrorText error={registerFieldErrors.name} />
              </div>

              <div>
                <div className="relative">
                  <User
                    className={iconClassName(
                      Boolean(registerFieldErrors.signerName)
                    )}
                  />
                  <input
                    name="signerName"
                    type="text"
                    placeholder="Yetkili Hekim Adı"
                    required
                    value={registerFields.signerName}
                    onChange={(e) => {
                      const val = e.target.value;
                      setRegisterFields((prev) => ({
                        ...prev,
                        signerName: val,
                      }));
                      if (registerFieldErrors.signerName) {
                        setRegisterFieldErrors((prev) => ({
                          ...prev,
                          signerName: undefined,
                        }));
                      }
                    }}
                    aria-label="Yetkili Hekim Adı"
                    aria-invalid={Boolean(registerFieldErrors.signerName)}
                    className={inputClassName(
                      Boolean(registerFieldErrors.signerName)
                    )}
                  />
                </div>
                <FieldErrorText error={registerFieldErrors.signerName} />
              </div>
            </div>

            <div>
              <div className="relative">
                <Mail
                  className={iconClassName(Boolean(registerFieldErrors.email))}
                />
                <input
                  name="email"
                  type="email"
                  placeholder="Kurumsal E-posta (klinik@ornek.com)"
                  required
                  value={registerFields.email}
                  onChange={(e) => {
                    const val = e.target.value;
                    setRegisterFields((prev) => ({ ...prev, email: val }));
                    if (registerFieldErrors.email) {
                      setRegisterFieldErrors((prev) => ({
                        ...prev,
                        email: undefined,
                      }));
                    }
                  }}
                  aria-label="Kurumsal E-posta"
                  aria-invalid={Boolean(registerFieldErrors.email)}
                  className={inputClassName(Boolean(registerFieldErrors.email))}
                />
              </div>
              <FieldErrorText error={registerFieldErrors.email} />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <div className="relative">
                  <Phone
                    className={iconClassName(Boolean(registerFieldErrors.phone))}
                  />
                  <input
                    name="phone"
                    type="tel"
                    placeholder="Telefon (+90 212...)"
                    required
                    value={registerFields.phone}
                    onChange={(e) => {
                      const val = e.target.value;
                      setRegisterFields((prev) => ({ ...prev, phone: val }));
                      if (registerFieldErrors.phone) {
                        setRegisterFieldErrors((prev) => ({
                          ...prev,
                          phone: undefined,
                        }));
                      }
                    }}
                    aria-label="Telefon"
                    aria-invalid={Boolean(registerFieldErrors.phone)}
                    className={inputClassName(Boolean(registerFieldErrors.phone))}
                  />
                </div>
                <FieldErrorText error={registerFieldErrors.phone} />
              </div>

              <div>
                <div className="relative">
                  <MapPin
                    className={iconClassName(
                      Boolean(registerFieldErrors.address)
                    )}
                  />
                  <input
                    name="address"
                    type="text"
                    placeholder="Şehir / İlçe (İstanbul)"
                    required
                    value={registerFields.address}
                    onChange={(e) => {
                      const val = e.target.value;
                      setRegisterFields((prev) => ({ ...prev, address: val }));
                      if (registerFieldErrors.address) {
                        setRegisterFieldErrors((prev) => ({
                          ...prev,
                          address: undefined,
                        }));
                      }
                    }}
                    aria-label="Şehir veya Adres"
                    aria-invalid={Boolean(registerFieldErrors.address)}
                    className={inputClassName(
                      Boolean(registerFieldErrors.address)
                    )}
                  />
                </div>
                <FieldErrorText error={registerFieldErrors.address} />
              </div>
            </div>

            <div>
              <div className="relative">
                <Lock
                  className={iconClassName(
                    Boolean(registerFieldErrors.password)
                  )}
                />
                <input
                  name="password"
                  type="password"
                  placeholder="Şifre (En az 8 karakter)"
                  required
                  minLength={8}
                  value={registerFields.password}
                  onChange={(e) => {
                    const val = e.target.value;
                    setRegisterFields((prev) => ({ ...prev, password: val }));
                    if (registerFieldErrors.password) {
                      setRegisterFieldErrors((prev) => ({
                        ...prev,
                        password: undefined,
                      }));
                    }
                  }}
                  aria-label="Şifre"
                  aria-invalid={Boolean(registerFieldErrors.password)}
                  className={inputClassName(
                    Boolean(registerFieldErrors.password)
                  )}
                />
              </div>
              <FieldErrorText error={registerFieldErrors.password} />
            </div>
          </div>

          <button
            type="submit"
            disabled={isRegisterPending}
            className="mt-5 inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#172647] via-slate-900 to-blue-900 px-6 py-3.5 text-xs font-bold tracking-wider text-white uppercase shadow-lg shadow-slate-900/15 transition-all hover:-translate-y-0.5 hover:from-blue-600 hover:to-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isRegisterPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Hesap Oluşturuluyor...</span>
              </>
            ) : (
              <>
                <span>Kayıt Ol</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>

          <p className="mt-5 text-center text-xs text-slate-500 md:hidden">
            Zaten bir klinik hesabınız var mı?{" "}
            <button
              type="button"
              onClick={() => setIsActive(false)}
              className="cursor-pointer font-bold text-blue-600 hover:underline"
            >
              Giriş Yapın
            </button>
          </p>
        </form>
      </div>

      {/* ============================================================
          GİRİŞ YAP FORMU (Sign-In Container)
          ============================================================ */}
      <div
        className={`form-container sign-in-container flex flex-1 flex-col justify-center px-6 py-10 transition-all duration-700 ease-[cubic-bezier(0.65,0,0.35,1)] md:absolute md:top-0 md:left-0 md:z-20 md:h-full md:w-1/2 md:px-16 lg:px-24 ${
          isActive
            ? "hidden opacity-0 md:pointer-events-none md:flex md:translate-x-full"
            : "relative opacity-100 md:translate-x-0"
        }`}
      >
        <form
          action={loginFormAction}
          onSubmit={handleLoginSubmit}
          noValidate
          className="mx-auto flex w-full max-w-md flex-col"
        >
          <div className="text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3.5 py-1 text-xs font-bold tracking-wide text-blue-700 uppercase">
              Klinik Girişi
            </span>
            <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Giriş Yapın
            </h1>
          </div>

          <SocialLoginRow label="veya kayıtlı e-posta hesabınızı kullanın" />

          {activeLoginBanner && (
            <AuthAlertBanner
              title="Giriş Yapılamadı"
              message={activeLoginBanner}
              onDismiss={() => setLoginBannerError("")}
            />
          )}

          <div className="space-y-3.5">
            <div>
              <div className="relative">
                <Mail
                  className={iconClassName(Boolean(loginFieldErrors.email))}
                />
                <input
                  name="email"
                  type="email"
                  placeholder="E-posta (klinik@ornek.com)"
                  required
                  value={loginFields.email}
                  onChange={(e) => {
                    const val = e.target.value;
                    setLoginFields((prev) => ({
                      ...prev,
                      email: val,
                    }));
                    if (loginFieldErrors.email) {
                      setLoginFieldErrors((prev) => ({
                        ...prev,
                        email: undefined,
                      }));
                    }
                  }}
                  aria-label="E-posta"
                  aria-invalid={Boolean(loginFieldErrors.email)}
                  className={inputClassName(
                    Boolean(loginFieldErrors.email),
                    "py-3.5"
                  )}
                />
              </div>
              <FieldErrorText error={loginFieldErrors.email} />
            </div>

            <div>
              <div className="relative">
                <Lock
                  className={iconClassName(Boolean(loginFieldErrors.password))}
                />
                <input
                  name="password"
                  type="password"
                  placeholder="Şifreniz"
                  required
                  value={loginFields.password}
                  onChange={(e) => {
                    const val = e.target.value;
                    setLoginFields((prev) => ({
                      ...prev,
                      password: val,
                    }));
                    if (loginFieldErrors.password) {
                      setLoginFieldErrors((prev) => ({
                        ...prev,
                        password: undefined,
                      }));
                    }
                  }}
                  aria-label="Şifre"
                  aria-invalid={Boolean(loginFieldErrors.password)}
                  className={inputClassName(
                    Boolean(loginFieldErrors.password),
                    "py-3.5"
                  )}
                />
              </div>
              <FieldErrorText error={loginFieldErrors.password} />
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between text-xs">
            <label className="inline-flex cursor-pointer items-center gap-2 text-slate-600 select-none">
              <input
                type="checkbox"
                defaultChecked
                className="h-3.5 w-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span>Oturumu açık tut</span>
            </label>
            <span className="cursor-pointer font-semibold text-slate-500 transition-colors hover:text-blue-600">
              Şifrenizi mi unuttunuz?
            </span>
          </div>

          <button
            type="submit"
            disabled={isLoginPending}
            className="mt-6 inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#172647] via-slate-900 to-blue-900 px-6 py-4 text-xs font-bold tracking-wider text-white uppercase shadow-lg shadow-slate-900/15 transition-all hover:-translate-y-0.5 hover:from-blue-600 hover:to-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoginPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Giriş Yapılıyor...</span>
              </>
            ) : (
              <>
                <span>Giriş Yap</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>

          <p className="mt-5 text-center text-xs text-slate-500 md:hidden">
            Henüz klinik hesabınız yok mu?{" "}
            <button
              type="button"
              onClick={() => setIsActive(true)}
              className="cursor-pointer font-bold text-blue-600 hover:underline"
            >
              Kayıt Olun
            </button>
          </p>
        </form>
      </div>

      {/* ============================================================
          HAREKETLİ KAYDIRMA PANELİ (Sliding Toggle Overlay)
          ============================================================ */}
      <div
        className={`toggle-container absolute top-0 left-1/2 z-30 hidden h-full w-1/2 overflow-hidden shadow-2xl transition-all duration-700 ease-[cubic-bezier(0.65,0,0.35,1)] md:block ${
          isActive
            ? "-translate-x-full rounded-r-[160px] rounded-l-none"
            : "translate-x-0 rounded-l-[160px] rounded-r-none"
        }`}
      >
        <div
          className={`toggle relative -left-full h-full w-[200%] bg-gradient-to-br from-[#172647] via-[#1c315e] to-blue-700 text-white transition-transform duration-700 ease-[cubic-bezier(0.65,0,0.35,1)] ${
            isActive ? "translate-x-1/2" : "translate-x-0"
          }`}
        >
          {/* Arka Plan Işıltı Deseni */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_25%_20%,rgba(56,189,248,0.22),transparent_45%),radial-gradient(circle_at_80%_80%,rgba(59,130,246,0.25),transparent_50%)]"
          />

          {/* SOL PANEL: "Tekrar Hoş Geldiniz!" (Kayıt Ol açıkken solda görünür) */}
          <div
            className={`toggle-panel toggle-left absolute top-0 left-0 flex h-full w-1/2 flex-col items-center justify-center px-14 text-center transition-transform duration-700 ease-[cubic-bezier(0.65,0,0.35,1)] ${
              isActive ? "translate-x-0" : "-translate-x-[20%]"
            }`}
          >
            <Link
              href="/"
              aria-label="Ana sayfaya dön"
              className="mb-6 transition-transform duration-300 hover:scale-105"
            >
              <Mark framed className="h-20 w-20 rounded-2xl shadow-xl ring-2 ring-white/20" />
            </Link>
            <h2 className="text-3xl font-extrabold tracking-tight lg:text-4xl">
              Tekrar Hoş Geldiniz!
            </h2>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-blue-100/90 lg:text-base">
              Klinik çalışma alanınıza, hasta tedavi planlarınıza ve 3D
              odontogram sunumlarınıza kaldığınız yerden devam etmek için
              giriş yapın.
            </p>
            <div className="mt-6 flex items-center gap-2 text-xs font-medium text-cyan-300">
              <CheckCircle2 className="h-4 w-4" />
              <span>Tek tıkla hasta sunumu & PDF çıktı</span>
            </div>
            <button
              type="button"
              id="login"
              onClick={() => setIsActive(false)}
              className="mt-8 inline-flex cursor-pointer items-center justify-center rounded-xl border-2 border-white/80 bg-transparent px-10 py-3 text-xs font-bold tracking-wider text-white uppercase transition-all duration-200 hover:scale-105 hover:bg-white hover:text-[#172647]"
            >
              Giriş Yap
            </button>
          </div>

          {/* SAĞ PANEL: "Kliniğinizi Dijitalleştirin!" (Giriş Yap açıkken sağda görünür) */}
          <div
            className={`toggle-panel toggle-right absolute top-0 right-0 flex h-full w-1/2 flex-col items-center justify-center px-14 text-center transition-transform duration-700 ease-[cubic-bezier(0.65,0,0.35,1)] ${
              isActive ? "translate-x-[20%]" : "translate-x-0"
            }`}
          >
            <Link
              href="/"
              aria-label="Ana sayfaya dön"
              className="mb-6 transition-transform duration-300 hover:scale-105"
            >
              <Mark framed className="h-20 w-20 rounded-2xl shadow-xl ring-2 ring-white/20" />
            </Link>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-300/30 bg-white/10 px-3.5 py-1 text-xs font-semibold text-cyan-200">
              <Sparkles className="h-3.5 w-3.5" />
              3D Dental Planlama Platformu
            </span>
            <h2 className="mt-4 text-3xl font-extrabold tracking-tight lg:text-4xl">
              Kliniğinizi Dijitalleştirin!
            </h2>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-blue-100/90 lg:text-base">
              Bilgilerinizi girerek dakikalar içinde 3 boyutlu interaktif
              tedavi planlama ve hasta onay sistemini kullanmaya başlayın.
            </p>
            <button
              type="button"
              id="register"
              onClick={() => setIsActive(true)}
              className="mt-8 inline-flex cursor-pointer items-center justify-center rounded-xl border-2 border-white/80 bg-transparent px-10 py-3 text-xs font-bold tracking-wider text-white uppercase transition-all duration-200 hover:scale-105 hover:bg-white hover:text-[#172647]"
            >
              Kayıt Ol
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
