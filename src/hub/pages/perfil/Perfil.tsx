/*
 * PROTÓTIPO DESCARTÁVEL — não é o app.
 * Gerado de: src/hub/components/shell/MenuAvatar.tsx, src/hub/components/CardChrome.tsx,
 *   src/hub/components/shell/CabecalhoShell.tsx, src/hub/pages/marca/Marca.tsx (LogoUploader)
 *   @ origin/main c16c790 / leitura 2026-10-27.
 * Fonte da verdade = Lovable. Regenerar (não remendar) se o real mudar.
 * Decisão de design correspondente: docs-marketing-hub/implementacao/pacote-perfil-e-foto-2026-10-27.md.
 *
 * Tela "Meu perfil" (#/perfil). Dados MOCK: nome e foto no localStorage
 * (proto.perfil.<id>); tema e fita reaproveitam as preferências da Minha Mesa viva
 * (mesmo valor nas duas telas). Sem backend.
 *
 * Parâmetros de demonstração: ?estado=carregando | ?estado=erro | ?falha=envio | ?falha=nome
 */
import { useEffect, useId, useMemo, useRef, useState, type DragEvent, type KeyboardEvent, type ReactNode } from "react";
import { ArrowRight, Check, CircleAlert, Loader2, Lock, Trash2, Upload } from "lucide-react";
import { cn } from "../../../lib/utils";
import { hrefDe, type Rota } from "../../router";
import { useHub } from "../../store/HubStore";
import { ROTULO_PAPEL, trabalhoAbertoDe } from "../../store/regras";
import type { Papel } from "../../store/tipos";
import { definirFraseComFita, lerArranjo, lerPrefs, salvarArranjo, salvarPrefs, type PrefsPrototipo } from "../inicio/mesa-viva/layout";
import "../inicio/mesa-viva/mesa-viva.css";
import {
  LADO_MINIMO,
  NOME_MAX,
  gravarPerfil,
  lerPerfil,
  mensagemErroFoto,
  usePerfilMock,
  validarArquivoFoto,
  validarNome,
  type ErroFoto,
} from "./armazenamento";
import { FotoPerfil } from "./FotoPerfil";
import { exportarRecorte, type Recorte } from "./recorte";
import { RecorteFoto } from "./RecorteFoto";
import "./perfil.css";

const esperar = (ms: number) => new Promise<void>((r) => window.setTimeout(r, ms));

const FRASE_PAPEL: Record<Papel, string> = {
  admin: "Cuida da equipe e das configurações, e decide pedidos e posts.",
  aprovador: "Aprova ou reprova posts e decide os pedidos que chegam.",
  marketing: "Cria posts, toca as tarefas e acompanha os pedidos do time.",
};

const MESES = ["JAN", "FEV", "MAR", "ABR", "MAI", "JUN", "JUL", "AGO", "SET", "OUT", "NOV", "DEZ"];

const BOTAO_BASE =
  "inline-flex items-center justify-center gap-1.5 rounded-full px-4 font-display text-xs font-bold shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-float focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 motion-reduce:transition-none motion-reduce:hover:translate-y-0 h-11 sm:h-10";

