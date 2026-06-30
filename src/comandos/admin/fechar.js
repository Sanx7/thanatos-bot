module.exports = {
    nome: 'fechar',
    descricao: 'Fecha o grupo para apenas administradores falarem',
    categoria: 'admin',
    async executar(socket, msg, args) {
        const deOnde = msg.key.remoteJid;
        if (!deOnde.endsWith('@g.us')) return;

        const metadata = await socket.groupMetadata(deOnde);
        const participantes = metadata.participants;
        const meuJid = socket.user.id.split(':')[0] + '@s.whatsapp.net';
        const remetente = msg.key.participant || msg.key.remoteJid;

        if (!(participantes.find(p => p.id === meuJid)?.admin?.includes('admin'))) return await socket.sendMessage(deOnde, { text: '❌ Falta de privilégios administrativos.' });
        if (!(participantes.find(p => p.id === remetente)?.admin?.includes('admin'))) return await socket.sendMessage(deOnde, { text: '❌ Apenas administradores podem silenciar o chat.' });

        try {
            await socket.groupSettingUpdate(deOnde, 'announcement');
            await socket.sendMessage(deOnde, { text: `🤫 *SILÊNCIO MORTAL.*\n\nO chat foi fechado por ordens superiores. Apenas administradores possuem o direito da palavra agora.` });
        } catch (erro) {
            await socket.sendMessage(deOnde, { text: '❌ Erro ao fechar o grupo.' });
        }
    }
};