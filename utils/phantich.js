const { readFileSync, writeFileSync, unlinkSync, createReadStream } = require("fs");
const axios = require("axios");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI("AIzaSyAPNdMHmcfM7f3-TEepZGrHBDPBAmBfPUY");
exports.api = (api, callback) => {
if(callback == "phantich"){
return phantich(api)
}
else if(callback == "gemini_chat"){
return gemini_chat(api)
}

try {
var data = readFileSync(__dirname + "/json/" + api, "utf-8")
let d = JSON.parse(data)
return d[Math.floor(Math.random() * d.length)]
} catch (e) {
const data = readFileSync(__dirname + "/json/" + api, "utf-8").split("\n")
const t = JSON.stringify(data)
const d = JSON.parse(t)
return d[Math.floor(Math.random() * d.length)]
}
}
async function phantich(api){
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
    const prompt = "phân tích ảnh này";
    const res = await axios.get(api, { responseType: 'arraybuffer' });
    const path = process.cwd() + `/modules/commands/cache/${Date.now()}.jpg`;
    writeFileSync(path, res.data);
    setTimeout(p => unlinkSync(p), 1000 * 60, path);
    const image = { inlineData: { data: Buffer.from(readFileSync(path)).toString("base64"), mimeType: "image/png" }};
    const result = await model.generateContent([prompt, image]);
    return result.response.text()
    }
    async function gemini_chat (prompt){
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest"});
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    return text;
    }
