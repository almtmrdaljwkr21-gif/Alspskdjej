const axios = require("axios");

// تخزين الجلسات النشطة لكل مستخدم
const userSessions = {};

module.exports = {
  name: "talk",
  alias: ["تحدث", "إيتاشي"],
  category: "ai",
  desc: "تفعيل المحادثة الذكية مع إيتاشي",
  async run({ sock, m, text, reply }) {
    const command = text.trim();

    // ✅ تفعيل المحادثة
    if (command === "تحدث معي يا إيتاشي") {
      userSessions[m.sender] = true;
      return reply(
        `*مرحباً بك في وضع المحادثة الذكية!* \n\n` +
        `✅ تم تفعيل المحادثة مع إيتاشي.\n` +
        `💬 أرسل لي أي رسالة وسأرد عليك.\n\n` +
        `🛑 لإيقاف المحادثة أرسل: توقف\n` +
        `━━━━━━━━━━━━━━━\n` +
        `⚡ استمتع بالتجربة!`
      );
    }

    // ✅ إيقاف المحادثة
    if (command === "توقف") {
      delete userSessions[m.sender];
      return reply("✅ تم إيقاف المحادثة.");
    }

    // ✅ الرد إذا الوضع مفعّل
    if (userSessions[m.sender]) {
      try {
        if (!text) return;

        await sock.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });

        const apiUrl = `https://vapis.my.id/api/openai?q=${encodeURIComponent(text)}`;
        const { data } = await axios.get(apiUrl);

        if (!data || !data.result) {
          return reply("❌ لم أتمكن من الرد الآن.");
        }

        await reply(`🤖 إيتاشي يرد:\n\n${data.result}`);
        await sock.sendMessage(m.chat, { react: { text: "✅", key: m.key } });

      } catch (err) {
        console.error("AI Chat Error:", err.message);
        reply("❌ حدث خطأ أثناء الاتصال بالذكاء الاصطناعي.");
      }
    }
  }
};
