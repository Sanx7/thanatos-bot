const fs = require('fs');
const path = require('path');

// Aponta para o arquivo único de configurações do Hipnos que seu bot2.js usa agora
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
    nome: 'antistatus',
    descricao: 'Ativa ou desativa a barreira contra alterações de status/dados do grupo por membros',
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
            return await socket.sendMessage(deOnde, { text: '🔮 *Uso correto:* `!antistatus on` para ativar ou `!antistatus off` para desativar.' });
        }

        let configs = lerConfiguracoes();

        if (acao === 'on') {
            // Se o ID do grupo não estiver na lista de antiStatus, adiciona ele
            if (!configs.antiStatus.includes(deOnde)) {
                configs.antiStatus.push(deOnde);
            }
            salvarConfiguracoes(configs);

            // Configura o grupo para que apenas admins possam editar os dados (nome, descrição, foto)
            await socket.groupSettingUpdate(deOnde, 'locked');
            await socket.sendMessage(deOnde, { text: '🛡️ *BARREIRA ANTISTATUS ATIVADA.*\n\nThánatos salvou a configuração no sistema central e trancou as configurações do grupo. Apenas administradores podem alterar o nome, descrição ou imagem do recinto.' });
        } else {
            // Remove o ID do grupo da lista de antiStatus
            configs.antiStatus = configs.antiStatus.filter(id => id !== deOnde);
            salvarConfiguracoes(configs);

            // Libera o grupo para que todos editem
            await socket.groupSettingUpdate(deOnde, 'unlocked');
            await socket.sendMessage(deOnde, { text: '⚠️ *BARREIRA ANTISTATUS DESATIVADA.*\n\nAs configurações de status do grupo foram reabertas e removidas do registro central.' });
        }
    }
};