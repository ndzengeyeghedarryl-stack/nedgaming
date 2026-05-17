const { createServer } = require('http');
const next = require('next');

const port = parseInt(process.env.PORT || '3000', 10);
const hostname = '0.0.0.0';

const app = next({ dev: false, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer(handle);
  
  server.on('error', (err) => {
    console.error('Server error:', err);
  });
  
  server.listen(port, hostname, () => {
    console.log(`> Server listening at http://${hostname}:${port}`);
  });
  
  // Keep process alive
  process.on('SIGTERM', () => {
    console.log('SIGTERM received, keeping alive...');
  });
  process.on('SIGINT', () => {
    console.log('SIGINT received, keeping alive...');
  });
});

// Prevent process from exiting
setInterval(() => {
  // heartbeat
}, 60000);
