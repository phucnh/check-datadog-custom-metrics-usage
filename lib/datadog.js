'use strict';

const https = require('https');
const querystring = require('querystring');

const apiUrl = 'https://api.datadoghq.com/api';

function getHourlyUsageHostsAndContainers(auth, startHr, endHr) {
  checkAuthentication(auth);

  const query = {
    api_key: auth.apiKey,
    application_key: auth.appKey,
    start_hr: startHr
  };

  if (endHr) query['end_hr'] = endHr;

  const url = `${apiUrl}/v1/usage/hosts?${querystring.stringify(query)}`;

  return new Promise((resolve, reject) => {
    https
      .get(url, res => {
        const { statusCode } = res;
        const contentType = res.headers['content-type'];

        if (statusCode != 200) {
          reject(new Error(`Request failed. Status code: ${statusCode}`));
        } else if (!/^application\/json/.test(contentType)) {
          reject(new Error(`Expected application/json but received ${contentType}`));
        }

        res.setEncoding('utf8');
        let body = '';

        res.on('data', chunk => {
          body += chunk;
        });
        res.on('end', () => {
          try {
            resolve(JSON.parse(body));
          } catch (e) {
            reject(e);
          }
        });
      })
      .on('error', e => reject(e));
  });
}

function getHourlyUsageCustomMetrics(auth, startHr, endHr) {
  checkAuthentication(auth);

  const query = {
    api_key: auth.apiKey,
    application_key: auth.appKey,
    start_hr: startHr
  };

  if (endHr) query['end_hr'] = endHr;

  const queryString = querystring.stringify(query);
  const url = `${apiUrl}/v1/usage/timeseries?${queryString}`;

  return new Promise((resolve, reject) => {
    https
      .get(url, res => {
        const { statusCode } = res;
        const contentType = res.headers['content-type'];

        if (statusCode != 200) {
          reject(new Error(`Request failed. Status code: ${statusCode}`));
        } else if (!/^application\/json/.test(contentType)) {
          reject(new Error(`Expected application/json but received ${contentType}`));
        }

        res.setEncoding('utf8');
        let body = '';

        res.on('data', chunk => {
          body += chunk;
        });
        res.on('end', () => {
          try {
            resolve(JSON.parse(body));
          } catch (e) {
            reject(e);
          }
        });
      })
      .on('error', e => reject(e));
  });
}

function checkAuthentication(auth) {
  if (!auth.apiKey) throw new Error('API key is required.');

  if (!auth.appKey) throw new Error('Application Key is required.');
}

module.exports = {
  getHourlyUsageHostsAndContainers,
  getHourlyUsageCustomMetrics
};
