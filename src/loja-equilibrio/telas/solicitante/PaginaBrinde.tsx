// PROTÓTIPO DESCARTÁVEL — não é o app.
// Gerado de: loja-digi-store/ e loja-brindes/ (página do brinde), lidos em 2026-11-11; reescrito aqui, sem importar deles.
// Fonte da verdade = Lovable. Regenerar (não remendar) se o real mudar.
// Decisão de design correspondente: .agents/tasks/loja-equilibrio/ (relatorio.md) e .kiro/specs/loja-equilibrio-digiplace/design.md (Req. 3).
//
// Página do brinde: foto grande à esquerda, escolha à direita. A linha de erro e o botão ficam em posições estáveis
// (a mensagem ocupa uma faixa reservada), então validar a quantidade não desloca o botão "Adicionar ao carrinho".

import { useMemo, useState } from "react";
import { ChevronLeft } from "lucide-react";
import { brl } from "../../formato";
import { PrecoBrinde } from "../../PrecoBrinde";
import { disponivel, precoDaLinhaDoCarrinho, precoUnitarioLinha, selos, subtotalDaLinha, validarLinha } from "../../regras";
import { href } from "../../rota";
import { useLoja } from "../../store";
import type { Brinde, OpcaoPersonalizacao } from "../../tipos";
import { FotoBrinde, Msg, Selo } from "../../ui";

const CAMPO =
  "h-11 w-full rounded-2xl border bg-card px-4 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--le-foco)]";

const ROTULO_OPCAO: Record<OpcaoPersonalizacao, string> = {
  texto: "Texto",
  arte: "Arte",
  logo: "Logo",
  nome: "Nome",
};

const LINK_VOLTAR =
  "le-btn inline-flex h-11 items-center gap-1 rounded-full px-3 text-sm font-semibold text-navy hover:bg-navy-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--le-foco)]";

function NaoEncontrado() {
  return (
    <section className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <div className="rounded-3xl border bg-card p-8 text-center shadow-card">
        <h1 className="font-display text-2xl font-bold text-navy">Brinde não encontrado</h1>
        <p className="mt-1 text-sm text-muted-foreground">Esse brinde não existe ou foi desativado.</p>
        <a
          href={href("")}
          className="le-btn mt-4 inline-flex h-11 items-center rounded-full bg-navy px-5 font-display text-sm font-bold text-navy-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--le-foco)]"
        >
          Voltar aos brindes
        </a>
      </div>
    </section>
  );
}

export function PaginaBrinde({ slug }: { slug: string }) {
  const loja = useLoja();
  const b = loja.brinde(slug);
  if (!b || !b.ativo) return <NaoEncontrado />;
  // key: trocar de brinde reinicia a escolha.
  return <Conteudo key={b.id} b={b} />;
}

