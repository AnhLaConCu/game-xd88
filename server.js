const Fastify = require("fastify");
const axios = require("axios");

const fastify = Fastify();

const API_URL = "https://taixiu.system32-cloudfare-356783752985678522.monster/api/luckydice/GetSoiCau";

// Hàm chuyển điểm thành Tài/Xỉu
function getTaiXiu(sum) {
  return sum >= 11 ? "Tài" : "Xỉu";
}

// Dự đoán theo lịch sử gần nhất
function predictNext(history) {
  if (!Array.isArray(history) || history.length === 0) return "Không rõ";
  const last = history[0];
  return getTaiXiu(last.DiceSum); // Dự đoán theo phiên gần nhất
}

fastify.get("/api/luckydice", async (request, reply) => {
  try {
    const res = await axios.get(API_URL);
    const data = res.data;

    if (!Array.isArray(data) || data.length === 0) {
      return reply.send({ error: "Không có dữ liệu" });
    }

    const latest = data[0];

    const result = {
      current_result: getTaiXiu(latest.DiceSum),
      current_session: latest.SessionId,
      next_session: latest.SessionId + 1,
      prediction: predictNext(data),
      timestamp: new Date(latest.CreatedDate).toISOString()
    };

    reply.send(result);
  } catch (err) {
    reply.code(500).send({ error: err.message });
  }
});

fastify.listen({ port: process.env.PORT || 3000, host: "0.0.0.0" }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server chạy tại ${address}`);
});
