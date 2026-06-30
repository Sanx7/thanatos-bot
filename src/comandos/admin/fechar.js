module.exports = {
    nome: 'fechar',
    descricao: 'Restringe o envio de mensagens apenas para administradores',
    categoria: 'admin',
    async executar(socket, msg, args) {
        const deOnde = msg.key.remoteJid;
        if (!deOnde.endsWith('@g.us')) return;

        try {
            const metadata = await socket.groupMetadata(deOnde);
            const participantes = metadata.participants;
            
            // Tratamento correto do ID do bot para evitar o erro de privilégios
            const meuJid = socket.user.id.split(':')[0] + '@s.whatsapp.net';
            const remetente = msg.key.participant || msg.key.remoteJid;

            const botEhAdmin = participantes.find(p => p.id === meuJid)?.admin?.includes('admin');
            const remetenteEhAdmin = participantes.find(p => p.id === remetente)?.admin?.includes('admin');

            if (!remetenteEhAdmin) {
                return await socket.sendMessage(deOnde, { text: '❌ Apenas administradores mortais podem usar este comando.' });
            }

            if (!botEhAdmin) {
                return await socket.sendMessage(deOnde, { text: '❌ Eu preciso de privilégios administrativos (ser Admin) para fechar o chat.' });
            }

            await socket.groupSettingUpdate(deOnde, 'announcement');
            await socket.sendMessage(deOnde, { text: '🔒 *CHAT FECHADO.*\n\nDecreta-se o silêncio mortal. Apenas administradores purificados podem falar aqui.' });

        } catch (erro) {
            console.error(erro);
            await socket.sendMessage(deOnde, { text: '❌ Ocorreu um erro ao tentar fechar o grupo.' });
        }
    }
};