/*import express from 'express';
import initApp from './src/index.router.js';
import 'dotenv/config';

const app = express();
const PORT = process.env.PORT || 3000;
initApp(app,express);

app.listen(PORT,()=>{
    console.log(`server is running ... ${PORT}`);
}) 
*/
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import 'dotenv/config';

import initApp from './src/index.router.js';
import { setupChatSocket } from './src/modules/chat/socket/socket.controller.js'; // تأكد من المسار

const app = express();

// ميدلوير للتعامل مع JSON و CORS
app.use(cors());
app.use(express.json());

// السيرفر عبر http (حتى نمرر io مع socket.io)
const server = http.createServer(app);

// تهيئة socket.io وربطها بالسيرفر
const io = new Server(server, {
  cors: {
    origin: "*", // عدّلها لاحقًا لعنوان موقعك
    methods: ["GET", "POST"]
  }
});

// تمرير io لمنطق المحادثة socket
setupChatSocket(io);

// تمرير app للراوترات
initApp(app, express);

// تشغيل السيرفر
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
});
