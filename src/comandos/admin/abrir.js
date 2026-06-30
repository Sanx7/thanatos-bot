module.exports = {
    nome: 'abrir',
    descricao: 'Permite que todos os membros enviem mensagens no grupo',
    categoria: 'admin',
    async executar(socket, msg, args) {
        const deOnde = msg.key.remoteJid;
        if (!deOnde.endsWith('@g.us')) return;

        try {
            // Tenta alterar a configuração direto no WhatsApp
            await socket.groupSettingUpdate(deOnde, 'not_announcement');
            await socket.sendMessage(deOnde, { 
                text: '🔓 *CHAT ABERTO.*\n\nThánatos permitiu que os mortais voltem a falar neste recinto.' 
            });
        } catch (erro) {
            // Se der erro (ex: falta de admin), avisa o chat
            await socket.sendMessage(deOnde, { 
                text: '❌ Preciso ser administrador do grupo para abrir o chat.' 
            });
        }
    }
};