const axios = require('axios');

async function dl(url) {
    try {
        const data = await require("./HandleFB.js")(url);

        // Kiểm tra xem có dữ liệu hợp lệ hay không
        if (!data || !data.attachments || data.attachments.length === 0) {
            console.log("No data available or no attachments found.");
            return; // Chỉ log và không trả về dữ liệu nếu không có media hợp lệ
        }

        const stream = async (url) => (await axios.get(url, { responseType: 'stream' })).data;
        const title = data.message || "Không có tiêu đề";  // Sử dụng giá trị mặc định nếu không có tiêu đề
        const media = [];

        // Xử lý attachments nếu có
        if (data.queryStorieID) {
            const attachment = data.attachments.find(att => att.id === data.queryStorieID);
            if (attachment && attachment.type === "Video") {
                const link = attachment.url.hd || attachment.url.sd;
                media.push(await stream(link));
            }
        } else {
            for (const att of data.attachments) {
                if (att.type === "Video") {
                    const link = att.url.hd || att.url.sd;
                    media.push(await stream(link));
                } else if (att.type === "Photo") {
                    media.push(await stream(att.url));
                }
            }
        }

        // Nếu có media hợp lệ, gửi thông điệp
        if (media.length > 0) {
            return {
                media,
                title,
                likes: data.like || 0,          // Nếu không có likes thì mặc định là 0
                comments: data.comment || 0,     // Nếu không có comments thì mặc định là 0
                author: data.author || "Không rõ tác giả" // Nếu không có author thì mặc định là "Không rõ tác giả"
            };
        } else {
            console.log("No valid media found to send.");
            return; // Không gửi gì khi không có media hợp lệ
        }
    } catch (err) {
        console.error("Đã xảy ra lỗi:", err);
    }

    console.log("No data to send.");
    return; // Không gửi gì khi xảy ra lỗi
}

module.exports = { dl };