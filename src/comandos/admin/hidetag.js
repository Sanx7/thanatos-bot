module.exports = {
    nome: 'hidetag',
    descricao: 'Marca todos os membros do grupo de forma oculta',
    categoria: 'admin',
    async executar(socket, msg, args) {
        const deOnde = msg.key.remoteJid;
        if (!deOnde.endsWith('@g.us')) return;

        const metadata = await socket.groupMetadata(deOnde);
        const participantes = metadata.participants;
        const remetente = msg.key.participant || msg.key.remoteJid;

        if (!(participantes.find(p => p.id === remetente)?.admin?.includes('admin'))) {
            return await socket.sendMessage(deOnde, { text: '❌ Apenas administradores podem invocar o hidetag.' });
        }

        // Pega o texto que veio depois do comando ou deixa um aviso padrão
        const aviso = args.join(' ') || '⚠️ Thánatos requer a atenção de todos os presentes neste recinto.';
        
        // Mapeia o ID de todo mundo do grupo
        const jidsMembros = participantes.map(p => p.id);

        try {
            await socket.sendMessage(deOnde, { 
                text: `🔮 *CONVOCAÇÃO DO ALÉM*\n───────────────────\n\n${aviso}`, 
                mentions: jidsMembros 
            });
        } catch (erro) {
            await socket.sendMessage(deOnde, { text: '❌ Falha ao invocar os membros.' });
        }
    }
};