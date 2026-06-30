module.exports = {
    nome: 'fechar',
    descricao: 'Restringe o envio de mensagens apenas para administradores',
    categoria: 'admin',
    async executar(socket, msg, args) {
        const deOnde = msg.key.remoteJid;
        if (!deOnde.endsWith('@g.us')) return;

        try {
            // Tenta alterar a configuração direto no WhatsApp
            await socket.groupSettingUpdate(deOnde, 'announcement');
            await socket.sendMessage(deOnde, { 
                text: '🔒 *CHAT FECHADO.*\n\nDecreta-se o silêncio mortal. Apenas administradores purificados podem falar aqui.' 
            });
        } catch (erro) {
            // Se der erro (ex: falta de admin), avisa o chat
            await socket.sendMessage(deOnde, { 
                text: '❌ Preciso ser administrador do grupo para fechar o chat.' 
            });
        }
    }
};