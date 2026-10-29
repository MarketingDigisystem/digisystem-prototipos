/*
 * PROTÓTIPO DESCARTÁVEL — não é o app.
 * Gerado de: src/components/admin/AbaEquipe.tsx, src/components/admin/UserCard.tsx,
 *   src/components/admin/UserFilters.tsx, src/components/admin/UserStatsBar.tsx
 *   @ commit 4fcf254 / leitura 2026-10-08.
 * Fonte da verdade = Lovable. Regenerar (não remendar) se o real mudar.
 * Decisão de design correspondente: docs-marketing-hub/implementacao/PROPOSTA-nova-interface-golive.md
 *   (seção 7) e docs-marketing-hub/implementacao/pacote-10-admin-consolidado.md (bloco B).
 *
 * Configurações → Equipe (só admin; o shell barra os outros papéis).
 * Padrão anti-AI aprovado no pacote-10: resumo editorial em uma frase com os
 * números em Dosis e "Convidar" na mesma linha; filtros leves numa linha só,
 * com divisor embaixo; cards (faixa lateral na cor do papel) ou tabela. Os 4
 * boxes iguais do UserStatsBar não entram. Menu de ações em portal.
 * Regras (regras.ts → Configurações): ninguém muda o próprio papel nem se
 * remove; o único administrador com acesso não é rebaixado nem removido;
 * remover alguém devolve o trabalho aberto ao time ("Sem responsável").
 */
import { useMemo, useState, type FormEvent, type ReactNode } from "react";
import { Copy, KeyRound, LayoutGrid, List, MailPlus, MoreHorizontal, Search, Trash2, UserPlus } from "lucide-react";
import { cn } from "../../../lib/utils";
import { CabecalhoArea } from "../../components/CabecalhoArea";
import { useHub } from "../../store/HubStore";
import { diaDe, nomeDoEmail, O_QUE_O_PAPEL_FAZ, ORDEM_PAPEIS, plural, ROTULO_PAPEL, somarDias } from "../../store/regras";
import type { Papel, Usuario } from "../../store/tipos";
import { atraso, CAMPO, Dialogo, MenuAcoes, ROTULO, type ItemMenu } from "./partes";

type FiltroStatus = "todos" | "ativos" | "pendentes";
type Ordem = "nome" | "acesso" | "criacao";
type Vista = "cards" | "tabela";

/** Cores por papel, como ROLE_FAIXA/ROLE_TEXTO do real (editor = Marketing). */
const FAIXA: Record<Papel, string> = { admin: "bg-navy", aprovador: "bg-accent", marketing: "bg-sky" };
const TEXTO: Record<Papel, string> = { admin: "text-navy", aprovador: "text-accent", marketing: "text-[oklch(0.5_0.1_221)]" };
const AVATAR: Record<Papel, string> = {
  admin: "bg-primary text-primary-foreground",
  aprovador: "bg-accent text-accent-foreground",
  marketing: "bg-sky text-primary",
};

/** "hoje", "ontem", "há 3 dias" contra o "hoje" do protótipo. */
function tempoRelativo(iso: string | undefined, hoje: string): string {
  if (!iso) return "nunca";
  const dia = diaDe(iso);
  if (dia === hoje) return "hoje";
  if (dia === somarDias(hoje, -1)) return "ontem";
  const [a, m, d] = dia.split("-").map(Number);
  const [ah, mh, dh] = hoje.split("-").map(Number);
  const dias = Math.round((new Date(ah, mh - 1, dh).getTime() - new Date(a, m - 1, d).getTime()) / 86_400_000);
  if (dias < 0) return "hoje";
  if (dias < 30) return `há ${dias} dias`;
  const meses = Math.round(dias / 30);
  return meses <= 1 ? "há 1 mês" : `há ${meses} meses`;
}

