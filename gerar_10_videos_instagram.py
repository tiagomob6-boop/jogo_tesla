"""
gerar_10_videos_instagram.py
Gera automaticamente 10 vídeos cinematográficos em formato MP4 Vertical (9:16 - 720x1280)
prontos para publicação imediata no Instagram Reels, Stories e TikTok.
Apresenta o Solaris Hypercar com fidelidade visual estrita (dourado, barbatana de carbono e 4 escapes de foguete).
"""

import os
import math
import av
import numpy as np
from PIL import Image, ImageDraw, ImageFont

OUTPUT_DIR = "instagram_videos"
os.makedirs(OUTPUT_DIR, exist_ok=True)

WIDTH = 720
HEIGHT = 1280
FPS = 30
DURATION_SEC = 5.0
TOTAL_FRAMES = int(FPS * DURATION_SEC)

# 10 Temas e Roteiros de Vídeo
VIDEO_SCRIPTS = [
    {
        "filename": "01_subway_surfers_rush.mp4",
        "hook_title": "🔥 DESVIE SE FOR CAPAZ!",
        "hook_sub": "Subway Surfers a 250 KM/H",
        "cta": "JOGUE GRÁTIS NO LINK DA BIO ➔",
        "mode": "rush",
        "bg_theme": "sunset"
    },
    {
        "filename": "02_salto_rampa_360.mp4",
        "hook_title": "🛹 SALTO 360° NA RAMPA!",
        "hook_sub": "Acrobacia insana sobre o tráfego",
        "cta": "BATA ESSE RECORDE AGORA ➔",
        "mode": "ramp_jump",
        "bg_theme": "sunset"
    },
    {
        "filename": "03_escudo_invencivel_smash.mp4",
        "hook_title": "🛡️ MODO ESCUDO INVENCÍVEL!",
        "hook_sub": "Atropelando todos os obstáculos",
        "cta": "DESBLOQUEIE SUPERCARROS ➔",
        "mode": "shield_smash",
        "bg_theme": "sunset"
    },
    {
        "filename": "04_quatro_escapes_fogo.mp4",
        "hook_title": "💨 4 ESCAPES DE FOGUETE!",
        "hook_sub": "Potência máxima com propulsores reais",
        "cta": "OUÇA O RONCO DO MOTOR ➔",
        "mode": "thrusters",
        "bg_theme": "sunset"
    },
    {
        "filename": "05_sunset_highway_dourada.mp4",
        "hook_title": "🌅 SUNSET BRIDGE RETRO 80s",
        "hook_sub": "O visual synthwave mais relaxante",
        "cta": "JOGUE DIRETO NO NAVEGADOR ➔",
        "mode": "cruise",
        "bg_theme": "golden"
    },
    {
        "filename": "06_noite_neon_cyberpunk.mp4",
        "hook_title": "⚡ NOITE CYBERPUNK NEON",
        "hook_sub": "Luzes neon acesas na metrópole",
        "cta": "CORRA NA PISTA NOTURNA ➔",
        "mode": "night_drift",
        "bg_theme": "night"
    },
    {
        "filename": "07_chuva_moedas_ouro.mp4",
        "hook_title": "🪙 CHUVA DE MOEDAS DOURADAS!",
        "hook_sub": "Ímã magnético coletando fortuna",
        "cta": "RESGATE 1.500 MOEDAS GRÁTIS ➔",
        "mode": "coin_storm",
        "bg_theme": "sunset"
    },
    {
        "filename": "08_camera_frontal_perseguicao.mp4",
        "hook_title": "👀 CÂMERA DE AÇÃO FRONTAL",
        "hook_sub": "Velocidade na pele sem margem de erro",
        "cta": "PROVE SEUS REFLEXOS NO JOGO ➔",
        "mode": "frontal_cam",
        "bg_theme": "sunset"
    },
    {
        "filename": "09_near_miss_ultrapassagem.mp4",
        "hook_title": "😱 POR UM MILÍMETRO!",
        "hook_sub": "Ultrapassagem no limite entre caminhões",
        "cta": "PILOTE COMO UM PROFISSIONAL ➔",
        "mode": "near_miss",
        "bg_theme": "sunset"
    },
    {
        "filename": "10_hyperdrive_nitro_climax.mp4",
        "hook_title": "🚀 HIPERDRIVE NITRO: 300 KM/H!",
        "hook_sub": "O jogo 3D do momento para celular e PC",
        "cta": "CLIQUE E JOGUE AGORA MESMO ➔",
        "mode": "hyperdrive",
        "bg_theme": "night"
    }
]

