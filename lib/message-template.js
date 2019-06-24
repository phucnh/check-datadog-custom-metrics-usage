'use strict';

const defaultTemplate = `Your number of custom metrics is greater than limit.
Number of hosts: #{num_of_hosts}, custom metrics limit: #{limit_custom_metrics}.
Avg of using custom metrics per hour: #{num_of_custom_metrics}.
Check from #{check_from} to #{check_to} (UTC time).
Check custom metrics usage at https://app.datadoghq.com/account/usage`;

function format(template, checkResult, startHour, endHour) {
  const replacements = {
    '#{avg_of_num_custom_metrics}': checkResult.avgOfCustomMetrics,
    '#{avg_of_num_hosts}': checkResult.avgOfHosts,
    '#{custom_metrics_limit}': checkResult.limitOfCustomMetrics,
    '#{check_from}': startHour,
    '#{check_to}': endHour
  };

  return replaceMacros(template.trim(), replacements);
}

function replaceMacros(text, replacements) {
  const variablePattern = /#\{[a-z_]+\}/gi;

  return text.replace(variablePattern, matched => replacements[matched] || '');
}

module.exports = {
  defaultTemplate,
  format
};
