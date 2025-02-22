'use strict';
const axios = require('axios');
const CryptoJS = require('crypto-js');

const _e = {
  J2DOWN_SECRET: "U2FsdGVkX18wVfoTqTpAQwAnu9WB9osIMSnldIhYg6rMvFJkhpT6eUM9YqgpTrk41mk8calhYvKyhGF0n26IDXNmtXqI8MjsXtsq0nnAQLROrsBuLnu4Mzu63mpJsGyw",
  API_URL: "https://api.zm.io.vn/v1/"
};

function isRegexURL(url) {
  const regex = /(?:(?:https?|ftp|file):\/\/|www\.|ftp\.)(?:[-A-Z0-9+&@#\/%=~_|$?!:,.]*|[-A-Z0-9+&@#\/%=~_|$?!:,.])*(?:[-A-Z0-9+&@#\/%=~_|$?!:,.]*|[A-Z0-9+&@#\/%=~_|$])/igm;
  const match = url.match(regex);
  const cleanUrl = match ? match[0] : url;
  return /^(?:https?:\/\/)?(?:[\w-]+\.)?(tiktok|douyin|iesdouyin|capcut|instagram|threads|facebook|fb|espn|kuaishou|pinterest|pin|imdb|imgur|ifunny|reddit|youtube|youtu|twitter|x|t|vimeo|snapchat|bilibili|dailymotion|sharechat|linkedin|tumblr|hipi|getstickerpack|xvideos|xnxx|xiaohongshu|xhslink|weibo|miaopai|meipai|xiaoying|nationalvideo|yingke|soundcloud|mixcloud|spotify|zingmp3|bitchute|febspot|bandcamp|izlesene|9gag|rumble|streamable|ted|sohu|ixigua|likee|sina)\.[a-z]{2,}(\/.*)?$/i.test(cleanUrl);
}

function secretKey() {
  const decrypted = CryptoJS.AES.decrypt(_e.J2DOWN_SECRET, "manhg-api");
  return decrypted.toString(CryptoJS.enc.Utf8);
}

function randomString(length) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function encryptData(data) {
  const key = CryptoJS.enc.Hex.parse(secretKey());
  const iv = CryptoJS.lib.WordArray.random(16);
  const encrypted = CryptoJS.AES.encrypt(data, key, {
    iv: iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7
  });

  return {
    iv: iv.toString(CryptoJS.enc.Hex),
    k: randomString(11) + "8QXBNv5pHbzFt5QC",
    r: "BRTsfMmf3CuN",
    encryptedData: encrypted.toString()
  };
}

module.exports.dlj2 = async (url) => {
  try {
    if (!url || !url.trim()) {
      return "Thiếu URL";
    }
    if (!isRegexURL(url)) {
      return "URL không hợp lệ!";
    }

    const data = JSON.stringify({ url: url, unlock: true });
    const encryptedData = encryptData(data);

    const response = await axios.post(_e.API_URL + "social/autolink", {
      data: encryptedData
    }, {
      headers: {
        "content-type": "application/json",
        "token": "eyJ0eXAiOiJqd3QiLCJhbGciOiJIUzI1NiJ9.eyJxxx" // Thay thế bằng token thực tế
      }
    });

    return response.data;
  } catch (error) {
    console.error("Error:", error.message);
    if (error.response) {
      console.error("Response data:", error.response.data);
      console.error("Response status:", error.response.status);
    }
    return "Có lỗi xảy ra khi xử lý yêu cầu";
  }
};