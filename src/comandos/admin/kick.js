module.exports = {
    nome: 'kick',
    descricao: 'Expulsa um membro do grupo',
    categoria: 'admin',
    async executar(socket, msg, args) {
        const deOnde = msg.key.remoteJid;

        // 1. Verifica se o comando foi enviado dentro de um grupo
        const ehGrupo = deOnde.endsWith('@g.us');
        if (!ehGrupo) {
            return await socket.sendMessage(deOnde, { text: '❌ Este comando só pode ser utilizado em grupos.' });
        }

        // 2. Coleta as informações básicas do grupo e participantes
        const metadata = await socket.groupMetadata(deOnde);
        const participantes = metadata.participants;
        const meuJid = socket.user.id.split(':')[0] + '@s.whatsapp.net';

        // 3. Verifica se o BOT é administrador do grupo
        const botStatus = participantes.find(p => p.id === meuJid);
        const botEhAdmin = botStatus?.admin === 'admin' || botStatus?.admin === 'superadmin';
        if (!botEhAdmin) {
            return await socket.sendMessage(deOnde, { text: '❌ Eu preciso ser administrador do grupo para expulsar alguém.' });
        }

        // 4. Verifica se quem enviou o comando é administrador
        const remetente = msg.key.participant || msg.key.remoteJid;
        const usuarioStatus = participantes.find(p => p.id === remetente);
        const usuarioEhAdmin = usuarioStatus?.admin === 'admin' || usuarioStatus?.admin === 'superadmin';
        if (!usuarioEhAdmin) {
            return await socket.sendMessage(deOnde, { text: '❌ Apenas administradores do grupo podem usar este comando.' });
        }

        // 5. Identifica quem será expulso (por menção ou resposta de mensagem)
        let alvo = null;
        if (msg.message.extendedTextMessage?.contextInfo?.mentionedJid?.length > 0) {
            alvo = msg.message.extendedTextMessage.contextInfo.mentionedJid[0];
        } else if (msg.message.extendedTextMessage?.contextInfo?.participant) {
            alvo = msg.message.extendedTextMessage.contextInfo.participant;
        }

        if (!alvo) {
            return await socket.sendMessage(deOnde, { text: '❌ Marque ou responda à mensagem de quem você deseja expulsar.' });
        }

        // Não deixa o bot se expulsar ou expulsar o dono do grupo
        if (alvo === meuJid) {
            return await socket.sendMessage(deOnde, { text: '❌ Eu não posso me expulsar do grupo.' });
        }

        // 6. Executa a remoção
        try {
            await socket.groupParticipantsUpdate(deOnde, [alvo], 'remove');
            await socket.sendMessage(deOnde, { text: `⚔️ O destino foi selado. Membro banido do grupo.` });
        } catch (erro) {
            console.error(erro);
            await socket.sendMessage(deOnde, { text: '❌ Falha ao tentar banir o usuário.' });
        }
    }
};