export function Perfil({ rota }: { rota: Rota }) {
  const { usuario, papel, dados, hoje } = useHub();
  const perfil = usePerfilMock(usuario);
  const armazenamento = window.localStorage;

  const [carregando] = useState(rota.params.estado === "carregando");
  const [erroCarga, setErroCarga] = useState(rota.params.estado === "erro");
  const falhaEnvio = useRef(rota.params.falha === "envio");
  const falhaNome = useRef(rota.params.falha === "nome");

  // ─── Anúncios (região viva educada) ────────────────────────────────────
  const [anuncio, setAnuncio] = useState({ texto: "", n: 0 });
  const anunciar = (texto: string) => setAnuncio((a) => ({ texto, n: a.n + 1 }));

  // ─── Tema (mesma preferência da Minha Mesa viva) ───────────────────────
  const [prefs, setPrefsEstado] = useState<PrefsPrototipo>(() => lerPrefs(armazenamento));
  useEffect(() => {
    const html = document.documentElement;
    if (prefs.tema === "escuro") html.dataset.hubTema = "escuro";
    else delete html.dataset.hubTema;
    return () => {
      delete html.dataset.hubTema;
    };
  }, [prefs.tema]);

  // ─── Fita da frase do dia (mesmo valor do modo Reorganizar) ────────────
  const [comFita, setComFita] = useState(() => lerArranjo(armazenamento, usuario.id).arranjo.fraseComFita);
  useEffect(() => setComFita(lerArranjo(armazenamento, usuario.id).arranjo.fraseComFita), [usuario.id, armazenamento]);

  const [salvoEm, setSalvoEm] = useState<{ grupo: "tema" | "fita"; n: number } | null>(null);
  const marcarSalvo = (grupo: "tema" | "fita") => {
    const n = Date.now();
    setSalvoEm({ grupo, n });
    window.setTimeout(() => setSalvoEm((s) => (s?.n === n ? null : s)), 1200);
  };

  const mudarTema = (tema: PrefsPrototipo["tema"]) => {
    if (tema === prefs.tema) return;
    const novo = { ...prefs, tema };
    setPrefsEstado(novo);
    salvarPrefs(armazenamento, novo);
    marcarSalvo("tema");
    anunciar(tema === "escuro" ? "Tema escuro ligado." : "Tema claro ligado.");
  };

  const mudarFita = (v: "com" | "sem") => {
    const ligar = v === "com";
    if (ligar === comFita) return;
    const atual = lerArranjo(armazenamento, usuario.id).arranjo;
    salvarArranjo(armazenamento, usuario.id, definirFraseComFita(atual, ligar));
    setComFita(ligar);
    marcarSalvo("fita");
    anunciar(ligar ? "Frase do dia com fita." : "Frase do dia sem fita.");
  };

  // ─── Resumo "Com você agora" ───────────────────────────────────────────
  const resumo = useMemo(() => {
    const t = trabalhoAbertoDe(dados, usuario.id);
    return {
      posts: dados.posts.filter((p) => p.autorId === usuario.id && p.estado !== "publicado").length,
      tarefas: t.cards.length + t.subtarefas.length,
      triagens: papel === "aprovador" || papel === "admin" ? t.triagens.length : 0,
    };
  }, [dados, usuario.id, papel]);

  const [, m, d] = hoje.split("-");
  const diaMini = { dia: d, mes: MESES[Number(m) - 1] };

  return (
    <div className="pb-8">
      <header className="animate-rise max-sm:pr-14 motion-reduce:animate-none">
        <h1 className="font-display text-[26px] font-bold leading-tight tracking-[-0.01em] text-foreground sm:text-[32px] sm:leading-9">Meu perfil</h1>
        <p className="mt-1 text-sm text-muted-foreground sm:text-[15px]">Como você aparece para o time e como o hub abre para você.</p>
      </header>

      <div className="mt-6 grid items-start gap-6 sm:mt-8 lg:grid-cols-[360px_minmax(0,1fr)] lg:gap-8">
        {erroCarga ? (
          <section
            className="animate-rise rounded-3xl bg-card p-6 shadow-card motion-reduce:animate-none sm:p-8"
            style={{ animationDelay: "60ms" }}
          >
            <LinhaErro
              texto="Não deu para carregar seu perfil."
              acao="Tentar de novo"
              onAcao={() => {
                console.error("[perfil] demonstração: perfil não carregou");
                setErroCarga(false);
              }}
            />
          </section>
        ) : carregando ? (
          <EsqueletoIdentidade />
        ) : (
          <CartaoIdentidade
            nome={perfil.nome}
            iniciais={perfil.iniciais}
            foto={perfil.foto}
            papel={papel}
            email={usuario.email}
            usuarioId={usuario.id}
            falhaEnvio={falhaEnvio}
            anunciar={anunciar}
            resumo={resumo}
          />
        )}

        <div className="grid gap-6 lg:block lg:rounded-3xl lg:bg-card lg:p-8 lg:shadow-card">
          <section
            aria-labelledby="perfil-dados"
            className="animate-rise rounded-3xl bg-card p-6 shadow-card motion-reduce:animate-none lg:rounded-none lg:bg-transparent lg:p-0 lg:shadow-none"
            style={{ animationDelay: "140ms" }}
          >
            <h2 id="perfil-dados" className="font-display text-lg font-bold text-foreground">
              Seus dados
            </h2>
            <p className="mb-6 mt-1 text-sm text-muted-foreground">É assim que o time vê você nos cards, nos comentários e na triagem.</p>
            {carregando ? (
              <div className="space-y-4" aria-hidden>
                <div className="h-11 max-w-md animate-pulse rounded-2xl bg-muted motion-reduce:animate-none" />
                <div className="h-5 w-64 animate-pulse rounded-full bg-muted motion-reduce:animate-none" />
                <div className="h-5 w-40 animate-pulse rounded-full bg-muted motion-reduce:animate-none" />
              </div>
            ) : (
              <SeusDados
                nomeSalvo={perfil.nome}
                email={usuario.email}
                papel={papel}
                usuarioId={usuario.id}
                falhaNome={falhaNome}
                anunciar={anunciar}
              />
            )}
          </section>

          <section
            aria-labelledby="perfil-preferencias"
            className="animate-rise rounded-3xl bg-card p-6 shadow-card motion-reduce:animate-none lg:mt-8 lg:rounded-none lg:border-t lg:border-border lg:bg-transparent lg:p-0 lg:pt-8 lg:shadow-none"
            style={{ animationDelay: "220ms" }}
          >
            <h2 id="perfil-preferencias" className="font-display text-lg font-bold text-foreground">
              Preferências
            </h2>
            <p className="mb-6 mt-1 text-sm text-muted-foreground">Valem só para você.</p>

            <div className="grid gap-y-2 sm:grid-cols-[160px_minmax(0,1fr)] sm:gap-x-6 sm:gap-y-6 [&>div]:max-sm:mb-4 [&>div:last-child]:max-sm:mb-0">
              <RotuloCampo id="pref-tema-rotulo">Tema</RotuloCampo>
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <PillsPerfil
                    rotuloId="pref-tema-rotulo"
                    valor={prefs.tema}
                    onChange={mudarTema}
                    opcoes={[
                      { id: "claro", label: "Claro" },
                      { id: "escuro", label: "Escuro" },
                    ]}
                  />
                  {salvoEm?.grupo === "tema" && <Salvo key={salvoEm.n} />}
                </div>
                <p className="mt-2 text-[13px] text-muted-foreground">Vale para a sua conta, em qualquer computador.</p>
              </div>

              <RotuloCampo id="pref-fita-rotulo">Frase do dia na Minha mesa</RotuloCampo>
              <div>
                <div className="flex flex-wrap items-center gap-4">
                  <PillsPerfil
                    rotuloId="pref-fita-rotulo"
                    valor={comFita ? "com" : "sem"}
                    onChange={mudarFita}
                    opcoes={[
                      { id: "com", label: "Com fita" },
                      { id: "sem", label: "Sem fita" },
                    ]}
                  />
                  <span aria-hidden className="pf-bilhete" data-fita={comFita}>
                    {comFita && <span className="pf-fita" />}
                    <span className="font-display text-xl font-bold leading-none text-foreground">{diaMini.dia}</span>
                    <span className="mt-0.5 font-display text-[9px] font-bold tracking-[0.14em] text-muted-foreground">{diaMini.mes}</span>
                  </span>
                  {salvoEm?.grupo === "fita" && <Salvo key={salvoEm.n} />}
                </div>
                <p className="mt-2 text-[13px] text-muted-foreground">Com fita, o tema do dia aparece escrito na fita do bilhete.</p>
              </div>
            </div>
          </section>
        </div>
      </div>

      <p key={anuncio.n} aria-live="polite" className="sr-only">
        {anuncio.texto}
      </p>
    </div>
  );
}

