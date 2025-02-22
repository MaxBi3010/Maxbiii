const ai = require('unlimited-ai');

// Chỉ sử dụng 1 model duy nhất
const model = 'gpt-4-turbo-2024-04-09';

module.exports.gpt4 = async ({ system, question }) => {
  try {
    // Kiểm tra và log tham số đầu vào
    console.log("Received parameters:", { system, question });

    // Kiểm tra nếu thiếu tham số
    if (!system || !question) {
      return {
        error: "Missing parameters",
        message: "Provide 'system' and 'question'.",
      };
    }

    // Tạo message và gọi API để lấy phản hồi
    const messages = [
      { role: 'system', content: system },
      { role: 'user', content: question }
    ];

    const chat = await ai.generate(model, messages);

    return { success: true, response: chat };
    
  } catch (error) {
    console.error("AI error:", error);
    return { error: "Internal error", message: "Something went wrong. Try again later." };
  }
};