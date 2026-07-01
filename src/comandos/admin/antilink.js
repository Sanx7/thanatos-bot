const fs = require('fs');
const path = require('path');

const BANCO_CONFIG = path.resolve(__dirname, '..', '..', 'dados', 'antias.json');

function lerConfiguracoes() {
    try {
        if (!fs.existsSync(BANCO_CONFIG)) return { antiAudio: [], antiDocument: [], antiEvent: [], antiLink: [], antiPayment: [], antiStatus: [] };
        return JSON.parse(fs.readFileSync(BANCO_CONFIG, 'utf-8'));
    } catch {
        return { antiAudio: [], antiDocument: [], antiEvent: [], antiLink: [], antiPayment: [], antiStatus: [] };
    }
}

function salvarConfiguracoes(config) {
    fs.writeFileSync(BANCO_CONFIG, JSON.stringify(config, null, 2));
}

module.exports = {
    nome: 'antilink',
    descricao: 'Bane quem envia links de grupos',
    categoria: 'admin',
    async executar(socket, msg, args) {
        const deOnde = msg.key.remoteJid;
        if (!deOnde.endsWith('@g.us')) return;

        const metadata = await socket.groupMetadata(deOnde);
        const remetente = msg.key.participant || msg.key.remoteJid;
        const remetenteEhAdmin = metadata.participants.find(p => p.id === remetente)?.admin?.includes('admin');

        if (!remetenteEhAdmin) return await socket.sendMessage(deOnde, { text: '❌ Apenas administradores podem alterar as defesas.' });

        const acao = args[0]?.toLowerCase();
        if (acao !== 'on' && acao !== 'off') return await socket.sendMessage(deOnde, { text: '🔮 *Uso correto:* `!antilink on` ou `!antilink off`.' });

        let configs = lerConfiguracoes();

        if (acao === 'on') {
            if (!configs.antiLink.includes(deOnde)) configs.antiLink.push(deOnde);
            salvarConfiguracoes(configs);
            await socket.sendMessage(deOnde, { text: '🛡️ *ANTILINK ATIVADO.*\n\nThánatos agora monitora os links e purgará quem os enviar.' });
        } else {
            configs.antiLink = configs.antiLink.filter(id => id !== deOnde);
            salvarConfiguracoes(configs);
            await socket.sendMessage(deOnde, { text: '⚠️ *ANTILINK DESATIVADA.*\n\nLinks voltaram a ser permitidos.' });
        }
    }
};