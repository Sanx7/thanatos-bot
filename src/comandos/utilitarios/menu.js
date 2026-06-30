module.exports = {
    nome: 'menu',
    descricao: 'Exibe o menu temático do Thánatos Bot',
    categoria: 'utilitarios',
    async executar(socket, msg, args) { // Corrigido para "executar" com X
        const deOnde = msg.key.remoteJid;

        let textoMenu = `     ▲\n`;
        textoMenu += `    💀 *THÁNATOS BOT* 💀\n`;
        textoMenu += `     ▼\n\n`;
        textoMenu += `*"O descanso final para a sua gestão no WhatsApp."*\n\n`;
        textoMenu += `╭───────────────────◆\n`;
        textoMenu += `│ 🔮 *Prefixo:* [ ! ]\n`;
        textoMenu += `│ ⏳ *Status:* Online (Termux)\n`;
        textoMenu += `╰───────────────────◆\n\n`;
        
        textoMenu += `🛡️ ─── *SISTEMAS DE DEFESA* ─── 🛡️\n`;
        textoMenu += `│\n`;
        textoMenu += `│ ⚔️ *!antilink* [on/off] ➔ Purga links de grupos.\n`;
        textoMenu += `│ ⚔️ *!antifake* [on/off] ➔ Bloqueia números gringos.\n`;
        textoMenu += `│ ⚔️ *!antidoc* [on/off] ➔ Rejeita arquivos/documentos.\n`;
        textoMenu += `│ ⚔️ *!antiaudio* [on/off] ➔ Decreta silêncio de voz.\n`;
        textoMenu += `│ ⚔️ *!antipay* [on/off] ➔ Barra pedidos de Pix/Pagamento.\n`;
        textoMenu += `│ ⚔️ *!antistatus* [on/off] ➔ Tranca os dados do grupo.\n`;
        textoMenu += `│\n`;
        textoMenu += `╰────────────────────────◆\n\n`;

        textoMenu += `👑 ─── *MODERAÇÃO* ─── 👑\n`;
        textoMenu += `│\n`;
        textoMenu += `│ ⚔️ *!kick* ➔ Expulsa uma alma temporariamente.\n`;
        textoMenu += `│ ⚔️ *!ban* ➔ Envia definitivamente para o tártaro.\n`;
        textoMenu += `│ ⚔️ *!promover* ➔ Concede cargo de administrador.\n`;
        textoMenu += `│ ⚔️ *!rebaixar* ➔ Retorna o usuário ao plano mortal.\n`;
        textoMenu += `│ ⚔️ *!abrir* ➔ Permite aos mortais voltarem a falar.\n`;
        textoMenu += `│ ⚔️ *!fechar* ➔ Decreta silêncio mortal no chat.\n`;
        textoMenu += `│ ⚔️ *!hidetag* ➔ Convocação suprema de membros.\n`;
        textoMenu += `│\n`;
        textoMenu += `╰────────────────────────◆\n\n`;

        textoMenu += `🪐 ─── *UTILITIES* ─── 🪐\n`;
        textoMenu += `│\n`;
        textoMenu += `│ ⚔️ *!menu* ➔ Invoca esta lista de comandos.\n`;
        textoMenu += `│ ⚔️ *!ping* ➔ Mede a pulsação da conexão.\n`;
        textoMenu += `│\n`;
        textoMenu += `╰────────────────────────◆\n\n`;
        textoMenu += `_Thánatos v1.0.0 — Rodando de forma leve no celular._`;

        await socket.sendMessage(deOnde, { text: textoMenu });
    }
};