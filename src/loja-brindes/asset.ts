// PROTÓTIPO DESCARTÁVEL — não é o app. Fonte da verdade = Lovable.
// Gerado de: conceito novo (DigiPlace v4, marketplace de brindes) @ leitura 2026-10-29.
// Regenerar (não remendar) se o conceito mudar. Dados MOCK, sem backend, sem segredos.
// Decisão de design correspondente: .agents/tasks/digiplace-v4/ (protótipo para validar a ideia).
//
// Resolve um caminho de asset de public/ (ex.: "/brindes/caneta.png") contra o base do Vite.
// No dev local o base é "/", no GitHub Pages é "/digisystem-prototipos/". Sem isso, um caminho
// absoluto como "/brindes/caneta.png" ignora o subcaminho do Pages e dá 404.
// BASE_URL sempre termina com "/", então removemos a barra inicial do caminho antes de concatenar.

/** Prefixa um caminho de public/ com import.meta.env.BASE_URL. Entradas vazias ficam vazias. */
export function asset(caminho?: string): string | undefined {
  if (!caminho) return caminho;
  return import.meta.env.BASE_URL + caminho.replace(/^\//, "");
}
