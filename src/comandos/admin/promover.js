module.exports = {
    nome: 'promover',
    descricao: 'Promove um membro a administrador do grupo',
    categoria: 'admin',
    async executar(socket, msg, args) {
        const deOnde = msg.key.remoteJid;
        if (!deOnde.endsWith('@g.us')) return await socket.sendMessage(deOnde, { text: '❌ Este comando só pode ser utilizado em grupos.' });

        const metadata = await socket.groupMetadata(deOnde);
        const participantes = metadata.participants;
        const meuJid = socket.user.id.split(':')[0] + '@s.whatsapp.net';

        if (!(participantes.find(p => p.id === meuJid)?.admin?.includes('admin'))) {
            return await socket.sendMessage(deOnde, { text: '❌ Thánatos necessita de privilégios administrativos para outorgar poder.' });
        }

        const remetente = msg.key.participant || msg.key.remoteJid;
        if (!(participantes.find(p => p.id === remetente)?.admin?.includes('admin'))) {
            return await socket.sendMessage(deOnde, { text: '❌ Apenas administradores podem elevar o status de um membro.' });
        }

        let alvo = msg.message.extendedTextMessage?.contextInfo?.mentionedJid?.length > 0 
            ? msg.message.extendedTextMessage.contextInfo.mentionedJid[0] 
            : msg.message.extendedTextMessage?.contextInfo?.participant;

        if (!alvo) return await socket.sendMessage(deOnde, { text: '❌ Indique quem deseja promover marcando a pessoa ou respondendo à sua mensagem.' });

        try {
            await socket.groupParticipantsUpdate(deOnde, [alvo], 'promote');
            await socket.sendMessage(deOnde, { text: `✨ *ASCENSÃO CONCEDIDA.*\n\n@${alvo.split('@')[0]} recebeu a bênção e agora faz parte do conselho de administradores.`, mentions: [alvo] });
        } catch (erro) {
            await socket.sendMessage(deOnde, { text: '❌ Falha ao tentar promover o usuário.' });
        }
    }
};