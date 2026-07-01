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
    nome: 'antidoc',
    descricao: 'Ativa ou desativa o bloqueio de documentos no grupo',
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
            return await socket.sendMessage(deOnde, { text: '🔮 *Uso correto:* `!antidoc on` para ativar ou `!antidoc off` para desativar.' });
        }

        let configs = lerConfiguracoes();

        if (acao === 'on') {
            // Se o ID do grupo não estiver no array antiDocument, adiciona ele
            if (!configs.antiDocument.includes(deOnde)) {
                configs.antiDocument.push(deOnde);
            }
            salvarConfiguracoes(configs);

            await socket.sendMessage(deOnde, { text: '🛡️ *BARREIRA ANTIDOC ATIVADA.*\n\nThánatos salvou a configuração no sistema central e agora rejeita transmissões de arquivos. O envio de documentos está permanentemente vedado a membros comuns.' });
        } else {
            // Remove o ID do grupo do array antiDocument
            configs.antiDocument = configs.antiDocument.filter(id => id !== deOnde);
            salvarConfiguracoes(configs);

            await socket.sendMessage(deOnde, { text: '⚠️ *BARREIRA ANTIDOC DESATIVADA.*\n\nO tráfego de arquivos e documentos foi liberado e removido do registro central.' });
        }
    }
};