"""
criar_planilha_instagram.py
Cria a planilha profissional formatada em .xlsx e .csv
para upload no Google Drive / Google Sheets e automação no Make.com.
"""

import os
import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter

POSTS_DATA = [
    {
        "id": 1,
        "video": "01_subway_surfers_rush.mp4",
        "hook": "🔥 DESVIE SE FOR CAPAZ!",
        "legenda": "Será que seus reflexos aguentam o tráfego pesado a mais de 200 KM/H? 🏎️💨\n\nDesvie dos carros, colete moedas e desafie seus amigos no jogo do momento!\n\n👉 Jogue GRÁTIS direto no navegador pelo link da bio!",
        "hashtags": "#RoadsterDash #JogoDeCarro #GamesBrasil #SubwaySurfers #Hypercar #IndieDev #ThreeJS #GamingReels",
        "data": "Dia 1",
        "hora": "18:00"
    },
    {
        "id": 2,
        "video": "02_salto_rampa_360.mp4",
        "hook": "🛹 SALTO 360° NA RAMPA!",
        "legenda": "Acrobacia insana com Barrel Roll sobre o trânsito! Quem aí consegue bater esse recorde de altura? 🚀✨\n\nJogue sem precisar baixar nada!",
        "hashtags": "#Acrobacia #StuntCar #GamesNoCelular #ShortsGaming #GamingLife #Supercarro #Corrida3D",
        "data": "Dia 2",
        "hora": "18:00"
    },
    {
        "id": 3,
        "video": "03_escudo_invencivel_smash.mp4",
        "hook": "🛡️ MODO ESCUDO INVENCÍVEL!",
        "legenda": "Ativando o escudo quântico hexagonal! Atropelando caminhões e abrindo caminho na rodovia sem tomar 1 de dano! 🛡️⚡\n\nLink na bio para jogar agora!",
        "hashtags": "#Escudo #ModoDeus #GamerBR #MobileGaming #Adrenalina #VideoGame #CorridaInfinita",
        "data": "Dia 3",
        "hora": "18:00"
    },
    {
        "id": 4,
        "video": "04_quatro_escapes_fogo.mp4",
        "hook": "💨 4 ESCAPES DE FOGUETE!",
        "legenda": "O ronco dos 4 propulsores a jato cuspindo fogo na estrada! Qual supercarro da garagem é o seu favorito? 🔥🏎️\n\nComente aqui e venha jogar!",
        "hashtags": "#Supercarros #Nitro #RocketThrusters #HypercarLifestyle #V8 #SpeedDemon #CarrosEsportivos",
        "data": "Dia 4",
        "hora": "18:00"
    },
    {
        "id": 5,
        "video": "05_sunset_highway_dourada.mp4",
        "hook": "🌅 SUNSET BRIDGE RETRO 80s",
        "legenda": "Aquele visual synthwave relaxante com o pôr-do-sol dourado na ponte suspensa. O jogo perfeito para passar o tempo! 🌇✨\n\nClique no link da bio e jogue grátis!",
        "hashtags": "#Synthwave #Retrowave #AestheticGames #SunsetVibes #ChillGaming #80sStyle #LofiGaming",
        "data": "Dia 5",
        "hora": "18:00"
    },
    {
        "id": 6,
        "video": "06_noite_neon_cyberpunk.mp4",
        "hook": "⚡ NOITE CYBERPUNK NEON",
        "legenda": "Quando a noite cai, as luzes de neon e os túneis futuristas ganham vida! Você aguenta a velocidade máxima na escuridão? 🌃⚡\n\nLink na bio!",
        "hashtags": "#Cyberpunk #NeonAesthetics #NightDrive #CorridaNoturna #Outrun #GamerGirl #JogosOnline",
        "data": "Dia 6",
        "hora": "18:00"
    },
    {
        "id": 7,
        "video": "07_chuva_moedas_ouro.mp4",
        "hook": "🪙 CHUVA DE MOEDAS DOURADAS!",
        "legenda": "Ativei o ímã magnético e puxei mais de 500 moedas na rodovia! Quanto dinheiro você consegue juntar em uma corrida? 💰🪙\n\nJogue grátis no link da bio!",
        "hashtags": "#Moedas #FarmDeMoedas #CoinMaster #GameTips #RecordeMundial #JogosGratis #WebGaming",
        "data": "Dia 7",
        "hora": "18:00"
    },
    {
        "id": 8,
        "video": "08_camera_frontal_perseguicao.mp4",
        "hook": "👀 CÂMERA DE AÇÃO DINÂMICA",
        "legenda": "A visão mais tensa da corrida: câmera invertida vendo o perigo se aproximar a 240 KM/H! Se piscar, bate! 😱🏎️\n\nTeste seus reflexos no link da bio!",
        "hashtags": "#POV #AçãoPura #Tensão #NearMiss #Reflexos #VelocidadeMaxima #GamerCommunity",
        "data": "Dia 8",
        "hora": "18:00"
    },
    {
        "id": 9,
        "video": "09_near_miss_ultrapassagem.mp4",
        "hook": "😱 POR UM MILÍMETRO!",
        "legenda": "Aquela fininha de tirar o fôlego entre dois caminhões! Sobrevivi por puro milagre! Quem mais arrisca assim? 🤏🔥\n\nJogue grátis direto no navegador!",
        "hashtags": "#NearMiss #Ultrapassagem #PorPouco #PilotoPro #Habilidade #DriftKing #GameplayReels",
        "data": "Dia 9",
        "hora": "18:00"
    },
    {
        "id": 10,
        "video": "10_hyperdrive_nitro_climax.mp4",
        "hook": "🚀 HIPERDRIVE NITRO: 300 KM/H!",
        "legenda": "TANQUE DE AR CHEIO + NITRO ATIVADO = 300 KM/H NA PONTE! 🚀💨\n\nDesafie agora mesmo os pilotos do ranking multiplayer online! Link na bio!",
        "hashtags": "#Hiperdrive #NitroBoost #TopSpeed #VelocidadeDaLuz #MultiplayerOnline #JogosDeCorrida #ViralReels",
        "data": "Dia 10",
        "hora": "18:00"
    }
]

