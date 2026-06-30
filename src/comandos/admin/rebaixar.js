function isAdmin(p) {
    return p?.admin === "admin" || p?.admin === "superadmin";
}

const cooldown = new Map();

module.exports = {
    nome: "rebaixar",
    descricao: "Remove o cargo de administrador de um membro",
    categoria: "admin",

    executar: async (socket, msg, args) => {
        const deOnde = msg.key.remoteJid;
        if (!deOnde.endsWith('@g.us')) return;

        try {
            const sender = msg.key.participant || msg.key.remoteJid;
            const contextInfo = msg.message?.extendedTextMessage?.contextInfo;
            const alvo = contextInfo?.mentionedJid?.[0] || contextInfo?.participant;

            if (!alvo) {
                return socket.sendMessage(deOnde, {
                    text: "❌ Mencione um administrador ou responda à mensagem dele.\nExemplo: !rebaixar @usuario"
                }, { quoted: msg });
            }

            if (cooldown.has(sender)) return;
            cooldown.set(sender, true);
            setTimeout(() => cooldown.delete(sender), 3000);

            const metadata = await socket.groupMetadata(deOnde);
            const senderData = metadata.participants.find(p => p.id === sender);
            const targetData = metadata.participants.find(p => p.id === alvo);

            const isSenderAdmin = isAdmin(senderData) || metadata.owner === sender;

            if (!isSenderAdmin) {
                return socket.sendMessage(deOnde, {
                    text: "💀 Você não possui autoridade para destituir um administrador."
                }, { quoted: msg });
            }

            if (!targetData) {
                return socket.sendMessage(deOnde, {
                    text: "❌ Esta alma não foi encontrada neste grupo."
                }, { quoted: msg });
            }

            if (!isAdmin(targetData)) {
                return socket.sendMessage(deOnde, {
                    text: "🔮 Este usuário já se encontra no plano dos mortais comuns."
                }, { quoted: msg });
            }

            // Tenta rebaixar direto no WhatsApp
            await socket.groupParticipantsUpdate(deOnde, [alvo], "demote");

            await socket.sendMessage(deOnde, {
                text: `⚖️📉 *QUEDA AO TÁRTARO*\n\n☠️ Um líder perdeu sua coroa...\n\n👤 @${alvo.split("@")[0]} foi *REBAIXADO*.\n\n💀 _"Seu poder foi revogado por Thánatos. Retorne ao silêncio junto aos meros mortais."_`,
                mentions: [alvo]
            }, { quoted: msg });

        } catch (err) {
            console.log("Erro no rebaixar:", err);
            await socket.sendMessage(deOnde, {
                text: "❌ Falha ao revogar o poder. Certifique-se de que eu sou Administrador do grupo."
            });
        }
    }
};