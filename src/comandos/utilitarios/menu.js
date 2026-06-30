module.exports = {
    nome: 'menu',
    descricao: 'Exibe o menu temático do Thánatos Bot',
    categoria: 'utilitarios',
    async ejecutar(socket, msg, args) {
        const deOnde = msg.key.remoteJid;

        let textoMenu = `     ▲\n`;
        textoMenu += `    💀 *THÁNATOS BOT* 💀\n`;
        textoMenu += `     ▼\n\n`;
        textoMenu += `*"O descanso final para a sua gestão no WhatsApp."*\n\n`;
        textoMenu += `╭───────────────────◆\n`;
        textoMenu += `│ 🔮 *Prefixo:* [ ! ]\n`;
        textoMenu += `│ ⏳ *Status:* Online (Termux)\n`;
        textoMenu += `╰───────────────────◆\n\n`;
        
        textoMenu += `🛡️ ─── *ADMINISTRAÇÃO* ─── 🛡️\n`;
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