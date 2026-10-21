/**
 * story.js - Árvore de Decisão e Enredo do Mini-RPG "O Casamento do Professor"
 * Contém todos os nós da história, diálogos, desafios e mecânicas específicas.
 */

const STORY_DATA = {
    // Tela Inicial / Start
    "start": {
        id: "start",
        stage: "Compilador Inicial",
        file: "main.c",
        title: "PROJETO: CASAMENTO_V1.0.EXE",
        text: [
            "> Iniciando ambiente de execução...",
            "> Carregando módulos: Paciência.dll, Cafeina.so, AmorEterno.h",
            "> Professor detectado no sistema: Status = NOIVO (Ansiedade: 99.9%).",
            "",
            "Hoje não é um dia qualquer de aulas de algoritmos e estruturas de dados. É o grande dia da sua vida!",
            "Mas para subir ao altar com sucesso, você precisará sobreviver às três provações sagradas da engenharia de software.",
            "",
            "Prepare sua IDE mental, respire fundo e clique abaixo para compilar sua jornada!"
        ],
        code: `// ==========================================
// PROJETO: Matrimonio.c
// Meta do Dia: Compilar o Amor Eterno
// ==========================================
#include <AmorEterno.h>
#include <PacienciaInfinita.h>

struct Matrimonio {
    char noivo[] = "Professor de Programação";
    char status[] = "Pronto para o 'Sim' no Altar";
    long int nivel_felicidade = 999999999;
    int cafeina_no_sangue = 100;
    bool amor_eterno = true;
    bool bugs_no_casamento = false;
};

void celebrarCasamento() {
    printf("União compilada com 0 erros e 0 warnings!\n");
}`,
        options: [
            {
                text: "▶️ Iniciar Depuração da Vida (Compilar Casamento)",
                nextNode: "fase1_intro"
            }
        ]
    },

    // ==========================================
    // FASE 1: O BUG DA MADRUGADA (03:14 AM)
    // ==========================================
    "fase1_intro": {
        id: "fase1_intro",
        stage: "Fase 1/3: O Bug da Madrugada",
        file: "tcc_aluno_urgente.js",
        title: "03:14 AM - Notificação no Discord",
        text: [
            "Faltam poucas horas para o amanhecer do seu casamento.",
            "Você acabou de deitar a cabeça no travesseiro quando seu celular vibra ensurdecedoramente na mesa de cabeceira.",
            "",
            "Mensagem de Aluno às 03:14: 'Professoor, desculpa a hora! Meu TCC não calcula a nota e a entrega encerra às 04:00!'",
            "'O sistema diz que 100% da turma reprovou e o reitor tá me marcando no Teams! Ajuda pfvr, prometo levar docinho no casamento!'",
            "",
            "Você abre o notebook em modo escuro total com os olhos semicerrados e examina a função suspeita:"
        ],
        code: `// tcc_aluno_urgente.js - Linha 42
function processarAprovacao(aluno) {
    let nota = aluno.obterNota();
    // Atenção: analisando o critério do semestre...
    if (aluno.entregouTrabalho = false) {
        return "Reprovado! Zero no boletim!";
    }
    return "Aprovado com Louvor!";
}`,
        options: [
            {
                text: "🔍 'Você usou = (atribuição) em vez de === (comparação) no if! Aluno, vá dormir!'",
                nextNode: "fase1_acerto"
            },
            {
                text: "💣 'Roda um rm -rf / ou npm install em loop que resolve!'",
                nextNode: "game_over_npm"
            },
            {
                text: "😴 Ignorar a mensagem, silenciar o celular e fingir que faltou energia na cidade.",
                nextNode: "game_over_ignorar"
            },
            {
                text: "🤷 'Troca por um operador ternário sem testar e faz deploy direto em produção!'",
                nextNode: "game_over_ternario"
            }
        ]
    },

    "fase1_acerto": {
        id: "fase1_acerto",
        stage: "Fase 1/3: O Bug da Madrugada",
        file: "tcc_aluno_urgente.js",
        title: "Bug Aniquilado com Sucesso!",
        text: [
            "> [COMPILAÇÃO]: SUCESSO! 0 Warnings, 0 Errors.",
            "> Aluno responde: 'MEU DEUS PROFESSOR VC É UM DEUS OBRIGADO VOU CASAR COM VC (pera, vc já vai casar hj kk)!'",
            "",
            "Você salvou o semestre acadêmico e fechou o notebook com a elegância de quem refatora código em sono REM.",
            "Agora são 04:00. Você consegue descansar um pouco... mas ao amanhecer, outro desafio crítico surge!"
        ],
        code: `// Status do Sistema
const professor = {
    sono: "2 horas",
    respeitoDosAlunos: "+1000",
    energiaAtual: "12% [Crítica]"
};`,
        options: [
            {
                text: "☕ Avançar para a manhã do casamento (Fase 2)",
                nextNode: "fase2_intro"
            }
        ]
    },

    // Game Overs da Fase 1
    "game_over_npm": {
        id: "game_over_npm",
        stage: "Kernel Panic",
        file: "system_crash.dump",
        title: "TELA AZUL: CRASH NO SISTEMA",
        isGameOver: true,
        bsodMessage: "FATAL_ERROR: NODE_MODULES_OVERFLOW\nO aluno rodou npm install sem lockfile. A pasta node_modules atingiu 8.4 Terabytes e colapsou a gravidade da Terra em um buraco negro. Você perdeu o horário do casamento!",
        options: [
            {
                text: "🔄 Reiniciar Depuração (F5)",
                nextNode: "start"
            }
        ]
    },

    "game_over_ignorar": {
        id: "game_over_ignorar",
        stage: "Kernel Panic",
        file: "system_crash.dump",
        title: "TELA AZUL: CULPA MORAL NÃO TRATADA",
        isGameOver: true,
        bsodMessage: "UNHANDLED_EXCEPTION: PEDAGOGICAL_GUILT\nVocê silenciou o celular, mas o peso na consciência ativou um loop infinito no seu cérebro. Você passou a madrugada sonhando com ponteiros nulos e acordou às 17h com 80 ligações da noiva!",
        options: [
            {
                text: "🔄 Tentar Novamente com Consciência Limpa",
                nextNode: "start"
            }
        ]
    },

    "game_over_ternario": {
        id: "game_over_ternario",
        stage: "Kernel Panic",
        file: "system_crash.dump",
        title: "TELA AZUL: DEPLOY ÀS CEGAS",
        isGameOver: true,
        bsodMessage: "ERROR 500: PRODUCTION_ON_FIRE\nDeploy sem testes às 03:30 da manhã gerou um stack overflow na faculdade. O sistema emitiu diplomas de Engenharia para cachorros do campus e o MEC cancelou sua licença de noivo!",
        options: [
            {
                text: "🔄 Voltar e Refatorar Corretamente",
                nextNode: "start"
            }
        ]
    },

    // ==========================================
    // FASE 2: A CAFETEIRA QUEBROU (07:45 AM)
    // ==========================================
    "fase2_intro": {
        id: "fase2_intro",
        stage: "Fase 2/3: A Cafeteira Quebrou",
        file: "smart_coffee_maker.py",
        title: "07:45 AM - Pânico no Módulo de Cafeína",
        text: [
            "O grande dia começou! O terno já está pendurado, os sapatos engraxados.",
            "Porém, seu cérebro ainda está rodando a 800MHz com 2 horas de sono.",
            "",
            "Você caminha como um zumbi até a cafeteira inteligente programável... mas a tela LCD dela exibe:",
            "> [ERROR 418]: I'm a teapot, but currently broken.",
            "> Traceback: 'NullPointerException: CoffeeBeansMissing or PressureOutOfSync'",
            "",
            "Sem café, você não vai conseguir nem pronunciar os votos sem gaguejar em binário! É hora de fazer o diagnóstico de hardware e software:"
        ],
        code: `# cafeteira.py
class SmartEspresso:
    def brew(self, graos, agua_ml, pressao_bar):
        if not graos:
            raise LackOfBeansError("Grãos não detectados!")
        if agua_ml < 200 or pressao_bar != 9:
            return "Chafé horroroso!"
        return "Espresso Perfeito: Energia 100%!"`,
        options: [
            {
                text: "🔧 Inspecionar o compartimento de grãos e ajustar a moagem para 'Fine'",
                nextNode: "fase2_puzzle_1"
            },
            {
                text: "⚡ Chutar a cafeteira com força e xingar em Assembly",
                nextNode: "game_over_chute"
            },
            {
                text: "🥤 Beber água da torneira morna e fingir que é café descafeinado",
                nextNode: "game_over_chafe"
            }
        ]
    },

    "fase2_puzzle_1": {
        id: "fase2_puzzle_1",
        stage: "Fase 2/3: Calibração da Cafeteira",
        file: "smart_coffee_maker.py",
        title: "Grãos Carregados! Agora a Pressão Hidráulica:",
        text: [
            "> Grãos especiais 100% arábica adicionados com sucesso!",
            "> Moagem configurada: Moinho cônico [OK].",
            "",
            "A cafeteira agora pede a calibração do manômetro para a extração do Espresso Perfeito.",
            "Um display digital pergunta: 'Qual a pressão ideal de bar para a extração sem queimar a bomba?'"
        ],
        code: `def calibrar_valvula(bar):
    return (bar ** 2 - 18 * bar + 81 == 0) # Resolva a equação do bar ideal!`,
        options: [
            {
                text: "☕ 9 Bar (A raiz perfeita da equação: (x - 9)² = 0)",
                nextNode: "fase2_acerto"
            },
            {
                text: "💥 81 Bar (Mais pressão = café mais rápido, com certeza!)",
                nextNode: "game_over_explosao"
            },
            {
                text: "🐢 1 Bar (Pressão ambiente de uma tarde preguiçosa)",
                nextNode: "game_over_chafe"
            }
        ]
    },

    "fase2_acerto": {
        id: "fase2_acerto",
        stage: "Fase 2/3: A Cafeteira Quebrou",
        file: "smart_coffee_maker.py",
        title: "Café Extraído! Carga Neural em 100%!",
        text: [
            "SHHHHHRRRRRRR... O aroma glorioso do café invade o ambiente!",
            "Uma xícara com crema aveludada e espessa é servida com perfeição.",
            "",
            "Você toma o primeiro gole: seus neurônios reconectam instantaneamente em fibra óptica gigabit!",
            "A barra de energia vai a 100%. A coordenação motora volta a funcionar.",
            "",
            "São 18:00... O cortejo começa. O carro da noiva está chegando. É hora de ir para o Altar!"
        ],
        code: `// Estado do Jogador:
const noivo = {
    vestimenta: "Smoking Alinhado",
    perfume: "Ativado",
    cafeinaNoSangue: "Máxima",
    coracaoBatimentos: "140 BPM (Acelerando)",
    status: "Rumo à Capela"
};`,
        options: [
            {
                text: "⛪ Entrar na Igreja e Enfrentar o Boss Final: O Altar!",
                nextNode: "fase3_intro"
            }
        ]
    },

    // Game Overs da Fase 2
    "game_over_chute": {
        id: "game_over_chute",
        stage: "Hardware Malfunction",
        file: "hardware_error.log",
        title: "TELA AZUL: HARDWARE DANIFICADO",
        isGameOver: true,
        bsodMessage: "EXCEPTION: FRACTURED_TOE_ERROR\nVocê chutou a carcaça de ferro fundido da cafeteira. Além de não sair café, você quebrou o dedão do pé e precisou ir pro altar mancando com gesso fluorescente!",
        options: [
            {
                text: "🔄 Reiniciar e tratar a cafeteira com respeito",
                nextNode: "start"
            }
        ]
    },

    "game_over_chafe": {
        id: "game_over_chafe",
        stage: "Energy Depleted",
        file: "low_battery.log",
        title: "TELA AZUL: SHUTDOWN POR FALTA DE ENERGIA",
        isGameOver: true,
        bsodMessage: "BATTERY_DRAINED_ERROR: SYSTEM_HALTED\nSem a cafeína correta, seu corpo entrou em modo de hibernação forçada no sofá. Você acordou no dia seguinte ouvindo apenas o eco da marcha nupcial!",
        options: [
            {
                text: "🔄 Tomar um café decente e recomeçar",
                nextNode: "start"
            }
        ]
    },

    "game_over_explosao": {
        id: "game_over_explosao",
        stage: "Overpressure Failure",
        file: "boiler_explosion.err",
        title: "TELA AZUL: EXPLOSÃO TERMOBÁRICA",
        isGameOver: true,
        bsodMessage: "PRESSURE_OVERFLOW: BOILER_DETONATION\n81 Bars de pressão transformaram a cafeteira numa ogiva nuclear caseira. Seu terno de noivo ficou 100% manchado de borra de café torrado!",
        options: [
            {
                text: "🔄 Reajustar a válvula com matemática correta",
                nextNode: "fase2_puzzle_1"
            }
        ]
    },

    // ==========================================
    // FASE 3: O ALTAR - BOSS FINAL (19:30)
    // ==========================================
    "fase3_intro": {
        id: "fase3_intro",
        stage: "Fase 3/3: O Altar - Boss Final",
        file: "cerimonia_ao_vivo.cpp",
        title: "19:30 - A Grande Pergunta do Celebrante",
        isBossFight: true,
        text: [
            "A marcha nupcial toca majestosamente ao fundo. As portas se abrem e sua alma gêmea surge maravilhosa.",
            "O público se levanta. Seus alunos estão na última fileira segurando cartazes: 'COMPILA ESSE CASAMENTO, FESSOR!'.",
            "",
            "Vocês seguram as mãos. O celebrante olha para você solenemente e diz:",
            "'Caro Professor, você aceita esta união no amor, nos commits felizes e nas madrugadas de refatoração, na saúde e na doença, até que o Garbage Collector os separe?'",
            "",
            "Você tenta responder 'Sim', mas uma onda de nervosismo e frio na barriga dispara um erro crítico na Thread Principal do seu sistema emocional!"
        ],
        code: `// Thread de Decisão: O Altar
try {
    const resposta = await noivo.responderCelebrante();
    return resposta; // Esperado: "SIM!"
} catch (frioNaBarriga) {
    // ERRO CRÍTICO: Botão "SIM" está desgovernado e fugindo do cursor!
    console.error("ALERTA: Frio na barriga causou instabilidade no ponteiro do mouse!");
}`,
        options: [
            {
                text: "💍 Sim, eu aceito!",
                nextNode: "fase3_vitoria",
                isRunawayButton: true // Identificador para o engine aplicar a fuga
            },
            {
                text: "🛠️ Aplicar Hotfix: try { aceitar() } catch(e) { amarParaSempre(); }",
                nextNode: "fase3_hotfix",
                isHotfixButton: true
            }
        ]
    },

    "fase3_hotfix": {
        id: "fase3_hotfix",
        stage: "Fase 3/3: Hotfix Aplicado no Coração",
        file: "cerimonia_ao_vivo.cpp",
        title: "Patch de Estabilidade Emocional Aplicado!",
        isBossFight: false,
        text: [
            "> [HOTFIX APPLIED]: Heartbeat_Stabilizer.patch instalado com sucesso!",
            "> Tratamento de exceção: O nervosismo foi convertido em AMOR PURO e certeiro.",
            "> O botão de consentimento matrimonial foi ancorado e travado na posição perfeita!",
            "",
            "Você respira fundo, olha nos olhos de quem você ama, sorri com a maior certeza do universo e diz:",
            "'Agora sim... com todo o meu coração!'"
        ],
        code: `// Compilado e assinado com chave criptográfica matrimonial:
const matrimônio = {
    status: "CONFIRMADO",
    noivos: "Casados para Sempre",
    warnings: 0,
    errors: 0,
    felicidade: Infinity
};`,
        options: [
            {
                text: "✨ SIM, COM TODA A CERTEZA DO MUNDO! (Assinar Aliança)",
                nextNode: "fase3_vitoria",
                isConfirmedVictory: true
            }
        ]
    },

    // ==========================================
    // TELA DE VITÓRIA E CRÉDITOS
    // ==========================================
    "fase3_vitoria": {
        id: "fase3_vitoria",
        stage: "Deploy em Produção",
        file: "casados_para_sempre.prod",
        title: "BUILD SUCCESSFUL! CASAMENTO COMPILADO COM SUCESSO!",
        isVictory: true,
        text: [
            "🎉 O SIM MAIS IMPORTANTE DA SUA VIDA FOI DITO!",
            "Os convidados explodem em aplausos, os padrinhos comemoram e uma chuva de confetes digitais toma conta da tela!",
            "",
            "📖 OS PRINCÍPIOS DO CASAMENTO LIMPO (CLEAN MARRIAGE):",
            "  1. Comunicação clara: sem mensagens cifradas.",
            "  2. Refatoração constante: aprender e crescer juntos todos os dias.",
            "  3. Paciência assíncrona: esperar o tempo do outro com carinho e respeito.",
            "",
            "Professor, que essa união seja a prova viva de que o amor é a melhor arquitetura de todas.",
            "Que a nova vida a dois venha com 0 bugs, 0 warnings e felicidade infinita!",
            "",
            "Nossos mais sinceros parabéns e homenagens de toda a turma de programação!"
        ],
        code: `// ==========================================
// RESULTADO DO DEPLOY:
// Status: CASADOS COM SUCESSO!
// Branch: amor/producao-eterna
// Commit: "Para sempre ao seu lado."
// Architecture: Clean Marriage v1.0
// ==========================================`,
        options: [
            {
                text: "🎁 Acessar Lista de Presentes (Deploy em Produção)",
                action: "openGiftModal",
                isHighlighted: true
            },
            {
                text: "🔄 Jogar Novamente (Reviver o Grande Dia)",
                nextNode: "start"
            }
        ]
    }
};

// Exportar globalmente para o engine.js
if (typeof window !== "undefined") {
    window.STORY_DATA = STORY_DATA;
}

