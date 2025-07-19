const express = require('express');
const http = require('http');
const cors = require('cors');
const dotenv = require('dotenv');
const summarizeRoute = require('./routes/summarizeRoute');
const { setupSocket } = require('./socket');

dotenv.config();

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());

// API route for Gemini summarization
app.use('/summarize-transcript', summarizeRoute);

// Socket.IO setup
setupSocket(server);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 