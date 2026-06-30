const fs = require('fs');
const path = require('path');

// Caminho onde o status do antidoc de cada grupo será salvo
const caminhoConfig = path.resolve(__dirname, '..', '..', 'dados', 'antidoc.json');

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
            return await socket.sendMessage(deOnde, { text: '❌ Apenas administradores podem alterar as defesas do grupo.' });
        }

        const acao = args[0]?.toLowerCase();
        if (acao !== 'on' && acao !== 'off') {
            return await socket.sendMessage(deOnde, { text: '🔮 *Uso correto:* `!antidoc on` para ativar ou `!antidoc off` para desativar.' });
        }

        const configs = lerConfig();
        configs[deOnde] = (acao === 'on');
        fs.writeFileSync(caminhoConfig, JSON.stringify(configs, null, 2));

        if (acao === 'on') {
            await socket.sendMessage(deOnde, { text: '🛡️ *BARREIRA ANTIDOC ATIVADA.*\n\nThánatos agora rejeita transmissões de arquivos. O envio de documentos está permanentemente vedado a membros comuns.' });
        } else {
            await socket.sendMessage(deOnde, { text: '⚠️ *BARREIRA ANTIDOC DESATIVADA.*\n\nO tráfego de arquivos e documentos foi liberado no chat.' });
        }
    }
};