// ─── Cartão de identidade (foto, nome, papel, e-mail, resumo) ─────────────

function CartaoIdentidade({
  nome,
  iniciais,
  foto,
  papel,
  email,
  usuarioId,
  falhaEnvio,
  anunciar,
  resumo,
}: {
  nome: string;
  iniciais: string;
  foto?: string;
  papel: Papel;
  email: string;
  usuarioId: string;
  falhaEnvio: { current: boolean };
  anunciar: (t: string) => void;
  resumo: { posts: number; tarefas: number; triagens: number };
}) {
  const inputId = useId();
  const input = useRef<HTMLInputElement>(null);
  const quemAbriu = useRef<HTMLElement | null>(null);
  const refEnviar = useRef<HTMLButtonElement>(null);
  const refCancelarRemocao = useRef<HTMLButtonElement>(null);
  const contadorArraste = useRef(0);

  const [arrastando, setArrastando] = useState(false);
  const [imagemRecorte, setImagemRecorte] = useState<HTMLImageElement | null>(null);
  const [previa, setPrevia] = useState<string | undefined>();
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<ErroFoto | null>(null);
  const [pendente, setPendente] = useState<string | null>(null);
  const [confirmandoRemocao, setConfirmandoRemocao] = useState(false);

  useEffect(() => {
    if (confirmandoRemocao) refCancelarRemocao.current?.focus();
  }, [confirmandoRemocao]);

  const escolher = () => {
    quemAbriu.current = document.activeElement as HTMLElement | null;
    setErro(null);
    input.current?.click();
  };

  const receber = (f: File) => {
    setErro(null);
    setPendente(null);
    const invalido = validarArquivoFoto(f);
    if (invalido) {
      setErro(invalido);
      return;
    }
    const leitor = new FileReader();
    leitor.onerror = () => {
      console.warn("[perfil] FileReader falhou", leitor.error);
      setErro({ tipo: "nao_abre" });
    };
    leitor.onload = () => {
      const img = new Image();
      img.onload = () => {
        if (Math.min(img.naturalWidth, img.naturalHeight) < LADO_MINIMO) {
          setErro({ tipo: "pequena" });
          return;
        }
        setImagemRecorte(img);
      };
      img.onerror = () => {
        console.warn("[perfil] imagem não abriu");
        setErro({ tipo: "nao_abre" });
      };
      img.src = String(leitor.result);
    };
    leitor.readAsDataURL(f);
  };

  const fecharRecorte = () => {
    setImagemRecorte(null);
    window.setTimeout(() => (quemAbriu.current ?? refEnviar.current)?.focus(), 0);
  };

  const enviar = async (dataUrl: string) => {
    setErro(null);
    setPendente(null);
    setPrevia(dataUrl);
    setEnviando(true);
    await esperar(900);
    try {
      if (falhaEnvio.current) {
        falhaEnvio.current = false;
        throw new Error("demonstração: falha de rede no envio");
      }
      gravarPerfil(usuarioId, { ...lerPerfil(usuarioId), foto: dataUrl });
      anunciar("Foto atualizada. Ela aparece para o time nos próximos minutos.");
    } catch (e) {
      console.warn("[perfil] envio da foto falhou:", e instanceof Error ? e.message : e);
      setErro({ tipo: "rede" });
      setPendente(dataUrl);
    } finally {
      setPrevia(undefined);
      setEnviando(false);
    }
  };

  // O botão fica desabilitado durante o envio e perde o foco: quando o envio
  // termina (botão já habilitado no DOM), o foco volta para ele.
  const enviouAntes = useRef(false);
  useEffect(() => {
    if (enviouAntes.current && !enviando && (!document.activeElement || document.activeElement === document.body)) {
      refEnviar.current?.focus();
    }
    enviouAntes.current = enviando;
  }, [enviando]);

  const usar = (r: Recorte) => {
    const img = imagemRecorte;
    fecharRecorte();
    if (!img) return;
    try {
      void enviar(exportarRecorte(img, r));
    } catch (e) {
      console.warn("[perfil] recorte falhou:", e);
      setErro({ tipo: "nao_abre" });
    }
  };

  const remover = () => {
    const atual = lerPerfil(usuarioId);
    delete atual.foto;
    try {
      gravarPerfil(usuarioId, atual);
    } catch (e) {
      console.error("[perfil] remover falhou:", e);
      return;
    }
    setConfirmandoRemocao(false);
    anunciar("Foto removida. No lugar dela fica a sua inicial.");
    window.setTimeout(() => refEnviar.current?.focus(), 0);
  };

  // ─── Arrastar arquivo até o cartão ────────────────────────────────────
  const temArquivo = (e: DragEvent) => [...e.dataTransfer.types].includes("Files");
  const entra = (e: DragEvent) => {
    if (!temArquivo(e) || enviando) return;
    e.preventDefault();
    contadorArraste.current += 1;
    setArrastando(true);
  };
  const sobre = (e: DragEvent) => {
    if (!temArquivo(e) || enviando) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  };
  const sai = () => {
    contadorArraste.current = Math.max(0, contadorArraste.current - 1);
    if (contadorArraste.current === 0) setArrastando(false);
  };
  const solta = (e: DragEvent) => {
    e.preventDefault();
    contadorArraste.current = 0;
    setArrastando(false);
    if (enviando) return;
    const f = e.dataTransfer.files?.[0];
    if (f) {
      quemAbriu.current = refEnviar.current;
      receber(f);
    }
  };

  const temFoto = !!foto;

  return (
    <section
      aria-label="Sua identidade no hub"
      onDragEnter={entra}
      onDragOver={sobre}
      onDragLeave={sai}
      onDrop={solta}
      data-testid="cartao-identidade"
      className="animate-rise rounded-3xl bg-card p-6 shadow-card motion-reduce:animate-none sm:p-8 lg:sticky lg:top-24"
      style={{ animationDelay: "60ms" }}
    >
      <div className="flex flex-col items-center text-center md:flex-row md:items-center md:gap-8 md:text-left lg:flex-col lg:gap-0 lg:text-center">
        <FotoPerfil
          foto={foto}
          previa={previa}
          iniciais={iniciais}
          enviando={enviando}
          arrastando={arrastando}
          onEscolher={escolher}
        />

        <div className="mt-5 w-full min-w-0 md:mt-0 lg:mt-5">
          <p key={nome} className="pf-nome-entra line-clamp-2 text-balance font-display text-2xl font-bold leading-8 text-foreground lg:text-[28px]">
            {nome}
          </p>
          <p className="mt-2 font-display text-[11px] font-bold uppercase tracking-[0.18em] text-primary">{ROTULO_PAPEL[papel]}</p>
          <p className="mt-1 truncate text-[13px] text-muted-foreground" title={email}>
            {email}
          </p>

          <input
            ref={input}
            id={inputId}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            tabIndex={-1}
            aria-label="Escolher arquivo de foto"
            data-testid="input-foto"
            className="sr-only"
            onChange={(e) => {
              const f = e.target.files?.[0];
              e.target.value = "";
              if (f) receber(f);
            }}
          />

          {confirmandoRemocao ? (
            <div className="pf-erro-entra mt-6 rounded-2xl bg-muted px-4 py-3 text-left">
              <p className="text-[13px] text-foreground">Remover a foto? No lugar dela fica a sua inicial.</p>
              <div className="mt-3 grid grid-cols-2 gap-2 sm:flex">
                <button type="button" onClick={remover} className={cn(BOTAO_BASE, "bg-destructive text-destructive-foreground")}>
                  Remover
                </button>
                <button
                  ref={refCancelarRemocao}
                  type="button"
                  onClick={() => {
                    setConfirmandoRemocao(false);
                    window.setTimeout(() => refEnviar.current?.focus(), 0);
                  }}
                  className={cn(BOTAO_BASE, "bg-card text-foreground")}
                >
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <div className={cn("mt-6 grid gap-2", temFoto ? "grid-cols-2 sm:flex sm:justify-center md:justify-start lg:justify-center" : "grid-cols-1 sm:flex sm:justify-center md:justify-start lg:justify-center")}>
              <button ref={refEnviar} type="button" onClick={escolher} disabled={enviando} className={cn(BOTAO_BASE, "pf-botao-principal")}>
                <Upload className="size-3.5" aria-hidden />
                {temFoto ? "Trocar foto" : "Enviar foto"}
              </button>
              {temFoto && (
                <button
                  type="button"
                  onClick={() => setConfirmandoRemocao(true)}
                  disabled={enviando}
                  className={cn(BOTAO_BASE, "bg-card text-destructive")}
                >
                  <Trash2 className="size-3.5" aria-hidden />
                  Remover foto
                </button>
              )}
            </div>
          )}

          {enviando && <p className="mt-3 text-[13px] text-muted-foreground">Enviando foto…</p>}
          {!temFoto && !enviando && !erro && (
            <p className="mt-3 text-[13px] text-muted-foreground">Arraste uma foto até o círculo ou escolha um arquivo. JPG, PNG ou WebP.</p>
          )}
          {erro && (
            <div className="mt-4 text-left">
              <LinhaErro
                texto={mensagemErroFoto(erro)}
                acao={erro.tipo === "rede" && pendente ? "Tentar de novo" : "Escolher outra foto"}
                onAcao={() => {
                  if (erro.tipo === "rede" && pendente) void enviar(pendente);
                  else escolher();
                }}
              />
            </div>
          )}
        </div>
      </div>

      <ResumoComVoce resumo={resumo} />

      {imagemRecorte && <RecorteFoto imagem={imagemRecorte} onCancelar={fecharRecorte} onUsar={usar} />}
    </section>
  );
}

