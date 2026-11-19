"""Otimiza as fotos oficiais do Marketplace para public/brindes/ (800x800, JPG, ate ~150 KB).

Uso (na pasta prototipos/react):  python scripts/otimizar-fotos.py
Fonte: Arquivos_temporarios_for_AI/Marketplace/*.jpg (2000x2000, fundo branco).
Fora de src/ e public/, portanto nao e publicado pelo Pages.
"""
from pathlib import Path
from PIL import Image

RAIZ = Path(__file__).resolve().parents[1]
FONTE = RAIZ.parents[1] / "Arquivos_temporarios_for_AI" / "Marketplace"
DESTINO = RAIZ / "public" / "brindes"
LIMITE = 150 * 1024

MAPA = {
    "01_kit_churrasco_aberto": "kit-churrasco-aberto",
    "02_estojo_churrasco_fechado": "estojo-churrasco-fechado",
    "03_caderno_bambu_laranja": "caderno-bambu-laranja",
    "04_caneta_azul_touch": "caneta-azul-touch",
    "05_caderno_espiral_azul_35anos": "caderno-espiral-35-anos",
    "06_caderneta_azul_digisystem": "caderneta-azul-digisystem",
    "07_caderneta_azul_35anos": "caderneta-azul-35-anos",
    "08_copo_termico": "copo-termico",
}

DESTINO.mkdir(parents=True, exist_ok=True)
falhas = []
print(f"{'arquivo':34} {'dim':9} {'KB':>7} q")
for origem, nome in MAPA.items():
    img = Image.open(FONTE / f"{origem}.jpg").convert("RGB")
    img.thumbnail((800, 800), Image.LANCZOS)
    tela = Image.new("RGB", (800, 800), (255, 255, 255))
    tela.paste(img, ((800 - img.width) // 2, (800 - img.height) // 2))
    saida = DESTINO / f"{nome}.jpg"
    for q in (85, 80, 75, 70):
        tela.save(saida, "JPEG", quality=q, optimize=True, progressive=True)
        if saida.stat().st_size <= LIMITE:
            break
    else:
        falhas.append(nome)
    print(f"{nome + '.jpg':34} {tela.width}x{tela.height} {saida.stat().st_size / 1024:7.1f} {q}")
if falhas:
    raise SystemExit(f"Acima de 150 KB mesmo com q70: {falhas}")
