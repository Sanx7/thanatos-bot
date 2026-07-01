const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, getContentType } = require('@whiskeysockets/baileys');
const pino = require('pino');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Configuração do leitor de terminal para o código de emparelhamento
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const question = (text) => new Promise((resolve) => rl.question(text, resolve));

// Objeto para armazenar os comandos carregados na memória
const comandos = {};

// Função para carregar os comandos de todas as subpastas automaticamente
function carregarComandos() {
    const pastaComandos = path.join(__dirname, 'src', 'comandos');
    if (!fs.existsSync(pastaComandos)) return;

    const categorias = fs.readdirSync(pastaComandos);

    console.log('\n🔮 [THÁNATOS] DESPERTANDO COMANDOS...');
    console.log('──────────────────────────────────────');

    for (const category of categorias) {
        const caminhoCategoria = path.join(pastaComandos, category);
        
        if (fs.lstatSync(caminhoCategoria).isDirectory()) {
            const arquivos = fs.readdirSync(caminhoCategoria).filter(arq => arq.endsWith('.js'));
            
            for (const arquivo of arquivos) {
                const comando = require(path.join(caminhoCategoria, arquivo));
                if (comando.nome) {
                    comando.categoria = category; 
                    comandos[comando.nome.toLowerCase()] = comando;
                    console.log(` ⚔️  !${comando.nome.padEnd(10)} ➔ [${category.toUpperCase()}]`);
                }
            }
        }
    }
    console.log('──────────────────────────────────────\n');
}