function Conteudo({ b }: { b: Brinde }) {
  const loja = useLoja();
  const s = selos(b);
  const personalizavel = b.tipo === "personalizavel";

  const [qtdTexto, setQtdTexto] = useState("1");
  const [tocou, setTocou] = useState(false);
  const [texto, setTexto] = useState("");
  const [nome, setNome] = useState("");
  const [arte, setArte] = useState("");
  const [logo, setLogo] = useState("");
  const [erroEnvio, setErroEnvio] = useState<string | null>(null);

  const qtd = Number(qtdTexto);
  const validacao = useMemo(() => validarLinha(b, qtdTexto.trim() === "" ? Number.NaN : qtd), [b, qtd, qtdTexto]);
  const esgotado = !personalizavel && s.indisponivel;
  // A mensagem aparece depois de a pessoa mexer na quantidade ou tentar adicionar; nunca antes.
  const erro = erroEnvio ?? (tocou && !validacao.ok ? validacao.erros.join(" ") : null);

  const opcoes = b.opcoesPersonalizacao ?? [];

  // Subtotal da quantidade escolhida, só com quantidade inteira a partir de 1 e preço conhecido (estoque).
  const linhaPreco = precoDaLinhaDoCarrinho(b, qtd);
  const precoUnit = Number.isInteger(qtd) && qtd >= 1 ? precoUnitarioLinha(linhaPreco) : null;
  const subtotal = precoUnit !== null ? subtotalDaLinha(linhaPreco) : null;

  const adicionar = () => {
    setTocou(true);
    setErroEnvio(null);
    if (!validacao.ok) return;
    let personalizacao: { texto?: string; arte?: string } | undefined;
    if (personalizavel) {
      const partesTexto = [
        opcoes.includes("texto") && texto.trim() ? texto.trim() : "",
        opcoes.includes("nome") && nome.trim() ? `Nome: ${nome.trim()}` : "",
      ].filter(Boolean);
      const partesArte = [
        opcoes.includes("arte") && arte.trim() ? arte.trim() : "",
        opcoes.includes("logo") && logo.trim() ? logo.trim() : "",
      ].filter(Boolean);
      personalizacao = {
        texto: partesTexto.join(" · ") || undefined,
        arte: partesArte.join(", ") || undefined,
      };
    }
    const r = loja.adicionar(b.id, qtd, personalizacao);
    if (!r.ok) {
      setErroEnvio(r.motivo);
      return;
    }
    loja.abrirCarrinho(true);
  };

  return (
    <section className="mx-auto max-w-7xl px-4 py-4 sm:px-6 sm:py-6">
      <nav aria-label="Você está em" className="mb-2 flex flex-wrap items-center gap-x-1 text-sm">
        <a href={href("")} className={LINK_VOLTAR}>
          <ChevronLeft className="size-4" aria-hidden />
          Brindes
        </a>
        <span className="text-muted-foreground" aria-hidden>
          /
        </span>
        <span className="px-1 font-semibold text-foreground" aria-current="page">
          {b.nome}
        </span>
      </nav>

      <div className="grid gap-6 md:grid-cols-2 md:gap-8 lg:gap-12">
        {/* Foto grande; no desktop acompanha a rolagem. */}
        <div className="md:sticky md:top-[11rem] md:self-start lg:top-36">
          <div className="relative overflow-hidden rounded-3xl border bg-secondary shadow-card">
            <FotoBrinde src={b.foto} alt={b.nome} className={esgotado ? "opacity-60" : ""} />
            {(s.novidade || s.ultimasUnidades) && (
              <div className="absolute left-3 top-3 flex flex-col items-start gap-1">
                {s.novidade && <Selo tipo="novidade" />}
                {s.ultimasUnidades && <Selo tipo="ultimas" />}
              </div>
            )}
          </div>
        </div>

        <div className="flex min-w-0 flex-col gap-5">
          <header>
            <p className="text-xs font-semibold text-muted-foreground">
              {b.categoria} · {personalizavel ? "Personalizável" : "Brinde em estoque"}
            </p>
            <h1 className="mt-1 font-display text-3xl font-bold leading-tight text-navy sm:text-4xl">{b.nome}</h1>
            <p className="mt-3 max-w-prose text-base text-foreground/85">{b.descricao}</p>
            <div className="mt-3">
              <PrecoBrinde modo="unitario" brinde={b} destaque />
              {/* Subtotal pela quantidade escolhida; a linha tem altura reservada e some o texto (não o espaço) sem preço ou sem quantidade válida. */}
              <p className="min-h-5 text-sm leading-5 text-foreground/80" aria-live="polite">
                {subtotal !== null && precoUnit !== null ? `${qtd} × ${brl(precoUnit)} = ${brl(subtotal)}` : ""}
              </p>
              {esgotado && <p className="text-sm font-semibold text-muted-foreground">Indisponível no momento</p>}
            </div>
          </header>

          {personalizavel && (
            <dl className="grid gap-3 rounded-2xl bg-secondary p-4 text-sm">
              <div>
                <dt className="text-xs text-muted-foreground">Prazo extra de produção</dt>
                <dd className="font-display text-lg font-bold text-navy">{b.prazoExtraDiasUteis ?? 0} dias úteis</dd>
              </div>
            </dl>
          )}

          {!esgotado && (
            <>
              {!personalizavel && <p className="text-sm font-semibold text-foreground">{disponivel(b)} disponíveis</p>}

              {personalizavel && opcoes.length > 0 && (
                <fieldset className="grid gap-3 rounded-2xl border p-4">
                  <legend className="px-1 font-display text-sm font-bold text-navy">Personalização</legend>
                  {opcoes.includes("texto") && (
                    <label className="block text-sm">
                      <span className="mb-1 block font-semibold">{ROTULO_OPCAO.texto}</span>
                      <input className={CAMPO} value={texto} onChange={(e) => setTexto(e.target.value)} placeholder="Frase a estampar" />
                    </label>
                  )}
                  {opcoes.includes("nome") && (
                    <label className="block text-sm">
                      <span className="mb-1 block font-semibold">{ROTULO_OPCAO.nome}</span>
                      <input className={CAMPO} value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Nome a gravar" />
                    </label>
                  )}
                  {opcoes.includes("arte") && (
                    <label className="block text-sm">
                      <span className="mb-1 block font-semibold">{ROTULO_OPCAO.arte}</span>
                      <input className={CAMPO} value={arte} onChange={(e) => setArte(e.target.value)} placeholder="Nome do arquivo, ex.: arte-evento.pdf" />
                    </label>
                  )}
                  {opcoes.includes("logo") && (
                    <label className="block text-sm">
                      <span className="mb-1 block font-semibold">{ROTULO_OPCAO.logo}</span>
                      <input className={CAMPO} value={logo} onChange={(e) => setLogo(e.target.value)} placeholder="Nome do arquivo, ex.: logo-cliente.png" />
                    </label>
                  )}
                  <p className="text-xs text-muted-foreground">Neste protótipo o arquivo é só o nome. O Marketing confere a arte antes da produção.</p>
                </fieldset>
              )}

              <div>
                <label htmlFor="qtd-brinde" className="mb-1 block font-display text-sm font-bold text-navy">
                  Quantidade
                </label>
                <div className="flex flex-wrap items-start gap-3">
                  <div className="w-32 shrink-0">
                    <input
                      id="qtd-brinde"
                      type="number"
                      inputMode="numeric"
                      min={1}
                      step={1}
                      value={qtdTexto}
                      onChange={(e) => {
                        setQtdTexto(e.target.value);
                        setTocou(true);
                        setErroEnvio(null);
                      }}
                      aria-invalid={!!erro}
                      aria-describedby="qtd-erro"
                      className={`${CAMPO} ${erro ? "border-destructive" : ""}`}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={adicionar}
                    className="le-btn inline-flex h-11 shrink-0 items-center justify-center rounded-full bg-navy px-6 font-display text-sm font-bold text-navy-foreground hover:bg-navy/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--le-foco)]"
                  >
                    Adicionar ao carrinho
                  </button>
                </div>
                {/* Faixa reservada para a mensagem: aparecer ou sumir não move o campo nem o botão. */}
                <p id="qtd-erro" role={erro ? "alert" : undefined} className="mt-2 min-h-10 text-sm font-semibold text-[color:var(--destructive-strong)] sm:min-h-5">
                  <Msg texto={erro} />
                </p>
              </div>
            </>
          )}

          {esgotado && (
            <div className="rounded-2xl bg-secondary p-4 text-sm text-foreground/85">
              Este brinde está sem saldo livre agora. Volte à vitrine para ver outros brindes ou sugira um novo.
              <div className="mt-3">
                <a
                  href={href("")}
                  className="inline-flex h-11 items-center rounded-full bg-navy px-5 font-display text-sm font-bold text-navy-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--le-foco)]"
                >
                  Voltar aos brindes
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
