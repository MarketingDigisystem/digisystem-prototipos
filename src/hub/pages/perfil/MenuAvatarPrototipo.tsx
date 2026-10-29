/*
 * PROTÓTIPO DESCARTÁVEL — não é o app.
 * Gerado de: src/hub/components/shell/MenuAvatar.tsx (ConteudoMenuAvatar), src/hooks/use-sair-hub.ts
 *   @ origin/main c16c790 / leitura 2026-10-27.
 * Fonte da verdade = Lovable. Regenerar (não remendar) se o real mudar.
 * Decisão de design correspondente: docs-marketing-hub/implementacao/pacote-perfil-e-foto-2026-10-27.md.
 *
 * Imitação do menu do avatar do cabeçalho real, com o item novo "Meu perfil"
 * (5 itens: cabeça com foto/inicial + nome + papel, posts em andamento, Meu
 * perfil, Sair). O protótipo não tem o cabeçalho novo (só o Dock antigo), então
 * o avatar fica fixo no canto de cima, logo abaixo do botão do painel de demo.
 * Fora do Perfil ele só aparece a partir de 640px, para não cobrir as outras
 * telas do protótipo no celular.
 */
import { useEffect, useRef, useState } from "react";
import { ChevronRight, LogOut, UserRound } from "lucide-react";
import { cn } from "../../../lib/utils";
import { hrefDe } from "../../router";
import { useHub } from "../../store/HubStore";
import { ROTULO_PAPEL } from "../../store/regras";
import { usePerfilMock } from "./armazenamento";
import { AvatarFoto } from "./AvatarFoto";
import "./perfil.css";

export function MenuAvatarPrototipo({ emPerfil }: { emPerfil: boolean }) {
  const { usuario, papel, dados, acoes } = useHub();
  const perfil = usePerfilMock(usuario);
  const [aberto, setAberto] = useState(false);
  const raiz = useRef<HTMLDivElement>(null);
  const gatilho = useRef<HTMLButtonElement>(null);
  const primeiroItem = useRef<HTMLAnchorElement>(null);

  const emAndamento = dados.posts.filter((p) => p.autorId === usuario.id && p.estado !== "publicado").length;

  useEffect(() => {
    if (!aberto) return;
    primeiroItem.current?.focus({ preventScroll: true });
    const fora = (e: MouseEvent) => {
      if (!raiz.current?.contains(e.target as Node)) setAberto(false);
    };
    const esc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setAberto(false);
        gatilho.current?.focus();
      }
    };
    document.addEventListener("mousedown", fora);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", fora);
      document.removeEventListener("keydown", esc);
    };
  }, [aberto]);

  // Navegar fecha o menu.
  useEffect(() => {
    const fecha = () => setAberto(false);
    window.addEventListener("hashchange", fecha);
    return () => window.removeEventListener("hashchange", fecha);
  }, []);

  const item =
    "flex h-11 w-full items-center gap-3 rounded-2xl px-3 text-left text-sm text-foreground transition-colors hover:bg-navy-soft hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring motion-reduce:transition-none";

  return (
    <div ref={raiz} className={cn("fixed right-3 top-11 z-[65]", !emPerfil && "max-sm:hidden")}>
      <button
        ref={gatilho}
        type="button"
        aria-haspopup="menu"
        aria-expanded={aberto}
        aria-label={`Conta de ${perfil.nome}`}
        data-testid="avatar-cabecalho"
        onClick={() => setAberto((v) => !v)}
        className="block rounded-full shadow-card outline-offset-2 focus-visible:outline-2 focus-visible:outline-ring"
      >
        <AvatarFoto foto={perfil.foto} iniciais={perfil.iniciais} nome={perfil.nome} className="size-10 text-sm" />
      </button>

      {aberto && (
        <div
          role="menu"
          aria-label="Sua conta"
          className="pf-dialogo absolute right-0 top-12 w-[min(17.5rem,calc(100vw-1.5rem))] rounded-3xl bg-popover p-2 text-popover-foreground shadow-float ring-1 ring-border"
        >
          <div className="flex items-center gap-3 px-3 pb-3 pt-2">
            <AvatarFoto foto={perfil.foto} iniciais={perfil.iniciais} nome={perfil.nome} className="size-10 text-sm" />
            <div className="min-w-0">
              <p className="truncate font-display text-sm font-bold text-foreground">{perfil.nome}</p>
              <p className="text-xs text-muted-foreground">Papel: {ROTULO_PAPEL[papel]}</p>
            </div>
          </div>
          <a ref={primeiroItem} role="menuitem" href={hrefDe("posts", "meus")} className={item}>
            <span className="font-display text-base font-bold tabular-nums">{emAndamento}</span>
            {emAndamento === 1 ? "post em andamento" : "posts em andamento"}
          </a>
          <a
            role="menuitem"
            href="#/perfil"
            aria-current={emPerfil ? "page" : undefined}
            className={cn(item, emPerfil && "bg-navy-soft text-primary")}
          >
            <UserRound className="size-4" aria-hidden />
            <span className="flex-1">Meu perfil</span>
            <ChevronRight className="size-3.5 text-muted-foreground" aria-hidden />
          </a>
          <div className="mt-1 border-t border-border pt-1">
            <button
              role="menuitem"
              type="button"
              onClick={() => {
                setAberto(false);
                acoes.avisar("No protótipo, Sair não encerra sessão: não existe login aqui.");
              }}
              className={cn(item, "hover:bg-destructive/10 hover:text-destructive")}
            >
              <LogOut className="size-4" aria-hidden />
              Sair
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
