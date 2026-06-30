const fs = require('fs');
const path = require('path');

// Caminho onde o status do antistatus de cada grupo será salvo
const caminhoConfig = path.resolve(__dirname, '..', '..', 'dados', 'antistatus.json');

function lerConfig() {
    if (!fs.existsSync(caminhoConfig)) {
        const pastaDados = path.dirname(caminhoConfig);
        if (!fs.existsSync(pastaDados)) fs.mkdirSync(pastaDados, { recursive: true });
        fs.writeFileSync(caminhoConfig, JSON.stringify({}));
        return {};
    }
    try {
        return JSON.parse(fs.readFileSync(caminConfig || caminhoConfig, 'utf-8'));
    } catch {
        return {};
    }
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
            return await socket.sendMessage(deOnde, { text: '❌ Apenas administradores podem alterar as defesas do grupo.' });
        }

        const acao = args[0]?.toLowerCase();
        if (acao !== 'on' && acao !== 'off') {
            return await socket.sendMessage(deOnde, { text: '🔮 *Uso correto:* `!antistatus on` para ativar ou `!antistatus off` para desativar.' });
        }

        const configs = lerConfig();
        configs[deOnde] = (acao === 'on');
        fs.writeFileSync(caminhoConfig, JSON.stringify(configs, null, 2));

        if (acao === 'on') {
            // Configura o grupo para que apenas admins possam editar os dados (nome, descrição, foto)
            await socket.groupSettingUpdate(deOnde, 'locked');
            await socket.sendMessage(deOnde, { text: '🛡️ *BARREIRA ANTISTATUS ATIVADA.*\n\nThánatos trancou as configurações do grupo. Apenas administradores podem alterar o nome, descrição ou imagem do recinto.' });
        } else {
            // Libera o grupo para que todos editem
            await socket.groupSettingUpdate(deOnde, 'unlocked');
            await socket.sendMessage(deOnde, { text: '⚠️ *BARREIRA ANTISTATUS DESATIVADA.*\n\nAs configurações de status do grupo foram reabertas para todos os membros.' });
        }
    }
};