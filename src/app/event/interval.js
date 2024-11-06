const db = require('../../utils/db.js')
const moment = require('../../utils/moment.js')
const currency = require('../../utils/currency.js')
const { BlockchainDB } = require('../../utils/blockchain/index.js')
const { delay } = require('@whiskeysockets/baileys')
const config = require('../../../config.js')
const fs = require('fs')
const path = require('path')

module.exports = async (sock) => {
    sendBlockchain()

    setInterval(async () => {
        sendBlockchain()
    }, 60000); // 1 minute

    async function sendBlockchain() {
        const minepending = await db.blockchain.mine.getRange();
        for (const mine of minepending) {
            if (moment().valueOf() > mine.value.remaining) {
                const result = await new BlockchainDB().mine(mine.value.address);
                db.blockchain.mine.remove(mine.value.address);
                let text = `*\`❖ Mining Blockchain Success\`*\n\n`;
                text += `▷ *Address*: ${mine.value.address.split('@')[0]}\n`
                text += `▷ *Reward*: ${currency.format(result.reward)}\n`
                text += `▷ *Remaining Supply*: ${result.remainingSupply}\n`
                text += `▷ *Blocks Until Halving*: ${result.blocksUntilHalving}\n\n`
                text += `▷ *Current Time*: ${moment().format('DD-MM-YYYY HH:mm:ss')}`
                sock.sendMessage(mine.value.chat, {
                    text: text,
                    contextInfo: {
                        mentionedJid: [ mine.value.address ],
                        externalAdReply: {
                            title: `❖ Mining Success`,
                            body: `▷ Blockchain`,
                            thumbnail: fs.readFileSync(path.join(config.STORAGE_PATH, 'media/coin.jpg')),
                            sourceUrl: 'https://ilsya.my.id',
                            mediaType: 1,
                            // renderLargerThumbnail: true
                        }
                    }
                }, { ephemeralExpiration: true })
            }
        }
    }

    async function _sendMessage (jid, content, options) {
        await sock.presenceSubscribe(jid)
		await delay(500)
		await sock.sendPresenceUpdate('composing', jid)
		await delay(500)
		await sock.sendPresenceUpdate('paused', jid)

        options = { ...options, ...{ ephemeralExpiration: true } };
        return await sock.sendMessage(jid, content, options)
    }
}