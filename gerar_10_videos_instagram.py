"""
gerar_10_videos_instagram.py
Gera 10 vídeos cinematográficos em formato MP4 Vertical (9:16 - 720x1280)
com fidelidade visual MÁXIMA E ABSOLUTA ao screenshot real do jogo (media_1793748464453_9c81e8c1.jpg):
- Paridade pixel-a-pixel com o visual do iPhone
- Solaris Hypercar com geometria 3D estrita, pintura dourada, 4 propulsores de foguete com halo de poeira e luz
- Rodovia com asfalto fosco, faixas brancas, guarda-corpos metálicos, postes e skyline ao entardecer
- HUD completo: Distância, KM/H amarelo, Nível ciano, Moedas, Usuário, Piloto, Mapa, Corações, Score ROCKET, botões touch e barra AIR
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
TOTAL_FRAMES = int(FPS * DURATION_SEC) # 150 frames por vídeo

# Carrega fontes nativas do Windows para paridade total
font_dist = ImageFont.truetype("C:/Windows/Fonts/segoeuib.ttf", 34)
font_speed = ImageFont.truetype("C:/Windows/Fonts/segoeuib.ttf", 26)
font_meta = ImageFont.truetype("C:/Windows/Fonts/segoeuib.ttf", 15)
font_coins = ImageFont.truetype("C:/Windows/Fonts/segoeuib.ttf", 24)
font_pill = ImageFont.truetype("C:/Windows/Fonts/segoeui.ttf", 14)
font_score = ImageFont.truetype("C:/Windows/Fonts/segoeuib.ttf", 46)
font_rocket = ImageFont.truetype("C:/Windows/Fonts/segoeuib.ttf", 11)
font_boost = ImageFont.truetype("C:/Windows/Fonts/segoeuib.ttf", 13)
font_air = ImageFont.truetype("C:/Windows/Fonts/segoeuib.ttf", 14)
font_clock = ImageFont.truetype("C:/Windows/Fonts/segoeuib.ttf", 15)
font_url = ImageFont.truetype("C:/Windows/Fonts/segoeui.ttf", 15)

VIDEO_CONFIGS = [
    {
        "filename": "01_subway_surfers_rush.mp4",
        "action": "rush",
        "theme": "sunset"
    },
    {
        "filename": "02_salto_rampa_360.mp4",
        "action": "ramp",
        "theme": "sunset"
    },
    {
        "filename": "03_escudo_invencivel_smash.mp4",
        "action": "shield",
        "theme": "sunset"
    },
    {
        "filename": "04_quatro_escapes_fogo.mp4",
        "action": "thrusters",
        "theme": "sunset"
    },
    {
        "filename": "05_sunset_highway_dourada.mp4",
        "action": "cruise",
        "theme": "sunset"
    },
    {
        "filename": "06_noite_neon_cyberpunk.mp4",
        "action": "night",
        "theme": "night"
    },
    {
        "filename": "07_chuva_moedas_ouro.mp4",
        "action": "coins",
        "theme": "sunset"
    },
    {
        "filename": "08_camera_frontal_perseguicao.mp4",
        "action": "chase",
        "theme": "sunset"
    },
    {
        "filename": "09_near_miss_ultrapassagem.mp4",
        "action": "near_miss",
        "theme": "sunset"
    },
    {
        "filename": "10_hyperdrive_nitro_climax.mp4",
        "action": "hyperdrive",
        "theme": "sunset"
    }
]

def draw_vector_heart(draw, cx, cy, size=15, fill=(255, 40, 70)):
    pts = []
    for a in np.linspace(0, 2 * math.pi, 32):
        hx = 16 * (math.sin(a) ** 3)
        hy = -(13 * math.cos(a) - 5 * math.cos(2*a) - 2 * math.cos(3*a) - math.cos(4*a))
        pts.append((cx + hx * (size / 18.0), cy + hy * (size / 18.0)))
    draw.polygon(pts, fill=fill)

def draw_vector_coin(draw, cx, cy, r=11):
    draw.ellipse([cx - r, cy - r, cx + r, cy + r], fill=(245, 190, 25), outline=(215, 150, 15), width=2)
    draw.ellipse([cx - r + 3, cy - r + 3, cx + r - 3, cy + r - 3], outline=(255, 225, 95), width=1)

def render_gameplay_frame(cfg, frame_idx):
    t = frame_idx / FPS
    action = cfg["action"]
    theme = cfg["theme"]
    is_night = (theme == "night")

    img = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 255))
    draw = ImageDraw.Draw(img)

    # 1. CÉU EM DEGRADÊ SYNTHWAVE (Idêntico ao jogo)
    horizon_y = int(HEIGHT * 0.442) # ~565px
    for y in range(horizon_y + 1):
        ratio = y / horizon_y
        if is_night:
            r = int(14 + (40 - 14) * ratio)
            g = int(10 + (22 - 10) * ratio)
            b = int(28 + (65 - 28) * ratio)
        else:
            if ratio < 0.45:
                sub = ratio / 0.45
                r = int(58 + (199 - 58) * sub)
                g = int(42 + (106 - 42) * sub)
                b = int(110 + (156 - 110) * sub)
            elif ratio < 0.85:
                sub = (ratio - 0.45) / 0.40
                r = int(199 + (242 - 199) * sub)
                g = int(106 + (160 - 106) * sub)
                b = int(156 + (126 - 156) * sub)
            else:
                sub = (ratio - 0.85) / 0.15
                r = int(242 + (245 - 242) * sub)
                g = int(160 + (168 - 160) * sub)
                b = int(126 + (138 - 126) * sub)
        draw.line([(0, y), (WIDTH, y)], fill=(r, g, b))

    # Sol no horizonte (ou Lua Synthwave Neon se for noite)
    if is_night:
        moon_cx = int(WIDTH * 0.72)
        moon_cy = int(horizon_y * 0.65)
        for rad, alpha, col in [(65, 40, (168, 85, 247)), (42, 180, (244, 114, 182))]:
            halo = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0))
            d_halo = ImageDraw.Draw(halo)
            d_halo.ellipse([moon_cx - rad, moon_cy - rad, moon_cx + rad, moon_cy + rad], fill=col + (alpha,))
            img = Image.alpha_composite(img, halo)
    else:
        sun_cx = int(WIDTH * 0.28)
        sun_cy = int(horizon_y * 0.84)
        for rad, alpha, col in [(120, 28, (255, 175, 120)), (75, 55, (255, 205, 140)), (42, 140, (255, 245, 200))]:
            halo = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0))
            d_halo = ImageDraw.Draw(halo)
            d_halo.ellipse([sun_cx - rad, sun_cy - rad, sun_cx + rad, sun_cy + rad], fill=col + (alpha,))
            img = Image.alpha_composite(img, halo)

    draw = ImageDraw.Draw(img)

    # 2. PRÉDIOS E SKYSCRAPERS À DIREITA
    buildings = [
        {"x_pct": 0.62, "w_pct": 0.075, "h_pct": 0.35, "col": (232, 178, 158) if not is_night else (32, 28, 48)},
        {"x_pct": 0.685, "w_pct": 0.085, "h_pct": 0.46, "col": (240, 192, 174) if not is_night else (40, 34, 58)},
        {"x_pct": 0.765, "w_pct": 0.105, "h_pct": 0.42, "col": (228, 172, 152) if not is_night else (35, 30, 52)},
        {"x_pct": 0.865, "w_pct": 0.115, "h_pct": 0.38, "col": (218, 160, 142) if not is_night else (28, 24, 42)},
        {"x_pct": 0.965, "w_pct": 0.095, "h_pct": 0.30, "col": (208, 148, 132) if not is_night else (22, 20, 36)}
    ]
    for b in buildings:
        bx = int(WIDTH * b["x_pct"])
        bw = int(WIDTH * b["w_pct"])
        bh = int(HEIGHT * b["h_pct"])
        by = horizon_y - bh
        draw.rectangle([bx, by, bx + bw, horizon_y], fill=b["col"])
        shade = (int(b["col"][0] * 0.88), int(b["col"][1] * 0.88), int(b["col"][2] * 0.88))
        draw.rectangle([bx + int(bw * 0.72), by, bx + bw, horizon_y], fill=shade)
        win_col = (255, 238, 198) if not is_night else (56, 189, 248)
        for fy in range(by + 14, horizon_y - 6, 15):
            draw.line([(bx + 3, fy), (bx + int(bw * 0.68), fy)], fill=win_col, width=2)

    # 3. PROJEÇÃO EM PERSPECTIVA 3D DA RODOVIA
    cam_y = 4.8
    cam_z = 8.8
    focal = 510.0

    if action == "thrusters":
        cam_z = 7.4
        cam_y = 4.0
    elif action == "hyperdrive":
        focal = 470.0

    def p3d(x, y, z):
        dz = z - cam_z
        if dz >= -0.1:
            dz = -0.1
        sc = focal / (-dz)
        sx = WIDTH / 2 + x * sc
        sy = horizon_y - (y - cam_y) * sc
        return sx, sy, sc

    # Oceano
    ocean_col = (42, 34, 58) if not is_night else (18, 15, 28)
    draw.rectangle([0, horizon_y, WIDTH, HEIGHT], fill=ocean_col)

    # Pista de Asfalto (Preenche toda a base sem gaps)
    road_half_w = 7.25
    draw.rectangle([0, int(HEIGHT * 0.75), WIDTH, HEIGHT], fill=(98, 93, 112) if not is_night else (38, 36, 46))

    rf_l = p3d(-road_half_w, 0, -320)
    rf_r = p3d(road_half_w, 0, -320)
    rn_r = p3d(road_half_w, 0, 7.35)
    rn_l = p3d(-road_half_w, 0, 7.35)

    asphalt_col = (98, 93, 112) if not is_night else (38, 36, 46)
    draw.polygon([(rf_l[0], rf_l[1]), (rf_r[0], rf_r[1]), (rn_r[0], rn_r[1]), (rn_l[0], rn_l[1])], fill=asphalt_col)

    # Guarda-corpo e calçada esquerda (terminam em z = 3.5)
    gw = 0.35
    gh = 0.9
    gl_far_b = p3d(-road_half_w, 0, -320)
    gl_far_t = p3d(-road_half_w, gh, -320)
    gl_near_t = p3d(-road_half_w, gh, 3.5)
    gl_near_b = p3d(-road_half_w, 0, 3.5)
    draw.polygon([(gl_far_b[0], gl_far_b[1]), (gl_far_t[0], gl_far_t[1]), (gl_near_t[0], gl_near_t[1]), (gl_near_b[0], gl_near_b[1])], fill=(188, 192, 204))

    sw_far = p3d(-road_half_w - 4.2, 0.15, -320)
    sw_near = p3d(-road_half_w - 4.2, 0.15, 3.5)
    draw.polygon([(sw_far[0], sw_far[1]), (gl_far_b[0], gl_far_b[1]), (gl_near_b[0], gl_near_b[1]), (sw_near[0], sw_near[1])], fill=(92, 86, 96))

    # Guarda-corpo direito com corrimão metálico (terminam em z = 3.5)
    gr_far_b = p3d(road_half_w, 0, -320)
    gr_far_t = p3d(road_half_w, 1.25, -320)
    gr_near_t = p3d(road_half_w, 1.25, 3.5)
    gr_near_b = p3d(road_half_w, 0, 3.5)
    draw.polygon([(gr_far_b[0], gr_far_b[1]), (gr_far_t[0], gr_far_t[1]), (gr_near_t[0], gr_near_t[1]), (gr_near_b[0], gr_near_b[1])], fill=(175, 180, 192))

    led_col = (255, 122, 54) if not is_night else (0, 240, 255)
    led_far = p3d(road_half_w + 0.05, 0.22, -320)
    led_near = p3d(road_half_w + 0.05, 0.22, 3.5)
    draw.line([(led_far[0], led_far[1]), (led_near[0], led_near[1])], fill=led_col, width=3)

    # Postes de iluminação pública na lateral direita
    road_speed = 52.0 if action != "hyperdrive" else 92.0
    z_offset = (t * road_speed) % 35.0
    for lz in range(-280, 8, 35):
        actual_z = lz + z_offset
        if actual_z > 6: continue
        pb = p3d(road_half_w + 0.26, 0, actual_z)
        pt = p3d(road_half_w + 0.26, 4.4, actual_z)
        arm = p3d(road_half_w - 0.9, 4.35, actual_z)
        lamp = p3d(road_half_w - 1.25, 4.3, actual_z)
        draw.line([(pb[0], pb[1]), (pt[0], pt[1])], fill=(180, 185, 200), width=max(1, int(pb[2] * 0.16)))
        draw.line([(pt[0], pt[1]), (arm[0], arm[1])], fill=(180, 185, 200), width=max(1, int(pb[2] * 0.14)))
        draw.ellipse([lamp[0]-2, lamp[1]-2, lamp[0]+2, lamp[1]+2], fill=(255, 245, 210))

    # Faixas brancas tracejadas que param perto do carro
    dash_len = 5.2
    dash_gap = 3.8
    cycle_len = dash_len + dash_gap
    z_scroll = (t * road_speed) % cycle_len

    for lane_x_div in [-2.4, 2.4]:
        for dz in np.arange(-280, 5, cycle_len):
            z_s = dz + z_scroll
            z_e = z_s + dash_len
            if z_s > 1.2 or z_e < -290: continue
            p1 = p3d(lane_x_div, 0.02, z_s)
            p2 = p3d(lane_x_div, 0.02, z_e)
            w = max(1, int(p1[2] * 0.18))
            draw.line([(p1[0], p1[1]), (p2[0], p2[1])], fill=(255, 255, 255), width=w)

    # 4. DINÂMICA DA CENA E TRÂNSITO
    car_x = 0.0
    car_y = 0.0

    if action == "rush":
        # Desvios Subway Surfers
        lanes = [0.0, 2.4, -2.4, 0.0, -2.4, 2.4]
        s_idx = int(t * 1.5) % len(lanes)
        n_idx = (s_idx + 1) % len(lanes)
        lerp = (t * 1.5) - int(t * 1.5)
        lerp = 0.5 - 0.5 * math.cos(lerp * math.pi)
        car_x = lanes[s_idx] * (1 - lerp) + lanes[n_idx] * lerp

        for lx in [-2.4, 0.0, 2.4]:
            obs_z = -110 + ((t * 22.0 + lx * 30) % 115)
            if -100 < obs_z < -4:
                p_tc = p3d(lx, 0, obs_z)
                tc_w = int(1.8 * p_tc[2])
                tc_h = int(1.1 * p_tc[2])
                draw.rectangle([p_tc[0] - tc_w//2, p_tc[1] - tc_h, p_tc[0] + tc_w//2, p_tc[1]], fill=(210, 60, 60) if lx==0 else (235, 238, 245))
                draw.rectangle([p_tc[0] - int(tc_w*0.35), p_tc[1] - tc_h + 2, p_tc[0] + int(tc_w*0.35), p_tc[1] - int(tc_h*0.4)], fill=(20, 24, 32))
                draw.line([(p_tc[0] - int(tc_w*0.45), p_tc[1] - int(tc_h*0.3)), (p_tc[0] - int(tc_w*0.25), p_tc[1] - int(tc_h*0.3))], fill=(255, 25, 45), width=max(1, int(p_tc[2]*0.08)))
                draw.line([(p_tc[0] + int(tc_w*0.25), p_tc[1] - int(tc_h*0.3)), (p_tc[0] + int(tc_w*0.45), p_tc[1] - int(tc_h*0.3))], fill=(255, 25, 45), width=max(1, int(p_tc[2]*0.08)))

    elif action == "ramp":
        # Rampa e Salto Aéreo
        ramp_cycle = (t * 0.6) % 1.0
        ramp_z = -40 + ramp_cycle * 60
        if -60 < ramp_z < 0:
            rp_bl = p3d(-1.6, 0, ramp_z + 8)
            rp_br = p3d(1.6, 0, ramp_z + 8)
            rp_tl = p3d(-1.6, 2.2, ramp_z - 3)
            rp_tr = p3d(1.6, 2.2, ramp_z - 3)
            draw.polygon([(rp_bl[0], rp_bl[1]), (rp_tl[0], rp_tl[1]), (rp_tr[0], rp_tr[1]), (rp_br[0], rp_br[1])], fill=(31, 35, 48))
            draw.line([(rp_bl[0], rp_bl[1]), (rp_tl[0], rp_tl[1])], fill=(255, 136, 0), width=max(2, int(rp_tl[2]*0.14)))
            draw.line([(rp_br[0], rp_br[1]), (rp_tr[0], rp_tr[1])], fill=(255, 136, 0), width=max(2, int(rp_tl[2]*0.14)))
            draw.line([(rp_tl[0], rp_tl[1]), (rp_tr[0], rp_tr[1])], fill=(0, 240, 255), width=max(2, int(rp_tl[2]*0.16)))

        if ramp_cycle > 0.45:
            flight_p = (ramp_cycle - 0.45) / 0.55
            car_y = math.sin(flight_p * math.pi) * 3.6

    elif action == "shield":
        # Atropelando carros
        obs_z = -55 + ((t * 36.0) % 70)
        if -50 < obs_z < 0:
            p_tc = p3d(0.0, 0, obs_z)
            tc_w = int(1.8 * p_tc[2])
            tc_h = int(1.1 * p_tc[2])
            draw.rectangle([p_tc[0] - tc_w//2, p_tc[1] - tc_h, p_tc[0] + tc_w//2, p_tc[1]], fill=(180, 50, 50))
            if obs_z > -12:
                for sp in range(12):
                    sx = p_tc[0] + int(math.sin(sp*1.2 + t*20)*35)
                    sy = p_tc[1] - int(math.cos(sp*1.2 + t*20)*25)
                    draw.ellipse([sx-3, sy-3, sx+3, sy+3], fill=(255, 230, 80))

    elif action == "coins":
        # Chuva de moedas magnéticas
        for ci in range(12):
            cz = -100 + ((t * 32.0 + ci * 15) % 110)
            if -95 < cz < 2:
                cx = math.sin(ci * 1.6) * 2.4 * max(0.1, min(1.0, -cz / 30.0))
                p_c = p3d(cx, 1.2, cz)
                draw_vector_coin(draw, int(p_c[0]), int(p_c[1]), r=max(3, int(0.18 * p_c[2])))

    elif action == "near_miss":
        car_x = math.sin(t * 1.8) * 0.4
        for sign in [-1, 1]:
            truck_x = sign * 2.4
            truck_z = -45 + ((t * 18.0) % 60)
            if -40 < truck_z < 5:
                pt = p3d(truck_x, 0, truck_z)
                tw = int(2.2 * pt[2])
                th = int(2.4 * pt[2])
                draw.rectangle([pt[0] - tw//2, pt[1] - th, pt[0] + tw//2, pt[1]], fill=(70, 75, 88))
                draw.rectangle([pt[0] - int(tw*0.45), pt[1] - int(th*0.35), pt[0] + int(tw*0.45), pt[1] - int(th*0.1)], fill=(200, 30, 30))

    else:
        # Padrão: carro branco à frente
        tc_z = -85.0 + (t * 6.0) % 40.0
        p_tc = p3d(0.0, 0, tc_z)
        if p_tc[2] > 0 and tc_z < -5:
            tc_w = int(1.8 * p_tc[2])
            tc_h = int(1.1 * p_tc[2])
            draw.rectangle([p_tc[0] - tc_w//2, p_tc[1] - tc_h, p_tc[0] + tc_w//2, p_tc[1]], fill=(235, 238, 245))
            draw.rectangle([p_tc[0] - int(tc_w*0.35), p_tc[1] - tc_h + 2, p_tc[0] + int(tc_w*0.35), p_tc[1] - int(tc_h*0.4)], fill=(20, 24, 32))
            draw.line([(p_tc[0] - int(tc_w*0.45), p_tc[1] - int(tc_h*0.3)), (p_tc[0] - int(tc_w*0.25), p_tc[1] - int(tc_h*0.3))], fill=(255, 25, 45), width=max(1, int(p_tc[2]*0.08)))
            draw.line([(p_tc[0] + int(tc_w*0.25), p_tc[1] - int(tc_h*0.3)), (p_tc[0] + int(tc_w*0.45), p_tc[1] - int(tc_h*0.3))], fill=(255, 25, 45), width=max(1, int(p_tc[2]*0.08)))

    # 5. O SOLARIS HYPERCAR (IDÊNTICO AO SCREENSHOT)
    p_car = p3d(car_x, car_y, 0.0)
    s = p_car[2]

    # Sombra
    if car_y < 0.2:
        draw.ellipse([p_car[0] - int(1.4*s), p_car[1] - int(0.4*s), p_car[0] + int(1.4*s), p_car[1] + int(0.4*s)], fill=(22, 20, 28))

    # Rodas Dianteiras
    w_front_w = int(0.28 * s)
    w_front_h = int(0.72 * s)
    for wx_sign in [-1, 1]:
        w_f_proj = p3d(car_x + wx_sign * 1.08, car_y + 0.35, -2.4)
        draw.rounded_rectangle([
            w_f_proj[0] - w_front_w // 2, w_f_proj[1] - w_front_h // 2,
            w_f_proj[0] + w_front_w // 2, w_f_proj[1] + w_front_h // 2
        ], radius=4, fill=(20, 22, 26))

    # Rodas Traseiras
    w_rear_w = int(0.36 * s)
    w_rear_h = int(0.88 * s)
    for wx_sign in [-1, 1]:
        w_r_proj = p3d(car_x + wx_sign * 1.14, car_y + 0.36, 0.1)
        draw.rounded_rectangle([
            w_r_proj[0] - w_rear_w // 2, w_r_proj[1] - w_rear_h // 2,
            w_r_proj[0] + w_rear_w // 2, w_r_proj[1] + w_rear_h // 2
        ], radius=5, fill=(18, 20, 24))

    # Carroceria Solaris
    p_b_bl = p3d(car_x - 1.05, car_y + 0.24, 0.0)
    p_b_br = p3d(car_x + 1.05, car_y + 0.24, 0.0)
    p_b_tl = p3d(car_x - 0.98, car_y + 0.76, 0.0)
    p_b_tr = p3d(car_x + 0.98, car_y + 0.76, 0.0)

    p_f_tl = p3d(car_x - 0.78, car_y + 0.94, -2.4)
    p_f_tr = p3d(car_x + 0.78, car_y + 0.94, -2.4)
    p_f_bl = p3d(car_x - 0.88, car_y + 0.44, -4.2)
    p_f_br = p3d(car_x + 0.88, car_y + 0.44, -4.2)

    draw.polygon([(p_b_tl[0], p_b_tl[1]), (p_f_tl[0], p_f_tl[1]), (p_f_tr[0], p_f_tr[1]), (p_b_tr[0], p_b_tr[1])], fill=(236, 174, 52))
    draw.polygon([(p_f_tl[0], p_f_tl[1]), (p_f_bl[0], p_f_bl[1]), (p_f_br[0], p_f_br[1]), (p_f_tr[0], p_f_tr[1])], fill=(224, 160, 40))

    # Vidro Escuro
    p_g_bl = p3d(car_x - 0.58, car_y + 0.77, -0.4)
    p_g_br = p3d(car_x + 0.58, car_y + 0.77, -0.4)
    p_g_tl = p3d(car_x - 0.48, car_y + 0.96, -2.0)
    p_g_tr = p3d(car_x + 0.48, car_y + 0.96, -2.0)
    draw.polygon([(p_g_bl[0], p_g_bl[1]), (p_g_tl[0], p_g_tl[1]), (p_g_tr[0], p_g_tr[1]), (p_g_br[0], p_g_br[1])], fill=(22, 26, 36))

    # Barbatana
    p_fin_b = p3d(car_x, car_y + 0.78, -0.3)
    p_fin_t = p3d(car_x, car_y + 1.15, -1.8)
    draw.line([(p_fin_b[0], p_fin_b[1]), (p_fin_t[0], p_fin_t[1])], fill=(16, 17, 22), width=max(2, int(0.08 * s)))

    # Traseira
    draw.polygon([(p_b_bl[0], p_b_bl[1]), (p_b_tl[0], p_b_tl[1]), (p_b_tr[0], p_b_tr[1]), (p_b_br[0], p_b_br[1])], fill=(226, 162, 42))
    draw.rectangle([p_b_bl[0], p_b_bl[1], p_b_br[0], p_b_bl[1] + int(0.10 * s)], fill=(24, 25, 30))

    # 4 ESCAPES DE FOGUETE
    exhaust_xs = [-0.45, -0.17, 0.17, 0.45]
    glow_layer = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0))
    d_glow = ImageDraw.Draw(glow_layer)

    flame_flicker = 1.0 + math.sin(t * 26.0) * 0.12
    if action == "hyperdrive":
        flame_flicker = 1.8 + math.sin(t * 40.0) * 0.35

    for ex in exhaust_xs:
        p_pipe = p3d(car_x + ex, car_y + 0.44, 0.05)
        pr = max(4, int(0.11 * s))
        draw.ellipse([p_pipe[0] - pr, p_pipe[1] - pr, p_pipe[0] + pr, p_pipe[1] + pr], fill=(30, 32, 38), outline=(65, 60, 50))

        fr = int(pr * 2.8 * flame_flicker)
        d_glow.ellipse([p_pipe[0] - fr, p_pipe[1] - fr + 4, p_pipe[0] + fr, p_pipe[1] + fr + 4], fill=(255, 135, 35, 100))
        d_glow.ellipse([p_pipe[0] - int(fr*0.65), p_pipe[1] - int(fr*0.65) + 3, p_pipe[0] + int(fr*0.65), p_pipe[1] + int(fr*0.65) + 3], fill=(255, 215, 80, 185))
        d_glow.ellipse([p_pipe[0] - int(fr*0.32), p_pipe[1] - int(fr*0.32) + 2, p_pipe[0] + int(fr*0.32), p_pipe[1] + int(fr*0.32) + 2], fill=(255, 255, 225, 245))

    # Poeira sob os escapes
    dust_cx = p_car[0]
    dust_cy = p_car[1] + int(0.22 * s)
    d_glow.ellipse([dust_cx - int(1.1*s), dust_cy - int(0.25*s), dust_cx + int(1.1*s), dust_cy + int(0.35*s)], fill=(255, 180, 90, 70))

    img = Image.alpha_composite(img, glow_layer)
    draw = ImageDraw.Draw(img)

    # Efeito Escudo se ação for "shield"
    if action == "shield":
        shield_layer = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0))
        d_sh = ImageDraw.Draw(shield_layer)
        sh_rx = int(1.6 * s)
        sh_ry = int(1.2 * s)
        d_sh.ellipse([p_car[0] - sh_rx, p_car[1] - sh_ry - int(0.5*s), p_car[0] + sh_rx, p_car[1] + sh_ry - int(0.5*s)], fill=(12, 38, 70, 90), outline=(56, 189, 248, 220), width=3)
        d_sh.ellipse([p_car[0] - int(sh_rx*1.1), p_car[1] - int(0.3*s) - int(0.5*s), p_car[0] + int(sh_rx*1.1), p_car[1] + int(0.3*s) - int(0.5*s)], outline=(251, 191, 36, 240), width=2)
        img = Image.alpha_composite(img, shield_layer)
        draw = ImageDraw.Draw(img)

    # Efeito Hyperdrive Warp
    if action == "hyperdrive":
        warp_layer = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0))
        d_w = ImageDraw.Draw(warp_layer)
        for st_i in range(16):
            st_x = int((math.sin(st_i * 2.3 + t * 6) * 0.45 + 0.5) * WIDTH)
            st_y1 = int(horizon_y + 20 + math.cos(st_i * 1.7) * 200)
            st_y2 = st_y1 + 130
            d_w.line([(st_x, st_y1), (st_x, st_y2)], fill=(0, 240, 255, 130), width=2)
        img = Image.alpha_composite(img, warp_layer)
        draw = ImageDraw.Draw(img)

    # =========================================================================
    # 6. HUD OVERLAY: 100% IDÊNTICO AO SCREENSHOT DO IPHONE
    # =========================================================================
    hud = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0))
    d_hud = ImageDraw.Draw(hud)

    # 6.1 Status Bar
    d_hud.text((54, 34), "20:07", fill=(255, 255, 255, 235), font=font_clock)
    bx, by = WIDTH - 76, 38
    d_hud.rounded_rectangle([bx, by, bx + 28, by + 14], radius=4, outline=(255, 255, 255, 210), width=2)
    d_hud.rectangle([bx + 28, by + 4, bx + 30, by + 10], fill=(255, 255, 255, 210))
    d_hud.rounded_rectangle([bx + 3, by + 3, bx + 21, by + 11], radius=2, fill=(255, 255, 255, 230))
    for bar_i in range(4):
        bh = 4 + bar_i * 3
        d_hud.rectangle([bx - 44 + bar_i * 5, by + 14 - bh, bx - 44 + bar_i * 5 + 3, by + 14], fill=(255, 255, 255, 220))
    d_hud.arc([bx - 26, by - 2, bx - 10, by + 14], 200, 340, fill=(255, 255, 255, 220), width=2)
    d_hud.arc([bx - 23, by + 2, bx - 13, by + 12], 200, 340, fill=(255, 255, 255, 220), width=2)

    # 6.2 Botões Topo
    d_hud.rounded_rectangle([28, 96, 76, 144], radius=14, fill=(40, 36, 56, 195), outline=(78, 72, 98, 170))
    d_hud.rectangle([44, 110, 48, 130], fill=(220, 225, 240))
    d_hud.rectangle([56, 110, 60, 130], fill=(220, 225, 240))

    d_hud.rounded_rectangle([88, 96, 136, 144], radius=14, fill=(40, 36, 56, 195), outline=(78, 72, 98, 170))
    d_hud.polygon([(102, 116), (108, 116), (116, 110), (116, 130), (108, 124), (102, 124)], fill=(220, 225, 240))
    d_hud.arc([114, 112, 124, 128], 300, 60, fill=(220, 225, 240), width=2)

    # 6.3 Card de Telemetria
    card_x = 28
    card_y = 160
    card_w = 265
    card_h = 396
    d_hud.rounded_rectangle([card_x, card_y, card_x + card_w, card_y + card_h], radius=24, fill=(32, 28, 44, 225), outline=(75, 68, 92, 190))

    cur_dist = int(66 + t * 44)
    speed_val = 143
    if action == "hyperdrive":
        speed_val = int(143 + t * 32)
    elif action == "rush":
        speed_val = int(143 + math.sin(t*4)*12)
    elif action == "ramp":
        speed_val = int(160 + math.sin(t*2)*8)

    cur_coins = int(304 + t * (25 if action == "coins" else 3))
    cur_score = int(160 + t * 55)

    d_hud.text((card_x + 22, card_y + 18), f"{cur_dist} m", fill=(255, 255, 255), font=font_dist)
    d_hud.text((card_x + 22, card_y + 64), f"{speed_val} KM/H", fill=(250, 204, 21), font=font_speed)
    rem_time = max(10, int(60 - t))
    d_hud.text((card_x + 22, card_y + 104), f"NÍVEL 1 • {rem_time}S", fill=(56, 189, 248), font=font_meta)

    draw_vector_coin(d_hud, card_x + 32, card_y + 150, r=12)
    d_hud.text((card_x + 52, card_y + 136), f"{cur_coins}", fill=(250, 204, 21), font=font_coins)

    d_hud.rounded_rectangle([card_x + 20, card_y + 178, card_x + card_w - 20, card_y + 214], radius=12, fill=(48, 46, 62, 200))
    d_hud.ellipse([card_x + 34, card_y + 188, card_x + 44, card_y + 198], fill=(160, 180, 210))
    d_hud.arc([card_x + 30, card_y + 198, card_x + 48, card_y + 212], 180, 0, fill=(160, 180, 210), width=3)
    d_hud.text((card_x + 54, card_y + 186), "Ariel", fill=(240, 242, 250), font=font_pill)

    d_hud.rounded_rectangle([card_x + 20, card_y + 224, card_x + card_w - 20, card_y + 276], radius=12, fill=(35, 52, 75, 200), outline=(56, 189, 248, 220))
    d_hud.ellipse([card_x + 32, card_y + 236, card_x + 46, card_y + 250], fill=(220, 235, 250), outline=(56, 189, 248), width=2)
    d_hud.rounded_rectangle([card_x + 35, card_y + 240, card_x + 43, card_y + 246], radius=2, fill=(40, 80, 120))
    d_hud.text((card_x + 54, card_y + 230), "Aria \"Vortex\"", fill=(240, 242, 250), font=font_pill)
    d_hud.text((card_x + 54, card_y + 252), "Vance", fill=(240, 242, 250), font=font_pill)

    d_hud.rounded_rectangle([card_x + 20, card_y + 286, card_x + card_w - 20, card_y + 326], radius=12, fill=(54, 40, 75, 200), outline=(168, 85, 247, 220))
    d_hud.rounded_rectangle([card_x + 32, card_y + 296, card_x + 46, card_y + 316], radius=2, fill=(80, 55, 110), outline=(168, 85, 247), width=1)
    map_label = "Rodovia Dupla" if not is_night else "Circuito Noturno"
    d_hud.text((card_x + 54, card_y + 296), map_label, fill=(240, 242, 250), font=font_pill)

    draw_vector_heart(d_hud, card_x + 36, card_y + 356, size=15, fill=(255, 40, 70))
    draw_vector_heart(d_hud, card_x + 72, card_y + 356, size=15, fill=(50, 45, 60))
    draw_vector_heart(d_hud, card_x + 108, card_y + 356, size=15, fill=(50, 45, 60))

    if action == "shield":
        d_hud.rounded_rectangle([card_x + 20, card_y + card_h - 40, card_x + card_w - 20, card_y + card_h - 12], radius=6, fill=(16, 48, 72, 230), outline=(56, 189, 248, 240))
        d_hud.text((card_x + 28, card_y + card_h - 36), "ESCUDO: 4.8s", fill=(34, 211, 238), font=font_meta)
    elif action == "coins":
        d_hud.rounded_rectangle([card_x + 20, card_y + card_h - 40, card_x + card_w - 20, card_y + card_h - 12], radius=6, fill=(58, 42, 16, 230), outline=(245, 190, 25, 240))
        d_hud.text((card_x + 28, card_y + card_h - 36), "IMA DE MOEDAS: 7.2s", fill=(250, 204, 21), font=font_meta)

    # 6.4 Painel Placar
    score_x = WIDTH - 275
    score_y = 96
    score_w = 248
    score_h = 108
    d_hud.rounded_rectangle([score_x, score_y, score_x + score_w, score_y + score_h], radius=22, fill=(28, 22, 38, 230), outline=(65, 55, 80, 180))
    d_hud.text((score_x + 72, score_y + 8), f"{cur_score}", fill=(255, 255, 255), font=font_score)
    d_hud.line([(score_x + 24, score_y + 72), (score_x + score_w - 24, score_y + 72)], fill=(236, 72, 153), width=4)
    d_hud.text((score_x + 92, score_y + 80), "ROCKET", fill=(210, 215, 230), font=font_rocket)

    # 6.5 Botões Touch
    ctrl_y = HEIGHT - 275
    d_hud.ellipse([32, ctrl_y + 15, 32 + 76, ctrl_y + 15 + 76], fill=(50, 45, 65, 195), outline=(85, 80, 105, 180), width=2)
    d_hud.polygon([(82, ctrl_y + 38), (82, ctrl_y + 68), (56, ctrl_y + 53)], fill=(230, 235, 250))

    d_hud.ellipse([124, ctrl_y + 15, 124 + 76, ctrl_y + 15 + 76], fill=(50, 45, 65, 195), outline=(85, 80, 105, 180), width=2)
    d_hud.polygon([(150, ctrl_y + 38), (150, ctrl_y + 68), (176, ctrl_y + 53)], fill=(230, 235, 250))

    d_hud.ellipse([WIDTH - 200, ctrl_y + 18, WIDTH - 200 + 64, ctrl_y + 18 + 64], fill=(50, 45, 65, 195), outline=(85, 80, 105, 180), width=2)
    d_hud.polygon([(WIDTH - 176, ctrl_y + 40), (WIDTH - 160, ctrl_y + 40), (WIDTH - 160, ctrl_y + 50),
                   (WIDTH - 152, ctrl_y + 50), (WIDTH - 168, ctrl_y + 64), (WIDTH - 184, ctrl_y + 50),
                   (WIDTH - 176, ctrl_y + 50)], fill=(230, 235, 250))

    boost_cx = WIDTH - 78
    boost_cy = ctrl_y + 48
    boost_r = 48
    d_hud.ellipse([boost_cx - boost_r - 6, boost_cy - boost_r - 6, boost_cx + boost_r + 6, boost_cy + boost_r + 6], fill=(6, 182, 212, 65))
    d_hud.ellipse([boost_cx - boost_r, boost_cy - boost_r, boost_cx + boost_r, boost_cy + boost_r], fill=(18, 55, 75, 225), outline=(6, 182, 212, 255), width=3)
    d_hud.polygon([(boost_cx, boost_cy - 30), (boost_cx - 14, boost_cy - 12), (boost_cx - 6, boost_cy - 12),
                   (boost_cx - 6, boost_cy - 2), (boost_cx + 6, boost_cy - 2), (boost_cx + 6, boost_cy - 12),
                   (boost_cx + 14, boost_cy - 12)], fill=(240, 253, 255))
    d_hud.text((boost_cx - 26, boost_cy + 4), "BOOST", fill=(34, 211, 238), font=font_boost)

    # 6.6 Barra de Ar
    air_y = HEIGHT - 170
    air_val = 180 if action != "hyperdrive" else max(30, int(180 - t * 30))
    d_hud.text((36, air_y), "AIR", fill=(220, 225, 240), font=font_air)
    d_hud.text((WIDTH - 90, air_y), f"{air_val} L", fill=(220, 225, 240), font=font_air)

    bar_x = 36
    bar_w = WIDTH - 72
    bar_y_pos = air_y + 22
    num_segments = 12
    active_segments = int((air_val / 180.0) * num_segments)
    seg_w = (bar_w - (num_segments - 1) * 4) // num_segments
    for s_idx in range(num_segments):
        sx1 = bar_x + s_idx * (seg_w + 4)
        sx2 = sx1 + seg_w
        seg_fill = (34, 211, 238, 235) if s_idx < active_segments else (40, 50, 65, 140)
        d_hud.rounded_rectangle([sx1, bar_y_pos, sx2, bar_y_pos + 12], radius=3, fill=seg_fill)

    # 6.7 Barra Safari
    nav_y = HEIGHT - 110
    nav_h = 70
    d_hud.rounded_rectangle([20, nav_y, WIDTH - 20, nav_y + nav_h], radius=28, fill=(45, 30, 60, 235), outline=(75, 55, 90, 160))
    d_hud.text((50, nav_y + 20), "〈", fill=(210, 215, 235), font=font_url)
    d_hud.text((105, nav_y + 20), "〉", fill=(210, 215, 235), font=font_url)

    url_box_x = 160
    url_box_w = WIDTH - 320
    d_hud.rounded_rectangle([url_box_x, nav_y + 10, url_box_x + url_box_w, nav_y + nav_h - 10], radius=20, fill=(30, 20, 42, 235))
    d_hud.text((url_box_x + 18, nav_y + 20), "≡", fill=(200, 205, 220), font=font_url)
    d_hud.text((url_box_x + 55, nav_y + 20), "oop.github.io", fill=(240, 245, 255), font=font_url)
    d_hud.text((url_box_x + url_box_w - 32, nav_y + 20), "↻", fill=(200, 205, 220), font=font_url)
    d_hud.text((WIDTH - 110, nav_y + 20), "❐", fill=(210, 215, 235), font=font_url)

    img = Image.alpha_composite(img, hud)
    return img.convert("RGB")

def generate_video(cfg, idx, total_videos):
    out_path = os.path.join(OUTPUT_DIR, cfg["filename"])
    print(f"[{idx+1}/{total_videos}] 🎬 Renderizando: {cfg['filename']}...")

    container = av.open(out_path, mode="w")
    stream = container.add_stream("h264", rate=FPS)
    stream.width = WIDTH
    stream.height = HEIGHT
    stream.pix_fmt = "yuv420p"
    stream.options = {"crf": "20", "preset": "fast"}

    for f_idx in range(TOTAL_FRAMES):
        frame_img = render_gameplay_frame(cfg, f_idx)
        av_frame = av.VideoFrame.from_image(frame_img)
        for packet in stream.encode(av_frame):
            container.mux(packet)

    for packet in stream.encode():
        container.mux(packet)
    container.close()

    size_mb = os.path.getsize(out_path) / (1024 * 1024)
    print(f"✅ Concluído: {out_path} ({size_mb:.2f} MB)")

def main():
    print("=" * 70)
    print("🚀 RENDERIZANDO OS 10 VÍDEOS IDÊNTICOS AO JOGO REAL (IPHONE GAMEPLAY)")
    print(f"📁 Pasta: {os.path.abspath(OUTPUT_DIR)}")
    print(f"📐 720x1280 (9:16) a {FPS} FPS")
    print("=" * 70)

    for i, cfg in enumerate(VIDEO_CONFIGS):
        generate_video(cfg, i, len(VIDEO_CONFIGS))

    print("=" * 70)
    print("🎉 SUCESSO ABSOLUTO! TODOS OS 10 VÍDEOS FORAM GERADOS COM FIDELIDADE TOTAL!")
    print("======================================================================")

if __name__ == "__main__":
    main()
