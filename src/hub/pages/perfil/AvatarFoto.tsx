/*
 * PROTÓTIPO DESCARTÁVEL — não é o app.
 * Gerado de: src/hub/components/CardChrome.tsx (Avatar), src/hub/components/shell/MenuAvatar.tsx
 *   @ origin/main c16c790 / leitura 2026-10-27.
 * Fonte da verdade = Lovable. Regenerar (não remendar) se o real mudar.
 * Decisão de design correspondente: docs-marketing-hub/implementacao/pacote-perfil-e-foto-2026-10-27.md.
 *
 * Avatar pequeno com foto e volta para as iniciais (sem foto ou se a imagem falhar).
 * No real: o Avatar de CardChrome.tsx ganha `usuario.avatarUrl` com esta mesma regra.
 */
import { useEffect, useState } from "react";
import { cn } from "../../../lib/utils";

export function AvatarFoto({
  foto,
  iniciais,
  nome,
  className,
}: {
  foto?: string;
  iniciais: string;
  nome: string;
  /** Tamanho e tipografia (ex.: "size-10 text-sm"). */
  className?: string;
}) {
  const [falhou, setFalhou] = useState(false);
  useEffect(() => setFalhou(false), [foto]);
  const comFoto = !!foto && !falhou;

  return (
    <span
      role="img"
      aria-label={nome}
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full font-display font-bold",
        comFoto ? "ring-1 ring-border" : "pf-iniciais-cor bg-sky",
        className,
      )}
    >
      {comFoto ? (
        <img
          src={foto}
          alt=""
          draggable={false}
          decoding="async"
          className="size-full object-cover"
          onError={() => {
            console.warn("[perfil] foto não carregou, voltando para a inicial");
            setFalhou(true);
          }}
        />
      ) : (
        <span aria-hidden>{iniciais}</span>
      )}
    </span>
  );
}
