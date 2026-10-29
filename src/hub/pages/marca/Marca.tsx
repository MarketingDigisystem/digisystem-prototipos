/*
 * PROTÓTIPO DESCARTÁVEL — não é o app.
 * Gerado de: src/routes/_authenticated/brand-kit.tsx, src/components/admin/AbaMarca.tsx,
 *   src/hooks/use-brand-kit.ts @ commit 4fcf254 / leitura 2026-10-07.
 * Fonte da verdade = Lovable. Regenerar (não remendar) se o real mudar.
 * Decisão de design correspondente: docs-marketing-hub/implementacao/PROPOSTA-nova-interface-golive.md.
 *
 * Marca (proposta 2.3: junta o Brand Kit e a aba Marca da Administração).
 *  - Uma página por aba (Identidade · Voz · Logos e fundos · Cores e fontes ·
 *    Hashtags) no lugar do menu lateral de âncoras do Brand Kit real.
 *  - Um rascunho só para as 5 abas, como o formulário único do real: trocar de
 *    aba não perde nada, e "Salvar alterações" (laranja, só ativo com mudança)
 *    grava tudo de uma vez. Quem não edita vê o selo "Somente leitura".
 *  - Quem edita: Marketing e Admin (no real, editor e admin; regras.ts →
 *    podeEditarMarca). O Aprovador só lê.
 *  - Identidade junta nome, slogan, descrição, cultura, experiência e
 *    segmentos; Voz junta voz, tom de voz, CTA padrão, assinatura e o que a
 *    marca evita (lido do Manual de Estilo).
 */
import { useEffect, useMemo, useState } from "react";
import { Fingerprint, Heart, Megaphone, Mic2, Plus, Save, Settings2, ShieldBan, Trash2, Users } from "lucide-react";
import { cn } from "../../../lib/utils";
import { CabecalhoArea } from "../../components/CabecalhoArea";
import { hrefDe } from "../../router";
import { useHub, novoId } from "../../store/HubStore";
import { TERMOS_BANIDOS } from "../../store/mock-geracao";
import { plural, podeEditarMarca, validarTamanhosLogo } from "../../store/regras";
import type { Marca as MarcaT } from "../../store/tipos";
import { CoresFontes } from "./CoresFontes";
import { Hashtags } from "./Hashtags";
import { LogosFundos } from "./LogosFundos";
import { atraso, BotaoLeve, BotaoRemover, CAMPO, Campo, CampoChips, Secao, type PatchMarca, type PropsAba } from "./partes";

const SUBTITULO: Record<string, string> = {
  identidade: "Quem é a Digisystem, no texto que a IA usa como ponto de partida em tudo o que gera.",
  voz: "Como a marca soa, para os textos do Estúdio saírem como o time escreve.",
  logos: "As versões do logo, os fundos e os elementos que o Estúdio usa na composição das artes.",
  cores: "A paleta oficial e a tipografia de cada nível de texto.",
  hashtags: "As hashtags oficiais que entram em todo post, somadas às de contexto.",
};

export function Marca({ aba }: { aba: string }) {
  const { dados, papel, acoes } = useHub();
  const podeEditar = podeEditarMarca(papel);
  const [form, setForm] = useState<MarcaT>(dados.marca);

  // Salvar ou "restaurar dados de exemplo" troca a marca do store: o rascunho acompanha.
  useEffect(() => setForm(dados.marca), [dados.marca]);

  const mudou = useMemo(() => JSON.stringify(form) !== JSON.stringify(dados.marca), [form, dados.marca]);
  const patch: PatchMarca = (chave, valor) => setForm((f) => ({ ...f, [chave]: valor }));

  const salvar = () => {
    const tamanhos = validarTamanhosLogo(form.tamanhosLogo);
    if (!tamanhos.ok) {
      acoes.avisar(`${tamanhos.motivo} Ajuste em Logos e fundos antes de salvar.`, "erro");
      return;
    }
    acoes.atualizarMarca(form);
    acoes.avisar("Marca atualizada. O Estúdio e a IA já usam a versão nova.");
  };

  const props: PropsAba = { form, patch, podeEditar };
  const conteudo =
    aba === "voz" ? (
      <Voz {...props} />
    ) : aba === "logos" ? (
      <LogosFundos {...props} />
    ) : aba === "cores" ? (
      <CoresFontes {...props} />
    ) : aba === "hashtags" ? (
      <Hashtags {...props} />
    ) : (
      <Identidade {...props} />
    );

  return (
    <>
      <CabecalhoArea
        area="marca"
        aba={aba}
        subtitulo={SUBTITULO[aba] ?? SUBTITULO.identidade}
        actions={
          podeEditar ? (
            <div className="flex items-center gap-2">
              {mudou && (
                <button
                  type="button"
                  onClick={() => setForm(dados.marca)}
                  className="rounded-full px-3 py-2 font-display text-xs font-bold text-muted-foreground transition-colors duration-300 hover:text-primary"
                >
                  Descartar
                </button>
              )}
              <button
                type="button"
                onClick={salvar}
                disabled={!mudou}
                className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 font-display text-xs font-bold text-accent-foreground shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:shadow-float disabled:pointer-events-none disabled:opacity-50"
              >
                <Save aria-hidden className="h-4 w-4" /> Salvar alterações
              </button>
            </div>
          ) : (
            <span className="rounded-full bg-muted px-3 py-1 font-display text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Somente leitura
            </span>
          )
        }
      />

      {mudou && (
        <p role="status" className="animate-rise mt-4 text-xs text-accent">
          Alterações ainda não salvas. Elas continuam aqui se você trocar de aba.
        </p>
      )}

      {conteudo}
    </>
  );
}

