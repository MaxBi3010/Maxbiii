const ai = require('unlimited-ai');

// Chỉ sử dụng một model duy nhất
const model = 'gpt-4o-mini';

module.exports.gpt4 = async (question) => {
  try {
    // Kiểm tra xem có thiếu tham số không
    if (!question) {
      return {
        error: "Missing parameters",
        message: "Provide 'question'.",
      };
    }

    // Tạo message và gọi API để lấy phản hồi
    const messages = [
      { role: 'system', content: 'You are a helpful assistant.' }, // System message mặc định
      { role: 'user', content: question }
    ];

    // Gọi API để lấy phản hồi từ model gpt-4o-mini
    const chat = await ai.generate(model, messages);

    // Trả về kết quả thành công
    return { success: true, response: chat };

  } catch (error) {
    console.error("AI error:", error);
    return { error: "Internal error", message: "Something went wrong. Try again later." };
  }
};