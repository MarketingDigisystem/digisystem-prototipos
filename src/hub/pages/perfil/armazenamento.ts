/*
 * PROTÓTIPO DESCARTÁVEL — não é o app.
 * Gerado de: src/hub/components/shell/MenuAvatar.tsx (iniciaisDe), src/hooks/use-solicitacao-anexos.ts
 *   (validação de tipo/tamanho) @ origin/main c16c790 / leitura 2026-10-27.
 * Fonte da verdade = Lovable. Regenerar (não remendar) se o real mudar.
 * Decisão de design correspondente: docs-marketing-hub/implementacao/pacote-perfil-e-foto-2026-10-27.md.
 *
 * Perfil MOCK: nome e foto (dataURL) no localStorage, chave `proto.perfil.<usuarioId>`.
 * No app real: profiles.display_name + profiles.avatar_path (bucket privado
 * `avatars`), via src/hooks/use-perfil.ts, fora de src/hub (guardas 12.5 e 12.8–12.10).
 */
import { useEffect, useState } from "react";
import type { Usuario } from "../../store/tipos";

export type PerfilSalvo = { nome?: string; foto?: string };

export const chavePerfil = (usuarioId: string) => `proto.perfil.${usuarioId}`;
export const EVENTO_PERFIL = "perfil:atualizado";

export const TIPOS_ACEITOS = ["image/jpeg", "image/png", "image/webp"] as const;
/** Limite do arquivo escolhido no navegador (decisão do usuário 2026-10-27: até 10 MB).
 *  A foto é recortada e reexportada em 512×512 WebP; o bucket mantém 2 MB. */
export const LIMITE_BYTES = 10 * 1024 * 1024;
export const LADO_MINIMO = 128;
export const NOME_MIN = 2;
export const NOME_MAX = 80;

export function lerPerfil(usuarioId: string): PerfilSalvo {
  try {
    const txt = window.localStorage.getItem(chavePerfil(usuarioId));
    if (!txt) return {};
    const b = JSON.parse(txt) as unknown;
    if (!b || typeof b !== "object") return {};
    const o = b as Record<string, unknown>;
    return {
      nome: typeof o.nome === "string" ? o.nome : undefined,
      foto: typeof o.foto === "string" && o.foto.startsWith("data:image/") ? o.foto : undefined,
    };
  } catch {
    console.warn("[perfil] perfil salvo inválido, voltando ao padrão");
    return {};
  }
}

/** Grava e avisa quem escuta (menu do avatar, tela). Pode lançar QuotaExceededError. */
export function gravarPerfil(usuarioId: string, p: PerfilSalvo) {
  window.localStorage.setItem(chavePerfil(usuarioId), JSON.stringify(p));
  window.dispatchEvent(new CustomEvent(EVENTO_PERFIL, { detail: { usuarioId } }));
}

export function iniciaisDe(nome: string): string {
  const partes = nome.trim().split(/\s+/).filter(Boolean);
  if (partes.length === 0) return "?";
  const a = partes[0][0] ?? "";
  const b = partes.length > 1 ? partes[partes.length - 1][0] : "";
  return (a + b).toUpperCase();
}

export type PerfilVisto = { nome: string; iniciais: string; foto?: string };

/** Perfil atual (mock por cima do usuário do store), relido a cada gravação. */
export function usePerfilMock(usuario: Usuario): PerfilVisto {
  const ler = (): PerfilVisto => {
    const s = lerPerfil(usuario.id);
    const nome = s.nome?.trim() || usuario.nome;
    return { nome, iniciais: s.nome ? iniciaisDe(nome) : usuario.iniciais, foto: s.foto };
  };
  const [perfil, setPerfil] = useState<PerfilVisto>(ler);
  useEffect(() => {
    setPerfil(ler());
    const ao = () => setPerfil(ler());
    window.addEventListener(EVENTO_PERFIL, ao);
    window.addEventListener("storage", ao);
    return () => {
      window.removeEventListener(EVENTO_PERFIL, ao);
      window.removeEventListener("storage", ao);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usuario.id, usuario.nome]);
  return perfil;
}

// ─── Validação (pura) ──────────────────────────────────────────────────────

export type ErroFoto =
  | { tipo: "formato" }
  | { tipo: "heic" }
  | { tipo: "grande"; mb: string }
  | { tipo: "pequena" }
  | { tipo: "nao_abre" }
  | { tipo: "rede" };

export const MENSAGEM_ERRO_FOTO: Record<ErroFoto["tipo"], (e: ErroFoto) => string> = {
  formato: () => "Este arquivo não é uma foto que o hub aceita. Use JPG, PNG ou WebP.",
  heic: () => "Fotos HEIC do iPhone ainda não entram. Exporte como JPG e tente de novo.",
  grande: (e) => `A foto tem ${(e as { mb: string }).mb} MB e o limite é 10 MB. Escolha uma menor.`,
  pequena: () => `A foto é pequena demais (mínimo de ${LADO_MINIMO} × ${LADO_MINIMO} pixels) e ficaria borrada.`,
  nao_abre: () => "Não deu para abrir esta imagem. Tente outro arquivo.",
  rede: () => "A foto não foi enviada. Confira a conexão e tente de novo.",
};

export const mensagemErroFoto = (e: ErroFoto) => MENSAGEM_ERRO_FOTO[e.tipo](e);

/** Tipo e tamanho do arquivo escolhido. Dimensões são conferidas depois de abrir a imagem. */
export function validarArquivoFoto(f: { name: string; type: string; size: number }): ErroFoto | null {
  const nome = f.name.toLowerCase();
  if (f.type === "image/heic" || f.type === "image/heif" || nome.endsWith(".heic") || nome.endsWith(".heif")) {
    return { tipo: "heic" };
  }
  if (!(TIPOS_ACEITOS as readonly string[]).includes(f.type)) return { tipo: "formato" };
  if (f.size > LIMITE_BYTES) {
    return { tipo: "grande", mb: (f.size / (1024 * 1024)).toLocaleString("pt-BR", { maximumFractionDigits: 1 }) };
  }
  return null;
}

export function validarNome(valor: string): string | null {
  const v = valor.trim();
  if (!v) return "Escreva seu nome para salvar.";
  if (v.length < NOME_MIN) return "O nome precisa ter pelo menos 2 letras.";
  if (v.length > NOME_MAX) return "Use até 80 caracteres.";
  return null;
}
