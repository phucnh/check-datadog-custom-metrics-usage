'use strict';

const chai = require('chai');
const expect = chai.expect;
const check = require('../../lib/check');
const fixtures = require('../fixtures');

describe('check.js', () => {
  describe('#checkLimit', () => {
    context('with usage custom metrics is empty', () => {
      it('throws an error', () => {
        const customMetrics = fixtures.datadogResponses.makeUsageCustomMetrics([]);
        const hosts = fixtures.datadogResponses.makeUsageHosts([1, 2, 3]);
        expect(() => check.checkLimit(customMetrics, hosts)).to.throw(/No usage of custom metrics/);
      });
    });

    context('with usage hosts is empty', () => {
      it('throws an error', () => {
        const customMetrics = fixtures.datadogResponses.makeUsageCustomMetrics([1, 2, 3, 4]);
        const hosts = fixtures.datadogResponses.makeUsageHosts([]);

        expect(() => check.checkLimit(customMetrics, hosts)).to.throw(/No usage of hosts/);
      });
    });

    context('with length of usage custom metrics is not same with length of hosts', () => {
      it('throws an error', () => {
        const customMetrics = fixtures.datadogResponses.makeUsageCustomMetrics([1, 2, 3, 4]);
        const hosts = fixtures.datadogResponses.makeUsageHosts([10]);
        expect(() => check.checkLimit(customMetrics, hosts)).to.throw(
          /length of custom metrics repsonse is not same with length of hosts/
        );
      });
    });

    context('with average of custom metrics per hour is greater than the limit', () => {
      it('returns checking result with over is true', () => {
        const customMetrics = fixtures.datadogResponses.makeUsageCustomMetrics([10000, 18000, 20000]);
        const hosts = fixtures.datadogResponses.makeUsageHosts([50, 51, 60]);
        const result = check.checkLimit(customMetrics, hosts);

        const expected = {
          avgOfHosts: 54,
          avgOfCustomMetrics: 16000,
          limitOfCustomMetrics: 54 * 100,
          over: true
        };

        expect(result).to.be.eql(expected);
      });
    });

    context('with average of custom metrics per hour is less than the limit', () => {
      it('returns checking result with over is false', () => {
        const customMetrics = fixtures.datadogResponses.makeUsageCustomMetrics([100, 180, 200]);
        const hosts = fixtures.datadogResponses.makeUsageHosts([50, 51, 60]);
        const result = check.checkLimit(customMetrics, hosts);

        const expected = {
          avgOfHosts: 54,
          avgOfCustomMetrics: 160,
          limitOfCustomMetrics: 54 * 100,
          over: false
        };

        expect(result).to.be.eql(expected);
      });
    });
  });
});
