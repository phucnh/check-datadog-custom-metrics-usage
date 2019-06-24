'use strict';

const https = require('https');
const apiHost = 'slack.com';

function postMessage(token, msg) {
  const options = {
    hostname: apiHost,
    path: '/api/chat.postMessage',
    protocol: 'https:',
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json; charset=utf-8',
      'Content-Length': msg.length
    }
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, res => {
      let body = '';
      res.setEncoding('utf8');
      res.on('data', chunk => {
        body += chunk;
      });
      res.on('end', () => {
        resolve(body);
      });
    });

    req.on('error', e => reject(e));

    req.write(msg);
    req.end();
  });
}

module.exports = {
  postMessage
};
