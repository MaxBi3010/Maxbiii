const axios = require('axios');
const fs = require("fs-extra");
const stringSimilarity = require('string-similarity');
const Groq = require('groq-sdk');

const apiKey = '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';

const systemPrompt = "Chủ yếu trả lời ngắn gọn như 1 hoặc 2 câu trừ khi yêu cầu câu trả lời dài như tiểu luận, bài thơ hoặc câu chuyện, v.v. Phân tích lời nhắc và câu trả lời theo hướng dẫn và chỉ phần cần thiết. Không có chất độn bổ sung.";

class Module {
    constructor() {
        this.dataThread = null;
        this.dataFilePath = __dirname + "/cache/simsim/data.json";
    }

    async onLoad({ models }) {
        if (!fs.existsSync(__dirname + "/cache/simsim")) {
            fs.mkdirSync(__dirname + "/cache/simsim", { recursive: true });
        }
        if (!fs.existsSync(this.dataFilePath)) {
            fs.writeFileSync(this.dataFilePath, JSON.stringify({}));
        }
        this.dataThread = JSON.parse(fs.readFileSync(this.dataFilePath));
        const Threads = models.use('Threads');
        const data = await Threads.findAll();
        data.forEach(({ threadID }) => {
            if (!(threadID in this.dataThread)) {
                this.dataThread[threadID] = false;
                console.log(`Tìm thấy thread mới: ${threadID}`);
            }
        });
        fs.writeFileSync(this.dataFilePath, JSON.stringify(this.dataThread, null, 2));
    }

 run({ api, event }) {
        const threadID = event.threadID;
        const isBotResponseEnabled = this.dataThread[threadID] || false;
        const newBotResponseEnabled = !isBotResponseEnabled;
        this.dataThread[threadID] = newBotResponseEnabled;
        try {
            fs.writeFileSync(this.dataFilePath, JSON.stringify(this.dataThread, null, 2));
        } catch (error) {
            console.log("Không thể ghi tệp dữ liệu: ", error);
        }
        const message = newBotResponseEnabled ? "bật" : "tắt";
        api.sendMessage(`[ 𝐒𝐈𝐌 ] đã ${message} thành công bot hóa thành con dâm/nhà thông thái khi bạn gọi!`, threadID, (error, info) => {
            if (error) {
                console.log("Gửi tin nhắn thất bại: ", error);
            }
        });
    }