// ─── Identidade ───────────────────────────────────────────────────────────

function Identidade({ form, patch, podeEditar }: PropsAba) {
  const { dados } = useHub();
  const tendenciasPorSegmento = (nome: string) =>
    dados.tendencias.filter((t) => t.segmento?.trim().toLowerCase() === nome.trim().toLowerCase()).length;

  const mudarSegmento = (i: number, campo: "nome" | "descricao", valor: string) => {
    const lista = [...form.segmentos];
    lista[i] = { ...lista[i], [campo]: valor };
    patch("segmentos", lista);
  };

  return (
    <>
      <p className="animate-rise mt-8 max-w-3xl text-[15px] leading-relaxed text-foreground/85" style={atraso(70)}>
        A {form.nome || "marca"} se apresenta como "{form.tagline || "sem slogan"}" e atende{" "}
        {plural(form.segmentos.length, "segmento", "segmentos")}. Os segmentos aparecem no briefing do Estúdio e no
        filtro das Tendências.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
        <Secao icone={<Fingerprint aria-hidden className="h-4 w-4" />} titulo="Como a marca se apresenta" delay={120}>
          <div className="mt-4 rounded-2xl bg-navy-soft px-5 py-4">
            <p className="font-display text-3xl font-bold leading-tight text-primary">{form.nome || "Nome da marca"}</p>
            <p className="mt-0.5 font-display text-sm font-semibold text-accent">{form.tagline || "Slogan"}</p>
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Campo rotulo="Nome da marca">
              {(id) => <input id={id} value={form.nome} onChange={(e) => patch("nome", e.target.value)} disabled={!podeEditar} className={CAMPO} />}
            </Campo>
            <Campo rotulo="Slogan">
              {(id) => (
                <input
                  id={id}
                  value={form.tagline}
                  onChange={(e) => patch("tagline", e.target.value)}
                  disabled={!podeEditar}
                  placeholder="Uma frase que resume a marca"
                  className={CAMPO}
                />
              )}
            </Campo>
          </div>
          <Campo rotulo="Descrição curta" className="mt-4" dica="É o primeiro parágrafo que a IA lê sobre a empresa.">
            {(id) => (
              <textarea
                id={id}
                rows={6}
                value={form.descricao}
                onChange={(e) => patch("descricao", e.target.value)}
                disabled={!podeEditar}
                className={cn(CAMPO, "resize-y leading-relaxed")}
              />
            )}
          </Campo>
        </Secao>

        <Secao icone={<Heart aria-hidden className="h-4 w-4" />} titulo="Cultura e experiência" delay={190}>
          <Campo rotulo="Cultura da marca" className="mt-4" dica="Valores, crenças e princípios que guiam o time e as decisões do dia a dia.">
            {(id) => (
              <textarea
                id={id}
                rows={4}
                value={form.cultura}
                onChange={(e) => patch("cultura", e.target.value)}
                disabled={!podeEditar}
                placeholder="Como a marca pensa, decide e se comporta internamente…"
                className={cn(CAMPO, "resize-y leading-relaxed")}
              />
            )}
          </Campo>
          <div className="my-5 border-t border-border" />
          <Campo
            rotulo="Experiência de marca"
            dica="O que as pessoas sentem, veem e vivem ao interagir com a marca em qualquer canal."
          >
            {(id) => (
              <textarea
                id={id}
                rows={4}
                value={form.experiencia}
                onChange={(e) => patch("experiencia", e.target.value)}
                disabled={!podeEditar}
                placeholder="Momentos-chave, princípios de UX, sensação desejada…"
                className={cn(CAMPO, "resize-y leading-relaxed")}
              />
            )}
          </Campo>
        </Secao>
      </div>

      <Secao
        icone={<Users aria-hidden className="h-4 w-4" />}
        titulo="Segmentos"
        ajuda="Segmentos são os públicos que você atende, usados na criação de posts."
        className="mt-6"
        delay={260}
        extra={<span className="font-display text-xs font-bold text-muted-foreground">{form.segmentos.length}</span>}
      >
        <ul className="mt-4 divide-y divide-border">
          {form.segmentos.map((s, i) => {
            const n = tendenciasPorSegmento(s.nome);
            return (
              <li key={s.id} className="grid gap-3 py-4 first:pt-0 last:pb-0 md:grid-cols-[minmax(0,15rem)_minmax(0,1fr)_auto] md:items-start">
                <div>
                  <label className="sr-only" htmlFor={`seg-nome-${s.id}`}>
                    Nome do segmento
                  </label>
                  <input
                    id={`seg-nome-${s.id}`}
                    value={s.nome}
                    onChange={(e) => mudarSegmento(i, "nome", e.target.value)}
                    disabled={!podeEditar}
                    placeholder="Nome do segmento"
                    className={cn(CAMPO, "font-display font-bold text-primary")}
                  />
                  <p className="mt-1.5 pl-1 text-[11px] text-muted-foreground">
                    {n ? `${plural(n, "tendência", "tendências")} no radar` : "Nenhuma tendência no radar"}
                  </p>
                </div>
                <div>
                  <label className="sr-only" htmlFor={`seg-desc-${s.id}`}>
                    Descrição do segmento {s.nome}
                  </label>
                  <textarea
                    id={`seg-desc-${s.id}`}
                    rows={2}
                    value={s.descricao}
                    onChange={(e) => mudarSegmento(i, "descricao", e.target.value)}
                    disabled={!podeEditar}
                    placeholder="Descrição breve do segmento"
                    className={cn(CAMPO, "resize-y leading-relaxed")}
                  />
                </div>
                {podeEditar && (
                  <BotaoRemover rotulo={`Remover o segmento ${s.nome || "sem nome"}`} onClick={() => patch("segmentos", form.segmentos.filter((_, j) => j !== i))}>
                    <Trash2 aria-hidden className="h-4 w-4" />
                  </BotaoRemover>
                )}
              </li>
            );
          })}
        </ul>
        {podeEditar && (
          <BotaoLeve
            className="mt-4 self-start"
            onClick={() => patch("segmentos", [...form.segmentos, { id: novoId("seg"), nome: "", descricao: "" }])}
          >
            <Plus aria-hidden className="h-3.5 w-3.5" /> Adicionar segmento
          </BotaoLeve>
        )}
      </Secao>
    </>
  );
}

