import dotenv from "dotenv";
dotenv.config();

import http from "http";
import { app } from "./app";
import { initSocket } from "./modules/realtime/socket";
import { loadQuestionCache } from "./config/loadQuestions";


const PORT = process.env.PORT || 4000;

const server = http.createServer(app);

// attach websocket
initSocket(server);

server.listen(PORT, async () => {
  await loadQuestionCache();
  console.log(`Server running on port ${PORT}`);
});