    getAskedResponse(text) {
        const formData = new URLSearchParams();
        formData.append('text', text);
        formData.append('lc', 'vn');
        return axios.post('https://simsimi.vn/web/simtalk', formData)
            .then(({ data }) => data.success)
            .catch(err => Promise.reject(err));
    }

async handleEvent({ api, event }) {
    const { usages } = this.config;
    const userInput = event.body.toLowerCase();
    const threadID = event.threadID;

    if (this.dataThread[threadID]) {
        const bestMatchBot = stringSimilarity.findBestMatch(userInput, usages);
        const similarityRatioBot = bestMatchBot.bestMatch.rating;

        if (event.senderID !== api.getCurrentUserID() && similarityRatioBot >= 0.9) {
            const responseOptions = "Chọn một trong các tuỳ chọn sau:\n1. Chat vui\n2. Chat AI";
            return api.sendMessage(responseOptions, threadID, (err, info) => {
                if (!err) {
                    global.client.handleReply.push({
                        name: this.config.name,
                        messageID: info.messageID,
                        author: event.senderID,
                        type: "chooseChat"
                    });
                }
            }, event.messageID);
        }
    }
}

async handleReply({ api, event, handleReply }) {
    const threadID = event.threadID;

    if (!this.dataThread[threadID]) {
        return; // Nếu bot không được bật, không xử lý các lựa chọn tiếp theo
    }

    switch (handleReply.type) {
        case "chooseChat": {
            const choice = event.body.trim();
            if (choice === "1") {
                return api.sendMessage("Bạn đã chọn Chat vui. Hãy nhập tin nhắn để bắt đầu.", event.threadID, (err, info) => {
                    if (!err) {
                        global.client.handleReply.push({
                            name: this.config.name,
                            messageID: info.messageID,
                            author: event.senderID,
                            type: "funChat"
                        });
                    }
                }, event.messageID);
            } else if (choice === "2") {
                return api.sendMessage("Bạn đã chọn Chat GPT. Hãy nhập tin nhắn để bắt đầu.", event.threadID, (err, info) => {
                    if (!err) {
                        global.client.handleReply.push({
                            name: this.config.name,
                            messageID: info.messageID,
                            author: event.senderID,
                            type: "gptChat"
                        });
                    }
                }, event.messageID);
            } else {
                return api.sendMessage("Lựa chọn không hợp lệ. Vui lòng chọn 1 hoặc 2.", event.threadID, (err, info) => {
                    if (!err) {
                        global.client.handleReply.push({
                            name: this.config.name,
                            messageID: info.messageID,
                            author: event.senderID,
                            type: "chooseChat"
                        });
                    }
                }, event.messageID);
            }
        }
            case "funChat": {
                api.setMessageReaction("⌛", event.messageID, () => { }, true);

                const startTime = Date.now();

                try {
                    const response = await this.getAskedResponse(event.body);
                    const endTime = Date.now();
                    const completionTime = ((endTime - startTime) / 1000).toFixed(2);
                    const totalWords = response.split(/\s+/).filter(word => word !== '').length;

                    const finalMessage = `${response}`;

                    api.sendMessage(finalMessage, event.threadID, (err, info) => {
                        if (!err) {
                            global.client.handleReply.push({
                                name: this.config.name,
                                messageID: info.messageID,
                                author: event.senderID,
                                type: "funChat"
                            });
                        }
                    });

                    api.setMessageReaction("✅", event.messageID, () => { }, true);
                } catch (error) {
                    api.setMessageReaction("❌", event.messageID, () => { }, true);
                    return api.sendMessage(`An error occurred: ${error.message}`, event.threadID, event.messageID);
                }
                break;
            }
            case "gptChat": {
                const prompt = event.body;
                const threadID = event.threadID;

                api.setMessageReaction("⌛", event.messageID, () => { }, true);

                const startTime = Date.now();

                try {
                    const chatMessages = [
                        { role: "system", content: systemPrompt },
                        { role: "user", content: prompt }
                    ];

                    const groq = new Groq({ apiKey });
                    const chatCompletion = await groq.chat.completions.create({
                        messages: chatMessages,
                        model: "llama3-70b-8192",
                        temperature: 0.6,
                        max_tokens: 8192,
                        top_p: 0.8,
                        stream: false,
                        stop: null
                    });

                    const assistantResponse = chatCompletion.choices[0].message.content;

                    const endTime = Date.now();
                    const completionTime = ((endTime - startTime) / 1000).toFixed(2);
                    const totalWords = assistantResponse.split(/\s+/).filter(word => word !== '').length;

                    const finalMessage = `${assistantResponse}`;

                    api.sendMessage(finalMessage, threadID, (err, info) => {
                        if (!err) {
                            global.client.handleReply.push({
                                name: this.config.name,
                                messageID: info.messageID,
                                author: event.senderID,
                                type: "gptChat"
                            });
                        }
                    });

                    api.setMessageReaction("✅", event.messageID, () => { }, true);
                } catch (error) {
                    api.setMessageReaction("❌", event.messageID, () => { }, true);
                    return api.sendMessage(`An error occurred: ${error.message}`, threadID, event.messageID);
                }
                break;
            }
        }
    }

    get config() {
        return {
            name: "sim",
            description: "lựa chọn chat vui/chat gpt",
            version: "2.0.0",
            credits: 'Vdang',
            hasPermssion: 2,
            commandCategory: "Quản trị viên",
            usages: ["bot"],
            //gptUsages: ["gpt ơi", "ơi gpt", "gpt đâu rồi", "gpt đẹp"],
            answer: ["Bot nghe!", "Ơi em đây!!","ơiiiii"],
            cooldowns: 5
        };
    }
}

module.exports = new Module();
