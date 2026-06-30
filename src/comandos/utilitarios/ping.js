module.exports = {
    nome: 'ping',
    descricao: 'Testa a velocidade de resposta do Thánatos Bot',
    async executar(socket, msg, args) {
        const deOnde = msg.key.remoteJid;
        
        // Envia a resposta de volta para o chat
        await socket.sendMessage(deOnde, { text: '🏓 Pong! O sistema modular do Thánatos está funcionando.' });
    }
};