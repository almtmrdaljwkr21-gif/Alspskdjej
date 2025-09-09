const { downloadMediaMessage } = require('@whiskeysockets/baileys');

const allowedMediaTypes = [
  'imageMessage',
  'videoMessage',
  'audioMessage',
  'documentMessage',
  'stickerMessage',
];

module.exports = async ({ sock, msg, text }) => {
  if (text !== 'شسمك') return;

  // رقم الجلسة (صاحب البوت)
  const sessionOwnerJid = sock.user.id.split(':')[0] + '@s.whatsapp.net';

  const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
  if (!quoted) {
    await sock.sendMessage(msg.key.remoteJid, { text: 'حجي اسمي ايتاشي' }, { quoted: msg });
    return;
  }

  // التحقق من نوع الوسائط
  const mediaType = Object.keys(quoted).find(type => allowedMediaTypes.includes(type));
  if (!mediaType) {
    await sock.sendMessage(msg.key.remoteJid, { text: '⚠️ تعرف تقول قيق 😂' }, { quoted: msg });
    return;
  }

  try {
    const mediaBuffer = await downloadMediaMessage(
      { key: msg.message.extendedTextMessage.contextInfo, message: quoted },
      'buffer',
      {},
      { logger: console }
    );

    // تحضير الرسالة بناءً على النوع
    let sendMsg = {};
    switch (mediaType) {
      case 'imageMessage':
        sendMsg = { image: mediaBuffer, caption: '✅ تم استرجاع الصورة (عرض لمرة واحدة)' };
        break;
      case 'videoMessage':
        sendMsg = { video: mediaBuffer, caption: '✅ تم استرجاع الفيديو (عرض لمرة واحدة)' };
        break;
      case 'audioMessage':
        sendMsg = { audio: mediaBuffer, mimetype: 'audio/mpeg', ptt: false };
        break;
      case 'documentMessage':
        sendMsg = {
          document: mediaBuffer,
          mimetype: quoted.documentMessage.mimetype,
          fileName: quoted.documentMessage.fileName || 'ملف_مستعاد',
        };
        break;
      case 'stickerMessage':
        sendMsg = { sticker: mediaBuffer };
        break;
      default:
        sendMsg = { text: '⚠️ نوع الوسائط غير مدعوم' };
    }

    // إرسال الوسائط إلى رقم الجلسة فقط
    await sock.sendMessage(sessionOwnerJid, sendMsg);

  } catch (error) {
    console.error('❌ خطأ في استعادة الوسائط:', error);
    await sock.sendMessage(msg.key.remoteJid, { text: '❌ حدث خطأ أثناء استرجاع الوسائط' }, { quoted: msg });
  }
};