def build_excel():
    wb = openpyxl.Workbook()
    ws = wb.active
    ws.title = "Agendamento_Instagram"

    # Estilos Visuais
    header_fill = PatternFill(start_color="1F2430", end_color="1F2430", fill_type="solid")
    header_font = Font(name="Segoe UI", size=11, bold=True, color="00F0FF")
    data_font = Font(name="Segoe UI", size=10)
    hook_font = Font(name="Segoe UI", size=10, bold=True, color="D97706")
    status_font = Font(name="Segoe UI", size=10, bold=True, color="059669")
    border_side = Side(border_style="thin", color="E2E8F0")
    thin_border = Border(left=border_side, right=border_side, top=border_side, bottom=border_side)

    headers = [
        "ID",
        "Nome_Video",
        "Link_Google_Drive",
        "Titulo_Hook",
        "Legenda",
        "Hashtags",
        "Data_Agendamento",
        "Horario_Recomendado",
        "Status",
        "Data_Publicacao"
    ]

    ws.append(headers)

    # Estiliza cabeçalho
    for col_idx in range(1, len(headers) + 1):
        cell = ws.cell(row=1, column=col_idx)
        cell.fill = header_fill
        cell.font = header_font
        cell.alignment = Alignment(horizontal="center", vertical="center", wrap_text=True)
        cell.border = thin_border
    ws.row_dimensions[1].height = 28

    # Preenche linhas com os links públicos diretos já hospedados no seu GitHub Pages
    for p in POSTS_DATA:
        direct_url = f"https://tiagomob6-boop.github.io/jogo_tesla/instagram_videos/{p['video']}"
        row = [
            p["id"],
            p["video"],
            direct_url,
            p["hook"],
            p["legenda"],
            p["hashtags"],
            p["data"],
            p["hora"],
            "Pendente",
            ""
        ]
        ws.append(row)
        curr_row = ws.max_row
        ws.row_dimensions[curr_row].height = 65

        for c_idx in range(1, len(headers) + 1):
            cell = ws.cell(row=curr_row, column=c_idx)
            cell.font = data_font
            cell.border = thin_border
            cell.alignment = Alignment(vertical="center", wrap_text=True)

            if c_idx == 1:
                cell.alignment = Alignment(horizontal="center", vertical="center")
            elif c_idx == 4:
                cell.font = hook_font
            elif c_idx == 9:
                cell.font = status_font
                cell.alignment = Alignment(horizontal="center", vertical="center")

    # Ajusta larguras das colunas
    col_widths = {
        "A": 6,   # ID
        "B": 32,  # Nome_Video
        "C": 35,  # Link_Google_Drive
        "D": 28,  # Titulo_Hook
        "E": 45,  # Legenda
        "F": 35,  # Hashtags
        "G": 18,  # Data_Agendamento
        "H": 22,  # Horario_Recomendado
        "I": 15,  # Status
        "J": 18   # Data_Publicacao
    }
    for col, width in col_widths.items():
        ws.column_dimensions[col].width = width

    xlsx_path = "planilha_agendamento_instagram.xlsx"
    wb.save(xlsx_path)
    print(f"✅ Planilha criada com sucesso: {xlsx_path}")

    # Gera também versão CSV
    csv_path = "planilha_agendamento_instagram.csv"
    import csv
    with open(csv_path, mode="w", newline="", encoding="utf-8-sig") as f:
        writer = csv.writer(f)
        writer.writerow(headers)
        for p in POSTS_DATA:
            direct_url = f"https://tiagomob6-boop.github.io/jogo_tesla/instagram_videos/{p['video']}"
            writer.writerow([
                p["id"],
                p["video"],
                direct_url,
                p["hook"],
                p["legenda"],
                p["hashtags"],
                p["data"],
                p["hora"],
                "Pendente",
                ""
            ])
    print(f"✅ CSV criado com sucesso: {csv_path}")

if __name__ == "__main__":
    build_excel()
