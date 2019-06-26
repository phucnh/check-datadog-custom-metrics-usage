# check-datadog-custom-metrics-usage

## Overview

Servlerless application that checks the usage of Datadog custom metrics and notifies
when number of usage custom metrics is greater than your limit.

[About Datadog custom metrics definition and counting](https://docs.datadoghq.com/developers/metrics/custom_metrics/)

[About Datadog custom metrics billing](https://docs.datadoghq.com/account_management/billing/custom_metrics/)

## Prerequisites

* [aws-cli](https://aws.amazon.com/cli/)
* [aws-sam-cli 0.17.+](https://github.com/awslabs/aws-sam-cli)
* [nodejs 10.10+](https://nodejs.org/en/download/releases/)

## Setup process

### Create Datadog API Key and Application Key

This application requires Datadog `API Key` and `application key`.
Create at [manage your account's API and application keys.](https://app.datadoghq.com/account/settings#api)

### Create Slack token

This application also requires Slack token for sending notification to Slack channel.
Please see [Slack Web API authentication](https://api.slack.com/web#authentication).

You could use [Slack Legacy tokens](https://api.slack.com/custom-integrations/legacy-tokens) as well.

## Local development

#### Setup environment variables in env.json

```json
{
  "checkDatadogCustomMetricsUsage": {
    "DATADOG_API_KEY_SSM_PARAM_NAME": "<The AWS Parameter Store name of your Datadog API Key>",
    "DATADOG_APP_KEY_SSM_PARAM_NAME": "<The AWS Parameter Store name of your Datadog APP Key>",
    "CUSTOM_METRICS_INCLUDED_PER_HOST": "100",
    "SLACK_TOKEN_SSM_PARAM_NAME": "<The AWS Parameter Store name of your Slack token>",
    "SLACK_CHANNEL_ID": "<Your Slack Channel ID>",
    "LOG_LEVEL": "DEBUG"
  }
}
```

- The default of `CUSTOM_METRICS_INCLUDED_PER_HOST` is 100 (Pro plan).
- The `LOG_LEVEL` accepted `DEBUG`, `INFO`, `WARN`, `ERROR` values

See [./env.json.sample](./env.json.sample) for more information.

#### Invoking function locally using a local sample payload

```bash
sam local invoke -t template.yaml --no-event -n env.json "checkDatadogCustomMetricsUsage" <<< "{}"
```

## Deployment

Firstly, create the AWS Systems Manager Parameter Store configurations to store your secrets.

For example:
```bash
aws ssm put-parameter \
  --name /Shared/Datadog/ApiKey \
  --value <Your Datadog API Key> \
  --type SecureString
```

The needed secrets are:
- The Datadog API Key
- The Datadog Application Key
- The Slack Token

See [setup process](#setup-process) for more information.

Then build and package by:

```bash
make build package
```

Finally, deploy by following command

```bash
DATADOG_API_KEY_SSM_PARAM_NAME=<Your Parameter Store Key> && \
  DATADOG_APP_KEY_SSM_PARAM_NAME=<Your Parameter Store Key> && \
  SLACK_TOKEN_SSM_PARAM_NAME=<Your Parameter Store Key> && \
  SLACK_CHANNEL_ID=<Your Slack Channel ID> && \
  EXECUTION_IAM_ROLE_ARN=<The Arn of IAM Role for executing or leave blank to create automatically> && \
  make deploy
```

## Publish to [AWS SAR](https://aws.amazon.com/serverless/serverlessrepo/)

```bash
make build package publish
```

## Message Template

You can custom the notification message by set the `SLACK_MESSAGE_TEMPLATE` environment variable.
Following variable templates are supported:

Variable template              | Description
------------------------------ | -----------
`#{avg_of_num_custom_metrics}` | The average of usage custom metrics per hour
`#{avg_of_num_hosts}`          | The average of usage hosts per hour
`#{custom_metrics_limit}`      | The upper limit of your usage custom metrics. When `avg_of_num_custom_metrics` is greater than this value, the notification is sent. Calculated by `round(avg_of_num_hosts) * CUSTOM_METRICS_INCLUDED_PER_HOST`
`#{check_from}`                | The beginning hour of checking process (in UTC)
`#{check_to}`                  | The ending hour of checking process (in UTC)
