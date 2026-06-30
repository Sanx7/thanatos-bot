module.exports = {
    nome: 'abrir',
    descricao: 'Abre o grupo para todos os membros falarem',
    categoria: 'admin',
    async executar(socket, msg, args) {
        const deOnde = msg.key.remoteJid;
        if (!deOnde.endsWith('@g.us')) return;

        const metadata = await socket.groupMetadata(deOnde);
        const participantes = metadata.participants;
        const meuJid = socket.user.id.split(':')[0] + '@s.whatsapp.net';
        const remetente = msg.key.participant || msg.key.remoteJid;

        if (!(participantes.find(p => p.id === meuJid)?.admin?.includes('admin'))) return await socket.sendMessage(deOnde, { text: '❌ Falta de privilégios administrativos.' });
        if (!(participantes.find(p => p.id === remetente)?.admin?.includes('admin'))) return await socket.sendMessage(deOnde, { text: '❌ Apenas administradores podem reabrir o chat.' });

        try {
            await socket.groupSettingUpdate(deOnde, 'not_announcement');
            await socket.sendMessage(deOnde, { text: `🔔 *O SILÊNCIO ACBOU.*\n\nO chat foi reaberto. Os mortais recuperaram o direito de se comunicar.` });
        } catch (erro) {
            await socket.sendMessage(deOnde, { text: '❌ Erro ao abrir o grupo.' });
        }
    }
};