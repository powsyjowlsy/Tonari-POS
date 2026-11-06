const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');

const CANDIDATE_PORTS = [3000, 3001, 3002, 3005, 3030, 8080, 8085, 0];
let currentPortIndex = 0;
let activePort = 3000;
let serverStatus = 'starting';

const RENDERER_DIR = path.join(__dirname, 'renderer');

// Helper to determine active local network IP address (filters out virtual VPNs like Radmin)
function getLocalNetworkIp() {
  const interfaces = os.networkInterfaces();
  const candidates = [];

  for (const name of Object.keys(interfaces)) {
    const lowerName = name.toLowerCase();
    // Exclude virtual/VPN adapters
    if (lowerName.includes('radmin') || 
        lowerName.includes('vpn') || 
        lowerName.includes('virtual') || 
        lowerName.includes('vethernet') || 
        lowerName.includes('vmware') || 
        lowerName.includes('wsl') || 
        lowerName.includes('loopback') ||
        lowerName.includes('hyper-v')) {
      continue;
    }

    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        // Prioritize standard local subnet ranges (192.168.x.x, 10.x.x.x)
        if (iface.address.startsWith('192.168.') || iface.address.startsWith('10.')) {
          return iface.address;
        }
        candidates.push(iface.address);
      }
    }
  }

  if (candidates.length > 0) return candidates[0];

  // Fallback to any non-internal IPv4 if no physical LAN interface matched
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

const MIME_TYPES = {
  '.html': 'text/html; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.js': 'application/javascript; charset=UTF-8',
  '.json': 'application/json; charset=UTF-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
  let reqPath = req.url.split('?')[0];
  if (reqPath === '/' || reqPath === '') {
    reqPath = '/index.html';
  }

  // API endpoint: Get system & network info
  if (reqPath === '/api/info') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      appName: 'Tonari POS',
      version: '1.1.0',
      localIp: getLocalNetworkIp(),
      port: activePort,
      status: serverStatus
    }));
    return;
  }

  const safePath = path.normalize(reqPath).replace(/^(\.\.[\/\\])+/, '');
  const filePath = path.join(RENDERER_DIR, safePath);

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': 'no-cache'
    });

    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  });
});

function startServer() {
  if (currentPortIndex >= CANDIDATE_PORTS.length) {
    serverStatus = 'offline';
    console.warn('[TONARI POS] Unable to bind network server to any candidate port. Running in local standalone mode.');
    return;
  }

  const portToTry = CANDIDATE_PORTS[currentPortIndex];

  const onListen = () => {
    server.removeListener('error', onError);
    server.on('error', (runtimeErr) => {
      console.error('[TONARI POS] Runtime network server error: ' + runtimeErr.message);
    });

    const addr = server.address();
    activePort = (addr && typeof addr === 'object') ? addr.port : portToTry;
    serverStatus = 'online';
    const localIp = getLocalNetworkIp();
    console.log('====================================================');
    console.log(' TONARI POS - LOCAL NETWORK SERVER STARTED');
    console.log('====================================================');
    console.log(' Desktop / Local Access : http://localhost:' + activePort);
    console.log(' Mobile Smartphone Link : http://' + localIp + ':' + activePort);
    console.log(' Connect your smartphone to the same Wi-Fi network');
    console.log(' and open the link above to use the mobile POS terminal.');
    console.log('====================================================');
  };

  const onError = (err) => {
    server.removeListener('listening', onListen);
    if (err.code === 'EACCES' || err.code === 'EADDRINUSE') {
      console.warn('[TONARI POS] Port ' + portToTry + ' unavailable (' + err.code + '). Trying next fallback...');
      currentPortIndex++;
      setImmediate(() => startServer());
    } else {
      serverStatus = 'error';
      console.error('[TONARI POS] Server socket error: ' + err.message);
    }
  };

  server.once('listening', onListen);
  server.once('error', onError);

  try {
    server.listen(portToTry, '0.0.0.0');
  } catch (listenSyncErr) {
    onError(listenSyncErr);
  }
}

startServer();

function getActivePort() {
  return activePort;
}

function getServerStatus() {
  return serverStatus;
}

module.exports = {
  server,
  getLocalNetworkIp,
  getActivePort,
  getServerStatus,
  get PORT() { return activePort; }
};
