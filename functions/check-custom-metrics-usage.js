'use strict';

const check = require('../lib/check');
const datadog = require('../lib/datadog');
const log = require('../lib/log');
const messageTemplate = require('../lib/message-template');
const moment = require('moment');
const slack = require('../lib/slack');

const AWS = require('aws-sdk');
const SSM = new AWS.SSM();

const datadogAuth = {
  apiKey: null,
  appKey: null
};

const slackAuth = {
  token: null
};

module.exports.handler = async (_, context) => {
  try {
    await init();
  } catch (e) {
    context.fail(e);
  }

  const beginDate = moment
    .utc()
    .hour(0)
    .subtract(2, 'days') // Datadog usage delay
    .date(1);
  const endDate = moment
    .utc()
    .hour(0)
    .subtract(1, 'days');

  const dateFmt = 'YYYY-MM-DDTHH';
  const startHr = beginDate.format(dateFmt);
  const endHr = endDate.format(dateFmt);
  log.debug(`Checking custom metric from [${startHr}] to [${endHr}]`);

  const customMetrics = await datadog.getHourlyUsageCustomMetrics(datadogAuth, startHr, endHr);
  const hosts = await datadog.getHourlyUsageHostsAndContainers(datadogAuth, startHr, endHr);

  const checkResult = check.checkLimit(customMetrics, hosts);
  log.debug(`Check result: ${JSON.stringify(checkResult)}`);

  await notify(startHr, endHr, checkResult);

  return checkResult;
};

async function getSSMValue(key) {
  const result = await SSM.getParameter({ Name: key, WithDecryption: true }).promise();

  return result.Parameter.Value;
}

async function init() {
  log.debug(`Datadog api key SSM Parameter Store name: ${process.env['DATADOG_API_KEY_SSM']}`);
  datadogAuth.apiKey = await getSSMValue(process.env['DATADOG_API_KEY_SSM']);

  log.debug(`Datadog api key SSM Parameter Store name: ${process.env['DATADOG_APP_KEY_SSM']}`);
  datadogAuth.appKey = await getSSMValue(process.env['DATADOG_APP_KEY_SSM']);

  log.debug(`Datadog api key SSM Parameter Store name: ${process.env['SLACK_TOKEN_SSM']}`);
  slackAuth.token = await getSSMValue(process.env['SLACK_TOKEN_SSM']);
}

async function notify(startHr, endHr, checkResult) {
  if (checkResult.over) {
    const slackToken = slackAuth.token;
    const slackChannelId = process.env['SLACK_CHANNEL_ID'];

    if (slackToken && slackChannelId) {
      log.debug(`Found slack token and channel id. Sending notification to Slack`, { channelId: slackChannelId });
      await notifySlack(slackToken, slackChannelId, startHr, endHr, checkResult);
    }
  }
}

async function notifySlack(slackToken, slackChannelId, startHr, endHr, checkResult) {
  const tmpl = process.env['SLACK_MESSAGE_TEMPLATE'] || messageTemplate.defaultTemplate;
  const msg = messageTemplate.format(tmpl, checkResult, startHr, endHr);

  if (msg) {
    const slackMsg = {
      attachments: [
        {
          color: 'warning',
          title: 'Datadog Custom metrics Warning',
          text: msg
        }
      ],
      channel: slackChannelId
    };
    log.debug(`Sending message: ${JSON.stringify(slackMsg)}`);
    const res = await slack.postMessage(slackToken, JSON.stringify(slackMsg));
    log.debug(`Slack response: ${JSON.stringify(res)}`);
  } else {
    log.error(`Slack message is empty or null or undefined. Message: [${msg}]`);
  }
}