async function iniciarThanatos() {
    const { state, saveCreds } = await useMultiFileAuthState('./sessao_thanatos');

    const socket = makeWASocket({
        logger: pino({ level: 'silent' }),
        auth: state,
        printQRInTerminal: false // Desativa o QR Code para não bugar o Termux
    });

    // Se não houver sessão salva, solicita o número para emparelhamento por código
    if (!socket.authState.creds.registered) {
        console.log('\n💀 [THÁNATOS] MÉTODO DE EMPARELHAMENTO POR CÓDIGO ATIVADO.');
        const numeroTelefone = await question('📱 Digite o número do bot com DDI e DDD (Ex: 5511999999999): ');
        
        // Remove espaços ou caracteres especiais que o usuário possa digitar
        const numeroLimpo = numeroTelefone.replace(/[^0-9]/g, '');
        
        setTimeout(async () => {
            try {
                const codigo = await socket.requestPairingCode(numeroLimpo);
                console.log('\n──────────────────────────────────────');
                console.log(`🔑 SEU CÓDIGO DE CONEXÃO É: ${codigo}`);
                console.log('──────────────────────────────────────');
                console.log('👉 No celular, vá em: Aparelhos Conectados > Conectar com número de telefone e insira o código acima.\n');
            } catch (erroCodigo) {
                console.error('❌ Erro ao solicitar código de pareamento:', erroCodigo);
            }
        }, 3000);
    }

    socket.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;

        if (connection === 'close') {
            const erroCodigo = lastDisconnect?.error?.output?.statusCode;
            const deveReiniciar = erroCodigo !== DisconnectReason.loggedOut;
            
            console.log(`\n⚠️  [THÁNATOS] A ALMA DO BOT SE DESCONECTOU (Código: ${erroCodigo}).`);
            if (deveReiniciar) {
                console.log('🔄 Tentando reviver o bot...');
                iniciarThanatos();
            }
        } else if (connection === 'open') {
            console.log('\n⚡ [THÁNATOS BOT] CONECTADO AO SUBMUNDO DO WHATSAPP!');
            console.log('📱 Pronto para rodar no Termux.');
            carregarComandos();
        }
    });

    socket.ev.on('creds.update', saveCreds);

    socket.ev.on('messages.upsert', async (m) => {
        const msg = m.messages[0];
        if (!msg.message || msg.key.fromMe) return; 

        const deOnde = msg.key.remoteJid;
        const ehGrupo = deOnde.endsWith('@g.us');

        // Extração avançada e precisa de texto para pegar legendas de links, mídias, etc.
        const texto = msg.message.conversation || 
                      msg.message.extendedTextMessage?.text || 
                      msg.message.imageMessage?.caption || 
                      msg.message.videoMessage?.caption || 
                      '';

        if (ehGrupo) {
            try {
                // Identificadores estáveis de tipo de mensagem via Baileys
                const msgType = getContentType(msg.message);

                console.log(`📩 Mensagem recebida no grupo! Texto: "${texto}" | Tipo Real: ${msgType}`);

                // Força a busca dos dados atualizados do servidor sem cache obsoleto
                const metadata = await socket.groupMetadata(deOnde, false);
                const participantes = metadata.participants;
                
                // Limpeza profunda de JIDs para evitar incompatibilidade de strings de portas (:1, :2, etc)
                const meuJidRaw = socket.user.id.split(':')[0];
                const meuJid = meuJidRaw.includes('@') ? meuJidRaw : `${meuJidRaw}@s.whatsapp.net`;
                
                const remetenteRaw = msg.key.participant || msg.key.remoteJid;
                const remetenteClean = remetenteRaw.split(':')[0];
                const remetente = remetenteClean.includes('@') ? remetenteClean : `${remetenteClean}@s.whatsapp.net`;

                const botEhAdmin = participantes.find(p => p.id.split(':')[0] === meuJid.split(':')[0])?.admin !== undefined;
                const remetenteEhAdmin = participantes.find(p => p.id.split(':')[0] === remetente.split(':')[0])?.admin !== undefined;

                console.log(`🛡️ Verificação -> Bot é Admin? ${botEhAdmin} | Remetente é Admin? ${remetenteEhAdmin}`);

                if (botEhAdmin && !remetenteEhAdmin) {
                    
                    // Integração com o arquivo único do Hipnos (antias.json)
                    const BANCO_CONFIG = path.resolve(__dirname, 'src', 'dados', 'antias.json');
                    let configs = { antiAudio: [], antiDocument: [], antiEvent: [], antiLink: [], antiPayment: [], antiStatus: [] };
                    
                    try {
                        const pastaDados = path.dirname(BANCO_CONFIG);
                        if (!fs.existsSync(pastaDados)) fs.mkdirSync(pastaDados, { recursive: true });
                        
                        if (fs.existsSync(BANCO_CONFIG)) {
                            const conteudo = fs.readFileSync(BANCO_CONFIG, 'utf-8').trim();
                            if (conteudo) {
                                configs = JSON.parse(conteudo);
                            } else {
                                fs.writeFileSync(BANCO_CONFIG, JSON.stringify(configs, null, 2));
                            }
                        } else {
                            fs.writeFileSync(BANCO_CONFIG, JSON.stringify(configs, null, 2));
                        }
                    } catch (e) {
                        console.error("Erro ao ler/inicializar antias.json no index:", e);
                    }

                    // 1️⃣ ANTILINK
                    const antilinkAtivo = configs.antiLink?.includes(deOnde);
                    if (antilinkAtivo && /(https?:\/\/[^\s]+)/g.test(texto)) {
                        await socket.sendMessage(deOnde, { delete: msg.key });
                        await socket.groupParticipantsUpdate(deOnde, [remetente], 'remove');
                        return await socket.sendMessage(deOnde, { 
                            text: `🛡️ *SISTEMA ANTILINK REAGIU.*\n\nA alma de @${remetente.split('@')[0]} tentou espalhar links e foi purgada.`, 
                            mentions: [remetente] 
                        });
                    }

                    // 2️⃣ ANTIFAKE
                    const antifakeAtivo = configs.antiEvent?.includes(deOnde); 
                    if (antifakeAtivo && !remetente.startsWith('55')) {
                        await socket.sendMessage(deOnde, { delete: msg.key });
                        await socket.groupParticipantsUpdate(deOnde, [remetente], 'remove');
                        return await socket.sendMessage(deOnde, { 
                            text: `🛡️ *SISTEMA ANTIFAKE REAGIU.*\n\nO número estrangeiro @${remetente.split('@')[0]} violou o perímetro nacional e foi banido.`, 
                            mentions: [remetente] 
                        });
                    }

                    // 3️⃣ ANTIDOC
                    const antidocAtivo = configs.antiDocument?.includes(deOnde);
                    const ehDocumento = msgType === 'documentMessage' || msgType === 'documentWithCaptionMessage';
                    if (antidocAtivo && ehDocumento) {
                        return await socket.sendMessage(deOnde, { delete: msg.key });
                    }

                    // 4️⃣ ANTIAUDIO
                    const antiaudioAtivo = configs.antiAudio?.includes(deOnde);
                    const ehAudio = msgType === 'audioMessage';
                    if (antiaudioAtivo && ehAudio) {
                        return await socket.sendMessage(deOnde, { delete: msg.key });
                    }

                    // 5️⃣ ANTIPAY
                    const antipayAtivo = configs.antiPayment?.includes(deOnde);
                    const ehPagamento = msgType === 'paymentRequestMessage' || msgType === 'sendPaymentMessage';
                    if (antipayAtivo && ehPagamento) {
                        return await socket.sendMessage(deOnde, { delete: msg.key });
                    }

                    // 6️⃣ ANTI-STATUS
                    const antistatusAtivo = configs.antiStatus?.includes(deOnde);
                    const ehStatusEncaminhado = msgType === 'protocolMessage' || msgType === 'statusMentionMessage';
                    if (antistatusAtivo && ehStatusEncaminhado) {
                        await socket.sendMessage(deOnde, { delete: msg.key });
                        await socket.groupParticipantsUpdate(deOnde, [remetente], 'remove');
                        return await socket.sendMessage(deOnde, { 
                            text: `🛡️ *SISTEMA ANTI-STATUS REAGIU.*\n\nA alma de @${remetente.split('@')[0]} violou o silêncio trazendo mídias de status externas e foi enviada ao Tártaro.`, 
                            mentions: [remetente] 
                        });
                    }

                }
            } catch (erroDefesas) {
                console.error('Erro no processamento dos sistemas de defesa:', erroDefesas);
            }
        }

        const prefixo = '!';
        if (!texto.startsWith(prefixo)) return;

        const argumentos = texto.slice(prefixo.length).trim().split(/ +/);
        const nomeComando = argumentos.shift().toLowerCase();

        const comando = comandos[nomeComando];
        if (comando) {
            try {
                await comando.executar(socket, msg, argumentos);
            } catch (erro) {
                console.error(`❌ Erro ao executar o comando !${nomeComando}:`, erro);
                await socket.sendMessage(deOnde, { text: '❌ Ocorreu um erro interno ao executar este comando.' });
            }
        }
    });
}

iniciarThanatos();

module.exports = { comandos };