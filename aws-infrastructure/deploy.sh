#!/bin/bash
# ============================================
# ShoeSwiper AWS Infrastructure Deployment
# ============================================

set -e

echo "🚀 ShoeSwiper AWS Infrastructure Deployment"
echo "============================================"

# Configuration
STACK_NAME="shoeswiper-blogs"
REGION="us-east-1"
S3_DEPLOY_BUCKET="shoeswiper-deployment-artifacts"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check AWS CLI
if ! command -v aws &> /dev/null; then
    echo -e "${RED}Error: AWS CLI not installed${NC}"
    exit 1
fi

# Check credentials
echo "Checking AWS credentials..."
if ! aws sts get-caller-identity &> /dev/null; then
    echo -e "${RED}Error: AWS credentials not configured${NC}"
    echo "Run: aws configure"
    exit 1
fi

ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
echo -e "${GREEN}✓ Authenticated as account: $ACCOUNT_ID${NC}"

# Create deployment bucket if needed
echo "Creating deployment bucket..."
aws s3 mb s3://$S3_DEPLOY_BUCKET --region $REGION 2>/dev/null || true

# Package the Lambda functions
echo "Packaging Lambda functions..."
cd lambda/content-generator
pip install -r requirements.txt -t . 2>/dev/null || true
zip -r ../../content-generator.zip . -x "*.pyc" -x "__pycache__/*"
cd ../..

# Upload to S3
aws s3 cp content-generator.zip s3://$S3_DEPLOY_BUCKET/lambda/

# Deploy CloudFormation stack
echo "Deploying CloudFormation stack..."
aws cloudformation deploy \
    --template-file template.yaml \
    --stack-name $STACK_NAME \
    --region $REGION \
    --capabilities CAPABILITY_IAM CAPABILITY_AUTO_EXPAND \
    --parameter-overrides Environment=prod \
    --tags Project=ShoeSwiper

# Get outputs
echo ""
echo "============================================"
echo -e "${GREEN}✓ Deployment Complete!${NC}"
echo "============================================"
echo ""

# Show outputs
aws cloudformation describe-stacks \
    --stack-name $STACK_NAME \
    --query 'Stacks[0].Outputs' \
    --output table

echo ""
echo "Next steps:"
echo "1. Configure DNS in your domain registrar:"
echo "   - blog.shoeswiper.com -> CloudFront distribution"
echo "   - shoes.shoeswiper.com -> CloudFront distribution"
echo "   - workwear.shoeswiper.com -> CloudFront distribution"
echo "   - music.shoeswiper.com -> CloudFront distribution"
echo ""
echo "2. Test content generation:"
echo "   ./test-generation.sh sneaker"
echo ""
echo "3. Monitor in CloudWatch:"
echo "   https://console.aws.amazon.com/cloudwatch/home?region=$REGION"
