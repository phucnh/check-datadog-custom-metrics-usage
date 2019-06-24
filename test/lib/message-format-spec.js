'use strict';

const chai = require('chai');
const expect = chai.expect;
const messageTemplate = require('../../lib/message-template');

describe('message-format.js', () => {
  describe('#format', () => {
    const checkResult = {
      limitOfCustomMetrics: 1000,
      avgOfCustomMetrics: 2000,
      avgOfHosts: 10
    };

    it('replaces variables in template', () => {
      const template = `#{custom_metrics_limit}
#{avg_of_num_custom_metrics}
#{avg_of_num_hosts}
#{check_from}
#{check_to}`;

      const formatted = messageTemplate.format(template, checkResult, '2019-06-10T00', '2019-06-11T00');

      const expected = `1000
2000
10
2019-06-10T00
2019-06-11T00`;

      expect(formatted).to.be.eql(expected);
    });

    it('replaces unknown variable by empty', () => {
      const template = 'variable: #{unknown}';
      const formatted = messageTemplate.format(template, checkResult);

      expect(formatted).to.be.eql('variable: ');
    });
  });
});
