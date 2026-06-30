const fs = require('fs');
const path = require('path');

// Caminho onde o status de cada grupo será salvo
const caminhoConfig = path.resolve(__dirname, '..', '..', 'dados', 'antilink.json');

// Função auxiliar para ler o arquivo JSON com segurança
function lerConfig() {
    if (!fs.existsSync(caminhoConfig)) {
        // Se o arquivo não existir, cria a pasta de dados e um JSON vazio
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
    nome: 'antilink',
    descricao: 'Ativa ou desativa o sistema de proteção contra links no grupo',
    categoria: 'admin',
    async executar(socket, msg, args) {
        const deOnde = msg.key.remoteJid;
        if (!deOnde.endsWith('@g.us')) return await socket.sendMessage(deOnde, { text: '❌ Este comando só pode ser utilizado em grupos.' });

        // Validação de permissão do remetente
        const metadata = await socket.groupMetadata(deOnde);
        const participantes = metadata.participants;
        const remetente = msg.key.participant || msg.key.remoteJid;
        const remetenteEhAdmin = participantes.find(p => p.id === remetente)?.admin?.includes('admin');

        if (!remetenteEhAdmin) {
            return await socket.sendMessage(deOnde, { text: '❌ Apenas administradores podem alterar as defesas do grupo.' });
        }

        const acao = args[0]?.toLowerCase();
        if (acao !== 'on' && acao !== 'off') {
            return await socket.sendMessage(deOnde, { text: '🔮 *Uso correto:* `!antilink on` para ativar ou `!antilink off` para desativar.' });
        }

        // Lê o estado atual dos grupos, modifica e salva de volta
        const configs = lerConfig();
        configs[deOnde] = (acao === 'on');
        fs.writeFileSync(caminhoConfig, JSON.stringify(configs, null, 2));

        if (acao === 'on') {
            await socket.sendMessage(deOnde, { text: '🛡️ *BARREIRA ATIVADA.*\n\nO Antilink do Thánatos está vigilante neste chat. Qualquer link externo resultará na purgação da alma.' });
        } else {
            await socket.sendMessage(deOnde, { text: '⚠️ *BARREIRA DESATIVADA.*\n\nO Antilink foi desligado. Os portões do submundo estão abertos para links temporariamente.' });
        }
    }
};