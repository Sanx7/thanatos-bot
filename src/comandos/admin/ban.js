module.exports = {
    nome: 'ban',
    descricao: 'Bane definitivamente um membro do grupo',
    categoria: 'admin',
    async executar(socket, msg, args) {
        const deOnde = msg.key.remoteJid;
        if (!deOnde.endsWith('@g.us')) return await socket.sendMessage(deOnde, { text: '❌ Este comando só pode ser utilizado em grupos.' });

        const metadata = await socket.groupMetadata(deOnde);
        const participantes = metadata.participants;
        const meuJid = socket.user.id.split(':')[0] + '@s.whatsapp.net';

        if (!(participantes.find(p => p.id === meuJid)?.admin?.includes('admin'))) {
            return await socket.sendMessage(deOnde, { text: '❌ Erro de autoridade: Thánatos necessita de privilégios administrativos para ceifar.' });
        }

        const remetente = msg.key.participant || msg.key.remoteJid;
        if (!(participantes.find(p => p.id === remetente)?.admin?.includes('admin'))) {
            return await socket.sendMessage(deOnde, { text: '❌ Apenas juízes do submundo (administradores) podem invocar este poder.' });
        }

        let alvo = msg.message.extendedTextMessage?.contextInfo?.mentionedJid?.length > 0 
            ? msg.message.extendedTextMessage.contextInfo.mentionedJid[0] 
            : msg.message.extendedTextMessage?.contextInfo?.participant;

        if (!alvo) return await socket.sendMessage(deOnde, { text: '❌ Indique a alma que deseja banir marcando-a ou respondendo à sua mensagem.' });
        if (alvo === meuJid) return await socket.sendMessage(deOnde, { text: '❌ Não posso ceifar minha própria existência.' });

        try {
            await socket.groupParticipantsUpdate(deOnde, [alvo], 'remove');
            await socket.sendMessage(deOnde, { text: `💀 *A foice cantou.* @${alvo.split('@')[0]} foi banido definitivamente para o tártaro.`, mentions: [alvo] });
        } catch (erro) {
            await socket.sendMessage(deOnde, { text: '❌ Falha ao tentar banir a alma.' });
        }
    }
};