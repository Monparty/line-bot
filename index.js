const express = require('express');
const app = express();
const line = require('@line/bot-sdk');
require('dotenv').config();

// package เกี่ยวกับการทำงานกับไฟล์
const util = require('util');
const fs = require('fs');
const path = require('path');
const { pipeline } = require('stream');

const config = {
    channelAccessToken: process.env.token,
    channelSecret: process.env.secretcode
}

app.post('/wedhook', line.middleware(config), (req, res) => {
    Promise
        .all([
            req.body.events.map(handleEvent)
        ])
        .then((result) => res.json(result))
});

const client = new line.Client(config);

// ส่งข้อความไปยังผู้ใช้
/*
client.pushMessage("U1d5d2d88f410b485ac56fb9ab3432fe2", [
    {
        "type": "sticker",
        "packageId": "789",
        "stickerId": "10857"
    }
])
*/

// ฟังก์ชัน handleEvent ใช้สำหรับการตอบกลับข้อความ
async function handleEvent(event) {
    console.log(event);
    if (event.message.type == 'image') {
        if (event.message.contentProvider.type === 'line') {
            const dlpath = path.join(__dirname, 'download', `${event.message.id}.jpg`);
            await downloadContent(event.message.id, dlpath);

            return client.replyMessage(event.replyToken, [
                {
                    "type": "text",
                    "text": `Download เรียบร้อย`,
                    "quoteToken": event.message.quoteToken
                }
            ])
        }
    } else {
        return client.replyMessage(event.replyToken, [
            {
                "type": "text",
                "text": `รับทราบครับ`,
                "quoteToken": event.message.quoteToken
            }
        ])
    }
}

async function downloadContent(mid, downloadpath) {
    const stream = await client.getMessageContent(mid);
    const pipelineSync = util.promisify(pipeline);
    const folder_download = fs.createWriteStream(downloadpath);
    await pipelineSync(stream, folder_download);
}

app.get('/', (req, res) => {
    res.send('ok');
});

app.listen(3000, () => console.log('Server is running on port 3000'));