// ─── Voz ──────────────────────────────────────────────────────────────────

const CTA_POR_CANAL = [
  { canal: "LinkedIn e Facebook", regra: "Link direto para a página ou o formulário." },
  { canal: "Instagram", regra: "Palavra-chave gatilho, como \"Comente CONTEXTO\", porque o link na legenda não abre." },
];

const POR_EXTENSO = [
  ["para", "pra"],
  ["está", "tá"],
];

function Voz({ form, patch, podeEditar }: PropsAba) {
  const { papel } = useHub();
  return (
    <>
      <p className="animate-rise mt-8 max-w-3xl text-[15px] leading-relaxed text-foreground/85" style={atraso(70)}>
        Tom {form.tomVoz.length ? form.tomVoz.map((t) => t.toLowerCase()).join(" e ") : "ainda sem definição"}, de colega
        capacitado explicando para outro colega. Toda legenda fecha com "{form.ctaPadrao || "o CTA padrão"}" ou com a
        chamada do canal, e assina como {form.assinatura || "a equipe"}.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
        <Secao
          icone={<Mic2 aria-hidden className="h-4 w-4" />}
          titulo="Voz da marca"
          ajuda="Como a marca soa: tom, ritmo e personalidade em todo ponto de contato."
          delay={120}
        >
          <label htmlFor="marca-voz" className="sr-only">
            Voz da marca
          </label>
          <textarea
            id="marca-voz"
            rows={5}
            value={form.voz}
            onChange={(e) => patch("voz", e.target.value)}
            disabled={!podeEditar}
            placeholder="Espírito jovem, inteligente, amante da tecnologia…"
            className={cn(CAMPO, "mt-3 resize-y leading-relaxed")}
          />
          <div className="mt-5">
            <CampoChips
              rotulo="Tom de voz"
              valores={form.tomVoz}
              onChange={(v) => patch("tomVoz", v)}
              podeEditar={podeEditar}
              tom="primary"
              placeholder="Ex.: Consultivo"
              normalizar={(s) => s.charAt(0).toLocaleUpperCase("pt-BR") + s.slice(1)}
            />
            <p className="mt-2 text-[11px] text-muted-foreground">
              Hoje o tom de voz fica guardado na marca, mas ainda não entra no texto que a IA escreve. Quem conduz o tom
              da geração é o Manual de Estilo.
            </p>
          </div>
        </Secao>

        <Secao icone={<Megaphone aria-hidden className="h-4 w-4" />} titulo="Chamada e assinatura" delay={190}>
          <Campo rotulo="CTA padrão" className="mt-4">
            {(id) => (
              <textarea
                id={id}
                rows={2}
                value={form.ctaPadrao}
                onChange={(e) => patch("ctaPadrao", e.target.value)}
                disabled={!podeEditar}
                className={cn(CAMPO, "resize-y")}
              />
            )}
          </Campo>
          <Campo rotulo="Assinatura" className="mt-4" dica="Fecha a legenda, depois da chamada.">
            {(id) => (
              <input id={id} value={form.assinatura} onChange={(e) => patch("assinatura", e.target.value)} disabled={!podeEditar} className={CAMPO} />
            )}
          </Campo>
          <div className="mt-5 border-t border-border pt-4">
            <p className="font-display text-xs font-bold uppercase tracking-wider text-muted-foreground">Chamada por canal</p>
            <dl className="mt-2 space-y-2">
              {CTA_POR_CANAL.map((c) => (
                <div key={c.canal} className="text-sm">
                  <dt className="font-display font-bold text-primary">{c.canal}</dt>
                  <dd className="text-xs leading-relaxed text-muted-foreground">{c.regra}</dd>
                </div>
              ))}
            </dl>
          </div>
        </Secao>
      </div>

      <Secao
        icone={<ShieldBan aria-hidden className="h-4 w-4" />}
        titulo="O que a marca evita"
        ajuda="Termos que soam gerados por máquina e formas abreviadas. A IA não usa, e o parecer da aprovação aponta quando aparecem."
        className="mt-6"
        delay={260}
      >
        <div className="mt-4 grid gap-6 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
          <div>
            <p className="font-display text-xs font-bold uppercase tracking-wider text-muted-foreground">Termos banidos</p>
            <ul className="mt-2 flex flex-wrap gap-2">
              {TERMOS_BANIDOS.map((t) => (
                <li key={t} className="rounded-full bg-destructive/10 px-3 py-1 font-display text-xs font-bold text-destructive line-through decoration-1">
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="font-display text-xs font-bold uppercase tracking-wider text-muted-foreground">Sempre por extenso</p>
            <ul className="mt-2 space-y-1 text-sm">
              {POR_EXTENSO.map(([certo, errado]) => (
                <li key={certo}>
                  <span className="font-semibold text-primary">{certo}</span>
                  <span className="text-muted-foreground">, nunca "{errado}"</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <p className="mt-5 flex items-center gap-2 border-t border-border pt-4 text-xs text-muted-foreground">
          <Settings2 aria-hidden className="h-3.5 w-3.5 shrink-0" />
          {papel === "admin" ? (
            <span>
              Esta lista vem do Manual de Estilo.{" "}
              <a href={hrefDe("configuracoes", "ia")} className="font-semibold text-primary underline-offset-2 hover:underline">
                Editar em Configurações → IA e prompts
              </a>
            </span>
          ) : (
            <span>Esta lista vem do Manual de Estilo. Quem edita é o admin, em Configurações → IA e prompts.</span>
          )}
        </p>
      </Secao>
    </>
  );
}
