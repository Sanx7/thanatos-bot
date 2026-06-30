const fs = require('fs');
const path = require('path');

// Caminho onde o status do antipay de cada grupo será salvo
const caminhoConfig = path.resolve(__dirname, '..', '..', 'dados', 'antipay.json');

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
    nome: 'antipay',
    descricao: 'Ativa ou desativa o bloqueio de solicitações de pagamento no grupo',
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
            return await socket.sendMessage(deOnde, { text: '🔮 *Uso correto:* `!antipay on` para ativar ou `!antipay off` para desativar.' });
        }

        const configs = lerConfig();
        configs[deOnde] = (acao === 'on');
        fs.writeFileSync(caminhoConfig, JSON.stringify(configs, null, 2));

        if (acao === 'on') {
            await socket.sendMessage(deOnde, { text: '🛡️ *BARREIRA ANTIPAY ATIVADA.*\n\nThánatos agora barra transações financeiras. Tentativas de solicitações de pagamento/PIX por WhatsApp Pay serão deletadas.' });
        } else {
            await socket.sendMessage(deOnde, { text: '⚠️ *BARREIRA ANTIPAY DESATIVADA.*\n\nO envio de solicitações de pagamento foi liberado.' });
        }
    }
};