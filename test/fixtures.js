'use strict';

const moment = require('moment');

const datadogResponses = {};

datadogResponses.makeUsageCustomMetrics = numCustomMetricsPerHours => {
  if (!Array.isArray(numCustomMetricsPerHours)) {
    throw new Error(`Expect array of num custom metrics per hour but got [${numCustomMetricsPerHours}]`);
  }

  const bootstrapHour = moment
    .utc()
    .hour(0)
    .date(1);

  const data = numCustomMetricsPerHours.map((num, index) => {
    return {
      hour: getNextHourStringFrom(bootstrapHour, index),
      num_custom_timeseries: num
    };
  });

  return { usage: data };
};

datadogResponses.makeUsageHosts = numOfHostsPerHours => {
  if (!Array.isArray(numOfHostsPerHours)) {
    throw new Error(`Expect array of num hosts per hour but got [${numOfHostsPerHours}]`);
  }

  const bootstrapHour = moment
    .utc()
    .hour(0)
    .date(1);
  const data = numOfHostsPerHours.map((num, index) => {
    return {
      host_count: num,
      container_count: 0,
      hour: getNextHourStringFrom(bootstrapHour, index),
      apm_host_count: null,
      agent_host_count: num,
      gcp_host_count: 0,
      aws_host_count: 0
    };
  });

  return { usage: data };
};

function getNextHourStringFrom(hour, additional) {
  const hr = moment(hour).add(additional, 'hour');
  // Datadog usage API response format of hour
  const fmt = 'YYYY-MM-DDTHH';
  return hr.format(fmt);
}

module.exports = {
  datadogResponses
};
