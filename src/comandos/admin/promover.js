function isAdmin(p) {
    return p?.admin === "admin" || p?.admin === "superadmin";
}

const cooldown = new Map();

module.exports = {
    nome: "promover",
    descricao: "Concede o cargo de administrador a um membro",
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
                    text: "❌ Mencione um usuário ou responda à mensagem dele.\nExemplo: !promover @usuario"
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
                    text: "💀 Apenas administradores mortais possuem o direito de conceder poder."
                }, { quoted: msg });
            }

            if (!targetData) {
                return socket.sendMessage(deOnde, {
                    text: "❌ Esta alma não foi encontrada nos registros deste grupo."
                }, { quoted: msg });
            }

            if (isAdmin(targetData)) {
                return socket.sendMessage(deOnde, {
                    text: "🔮 Este mortal já faz parte do conselho administrativo."
                }, { quoted: msg });
            }

            // Tenta promover direto no WhatsApp
            await socket.groupParticipantsUpdate(deOnde, [alvo], "promote");

            await socket.sendMessage(deOnde, {
                text: `🔮👑 *ASCENSÃO SUPREMA*\n\n☠️ Um mortal ergueu-se do plano comum...\n\n👤 @${alvo.split("@")[0]} foi *PROMOVIDO*.\n\n💀 _"Pelo decreto de Thánatos, agora você detém a autoridade administrativa. Governe com mãos de ferro."_`,
                mentions: [alvo]
            }, { quoted: msg });

        } catch (err) {
            console.log("Erro no promover:", err);
            await socket.sendMessage(deOnde, {
                text: "❌ Falha ao conceder poder. Certifique-se de que eu sou Administrador do grupo."
            });
        }
    }
};