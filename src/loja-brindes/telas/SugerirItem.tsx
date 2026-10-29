// PROTÓTIPO DESCARTÁVEL — não é o app. Fonte da verdade = Lovable.
// Gerado de: conceito novo (DigiPlace v4, marketplace de brindes) @ leitura 2026-10-29.
// Regenerar (não remendar) se o conceito mudar. Dados MOCK, sem backend, sem segredos.
// Decisão de design correspondente: .agents/tasks/digiplace-v4/ (protótipo para validar a ideia).
//
// Formulário de sugestão de item (mini-feature v4), aberto como gaveta a partir da vitrine
// (?sugerir=1). Qualquer usuário pode sugerir um brinde que não existe no catálogo; o marketing
// analisa e, se aprovar, ele vira um item de encomenda.

import { useState } from "react";
import { Lightbulb } from "lucide-react";
import { useLoja } from "../estado";
import { Botao, Campo, classeInput, Gaveta } from "../ui";

export function SugerirItem({ aberto, onFechar }: { aberto: boolean; onFechar: () => void }) {
  const { sugerirItem } = useLoja();
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [referencia, setReferencia] = useState("");
  const [qtd, setQtd] = useState("");
  const [tentou, setTentou] = useState(false);

  const erroNome = !nome.trim() ? "Dê um nome ao brinde." : null;
  const erroDescricao = !descricao.trim() ? "Conte para que serve o brinde." : null;
  const valido = !erroNome && !erroDescricao;

  const limpar = () => { setNome(""); setDescricao(""); setReferencia(""); setQtd(""); setTentou(false); };

  const enviar = () => {
    setTentou(true);
    if (!valido) return;
    const r = sugerirItem({
      nome: nome.trim(), descricao: descricao.trim(),
      referencia: referencia.trim() || undefined,
      qtdEstimada: qtd ? Math.max(0, Math.floor(Number(qtd) || 0)) : undefined,
    });
    if (r) { limpar(); onFechar(); }
  };

  return (
    <Gaveta
      aberto={aberto} onFechar={onFechar} titulo="Sugerir um brinde"
      subtitulo="Uma ideia de brinde que não está no catálogo. O marketing analisa e, se aprovar, ele vira um item de encomenda."
      rodape={
        <div className="flex gap-2">
          <Botao variante="fantasma" className="flex-1" onClick={onFechar}>Cancelar</Botao>
          <Botao tamanho="lg" className="flex-[2]" onClick={enviar}>Enviar sugestão</Botao>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="flex items-start gap-3 rounded-2xl bg-navy-soft p-3.5">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-card text-primary"><Lightbulb className="size-5" aria-hidden /></span>
          <p className="text-[13.5px] text-foreground/85">Descreva a ideia com o que você já sabe. Não precisa fechar quantidade nem fornecedor: o marketing cuida disso depois de aprovar.</p>
        </div>
        <Campo rotulo="Nome do item" htmlFor="sug-nome" erro={tentou ? erroNome : null}>
          <input id="sug-nome" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex.: Guarda-chuva compacto" className={classeInput} />
        </Campo>
        <Campo rotulo="Descrição / para que serve" htmlFor="sug-desc" erro={tentou ? erroDescricao : null}
          ajuda="Conte onde você usaria e por que vale a pena ter esse brinde.">
          <textarea id="sug-desc" rows={4} value={descricao} onChange={(e) => setDescricao(e.target.value)}
            placeholder="Ex.: guarda-chuva automático com a marca na faixa, para dar em feira com chuva" className={classeInput} />
        </Campo>
        <Campo rotulo="Link ou referência (opcional)" htmlFor="sug-ref" ajuda="Um link de exemplo ajuda o marketing a entender a ideia.">
          <input id="sug-ref" value={referencia} onChange={(e) => setReferencia(e.target.value)} placeholder="https://..." className={classeInput} />
        </Campo>
        <Campo rotulo="Quantidade estimada (opcional)" htmlFor="sug-qtd">
          <input id="sug-qtd" type="number" min="0" inputMode="numeric" value={qtd} onChange={(e) => setQtd(e.target.value)} placeholder="Ex.: 50" className={classeInput} />
        </Campo>
      </div>
    </Gaveta>
  );
}