function EsqueletoIdentidade() {
  return (
    <section aria-busy="true" className="rounded-3xl bg-card p-6 shadow-card sm:p-8 lg:sticky lg:top-24">
      <p className="sr-only">Carregando seu perfil.</p>
      <div aria-hidden className="flex flex-col items-center">
        <div className="size-32 animate-pulse rounded-full bg-muted motion-reduce:animate-none lg:size-40" />
        <div className="mt-5 h-7 w-48 animate-pulse rounded-full bg-muted motion-reduce:animate-none" />
        <div className="mt-3 h-3 w-24 animate-pulse rounded-full bg-muted motion-reduce:animate-none" />
        <div className="mt-2 h-3 w-40 animate-pulse rounded-full bg-muted motion-reduce:animate-none" />
        <div className="mt-6 h-10 w-36 animate-pulse rounded-full bg-muted motion-reduce:animate-none" />
      </div>
    </section>
  );
}

// ─── Resumo leve ─────────────────────────────────────────────────────────

const plural = (n: number, um: string, varios: string) => (n === 1 ? um : varios.replace("{n}", String(n)));

function ResumoComVoce({ resumo }: { resumo: { posts: number; tarefas: number; triagens: number } }) {
  const linhas = [
    { n: resumo.posts, texto: plural(resumo.posts, "post em andamento", "posts em andamento"), href: hrefDe("posts", "meus") },
    { n: resumo.tarefas, texto: plural(resumo.tarefas, "tarefa aberta", "tarefas abertas"), href: hrefDe("tarefas", "quadro") },
    { n: resumo.triagens, texto: plural(resumo.triagens, "pedido na sua triagem", "pedidos na sua triagem"), href: hrefDe("tarefas", "pedidos") },
  ].filter((l) => l.n > 0);

  return (
    <div className="mt-8 border-t border-border pt-6 text-left">
      <p className="px-2 font-display text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">Com você agora</p>
      {linhas.length === 0 ? (
        <p className="mt-3 px-2 text-sm text-muted-foreground">
          Nada aberto com você agora.{" "}
          <a href={hrefDe("tendencias", "tendencias")} className="font-display text-xs font-bold text-primary underline-offset-4 hover:underline">
            Ver tendências
          </a>
        </p>
      ) : (
        <ul className="mt-2">
          {linhas.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                className="group flex min-h-11 items-center gap-3 rounded-2xl px-2 transition-colors hover:bg-navy-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                <span className="w-[2.5ch] font-display text-2xl font-bold tabular-nums text-foreground">{l.n}</span>
                <span className="min-w-0 flex-1 text-sm text-foreground">{l.texto}</span>
                <ArrowRight
                  aria-hidden
                  className="size-3.5 text-muted-foreground transition-transform duration-150 group-hover:translate-x-0.5 motion-reduce:transform-none motion-reduce:transition-none"
                />
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ─── Seus dados ──────────────────────────────────────────────────────────

function SeusDados({
  nomeSalvo,
  email,
  papel,
  usuarioId,
  falhaNome,
  anunciar,
}: {
  nomeSalvo: string;
  email: string;
  papel: Papel;
  usuarioId: string;
  falhaNome: { current: boolean };
  anunciar: (t: string) => void;
}) {
  const [valor, setValor] = useState(nomeSalvo);
  const [estado, setEstado] = useState<"repouso" | "salvando" | "salvo">("repouso");
  const [erroGravar, setErroGravar] = useState<string | null>(null);
  const [mexeu, setMexeu] = useState(false);

  // Nome salvo de fora (outra pessoa de demo): acompanha se não há edição em curso.
  useEffect(() => {
    if (!mexeu) setValor(nomeSalvo);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nomeSalvo]);

  const aparado = valor.trim();
  const sujo = aparado !== nomeSalvo;
  const erroValidacao = mexeu && sujo ? validarNome(valor) : null;
  const erro = erroValidacao ?? erroGravar;
  const podeSalvar = sujo && !validarNome(valor) && estado !== "salvando";

  const salvar = async () => {
    if (!podeSalvar) {
      if (sujo) setMexeu(true);
      return;
    }
    setErroGravar(null);
    setEstado("salvando");
    await esperar(500);
    try {
      if (falhaNome.current) {
        falhaNome.current = false;
        throw new Error("demonstração: falha ao salvar o nome");
      }
      gravarPerfil(usuarioId, { ...lerPerfil(usuarioId), nome: aparado });
      setValor(aparado);
      setMexeu(false);
      setEstado("salvo");
      anunciar("Nome salvo.");
      window.setTimeout(() => setEstado((e) => (e === "salvo" ? "repouso" : e)), 1600);
    } catch (e) {
      console.error("[perfil] salvar nome falhou:", e instanceof Error ? e.message : e);
      setErroGravar("Não deu para salvar o nome. Tente de novo.");
      setEstado("repouso");
    }
  };

  const tecla = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      void salvar();
    } else if (e.key === "Escape") {
      e.preventDefault();
      setValor(nomeSalvo);
      setMexeu(false);
      setErroGravar(null);
    }
  };

  return (
    <div className="grid gap-y-2 sm:grid-cols-[160px_minmax(0,1fr)] sm:gap-x-6 sm:gap-y-6 [&>div]:max-sm:mb-4 [&>div:last-child]:max-sm:mb-0">
      <label htmlFor="perfil-nome" className="text-[13px] font-semibold text-foreground sm:pt-3">
        Nome completo
      </label>
      <div className="min-w-0">
        <div className="flex max-w-xl flex-col gap-3 sm:flex-row sm:items-start">
          <input
            id="perfil-nome"
            type="text"
            value={valor}
            maxLength={NOME_MAX}
            autoComplete="name"
            aria-invalid={erro ? true : undefined}
            aria-describedby={erro ? "perfil-nome-ajuda perfil-nome-erro" : "perfil-nome-ajuda"}
            onChange={(e) => {
              setValor(e.target.value);
              setMexeu(true);
              setErroGravar(null);
              if (estado === "salvo") setEstado("repouso");
            }}
            onKeyDown={tecla}
            className={cn(
              "h-11 w-full min-w-0 rounded-2xl border bg-background px-4 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none sm:max-w-md",
              erro ? "border-destructive" : "border-input",
            )}
          />
          <button
            type="button"
            onClick={() => void salvar()}
            disabled={!podeSalvar && estado !== "salvo"}
            aria-live="off"
            className={cn(BOTAO_BASE, "h-11 w-full shrink-0 sm:h-11 sm:w-auto", estado === "salvo" ? "bg-success-soft text-foreground" : "pf-botao-principal")}
          >
            {estado === "salvando" ? (
              <>
                <Loader2 className="size-3.5 animate-spin motion-reduce:animate-none" aria-hidden />
                Salvando…
              </>
            ) : estado === "salvo" ? (
              <>
                <CheckDesenhado />
                Salvo
              </>
            ) : (
              "Salvar nome"
            )}
          </button>
        </div>
        {erro && (
          <p id="perfil-nome-erro" role="alert" className="pf-erro-entra mt-2 flex items-center gap-1.5 text-[13px] text-destructive">
            <CircleAlert className="size-4 shrink-0" aria-hidden />
            {erro}
          </p>
        )}
        <p id="perfil-nome-ajuda" className="mt-2 text-[13px] text-muted-foreground">
          Use nome e sobrenome. É o que aparece no lugar da foto quando ela não carrega.
        </p>
      </div>

      <RotuloCampo>E-mail</RotuloCampo>
      <div className="min-w-0">
        <p className="flex min-w-0 items-center gap-2 pt-0 text-sm text-foreground sm:pt-3">
          <span className="truncate" title={email}>
            {email}
          </span>
          <Lock className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
        </p>
        <p className="mt-1 text-[13px] text-muted-foreground">O e-mail de acesso não muda por aqui. Se precisar trocar, fale com o administrador.</p>
      </div>

      <RotuloCampo>Papel</RotuloCampo>
      <div className="min-w-0">
        <p className="pt-0 font-display text-[15px] font-bold text-primary sm:pt-3">{ROTULO_PAPEL[papel]}</p>
        <p className="mt-0.5 text-sm text-foreground">{FRASE_PAPEL[papel]}</p>
        <p className="mt-1 text-[13px] text-muted-foreground">
          {papel === "admin" ? (
            <>
              Você muda papéis em{" "}
              <a href={hrefDe("configuracoes", "equipe")} className="font-semibold text-primary underline-offset-4 hover:underline">
                Configurações, na aba Equipe
              </a>
              .
            </>
          ) : (
            "Quem muda o papel é o administrador, em Configurações, na aba Equipe."
          )}
        </p>
      </div>
    </div>
  );
}

// ─── Peças pequenas ──────────────────────────────────────────────────────

function RotuloCampo({ id, children }: { id?: string; children: ReactNode }) {
  return (
    <p id={id} className="text-[13px] font-semibold text-foreground sm:pt-3">
      {children}
    </p>
  );
}

function CheckDesenhado() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden className="pf-check size-3.5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3.5 8.5l3 3 6-7" pathLength={1} />
    </svg>
  );
}

function Salvo() {
  return (
    <span className="pf-salvo inline-flex items-center gap-1 text-xs text-muted-foreground">
      <Check className="size-3.5 text-success" aria-hidden />
      Salvo
    </span>
  );
}

function LinhaErro({ texto, acao, onAcao }: { texto: string; acao?: string; onAcao?: () => void }) {
  return (
    <div role="alert" className="pf-erro-entra flex items-start gap-2 rounded-2xl bg-destructive/10 px-4 py-3">
      <CircleAlert className="mt-0.5 size-4 shrink-0 text-destructive" aria-hidden />
      <div className="min-w-0">
        <p className="text-[13px] text-foreground">{texto}</p>
        {acao && onAcao && (
          <button
            type="button"
            onClick={onAcao}
            className="min-h-11 font-display text-xs font-bold text-primary underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            {acao}
          </button>
        )}
      </div>
    </div>
  );
}

/** Par de pills do projeto (radiogroup, setas ←/→), com tamanho de toque abaixo de sm. */
function PillsPerfil<T extends string>({
  opcoes,
  valor,
  onChange,
  rotuloId,
}: {
  opcoes: { id: T; label: string }[];
  valor: T;
  onChange: (v: T) => void;
  rotuloId: string;
}) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const tecla = (e: KeyboardEvent, i: number) => {
    const delta = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 0;
    if (!delta) return;
    e.preventDefault();
    const j = (i + delta + opcoes.length) % opcoes.length;
    onChange(opcoes[j].id);
    refs.current[j]?.focus();
  };
  return (
    <div role="radiogroup" aria-labelledby={rotuloId} className="inline-flex items-center gap-1 rounded-full bg-secondary p-1">
      {opcoes.map((o, i) => {
        const marcado = o.id === valor;
        return (
          <button
            key={o.id}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="button"
            role="radio"
            aria-checked={marcado}
            tabIndex={marcado ? 0 : -1}
            onClick={() => onChange(o.id)}
            onKeyDown={(e) => tecla(e, i)}
            className={cn(
              "h-11 rounded-full px-5 font-display text-sm font-bold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transition-none sm:h-8 sm:px-4 sm:text-xs",
              marcado ? "bg-primary text-primary-foreground shadow-card" : "text-secondary-foreground hover:bg-sky-soft",
            )}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
