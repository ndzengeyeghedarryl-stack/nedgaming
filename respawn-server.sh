#!/bin/bash
cd /home/z/my-project
while true; do
  node -e "
const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const app = next({ dev: true, hostname: '0.0.0.0', port: 3000 });
const handle = app.getRequestHandler();
app.prepare().then(() => {
  createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  }).listen(3000, '0.0.0.0', () => {
    console.log('> Ready on http://0.0.0.0:3000');
  });
});
"
  sleep 2
done
