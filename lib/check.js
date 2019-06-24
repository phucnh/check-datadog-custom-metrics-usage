'use strict';

const customMetricsIncludedPerHost = parseInt(process.env['CUSTOM_METRICS_INCLUDED_PER_HOST']) || 100;

function checkLimit(usageCustomMetrics, usageHosts) {
  const metrics = usageCustomMetrics && usageCustomMetrics.usage;
  const hosts = usageHosts && usageHosts.usage;

  if (!metrics || !Array.isArray(metrics) || metrics.length == 0) {
    throw new Error('No usage of custom metrics, check the get custom metrics api');
  }

  if (!hosts || !Array.isArray(hosts) || hosts.length == 0) {
    throw new Error('No usage of hosts, check the get custom metrics api');
  }

  if (metrics.length != hosts.length) {
    throw new Error('The length of custom metrics repsonse is not same with length of hosts, check the api');
  }

  const sumOfHosts = hosts.reduce((acc, host) => {
    return acc + parseInt(host['host_count']);
  }, 0);
  const avgOfHosts = Math.round(sumOfHosts / hosts.length);

  const sumOfCustomMetrics = metrics.reduce((acc, metric) => {
    return acc + parseInt(metric['num_custom_timeseries']);
  }, 0);
  const avgOfCustomMetrics = Math.round(sumOfCustomMetrics / metrics.length);

  return {
    avgOfHosts,
    avgOfCustomMetrics,
    limitOfCustomMetrics: avgOfHosts * customMetricsIncludedPerHost,
    over: avgOfCustomMetrics > avgOfHosts * customMetricsIncludedPerHost
  };
}

module.exports = {
  checkLimit
};
