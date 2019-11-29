require('dotenv').config();
const express = require('express');
const fs = require('fs');
const https = require('https');
const httpProxy = require('http-proxy');
const cors = require('cors');

const apiProxy = httpProxy.createProxyServer();
const app = express();

const whitelist = ['https://shl.zetterstrom.dev', 'https://trivia.zetterstrom.dev'];
const corsOptions = {
  origin: (origin, callback) => {
    if (whitelist.includes(origin) || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
};

app.all('/shl/*', cors(corsOptions), (req, res) => {
  console.log('redirecting request to shl');
  req.url = req.url.replace(/\/shl/, '');
  apiProxy.web(req, res, {
    target: `http://localhost:${process.env.SHL_PORT}`,
  });
});

app.all('/trivia/*', cors(corsOptions), (req, res) => {
  console.log('redirecting request to trivia');
  req.url = req.url.replace(/\/trivia/, '');
  apiProxy.web(req, res, {
    target: `http://localhost:${process.env.TRIVIA_PORT}`,
  });
});

const options = {
  cert: fs.readFileSync('./sslcert/fullchain.pem'),
  key: fs.readFileSync('./sslcert/privkey.pem'),
};
https.createServer(options, app).listen(process.env.PORT);
