# 📱 Roadster Dash 3D - Anúncio Interativo para Instagram (Playable Ad)

Projeto desenvolvido especialmente para o **Google Project IDX**, modelando com fidelidade visual estrita o supercarro **Solaris Hypercar** (dourado com barbatana dorsal de carbono e 4 escapes de foguete), com mecânicas completas de corredor infinito estilo **Subway Surfers** (3 faixas, desvios, pulos em rampas e escudo invencível).

---

## 🚀 Como Executar e Testar no Project IDX

O Project IDX possui suporte nativo a servidores web e pré-visualização em tempo real (Live Web Preview).

### Opção 1: Via Servidor Estático Rápido no Terminal do IDX
Abra o terminal integrado do Project IDX e execute:
```bash
# Navegue até a pasta do anúncio
cd instagram_ad

# Inicie o servidor estático (qualquer um dos comandos abaixo)
npx serve .
# OU
python -m http.server 3000
```
O IDX abrirá automaticamente a janela de **Web Preview** ao lado do seu editor.

### Opção 2: Abrir Diretamente o Arquivo Standalone
Você pode abrir o arquivo `instagram_ad/playable-ad.html` direto no navegador com duplo-clique. Ele contém **100% do código empacotado em um único arquivo**, pronto para ser testado ou enviado diretamente ao **Meta Ads Manager (Instagram/Facebook Playable Ads)**.

---

## 🎮 Mecânicas Estilo Subway Surfers Implementadas

1. **3 Faixas Dinâmicas (`[-3.8, 0, +3.8]`)**:
   - Transição suave entre faixas com interpolação e inclinação lateral (*banking roll*).
   - Controles por **Swipe no Celular/Toque nas bordas** ou **Setas / A e D no Teclado**.
2. **Rampas de Salto Acrobático (Jump Ramps)**:
   - Rampas angulares em formato de cunha com guias de neon amarelo.
   - Passar por uma rampa projeta o carro alto sobre o tráfego e executa um giro acrobático 360° (*Barrel Roll*), garantindo bônus de pontuação (`+350`).
3. **Escudo Protetor Cibernético (Power-Up Shield)**:
   - Ao coletar o item de escudo, uma cúpula holográfica hexagonal neon envolve o carro.
   - Enquanto o escudo estiver ativo, o carro atropela e arremessa qualquer veículo ou obstáculo para longe com física de impacto (*Shield Smash +300*).
4. **Tráfego e Obstáculos**:
   - Sedãs e caminhões futuristas em cores neon trafegando na rodovia.
5. **Conversão de Anúncio de Alto Desempenho**:
   - Barra de progresso do Story (15 segundos).
   - Perfil oficial do Instagram (`@roadsterdash3d • Patrocinado`).
   - Botão de Call-To-Action pulsante `"JOGAR AGORA GRÁTIS ➔"`.
   - Card final com estrelas, estatísticas da corrida e botão de instalação do jogo completo.

---

## ⚙️ Ajustes de Câmera e Iluminação em Tempo Real (Project IDX)

O projeto inclui um painel de ajustes retrátil (`⚙️ AJUSTES DE CÂMERA & LUZ`) no canto superior direito:
- **FOV da Câmera**: De 40° a 95° para ajustar o campo de visão vertical.
- **Altura da Câmera (Y)**: De 2m a 12m.
- **Distância da Câmera (Z)**: De 4m a 18m para aproximar ou afastar o veículo.
- **Ponto Focal (Look Y)**: Ajusta o ângulo de visão sobre o horizonte.
- **Luz do Sol & Luz Ambiente**: Sliders de intensidade e seletores de cor hexadecimais em tempo real.
- **Presets Instantâneos**:
  - `Subway Surfers`: Câmera clássica vertical dinâmica.
  - `Cinemático Baixo`: Câmera colada nos 4 escapes de foguete.
  - `Noite Cyberpunk`: Iluminação neon com ambient roxo e ciano.
  - `Sunset Dourado`: Pôr do sol quente sobre a ponte.

---

## 📂 Estrutura Modular dos Arquivos

```
instagram_ad/
├── index.html              # Ponto de entrada modular com suporte a ES Modules no IDX
├── style.css               # Estilos de UI do Instagram (9:16), HUD, popups e painel de ajustes
├── playable-ad.html        # Build autônomo (Single-File) pronto para o Meta/Instagram Ads
├── README.md               # Documentação completa
└── src/
    ├── CarBuilder.js       # Modelagem 3D estrita do Solaris Hypercar (rodas, aerodinâmica e escapes)
    ├── Environment.js      # Pista infinita, névoa, gradiente de céu synthwave, sol e cidade
    ├── GamePlay.js         # Lógica Subway Surfers (faixas, saltos, colisões, moedas e escudo)
    ├── DebugControls.js    # Painel interativo de calibração em tempo real
    └── main.js             # Inicialização do loop Three.js e gerenciamento de eventos
```
