// PROTÓTIPO DESCARTÁVEL — não é o app. Fonte da verdade = Lovable.
// Gerado de: conceito novo (tela de Auth "liquid glass", referências do usuário)
//   @ decisão 2026-10-29. Dados MOCK, sem backend, sem validação real, sem segredos.
// Regenerar (não remendar) se o conceito mudar.
// Decisão de design correspondente: .agents/tasks/prototipo-auth/.
//
// Tela de Auth do Marketing Hub com efeito "liquid glass": fundo azul da marca
// com esferas flutuando (OrbesFundo) e um cartão de vidro fosco centralizado.
// Três telas alternáveis por abas (só do protótipo): Login da equipe, Acesso
// externo (OTP) e Redefinir senha. Nada envia de verdade.

import { useState, type FormEvent } from "react";
import {
  ArrowLeft, Eye, EyeOff, KeyRound, Lock, Mail, ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { OrbesFundo } from "./OrbesFundo";
import "./auth-proto.css";

// Logo do MKT HUB servido de public/ (respeita o base do Pages via BASE_URL; nunca caminho absoluto).
const LOGO_MKTHUB = import.meta.env.BASE_URL + "mkthub/vertical-white.png";

type Tela = "login" | "externo" | "redefinir";

const ABAS: { id: Tela; rotulo: string }[] = [
  { id: "login", rotulo: "Entrar" },
  { id: "externo", rotulo: "Acesso externo" },
  { id: "redefinir", rotulo: "Redefinir senha" },
];

export function AuthProto() {
  const [tela, setTela] = useState<Tela>("login");

  return (
    <div className="auth-palco relative min-h-dvh w-full overflow-hidden">
      <OrbesFundo />

      <div className="relative z-10 flex min-h-dvh items-center justify-center px-4 py-10">
        <div className="w-full max-w-[420px]">
          {/* Seletor de telas — só do protótipo, para o usuário ver as três. */}
          <div
            role="tablist"
            aria-label="Telas de autenticação (protótipo)"
            className="mb-5 flex items-center gap-1 rounded-full border border-white/20 bg-white/10 p-1 backdrop-blur-md"
          >
            {ABAS.map((aba) => {
              const ativa = tela === aba.id;
              return (
                <button
                  key={aba.id}
                  role="tab"
                  aria-selected={ativa}
                  onClick={() => setTela(aba.id)}
                  className={cn(
                    "flex-1 rounded-full px-3 py-2 font-display text-[13px] font-semibold tracking-wide transition",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky focus-visible:ring-offset-0",
                    ativa ? "bg-white text-primary shadow-sm" : "text-white/80 hover:text-white",
                  )}
                >
                  {aba.rotulo}
                </button>
              );
            })}
          </div>

          {/* Cartão liquid glass */}
          <div className="auth-glass auth-entrada rounded-3xl p-7 sm:p-8" key={tela}>
            <Marca />
            {tela === "login" && <TelaLogin aoEsquecer={() => setTela("redefinir")} />}
            {tela === "externo" && <TelaExterno />}
            {tela === "redefinir" && <TelaRedefinir aoVoltar={() => setTela("login")} />}
          </div>

          <p className="mt-5 text-center text-[12.5px] text-white/70">
            Protótipo visual. Nada é enviado de verdade.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Marca — logo vertical. Sem asset no protótipo: texto em Dosis.      */
/* (Não inventar outro logo; usar placeholder textual da marca.)       */
/* ------------------------------------------------------------------ */
function Marca() {
  return (
    <div className="mb-6 flex flex-col items-center text-center">
      <img
        src={LOGO_MKTHUB}
        alt="Marketing Hub"
        className="h-20 w-auto drop-shadow-[0_2px_8px_rgba(0,0,0,0.25)]"
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Campo de vidro com ícone                                            */
/* ------------------------------------------------------------------ */
function Campo({
  id, label, icone: Icone, children,
}: {
  id: string;
  label: string;
  icone: typeof Mail;
  children: React.ReactNode;
}) {
  return (
    <label htmlFor={id} className="block">
      <span className="mb-1.5 block text-[13px] font-semibold text-white/90">{label}</span>
      <span className="auth-campo flex items-center gap-2.5 rounded-xl px-3.5 py-2.5">
        <Icone className="size-4 shrink-0 text-white/70" aria-hidden />
        {children}
      </span>
    </label>
  );
}

/* ------------------------------------------------------------------ */
/* Botão sólido de destaque                                            */
/* ------------------------------------------------------------------ */
function BotaoPrimario({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={cn(
        "mt-1 w-full rounded-xl bg-white px-4 py-3 font-display text-[15px] font-bold text-primary shadow-md transition",
        "hover:bg-white/90 active:scale-[0.99]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky focus-visible:ring-offset-2 focus-visible:ring-offset-transparent",
      )}
    >
      {children}
    </button>
  );
}

/* ================================================================== */
/* 1) LOGIN da equipe                                                  */
/* ================================================================== */
function TelaLogin({ aoEsquecer }: { aoEsquecer: () => void }) {
  const [mostrarSenha, setMostrarSenha] = useState(false);

  return (
    <form className="space-y-4" onSubmit={(e: FormEvent) => e.preventDefault()}>
      <h1 className="text-center font-display text-[22px] font-bold text-white">Entrar no Hub</h1>

      <Campo id="login-email" label="E-mail" icone={Mail}>
        <input id="login-email" type="email" autoComplete="email" placeholder="voce@digisystem.com.br" />
      </Campo>

      <Campo id="login-senha" label="Senha" icone={Lock}>
        <input
          id="login-senha"
          type={mostrarSenha ? "text" : "password"}
          autoComplete="current-password"
          placeholder="Sua senha"
        />
        <button
          type="button"
          onClick={() => setMostrarSenha((v) => !v)}
          aria-label={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
          className="shrink-0 rounded-md p-1 text-white/70 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky"
        >
          {mostrarSenha ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      </Campo>

      <div className="flex items-center justify-between gap-2 pt-0.5">
        <label className="flex cursor-pointer items-center gap-2 text-[13px] text-white/85">
          <input
            type="checkbox"
            className="size-4 rounded border-white/40 bg-white/10 accent-[color:var(--sky)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky"
          />
          Lembrar de mim
        </label>
        <button
          type="button"
          onClick={aoEsquecer}
          className="rounded-md text-[13px] font-semibold text-sky underline-offset-2 transition hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky"
        >
          Esqueci minha senha
        </button>
      </div>

      <BotaoPrimario type="submit">Entrar</BotaoPrimario>

      <p className="flex items-center justify-center gap-1.5 pt-1 text-[12.5px] text-white/65">
        <ShieldCheck className="size-3.5" aria-hidden />
        Acesso restrito à Digisystem.
      </p>
    </form>
  );
}

/* ================================================================== */
/* 2) ACESSO EXTERNO (OTP) — pedir e-mail e depois digitar o código.   */
/* ================================================================== */
function TelaExterno() {
  const [etapa, setEtapa] = useState<"email" | "codigo">("email");

  if (etapa === "codigo") {
    return <CodigoOtp aoVoltar={() => setEtapa("email")} />;
  }

  return (
    <form className="space-y-4" onSubmit={(e: FormEvent) => { e.preventDefault(); setEtapa("codigo"); }}>
      <div className="text-center">
        <h1 className="font-display text-[22px] font-bold text-white">Acesso externo</h1>
        <p className="mt-1 text-[13px] text-white/75">
          Use seu e-mail corporativo. Enviamos um código de acesso para ele.
        </p>
      </div>

      <Campo id="ext-email" label="E-mail corporativo" icone={Mail}>
        <input id="ext-email" type="email" autoComplete="email" placeholder="voce@digisystem.com.br" />
      </Campo>

      <BotaoPrimario type="submit">Enviar código</BotaoPrimario>

      <p className="flex items-center justify-center gap-1.5 pt-1 text-[12.5px] text-white/65">
        <ShieldCheck className="size-3.5" aria-hidden />
        Só e-mails @digisystem.com.br recebem o código.
      </p>
    </form>
  );
}

function CodigoOtp({ aoVoltar }: { aoVoltar: () => void }) {
  const [digitos, setDigitos] = useState<string[]>(["", "", "", "", "", ""]);

  function mudar(i: number, valor: string) {
    const d = valor.replace(/\D/g, "").slice(-1);
    setDigitos((atual) => atual.map((x, idx) => (idx === i ? d : x)));
    // Foca o próximo campo quando preenche um dígito.
    if (d) {
      const prox = document.getElementById(`otp-${i + 1}`);
      prox?.focus();
    }
  }

  return (
    <form className="space-y-4" onSubmit={(e: FormEvent) => e.preventDefault()}>
      <div className="text-center">
        <h1 className="font-display text-[22px] font-bold text-white">Digite o código</h1>
        <p className="mt-1 text-[13px] text-white/75">
          Enviamos 6 dígitos para o seu e-mail. Ele vale por alguns minutos.
        </p>
      </div>

      <div className="flex justify-center gap-2" role="group" aria-label="Código de 6 dígitos">
        {digitos.map((d, i) => (
          <input
            key={i}
            id={`otp-${i}`}
            inputMode="numeric"
            maxLength={1}
            value={d}
            onChange={(e) => mudar(i, e.target.value)}
            aria-label={`Dígito ${i + 1}`}
            className={cn(
              "auth-campo size-11 rounded-xl text-center font-display text-[20px] font-bold text-white",
              "focus-visible:outline-none",
            )}
          />
        ))}
      </div>

      <BotaoPrimario type="submit">Validar código</BotaoPrimario>

      <div className="flex items-center justify-between gap-2 pt-0.5 text-[13px]">
        <button
          type="button"
          onClick={aoVoltar}
          className="flex items-center gap-1.5 rounded-md font-semibold text-white/80 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky"
        >
          <ArrowLeft className="size-3.5" aria-hidden />
          Trocar e-mail
        </button>
        <button
          type="button"
          className="rounded-md font-semibold text-sky underline-offset-2 transition hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky"
        >
          Reenviar código
        </button>
      </div>
    </form>
  );
}

/* ================================================================== */
/* 3) REDEFINIR SENHA                                                  */
/* ================================================================== */
function TelaRedefinir({ aoVoltar }: { aoVoltar: () => void }) {
  const [verNova, setVerNova] = useState(false);
  const [verConf, setVerConf] = useState(false);

  return (
    <form className="space-y-4" onSubmit={(e: FormEvent) => e.preventDefault()}>
      <div className="text-center">
        <h1 className="font-display text-[22px] font-bold text-white">Redefinir senha</h1>
        <p className="mt-1 text-[13px] text-white/75">
          Escolha uma senha nova. Use ao menos 8 caracteres.
        </p>
      </div>

      <Campo id="nova-senha" label="Nova senha" icone={KeyRound}>
        <input id="nova-senha" type={verNova ? "text" : "password"} autoComplete="new-password" placeholder="Nova senha" />
        <button
          type="button"
          onClick={() => setVerNova((v) => !v)}
          aria-label={verNova ? "Ocultar senha" : "Mostrar senha"}
          className="shrink-0 rounded-md p-1 text-white/70 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky"
        >
          {verNova ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      </Campo>

      <Campo id="conf-senha" label="Confirmar senha" icone={KeyRound}>
        <input id="conf-senha" type={verConf ? "text" : "password"} autoComplete="new-password" placeholder="Repita a senha" />
        <button
          type="button"
          onClick={() => setVerConf((v) => !v)}
          aria-label={verConf ? "Ocultar senha" : "Mostrar senha"}
          className="shrink-0 rounded-md p-1 text-white/70 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky"
        >
          {verConf ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      </Campo>

      <BotaoPrimario type="submit">Salvar nova senha</BotaoPrimario>

      <button
        type="button"
        onClick={aoVoltar}
        className="mx-auto flex items-center gap-1.5 rounded-md text-[13px] font-semibold text-white/80 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky"
      >
        <ArrowLeft className="size-3.5" aria-hidden />
        Voltar para entrar
      </button>
    </form>
  );
}
