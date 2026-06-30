const fs = require('fs');
const path = require('path');

// Caminho onde o status do antiaudio de cada grupo será salvo
const caminhoConfig = path.resolve(__dirname, '..', '..', 'dados', 'antiaudio.json');

function lerConfig() {
    if (!fs.existsSync(caminhoConfig)) {
        const pastaDados = path.dirname(caminhoConfig);
        if (!fs.existsSync(pastaDados)) fs.mkdirSync(pastaDados, { recursive: true });
        fs.writeFileSync(caminhoConfig, JSON.stringify({}));
        return {};
    }
    try {
        return JSON.parse(fs.readFileSync(caminhoConfig, 'utf-8'));
    } catch {
        return {};
    }
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
            return await socket.sendMessage(deOnde, { text: '❌ Apenas administradores podem alterar as defesas do grupo.' });
        }

        const acao = args[0]?.toLowerCase();
        if (acao !== 'on' && acao !== 'off') {
            return await socket.sendMessage(deOnde, { text: '🔮 *Uso correto:* `!antiaudio on` para ativar ou `!antiaudio off` para desativar.' });
        }

        const configs = lerConfig();
        configs[deOnde] = (acao === 'on');
        fs.writeFileSync(caminhoConfig, JSON.stringify(configs, null, 2));

        if (acao === 'on') {
            await socket.sendMessage(deOnde, { text: '🛡️ *BARREIRA ANTIAUDIO ATIVADA.*\n\nThánatos decretou silêncio de voz. Notas de áudio enviadas por membros comuns serão eliminadas.' });
        } else {
            await socket.sendMessage(deOnde, { text: '⚠️ *BARREIRA ANTIAUDIO DESATIVADA.*\n\nOs membros voltaram a ter permissão para enviar mensagens de voz.' });
        }
    }
};