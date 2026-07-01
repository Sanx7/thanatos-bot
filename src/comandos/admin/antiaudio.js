const fs = require('fs');
const path = require('path');

// Aponta para o arquivo único de configurações (antias.json) que seu bot2.js usa
const BANCO_CONFIG = path.resolve(__dirname, '..', '..', 'dados', 'antias.json');

function lerConfiguracoes() {
    try {
        const pastaDados = path.dirname(BANCO_CONFIG);
        if (!fs.existsSync(pastaDados)) fs.mkdirSync(pastaDados, { recursive: true });
        if (!fs.existsSync(BANCO_CONFIG)) {
            const padrao = { antiAudio: [], antiDocument: [], antiEvent: [], antiLink: [], antiPayment: [], antiStatus: [] };
            fs.writeFileSync(BANCO_CONFIG, JSON.stringify(padrao, null, 2));
            return padrao;
        }
        return JSON.parse(fs.readFileSync(BANCO_CONFIG, 'utf-8'));
    } catch {
        return { antiAudio: [], antiDocument: [], antiEvent: [], antiLink: [], antiPayment: [], antiStatus: [] };
    }
}

function salvarConfiguracoes(config) {
    fs.writeFileSync(BANCO_CONFIG, JSON.stringify(config, null, 2));
}

module.exports = {
    nome: 'antiaudio',
    descricao: 'Ativa ou desativa o bloqueio de mensagens de voz no grupo',
    categoria: 'admin',
    async executar(socket, msg, args) {
        const deOnde = msg.key.remoteJid;
        if (!deOnde.endsWith('@g.us')) return await socket.sendMessage(deOnde, { text: '❌ Este comando só pode ser utilizado em grupos.' });

        const metadata = await socket.groupMetadata(deOnde);
        const participantes = metadata.participants;
        const remetente = msg.key.participant || msg.key.remoteJid;
        const remetenteEhAdmin = participantes.find(p => p.id === remetente)?.admin?.includes('admin');

        if (!remetenteEhAdmin) {
            return await socket.sendMessage(deOnde, { text: '❌ Apenas administradores mortais podem alterar as defesas do grupo.' });
        }

        const acao = args[0]?.toLowerCase();
        if (acao !== 'on' && acao !== 'off') {
            return await socket.sendMessage(deOnde, { text: '🔮 *Uso correto:* `!antiaudio on` para ativar ou `!antiaudio off` para desativar.' });
        }

        let configs = lerConfiguracoes();

        if (acao === 'on') {
            // Se o ID do grupo não estiver no array antiAudio, adiciona ele
            if (!configs.antiAudio.includes(deOnde)) {
                configs.antiAudio.push(deOnde);
            }
            salvarConfiguracoes(configs);

            await socket.sendMessage(deOnde, { text: '🛡️ *BARREIRA ANTIAUDIO ATIVADA.*\n\nThánatos salvou a configuração no sistema central e decretou silêncio de voz. Notas de áudio enviadas por membros comuns serão eliminadas.' });
        } else {
            // Remove o ID do grupo do array antiAudio
            configs.antiAudio = configs.antiAudio.filter(id => id !== deOnde);
            salvarConfiguracoes(configs);

            await socket.sendMessage(deOnde, { text: '⚠️ *BARREIRA ANTIAUDIO DESATIVADA.*\n\nOs membros voltaram a ter permissão para enviar mensagens de voz e o registro foi removido do sistema central.' });
        }
    }
};