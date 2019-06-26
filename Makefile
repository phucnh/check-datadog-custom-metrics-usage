CLOUD_FORMATION_STACK_NAME := check-datadog-custom-metrics-usage
S3_BUCKET := check-datadog-custom-metrics-usage

build:          ## Build code and SAM application
	npm install
	npm run format-code
	npm test
	sam build

package:        ## Package built SAM application
	sam package \
		--output-template-file .aws-sam/build/packed.yml \
		--s3-bucket $(S3_BUCKET)

deploy:         ## Deploy SAM application
	sam deploy \
		--template-file .aws-sam/build/packed.yml \
		--stack-name $(CLOUD_FORMATION_STACK_NAME) \
		--capabilities CAPABILITY_IAM \
		--parameter-overrides \
			DatadogApiKeySSMParamName="$(DATADOG_API_KEY_SSM_PARAM_NAME)" \
			DatadogApplicationKeySSMParamName="$(DATADOG_APP_KEY_SSM_PARAM_NAME)" \
			SlackTokenSSMParamName="$(SLACK_TOKEN_SSM_PARAM_NAME)" \
			SlackChannelId="$(SLACK_CHANNEL_ID)" \
			ExecutionIAMRoleArn="$(EXECUTION_IAM_ROLE_ARN)"


publish:        ## Publish SAM application to AWS Serverless Application Repository
		echo '--- Copy README.md and LICENSE to s3 bucket'
		aws s3 cp LICENSE s3://$(S3_BUCKET)/metadata/
		aws s3 cp README.md s3://$(S3_BUCKET)/metadata/

		echo '-- Publish to AWS Serverless Application Repository'
		sam publish -t .aws-sam/build/packed.yml --region us-east-1

clean:          ## Clean built artifacts
	rm -rf .aws-sam

help:           ## Show this help.
	@fgrep -h "##" $(MAKEFILE_LIST) | fgrep -v fgrep | sed -e 's/\\$$//' | sed -e 's/##//'