function AvatarPapel({ u, tamanho = "h-11 w-11", className }: { u: Usuario; tamanho?: string; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn("grid shrink-0 place-items-center rounded-full font-display text-sm font-bold", AVATAR[u.papel], tamanho, className)}
    >
      {u.iniciais}
    </span>
  );
}

export function Equipe() {
  const { dados, hoje, usuario, sel, acoes } = useHub();
  const resumo = sel.resumoEquipe();
  const membros = sel.membrosEquipe();
  const removidos = dados.usuarios.length - membros.length;

  const [busca, setBusca] = useState("");
  const [papel, setPapel] = useState<Papel | "todos">("todos");
  const [status, setStatus] = useState<FiltroStatus>("todos");
  const [ordem, setOrdem] = useState<Ordem>("nome");
  const [vista, setVista] = useState<Vista>("cards");
  const [convidando, setConvidando] = useState(false);
  const [removendo, setRemovendo] = useState<Usuario | null>(null);

  const lista = useMemo(() => {
    const q = busca.trim().toLowerCase();
    return membros
      .filter((u) => !q || u.nome.toLowerCase().includes(q) || u.email.toLowerCase().includes(q))
      .filter((u) => papel === "todos" || u.papel === papel)
      .filter((u) => status === "todos" || (status === "ativos" ? u.ativo : !u.ativo))
      .sort((a, b) => {
        if (ordem === "acesso") return (b.ultimoAcesso ?? "").localeCompare(a.ultimoAcesso ?? "");
        if (ordem === "criacao") return b.criadoEm.localeCompare(a.criadoEm);
        return a.nome.localeCompare(b.nome, "pt-BR");
      });
  }, [membros, busca, papel, status, ordem]);

  const filtrando = busca.trim() !== "" || papel !== "todos" || status !== "todos";

  const copiar = (u: Usuario) => {
    void navigator.clipboard?.writeText(u.email).catch(() => undefined);
    acoes.avisar("E-mail copiado.");
  };

  /** Itens do menu ⋯ (UserActionsMenu real), com o motivo na linha quando a regra não deixa. */
  const itensMenu = (u: Usuario): ItemMenu[] => {
    const euMesmo = u.id === usuario.id;
    const itens: ItemMenu[] = [{ tipo: "titulo", texto: "Papel" }];
    if (euMesmo) {
      itens.push({ tipo: "nota", texto: `Você é ${ROTULO_PAPEL[u.papel]}. Para mudar o seu papel, peça a outro administrador.` });
    } else {
      for (const p of ORDEM_PAPEIS) {
        const r = p === u.papel ? { ok: true as const } : sel.podeMudarPapel(u.id, p);
        itens.push({
          tipo: "acao",
          texto: ROTULO_PAPEL[p],
          marcado: p === u.papel,
          bloqueio: r.ok ? undefined : r.motivo,
          onClick: () => p !== u.papel && acoes.mudarPapel(u.id, p),
        });
      }
    }
    itens.push({ tipo: "separador" });
    if (!u.ativo) {
      itens.push({
        tipo: "acao",
        texto: "Reenviar convite",
        icone: <MailPlus aria-hidden className="h-4 w-4" />,
        onClick: () => acoes.avisar(`Convite reenviado para ${u.email}.`),
      });
    }
    if (!euMesmo) {
      itens.push({
        tipo: "acao",
        texto: "Redefinir senha",
        icone: <KeyRound aria-hidden className="h-4 w-4" />,
        onClick: () => acoes.avisar(`Senha redefinida. ${u.nome.split(" ")[0]} define uma nova no próximo acesso.`),
      });
    }
    itens.push({ tipo: "acao", texto: "Copiar e-mail", icone: <Copy aria-hidden className="h-4 w-4" />, onClick: () => copiar(u) });
    if (!euMesmo) {
      const r = sel.podeRemoverUsuario(u.id);
      itens.push({
        tipo: "acao",
        texto: "Remover do time",
        icone: <Trash2 aria-hidden className="h-4 w-4" />,
        perigo: true,
        bloqueio: r.ok ? undefined : r.motivo,
        onClick: () => (r.ok ? setRemovendo(u) : acoes.avisar(r.motivo, "erro")),
      });
    }
    return itens;
  };

  return (
    <>
      <CabecalhoArea area="configuracoes" aba="equipe" subtitulo="Quem usa o Hub e o que cada pessoa pode fazer." />

      {/* Resumo editorial + Convidar na mesma linha (pacote-10). */}
      <div className="animate-rise mt-8 flex flex-wrap items-end justify-between gap-3" style={atraso(60)}>
        <p className="max-w-prose text-[15px] leading-relaxed text-muted-foreground">
          São <Num>{resumo.total}</Num> pessoas no time: <Num tom="accent">{resumo.admins}</Num> com acesso de administrador e{" "}
          <Num>{resumo.ativos}</Num> com acesso ativo.
          {resumo.pendentes > 0 && (
            <>
              {" "}
              {resumo.pendentes === 1 ? "Um convite ainda espera resposta." : `${resumo.pendentes} convites ainda esperam resposta.`}
            </>
          )}
        </p>
        <button
          type="button"
          onClick={() => setConvidando(true)}
          className="inline-flex shrink-0 items-center gap-2 rounded-full bg-accent px-4 py-2.5 font-display text-sm font-bold text-accent-foreground shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:shadow-float"
        >
          <UserPlus aria-hidden className="h-4 w-4" /> Convidar
        </button>
      </div>

      {/* Filtros leves: uma linha, sem card em volta, divisor embaixo. */}
      <div className="animate-rise mt-6 flex flex-wrap items-center gap-3 border-b border-border pb-4" style={atraso(120)}>
        <label className="relative min-w-[220px] flex-1">
          <span className="sr-only">Buscar por nome ou e-mail</span>
          <Search aria-hidden className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar por nome ou e-mail" className={cn(CAMPO, "py-2.5 pl-9")} />
        </label>
        <select aria-label="Papel" value={papel} onChange={(e) => setPapel(e.target.value as Papel | "todos")} className={cn(CAMPO, "w-auto py-2.5")}>
          <option value="todos">Todos os papéis · {resumo.total}</option>
          {ORDEM_PAPEIS.map((p) => (
            <option key={p} value={p}>
              {ROTULO_PAPEL[p]} · {resumo.porPapel[p]}
            </option>
          ))}
        </select>
        <select aria-label="Situação" value={status} onChange={(e) => setStatus(e.target.value as FiltroStatus)} className={cn(CAMPO, "w-auto py-2.5")}>
          <option value="todos">Todos os status</option>
          <option value="ativos">Ativos</option>
          <option value="pendentes">Convites pendentes</option>
        </select>
        <select aria-label="Ordenar" value={ordem} onChange={(e) => setOrdem(e.target.value as Ordem)} className={cn(CAMPO, "w-auto py-2.5")}>
          <option value="nome">Ordenar por nome</option>
          <option value="acesso">Último acesso</option>
          <option value="criacao">Data de entrada</option>
        </select>
        <div role="radiogroup" aria-label="Visualização" className="flex overflow-hidden rounded-xl border border-input">
          {(
            [
              ["cards", "Ver em cards", LayoutGrid],
              ["tabela", "Ver em tabela", List],
            ] as const
          ).map(([id, label, Icone]) => (
            <button
              key={id}
              type="button"
              role="radio"
              aria-checked={vista === id}
              aria-label={label}
              onClick={() => setVista(id)}
              className={cn(
                "px-3 py-2.5 transition-colors duration-300",
                vista === id ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:text-primary",
              )}
            >
              <Icone aria-hidden className="h-4 w-4" />
            </button>
          ))}
        </div>
      </div>

      {lista.length === 0 ? (
        <div className="animate-rise mt-6 rounded-3xl bg-card p-10 text-center shadow-card">
          <p className="font-display text-lg font-bold text-primary">Ninguém por aqui com esse filtro</p>
          <p className="mt-1 text-sm text-muted-foreground">Tente outro papel ou outra busca.</p>
          {filtrando && (
            <button
              type="button"
              onClick={() => {
                setBusca("");
                setPapel("todos");
                setStatus("todos");
              }}
              className="mt-4 font-display text-xs font-bold text-accent hover:underline"
            >
              Limpar filtros
            </button>
          )}
        </div>
      ) : vista === "cards" ? (
        <ul className="mt-6 grid gap-3 sm:grid-cols-2">
          {lista.map((u, i) => {
            const euMesmo = u.id === usuario.id;
            return (
              <li
                key={u.id}
                className="animate-rise relative flex items-center gap-3 overflow-hidden rounded-2xl border border-border bg-card py-3.5 pl-5 pr-2 shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:shadow-float"
                style={atraso(160 + i * 50)}
              >
                <span aria-hidden className={cn("absolute inset-y-0 left-0 w-1.5", FAIXA[u.papel])} />
                <AvatarPapel u={u} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate font-display text-[15px] font-bold text-primary">{u.nome}</p>
                    {euMesmo && <Selo tom="navy">Você</Selo>}
                    {!u.ativo && <Selo tom="muted">sem acesso</Selo>}
                  </div>
                  <p className="truncate text-xs text-muted-foreground">{u.email}</p>
                  <p className="mt-0.5 truncate text-[11px]">
                    <span className={cn("font-display font-bold uppercase tracking-wide", TEXTO[u.papel])}>{ROTULO_PAPEL[u.papel]}</span>
                    {u.cargo && <span className="text-muted-foreground"> · {u.cargo}</span>}
                  </p>
                </div>
                <MenuAcoes rotulo={`Ações de ${u.nome}`} itens={itensMenu(u)} gatilho={<MoreHorizontal aria-hidden className="h-4 w-4" />} />
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="animate-rise mt-6 overflow-hidden rounded-3xl border border-border bg-card shadow-card" style={atraso(160)}>
          {/* Cabeçalho discreto em Dosis cinza, sem caixa alta colorida (pacote-10). */}
          <div className="hidden items-center gap-4 border-b border-border px-4 py-2.5 font-display text-xs font-semibold text-muted-foreground sm:flex">
            <span className="w-11 shrink-0" />
            <span className="flex-1">Pessoa</span>
            <span className="w-40 shrink-0">Papel e acesso</span>
            <span className="w-2 shrink-0" />
            <span className="w-7 shrink-0" />
          </div>
          <ul>
            {lista.map((u, i) => (
              <li
                key={u.id}
                className={cn("flex items-center gap-4 px-4 py-3.5 transition-colors duration-300 hover:bg-secondary/40", i < lista.length - 1 && "border-b border-border/60")}
              >
                <AvatarPapel u={u} className="rounded-2xl" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-display text-[15px] font-bold text-primary">
                    {u.nome}
                    {u.id === usuario.id && <span className="ml-2 text-[10px] uppercase text-primary/70">Você</span>}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">{u.email}</p>
                </div>
                <div className="hidden w-40 shrink-0 sm:block">
                  <p className={cn("font-display text-[13px] font-bold", TEXTO[u.papel])}>{ROTULO_PAPEL[u.papel]}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {u.ativo ? `ativo · ${tempoRelativo(u.ultimoAcesso, hoje)}` : `convidado ${tempoRelativo(u.criadoEm, hoje)}`}
                  </p>
                </div>
                <span
                  className={cn("hidden h-2 w-2 shrink-0 rounded-full sm:block", u.ativo ? "bg-success" : "bg-border")}
                  title={u.ativo ? "Ativo" : "Sem acesso"}
                />
                <MenuAcoes rotulo={`Ações de ${u.nome}`} itens={itensMenu(u)} gatilho={<MoreHorizontal aria-hidden className="h-4 w-4" />} />
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* O que cada papel faz: a regra de acesso escrita, para quem convida escolher certo. */}
      <section aria-labelledby="papeis-titulo" className="animate-rise mt-12 max-w-3xl" style={atraso(260)}>
        <h2 id="papeis-titulo" className="font-display text-lg font-bold text-primary">
          O que cada papel pode fazer
        </h2>
        <dl className="mt-3 divide-y divide-border/70">
          {ORDEM_PAPEIS.map((p) => (
            <div key={p} className="flex gap-4 py-3">
              <span aria-hidden className={cn("mt-1 h-8 w-1 shrink-0 rounded-full", FAIXA[p])} />
              <div>
                <dt className="font-display text-sm font-bold text-primary">
                  {ROTULO_PAPEL[p]} <span className="font-normal text-muted-foreground">· {plural(resumo.porPapel[p], "pessoa", "pessoas")}</span>
                </dt>
                <dd className="mt-0.5 text-[13px] leading-relaxed text-foreground/80">{O_QUE_O_PAPEL_FAZ[p]}</dd>
              </div>
            </div>
          ))}
        </dl>
        <p className="mt-3 text-[12px] leading-relaxed text-muted-foreground">
          Em qualquer papel, ninguém decide o próprio post nem o próprio pedido.
          {removidos > 0 &&
            ` ${removidos === 1 ? "Uma pessoa saiu" : `${removidos} pessoas saíram`} do time: o nome continua nos posts e decisões que já estavam feitos.`}
        </p>
      </section>

      {convidando && <ConvidarDialog onFechar={() => setConvidando(false)} />}
      {removendo && <RemoverDialog u={removendo} onFechar={() => setRemovendo(null)} />}
    </>
  );
}

function Num({ children, tom = "primary" }: { children: ReactNode; tom?: "primary" | "accent" }) {
  return <span className={cn("font-display text-lg font-bold", tom === "accent" ? "text-accent" : "text-primary")}>{children}</span>;
}

function Selo({ children, tom }: { children: ReactNode; tom: "navy" | "muted" }) {
  return (
    <span
      className={cn(
        "shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase",
        tom === "navy" ? "bg-navy-soft text-primary" : "bg-muted text-muted-foreground",
      )}
    >
      {children}
    </span>
  );
}

// ─── Convidar (InviteUserDialog real: e-mail + papel) ──────────────────────

function ConvidarDialog({ onFechar }: { onFechar: () => void }) {
  const { acoes } = useHub();
  const [email, setEmail] = useState("");
  const [papel, setPapel] = useState<Papel>("marketing");
  const [erro, setErro] = useState("");
  const nome = email.includes("@") ? nomeDoEmail(email) : "";

  const enviar = (e: FormEvent) => {
    e.preventDefault();
    const r = acoes.convidarUsuario(email, papel);
    if (r.ok) onFechar();
    else setErro(r.motivo);
  };

  return (
    <Dialogo titulo="Convidar para o time" descricao="A pessoa recebe um e-mail para criar a senha. Até entrar, aparece como sem acesso." onFechar={onFechar}>
      <form onSubmit={enviar} className="mt-5 space-y-4">
        <label className="block">
          <span className={ROTULO}>E-mail</span>
          <input
            autoFocus
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setErro("");
            }}
            placeholder="nome.sobrenome@exemplo.com"
            className={cn(CAMPO, "mt-1.5")}
          />
          {nome && <span className="mt-1 block text-[12px] text-muted-foreground">Vai aparecer como {nome}.</span>}
        </label>
        <fieldset>
          <legend className={ROTULO}>Papel</legend>
          <div role="radiogroup" className="mt-1.5 inline-flex gap-1 rounded-full bg-secondary p-1">
            {[...ORDEM_PAPEIS].reverse().map((p) => (
              <button
                key={p}
                type="button"
                role="radio"
                aria-checked={papel === p}
                onClick={() => setPapel(p)}
                className={cn(
                  "rounded-full px-3.5 py-1.5 font-display text-xs font-bold transition-all duration-300",
                  papel === p ? "bg-card text-primary shadow-card" : "text-muted-foreground hover:text-primary",
                )}
              >
                {ROTULO_PAPEL[p]}
              </button>
            ))}
          </div>
          <p className="mt-2 text-[13px] leading-relaxed text-foreground/80">{O_QUE_O_PAPEL_FAZ[papel]}</p>
        </fieldset>
        {erro && (
          <p role="alert" className="rounded-2xl bg-destructive/10 px-3 py-2 text-[13px] text-destructive">
            {erro}
          </p>
        )}
        <div className="flex justify-end gap-2 pt-1">
          <button type="button" onClick={onFechar} className="rounded-full px-4 py-2 font-display text-xs font-bold text-muted-foreground hover:text-primary">
            Cancelar
          </button>
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2 font-display text-xs font-bold text-accent-foreground shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:shadow-float"
          >
            <MailPlus aria-hidden className="h-4 w-4" /> Enviar convite
          </button>
        </div>
      </form>
    </Dialogo>
  );
}

// ─── Remover (ConfirmRemoveDialog real + o que acontece com o trabalho aberto) ─

function RemoverDialog({ u, onFechar }: { u: Usuario; onFechar: () => void }) {
  const { sel, acoes } = useHub();
  const t = sel.trabalhoAbertoDe(u.id);
  const primeiro = u.nome.split(" ")[0];
  const linhas = [
    t.cards.length > 0 && `${plural(t.cards.length, "card fica", "cards ficam")} sem responsável`,
    t.subtarefas.length > 0 && `${plural(t.subtarefas.length, "subtarefa fica", "subtarefas ficam")} sem responsável`,
    t.revisoes.length > 0 && `${plural(t.revisoes.length, "revisão assumida é liberada", "revisões assumidas são liberadas")} em Para aprovar`,
    t.triagens.length > 0 && `${plural(t.triagens.length, "pedido em triagem volta", "pedidos em triagem voltam")} para Recebidos, sem dono`,
  ].filter((x): x is string => Boolean(x));

  const remover = () => {
    if (acoes.removerUsuario(u.id).ok) onFechar();
  };

  return (
    <Dialogo titulo={`Remover ${u.nome} do time?`} descricao={`${primeiro} perde o acesso ao Hub. Dá para convidar de novo depois.`} onFechar={onFechar}>
      <div className="mt-5 rounded-2xl bg-secondary/50 p-4 text-[13px] leading-relaxed text-foreground/85">
        {linhas.length === 0 ? (
          <p>Não há nada aberto com {primeiro} agora.</p>
        ) : (
          <>
            <p className="font-display text-xs font-bold uppercase tracking-wider text-muted-foreground">O que estava com {primeiro}</p>
            <ul className="mt-2 space-y-1">
              {linhas.map((l) => (
                <li key={l} className="flex gap-2">
                  <span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                  <span>{l.charAt(0).toUpperCase() + l.slice(1)}.</span>
                </li>
              ))}
            </ul>
          </>
        )}
        <p className="mt-2 text-muted-foreground">Os posts, comentários e decisões que {primeiro} já fez continuam com o nome.</p>
      </div>
      <div className="mt-5 flex justify-end gap-2">
        <button type="button" onClick={onFechar} className="rounded-full px-4 py-2 font-display text-xs font-bold text-muted-foreground hover:text-primary">
          Cancelar
        </button>
        <button
          type="button"
          onClick={remover}
          className="inline-flex items-center gap-2 rounded-full bg-destructive px-4 py-2 font-display text-xs font-bold text-destructive-foreground shadow-card transition-all duration-300 hover:-translate-y-0.5"
        >
          <Trash2 aria-hidden className="h-4 w-4" /> Remover do time
        </button>
      </div>
    </Dialogo>
  );
}
