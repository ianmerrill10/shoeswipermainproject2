# ShoeSwiper AWS Infrastructure

## Architecture Overview

This infrastructure powers 4 AI-automated blogs using AWS serverless services:

### Blogs
1. **blog.shoeswiper.com** - Sneaker Blog (trending sneakers, releases, reviews)
2. **shoes.shoeswiper.com** - General Shoe Blog (all footwear categories)
3. **workwear.shoeswiper.com** - Men's Workboots & Workwear Blog
4. **music.shoeswiper.com** - Music Discovery Blog (new/aspiring artists)

### AWS Services Used
- **Amazon Bedrock** - AI content generation (Claude 3.5 Sonnet)
- **AWS Lambda** - Serverless content generation & publishing
- **Amazon S3** - Static blog hosting
- **Amazon CloudFront** - CDN for fast global delivery
- **Amazon EventBridge** - Scheduled auto-posting (daily/hourly)
- **Amazon DynamoDB** - Blog post metadata & analytics
- **AWS Secrets Manager** - API keys and credentials
- **Amazon SES** - Email notifications for new posts

### Auto-posting Schedule
- Sneaker Blog: 3 posts/day (8am, 12pm, 6pm EST)
- Shoe Blog: 2 posts/day (10am, 4pm EST)
- Workwear Blog: 1 post/day (9am EST)
- Music Blog: 4 posts/day (9am, 12pm, 3pm, 8pm EST)

### Monetization
- Amazon Associates affiliate links (tag: shoeswiper-20)
- Apple Music affiliate integration
- Google AdSense integration
- Email capture for marketing

### Deployment
```bash
# Deploy all infrastructure
./deploy.sh

# Deploy single blog
./deploy.sh --blog sneaker

# Test content generation
./test-generation.sh
```

## Cost Estimate
- Bedrock (Claude): ~$30-50/month (based on 10 posts/day)
- Lambda: ~$5/month
- S3 + CloudFront: ~$10/month
- DynamoDB: ~$5/month
- Total: ~$50-70/month

## Main App Hosting
The main ShoeSwiper app is hosted on IONOS at shoeswiper.com
The AWS blogs are subdomains routed via CloudFront
