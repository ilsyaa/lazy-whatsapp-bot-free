const db = require('../../utils/db.js');
const moment = require('../../utils/moment.js');
const config = require('../../../config.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    name: "blockchain-mine",
    description: "Mining Blockchain",
    cmd: ['mining', 'mine', 'miner'],
    menu: {
        label: 'blockchain',
    },
    run: async ({ m, sock }) => {
        const intervalTime = getRandomInRange(3, 20); // minutes
        try {
            let mine = db.blockchain.mine.get(m.sender);
            if (mine) return m._sendMessage(m.chat, {
                text: m.lang(msg).userExists.replace('{time}', moment(mine.remaining).diff(moment(), 'minutes')),
                contextInfo: {
                    mentionedJid: [],
                    externalAdReply: {
                        title: `❖ Mining In Progress`,
                        body: `▷ Blockchain`,
                        thumbnail: fs.readFileSync(path.join(config.STORAGE_PATH, 'media/coin.jpg')),
                        sourceUrl: 'https://ilsya.my.id',
                        mediaType: 1,
                        // renderLargerThumbnail: true
                    }
                }
            })
            let expire = moment().add(intervalTime, 'minutes').valueOf();
            db.blockchain.mine.put(m.sender, {
                chat: m.chat,
                address : m.sender,
                intervalTime,
                remaining: expire
            });
            m._sendMessage(m.chat, {
                text: m.lang(msg).success.replace('{time}', intervalTime),
                contextInfo: {
                    mentionedJid: [],
                    externalAdReply: {
                        title: `❖ Mining In Progress`,
                        body: `▷ Blockchain`,
                        thumbnail: fs.readFileSync(path.join(config.STORAGE_PATH, 'media/coin.jpg')),
                        sourceUrl: 'https://ilsya.my.id',
                        mediaType: 1,
                        // renderLargerThumbnail: true
                    }
                }
            }, { quoted: m, ephemeralExpiration: m.ephemeral })
        } catch(error){
            if(error.message == 'Maksimum supply tercapai!') return m._reply(m.lang(msg).maxSupply);
            m._reply(error.message);
        }
    }
}

function getRandomInRange(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

const msg = {
    id: {
        success: '> Mining di mulai, estimasi selesai {time} menit.',
        userExists: '> Sedang ada progress yang berjalan, {time} menit lagi.',
        maxSupply: '> Maksimum supply tercapai!'
    },
    en: {
        success: '> Mining started, Estimated time: {time} minutes.',
        userExists: '> Already mining, {time} minutes left.',
        maxSupply: '> Maximum supply reached!'
    }
}