def draw_solaris_car(draw, cx, cy, scale=1.0, tilt=0.0, shield_active=False, flame_intensity=1.0):
    """
    Desenha o Solaris Hypercar com geometria estrita:
    Pintura dourada (#f0b030), cockpit em vidro fumê, barbatana dorsal de carbono
    e 4 escapes de foguete em titânio com labaredas de fogo vibrantes.
    """
    w = int(140 * scale)
    h = int(210 * scale)

    # 1. Chamas de propulsão dos 4 escapes traseiros
    flame_offsets = [-0.38, -0.14, 0.14, 0.38]
    flame_len = int((30 + 15 * flame_intensity) * scale)
    
    for fo in flame_offsets:
        fx = cx + int(fo * w)
        fy = cy + h // 2
        # Labareda externa laranja/vermelha
        flame_poly = [
            (fx - int(7 * scale), fy),
            (fx + int(7 * scale), fy),
            (fx, fy + flame_len)
        ]
        draw.polygon(flame_poly, fill=(255, 120, 20))
        # Núcleo quente amarelo/branco
        flame_core = [
            (fx - int(3 * scale), fy),
            (fx + int(3 * scale), fy),
            (fx, fy + int(flame_len * 0.65))
        ]
        draw.polygon(flame_core, fill=(255, 240, 100))

    # 2. Sombra e Underglow sob o veículo
    shadow_box = [
        cx - int(w * 0.58), cy - int(h * 0.45),
        cx + int(w * 0.58), cy + int(h * 0.58)
    ]
    draw.ellipse(shadow_box, fill=(10, 8, 14))

    # 3. Rodas com aros dourados e pneus esportivos
    wheel_w = int(24 * scale)
    wheel_h = int(52 * scale)
    wheel_coords = [
        (cx - w // 2 - wheel_w // 2, cy - int(h * 0.3)), # Dianteira Esq
        (cx + w // 2 - wheel_w // 2, cy - int(h * 0.3)), # Dianteira Dir
        (cx - w // 2 - wheel_w // 2, cy + int(h * 0.25)), # Traseira Esq
        (cx + w // 2 - wheel_w // 2, cy + int(h * 0.25))  # Traseira Dir
    ]
    for wx, wy in wheel_coords:
        draw.rounded_rectangle([wx, wy, wx + wheel_w, wy + wheel_h], radius=6, fill=(20, 22, 28))
        draw.rounded_rectangle([wx + 4, wy + 8, wx + wheel_w - 4, wy + wheel_h - 8], radius=4, fill=(240, 176, 48))

    # 4. Chassi do Solaris Hypercar (Pintura Dourada Aerodinâmica com Long-Tail)
    car_body = [
        (cx, cy - h // 2),                       # Nariz dianteiro afilado
        (cx + int(w * 0.42), cy - int(h * 0.38)), # Para-lama dianteiro dir
        (cx + int(w * 0.48), cy - int(h * 0.05)), # Lateral dir
        (cx + int(w * 0.52), cy + int(h * 0.35)), # Difusor traseiro dir
        (cx + int(w * 0.44), cy + h // 2),       # Canto traseiro dir
        (cx - int(w * 0.44), cy + h // 2),       # Canto traseiro esq
        (cx - int(w * 0.52), cy + int(h * 0.35)), # Difusor traseiro esq
        (cx - int(w * 0.48), cy - int(h * 0.05)), # Lateral esq
        (cx - int(w * 0.42), cy - int(h * 0.38)), # Para-lama dianteiro esq
    ]
    draw.polygon(car_body, fill=(240, 176, 48)) # Dourado Solaris #f0b030

    # Vincos e chanfros de reflexo metálico
    draw.polygon([
        (cx, cy - h // 2 + 10),
        (cx + int(w * 0.32), cy - int(h * 0.25)),
        (cx + int(w * 0.28), cy + int(h * 0.35)),
        (cx, cy + int(h * 0.42)),
        (cx - int(w * 0.28), cy + int(h * 0.35)),
        (cx - int(w * 0.32), cy - int(h * 0.25))
    ], fill=(255, 205, 85))

    # 5. Cockpit em Vidro Fumê Escuro Reflexivo
    canopy = [
        (cx, cy - int(h * 0.22)),
        (cx + int(w * 0.28), cy - int(h * 0.05)),
        (cx + int(w * 0.24), cy + int(h * 0.2)),
        (cx - int(w * 0.24), cy + int(h * 0.2)),
        (cx - int(w * 0.28), cy - int(h * 0.05))
    ]
    draw.polygon(canopy, fill=(16, 18, 26))

    # 6. Barbatana Dorsal de Fibra de Carbono (Shark Fin)
    fin_w = max(3, int(6 * scale))
    draw.rectangle([
        cx - fin_w // 2, cy - int(h * 0.15),
        cx + fin_w // 2, cy + int(h * 0.45)
    ], fill=(22, 23, 27))

    # 7. Lanterna Traseira Neon Âmbar Contínua
    tail_h = max(2, int(4 * scale))
    draw.rectangle([
        cx - int(w * 0.42), cy + h // 2 - int(8 * scale),
        cx + int(w * 0.42), cy + h // 2 - int(8 * scale) + tail_h
    ], fill=(255, 106, 0))

    # 8. Os 4 Bocais dos Escapes de Foguete em Titânio
    for fo in flame_offsets:
        fx = cx + int(fo * w)
        fy = cy + h // 2 - int(4 * scale)
        pr = int(6 * scale)
        draw.ellipse([fx - pr, fy - pr, fx + pr, fy + pr], fill=(30, 32, 38), outline=(60, 65, 75))

    # 9. Escudo Holográfico Protetor (Cyber Shield) se ativo
    if shield_active:
        shield_r_x = int(w * 0.75)
        shield_r_y = int(h * 0.65)
        draw.ellipse([
            cx - shield_r_x, cy - shield_r_y,
            cx + shield_r_x, cy + shield_r_y
        ], outline=(0, 247, 255), width=max(3, int(4 * scale)))
        draw.ellipse([
            cx - shield_r_x + 8, cy - shield_r_y + 8,
            cx + shield_r_x - 8, cy + shield_r_y - 8
        ], outline=(0, 180, 255), width=max(1, int(2 * scale)))

def render_frame(script, frame_idx):
    """Renderiza um quadro único de alta qualidade com resolução 720x1280."""
    t = frame_idx / FPS
    progress = frame_idx / TOTAL_FRAMES
    img = Image.new("RGB", (WIDTH, HEIGHT))
    draw = ImageDraw.Draw(img)

    # 1. Céu com Gradiente Synthwave
    horizon_y = int(HEIGHT * 0.44)
    bg_theme = script["bg_theme"]

    for y in range(horizon_y):
        ratio = y / horizon_y
        if bg_theme == "sunset":
            # Roxo espacial -> Rosa crepúsculo -> Laranja poente
            r = int(58 + (242 - 58) * ratio)
            g = int(42 + (160 - 42) * ratio)
            b = int(110 + (126 - 110) * ratio)
        elif bg_theme == "golden":
            r = int(90 + (255 - 90) * ratio)
            g = int(60 + (180 - 60) * ratio)
            b = int(80 + (60 - 80) * ratio)
        else: # night
            r = int(18 + (45 - 18) * ratio)
            g = int(10 + (20 - 10) * ratio)
            b = int(40 + (85 - 40) * ratio)
        draw.line([(0, y), (WIDTH, y)], fill=(r, g, b))

    # Sol Synthwave Gigante
    sun_x = int(WIDTH * 0.38)
    sun_y = horizon_y - 80
    sun_r = 95
    if bg_theme != "night":
        draw.ellipse([sun_x - sun_r, sun_y - sun_r, sun_x + sun_r, sun_y + sun_r], fill=(255, 222, 89))
        # Linhas horizontais de corte do sol retro
        for sy in range(sun_y - sun_r + 40, sun_y + sun_r, 16):
            draw.line([(sun_x - sun_r, sy), (sun_x + sun_r, sy)], fill=(242, 160, 126), width=3)

    # Silhueta de Arranha-Céus ao Fundo
    for i in range(16):
        bx = int(WIDTH * 0.48) + i * 28
        bw = 24
        bh = 60 + int(math.sin(i * 1.5) * 45) + 30
        draw.rectangle([bx, horizon_y - bh, bx + bw, horizon_y], fill=(24, 23, 36))
        # Janelas acesas
        if i % 2 == 0:
            draw.rectangle([bx + 4, horizon_y - bh + 15, bx + bw - 4, horizon_y - bh + 25], fill=(255, 170, 80))

    # 2. Rodovia Infinita em Perspectiva (Asfalto e 3 Faixas Subway Surfers)
    vanish_x = WIDTH // 2
    vanish_y = horizon_y

    # Base da pista
    road_poly = [
        (vanish_x - 70, vanish_y),
        (vanish_x + 70, vanish_y),
        (WIDTH - 10, HEIGHT),
        (10, HEIGHT)
    ]
    draw.polygon(road_poly, fill=(34, 36, 42))

    # Guias laterais com neon ciano
    draw.line([(vanish_x - 70, vanish_y), (10, HEIGHT)], fill=(0, 247, 255), width=6)
    draw.line([(vanish_x + 70, vanish_y), (WIDTH - 10, HEIGHT)], fill=(0, 247, 255), width=6)

    # Linhas divisórias das 3 faixas com movimento contínuo
    speed_offset = (frame_idx * 28) % 120
    for side in [-1, 1]:
        lane_top_x = vanish_x + side * 24
        lane_bot_x = vanish_x + side * 135
        for d in range(0, HEIGHT - horizon_y, 80):
            dy = horizon_y + d + speed_offset
            if dy < HEIGHT:
                prog_y = (dy - horizon_y) / (HEIGHT - horizon_y)
                cur_x = int(lane_top_x + (lane_bot_x - lane_top_x) * prog_y)
                seg_len = int(20 + 40 * prog_y)
                draw.line([(cur_x, dy), (cur_x, min(HEIGHT, dy + seg_len))], fill=(255, 230, 0), width=max(2, int(4 * prog_y)))

    # 3. Dinâmica e Coreografia do Carro
    mode = script["mode"]
    car_x = WIDTH // 2
    car_y = int(HEIGHT * 0.74)
    car_scale = 1.35
    shield_active = False
    flame_intensity = 1.0 + math.sin(frame_idx * 0.8) * 0.35

    # Coreografia conforme o Roteiro
    if mode == "rush":
        # Desvios rápidos em 3 faixas Subway Surfers
        car_x = WIDTH // 2 + int(math.sin(t * 3.8) * 165)
    elif mode == "ramp_jump":
        # Rampa se aproximando e pulo acrobático
        jump_phase = (t % 3.0) / 3.0
        if 0.3 < jump_phase < 0.8:
            jump_h = math.sin((jump_phase - 0.3) / 0.5 * math.pi) * 160
            car_y -= int(jump_h)
            car_scale += 0.2
        # Desenha a rampa amarela na pista
        ramp_y = int(horizon_y + ((frame_idx * 22) % (HEIGHT - horizon_y)))
        if ramp_y > horizon_y + 100:
            draw.polygon([
                (WIDTH // 2 - 45, ramp_y), (WIDTH // 2 + 45, ramp_y),
                (WIDTH // 2 + 65, ramp_y + 55), (WIDTH // 2 - 65, ramp_y + 55)
            ], fill=(255, 220, 0), outline=(0, 247, 255))
    elif mode == "shield_smash":
        shield_active = True
        # Carro do tráfego sendo arremessado
        smash_progress = (frame_idx % 45) / 45
        obs_x = WIDTH // 2 + int(smash_progress * 240)
        obs_y = int(HEIGHT * 0.65 - smash_progress * 180)
        draw.rectangle([obs_x - 35, obs_y - 20, obs_x + 35, obs_y + 20], fill=(214, 48, 49))
        draw.text((obs_x - 20, obs_y - 40), "💥 SMASH!", fill=(255, 230, 0))
    elif mode == "thrusters":
        car_y = int(HEIGHT * 0.82)
        car_scale = 1.75
        flame_intensity = 1.8 + math.sin(frame_idx * 1.2) * 0.6
    elif mode == "cruise":
        car_x = WIDTH // 2 + int(math.sin(t * 1.5) * 40)
    elif mode == "night_drift":
        car_x = WIDTH // 2 + int(math.sin(t * 3.2) * 120)
    elif mode == "coin_storm":
        # Moedas douradas caindo em direção ao carro
        for c_idx in range(6):
            cy_coin = int(horizon_y + ((frame_idx * 26 + c_idx * 90) % (HEIGHT - horizon_y)))
            cx_coin = WIDTH // 2 + int(math.sin(cy_coin * 0.05 + c_idx) * 60)
            draw.ellipse([cx_coin - 14, cy_coin - 14, cx_coin + 14, cy_coin + 14], fill=(255, 215, 0), outline=(255, 255, 255))
            draw.text((cx_coin - 6, cy_coin - 9), "🪙", fill=(0, 0, 0))
    elif mode == "frontal_cam":
        car_y = int(HEIGHT * 0.68)
        car_scale = 1.45
    elif mode == "near_miss":
        car_x = WIDTH // 2 + int(math.sin(t * 4.5) * 50)
        # Caminhão ao lado
        draw.rectangle([WIDTH // 2 + 80, int(HEIGHT * 0.68), WIDTH // 2 + 170, int(HEIGHT * 0.86)], fill=(108, 92, 231))
        draw.text((WIDTH // 2 + 10, int(HEIGHT * 0.62)), "⚡ NEAR MISS!", fill=(255, 230, 0))
    elif mode == "hyperdrive":
        car_scale = 1.25 + math.sin(frame_idx * 0.5) * 0.05
        flame_intensity = 2.4
        # Linhas de velocidade (speed lines)
        for sl in range(12):
            s_lx = int(WIDTH * (sl / 12))
            draw.line([(s_lx, horizon_y + 40), (s_lx + (sl - 6) * 15, HEIGHT)], fill=(0, 247, 255), width=2)

    # Desenha o Solaris Hypercar fiel
    draw_solaris_car(draw, car_x, car_y, scale=car_scale, shield_active=shield_active, flame_intensity=flame_intensity)

    # 4. Interface Instagram Stories / Reels Overlay
    # Barra de Progresso Superior
    draw.rectangle([20, 24, WIDTH - 20, 28], fill=(255, 255, 255, 80))
    draw.rectangle([20, 24, int(20 + (WIDTH - 40) * progress), 28], fill=(255, 255, 255))

    # Header Perfil Instagram
    draw.ellipse([24, 44, 68, 88], fill=(225, 48, 108))
    draw.ellipse([27, 47, 65, 85], fill=(20, 22, 28))
    draw.text((36, 54), "🏎️", fill=(255, 255, 255))
    draw.text((78, 48), "roadsterdash3d", fill=(255, 255, 255))
    draw.text((78, 68), "Patrocinado • Jogo 3D Online", fill=(200, 205, 215))

    # Gancho / Hook Principal do Anúncio
    hook_box = [WIDTH // 2 - 220, 130, WIDTH // 2 + 220, 205]
    draw.rounded_rectangle(hook_box, radius=24, fill=(15, 17, 26), outline=(255, 215, 0), width=3)
    draw.text((WIDTH // 2 - 180, 142), script["hook_title"], fill=(255, 215, 0))
    draw.text((WIDTH // 2 - 160, 174), script["hook_sub"], fill=(255, 255, 255))

    # Telemetria HUD (Velocidade e Pontuação)
    speed_kmh = int(180 + math.sin(t * 4) * 45)
    draw.text((30, 230), f"{speed_kmh} KM/H", fill=(255, 230, 0))
    draw.text((30, 258), f"NÍVEL {min(5, int(t) + 1)} • RECORD", fill=(0, 247, 255))

    # Botão de Ação / Conversão Inferior (CTA Instagram)
    cta_box = [30, HEIGHT - 110, WIDTH - 30, HEIGHT - 45]
    draw.rounded_rectangle(cta_box, radius=32, fill=(255, 65, 54))
    draw.text((WIDTH // 2 - 185, HEIGHT - 92), script["cta"], fill=(255, 255, 255))
    draw.text((WIDTH // 2 - 130, HEIGHT - 32), "Sem download • Direto no navegador", fill=(200, 205, 215))

    return np.array(img)

def generate_video(script):
    """Gera um arquivo MP4 codificado em H.264 pronto para upload no Instagram."""
    out_path = os.path.join(OUTPUT_DIR, script["filename"])
    print(f"🎬 Gerando vídeo: {script['filename']} ({script['hook_title']})...")

    container = av.open(out_path, mode="w")
    stream = container.add_stream("h264", rate=FPS)
    stream.width = WIDTH
    stream.height = HEIGHT
    stream.pix_fmt = "yuv420p"
    stream.options = {"preset": "fast", "crf": "22"}

    for f_idx in range(TOTAL_FRAMES):
        frame_rgb = render_frame(script, f_idx)
        av_frame = av.VideoFrame.from_ndarray(frame_rgb, format="rgb24")
        for packet in stream.encode(av_frame):
            container.mux(packet)

    for packet in stream.encode():
        container.mux(packet)

    container.close()
    file_size_mb = os.path.getsize(out_path) / (1024 * 1024)
    print(f"✅ Concluído: {out_path} ({file_size_mb:.2f} MB)")

def main():
    print("=" * 70)
    print("🚀 INICIANDO GERAÇÃO EM LOTE DE 10 VÍDEOS PARA INSTAGRAM REELS")
    print(f"📁 Pasta de destino: {os.path.abspath(OUTPUT_DIR)}")
    print(f"📐 Resolução: {WIDTH}x{HEIGHT} (Vertical 9:16) a {FPS} FPS")
    print("=" * 70)

    for i, script in enumerate(VIDEO_SCRIPTS, 1):
        print(f"[{i}/10] Processando...")
        generate_video(script)

    print("=" * 70)
    print("🎉 SUCESSO ABSOLUTO! TODOS OS 10 VÍDEOS ESTÃO PRONTOS PARA POSTAR NO INSTAGRAM!")
    print(f"👉 Acesse a pasta '{OUTPUT_DIR}' para visualizar e publicar os arquivos .mp4!")
    print("=" * 70)

if __name__ == "__main__":
    main()
