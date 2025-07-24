const express = require('express');
const http = require('http');
const cors = require('cors');
const dotenv = require('dotenv');
const summarizeRoute = require('./routes/summarizeRoute');
const { setupSocket } = require('./socket');

// Start the Flask NLP summarizer as a child process
const { spawn } = require('child_process');
const flaskProcess = spawn('python', ['summarizer_api.py'], {
  cwd: __dirname,
  stdio: 'inherit',
  shell: true
});

process.on('exit', () => {
  flaskProcess.kill();
});

process.on('SIGINT', () => {
  flaskProcess.kill();
  process.exit();
});

dotenv.config();

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());

// API route for Gemini/local summarization
app.use('/summarize-transcript', summarizeRoute);

// Socket.IO setup
setupSocket(server);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 