"""
ShoeSwiper AI Content Generator Lambda
Uses Amazon Bedrock (Claude 3.5 Sonnet) to generate blog content
Auto-publishes to S3 static sites
"""

import json
import boto3
import os
from datetime import datetime
import hashlib
import re

# Initialize AWS clients
bedrock = boto3.client('bedrock-runtime', region_name='us-east-1')
s3 = boto3.client('s3')
dynamodb = boto3.resource('dynamodb')

# Blog configurations
BLOG_CONFIGS = {
    'sneaker': {
        'bucket': 'blog-shoeswiper-com',
        'domain': 'blog.shoeswiper.com',
        'name': 'ShoeSwiper Sneaker Blog',
        'topics': [
            'trending sneaker releases',
            'sneaker resale market analysis',
            'celebrity sneaker style',
            'sneaker care and maintenance',
            'Nike vs Adidas comparison',
            'limited edition drops',
            'sneaker history and culture',
            'best sneakers for different occasions',
            'sneaker technology innovations',
            'affordable alternatives to hyped sneakers'
        ],
        'affiliate_tag': 'shoeswiper-20',
        'tone': 'enthusiastic, knowledgeable, streetwear-focused'
    },
    'shoes': {
        'bucket': 'shoes-shoeswiper-com',
        'domain': 'shoes.shoeswiper.com',
        'name': 'ShoeSwiper Shoe Guide',
        'topics': [
            'best running shoes by category',
            'dress shoes for men guide',
            'womens heel trends',
            'sandal season essentials',
            'orthopedic shoe recommendations',
            'shoe sizing guide',
            'sustainable footwear brands',
            'shoes for different foot types',
            'seasonal shoe trends',
            'shoe brand comparisons'
        ],
        'affiliate_tag': 'shoeswiper-20',
        'tone': 'helpful, informative, practical'
    },
    'workwear': {
        'bucket': 'workwear-shoeswiper-com',
        'domain': 'workwear.shoeswiper.com',
        'name': 'WorkWear Pro',
        'topics': [
            'best steel toe boots for construction',
            'waterproof work boots review',
            'Carhartt workwear essentials',
            'safety footwear regulations',
            'comfortable boots for long shifts',
            'work boot care and longevity',
            'winter work gear guide',
            'high visibility workwear',
            'tool belt and accessory reviews',
            'work pants and overalls comparison'
        ],
        'affiliate_tag': 'shoeswiper-20',
        'tone': 'practical, safety-conscious, value-focused'
    },
    'music': {
        'bucket': 'music-shoeswiper-com',
        'domain': 'music.shoeswiper.com',
        'name': 'ShoeSwiper Sounds',
        'topics': [
            'emerging hip-hop artists to watch',
            'underground R&B discoveries',
            'indie artists breaking through',
            'music and sneaker culture connection',
            'playlist curation for workouts',
            'new producer spotlight',
            'genre-blending artists',
            'local scene highlights',
            'music production tips for beginners',
            'artist interview features'
        ],
        'affiliate_tag': 'shoeswiper-20',
        'tone': 'passionate, discovery-focused, supportive of new artists'
    }
}


def generate_content(blog_type: str, topic: str = None) -> dict:
    """Generate blog content using Amazon Bedrock Claude 3.5 Sonnet"""
    
    config = BLOG_CONFIGS.get(blog_type)
    if not config:
        raise ValueError(f"Unknown blog type: {blog_type}")
    
    # Select random topic if not provided
    if not topic:
        import random
        topic = random.choice(config['topics'])
    
    # Build the prompt
    prompt = f"""You are an expert content writer for {config['name']}, a popular blog about {blog_type}.

Write a comprehensive, SEO-optimized blog post about: {topic}

Requirements:
1. Tone: {config['tone']}
2. Length: 1500-2000 words
3. Include practical tips and recommendations
4. Include 2-3 Amazon product recommendations with natural affiliate link placements
5. Use engaging headers and subheaders
6. Include a compelling meta description (150-160 characters)
7. Include 5-7 relevant keywords for SEO
8. End with a call-to-action to explore ShoeSwiper app

Format your response as JSON:
{{
    "title": "Engaging blog post title",
    "slug": "url-friendly-slug",
    "meta_description": "SEO meta description",
    "keywords": ["keyword1", "keyword2", ...],
    "content": "Full HTML content with proper tags",
    "featured_image_prompt": "DALL-E prompt for featured image",
    "products": [
        {{"name": "Product Name", "asin": "AMAZONASIN", "why": "Brief reason to recommend"}}
    ]
}}

Make the content genuinely helpful and engaging, not just promotional."""

    # Call Bedrock
    response = bedrock.invoke_model(
        modelId='anthropic.claude-3-5-sonnet-20241022-v2:0',
        contentType='application/json',
        accept='application/json',
        body=json.dumps({
            'anthropic_version': 'bedrock-2023-05-31',
            'max_tokens': 4096,
            'messages': [
                {
                    'role': 'user',
                    'content': prompt
                }
            ]
        })
    )
    
    response_body = json.loads(response['body'].read())
    content_text = response_body['content'][0]['text']
    
    # Parse JSON from response
    try:
        # Find JSON in response
        json_match = re.search(r'\{[\s\S]*\}', content_text)
        if json_match:
            content_data = json.loads(json_match.group())
        else:
            raise ValueError("No JSON found in response")
    except json.JSONDecodeError as e:
        print(f"JSON parse error: {e}")
        # Fallback to basic structure
        content_data = {
            'title': topic.title(),
            'slug': topic.lower().replace(' ', '-'),
            'meta_description': f"Discover the best {topic} with ShoeSwiper",
            'keywords': topic.split(),
            'content': content_text,
            'products': []
        }
    
    return content_data


def create_html_page(content_data: dict, blog_config: dict) -> str:
    """Create a full HTML blog post page"""
    
    affiliate_tag = blog_config['affiliate_tag']
    
    # Process product links
    products_html = ""
    for product in content_data.get('products', []):
        asin = product.get('asin', '')
        if asin:
            products_html += f"""
            <div class="product-card">
                <h4>{product['name']}</h4>
                <p>{product.get('why', '')}</p>
                <a href="https://amazon.com/dp/{asin}?tag={affiliate_tag}" 
                   class="buy-button" target="_blank" rel="noopener">
                    View on Amazon
                </a>
            </div>
            """
    
    html = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{content_data['title']} | {blog_config['name']}</title>
    <meta name="description" content="{content_data['meta_description']}">
    <meta name="keywords" content="{', '.join(content_data.get('keywords', []))}">
    
    <!-- Open Graph -->
    <meta property="og:title" content="{content_data['title']}">
    <meta property="og:description" content="{content_data['meta_description']}">
    <meta property="og:type" content="article">
    <meta property="og:site_name" content="{blog_config['name']}">
    
    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="{content_data['title']}">
    <meta name="twitter:description" content="{content_data['meta_description']}">
    
    <link rel="canonical" href="https://{blog_config['domain']}/{content_data['slug']}">
    
    <style>
        :root {{
            --primary: #f97316;
            --bg-dark: #09090b;
            --bg-card: #18181b;
            --text: #fafafa;
            --text-muted: #a1a1aa;
        }}
        
        * {{ margin: 0; padding: 0; box-sizing: border-box; }}
        
        body {{
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: var(--bg-dark);
            color: var(--text);
            line-height: 1.7;
        }}
        
        header {{
            background: var(--bg-card);
            padding: 1rem 2rem;
            border-bottom: 1px solid #27272a;
            position: sticky;
            top: 0;
            z-index: 100;
        }}
        
        .header-content {{
            max-width: 1200px;
            margin: 0 auto;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }}
        
        .logo {{
            font-size: 1.5rem;
            font-weight: 800;
            color: var(--primary);
            text-decoration: none;
        }}
        
        nav a {{
            color: var(--text-muted);
            text-decoration: none;
            margin-left: 2rem;
            transition: color 0.2s;
        }}
        
        nav a:hover {{ color: var(--primary); }}
        
        main {{
            max-width: 800px;
            margin: 0 auto;
            padding: 3rem 1.5rem;
        }}
        
        h1 {{
            font-size: 2.5rem;
            font-weight: 800;
            margin-bottom: 1rem;
            line-height: 1.2;
        }}
        
        .meta {{
            color: var(--text-muted);
            margin-bottom: 2rem;
            padding-bottom: 2rem;
            border-bottom: 1px solid #27272a;
        }}
        
        .content {{
            font-size: 1.1rem;
        }}
        
        .content h2 {{
            font-size: 1.8rem;
            margin: 2rem 0 1rem;
            color: var(--primary);
        }}
        
        .content h3 {{
            font-size: 1.4rem;
            margin: 1.5rem 0 0.75rem;
        }}
        
        .content p {{
            margin-bottom: 1.5rem;
        }}
        
        .content ul, .content ol {{
            margin-bottom: 1.5rem;
            padding-left: 2rem;
        }}
        
        .content li {{
            margin-bottom: 0.5rem;
        }}
        
        .content a {{
            color: var(--primary);
            text-decoration: none;
        }}
        
        .content a:hover {{
            text-decoration: underline;
        }}
        
        .product-card {{
            background: var(--bg-card);
            border-radius: 12px;
            padding: 1.5rem;
            margin: 2rem 0;
            border: 1px solid #27272a;
        }}
        
        .product-card h4 {{
            color: var(--primary);
            margin-bottom: 0.5rem;
        }}
        
        .buy-button {{
            display: inline-block;
            background: var(--primary);
            color: white;
            padding: 0.75rem 1.5rem;
            border-radius: 8px;
            text-decoration: none;
            font-weight: 600;
            margin-top: 1rem;
            transition: transform 0.2s;
        }}
        
        .buy-button:hover {{
            transform: scale(1.02);
        }}
        
        .cta-box {{
            background: linear-gradient(135deg, var(--primary), #ea580c);
            border-radius: 16px;
            padding: 2rem;
            margin-top: 3rem;
            text-align: center;
        }}
        
        .cta-box h3 {{
            font-size: 1.5rem;
            margin-bottom: 1rem;
        }}
        
        .cta-box a {{
            display: inline-block;
            background: white;
            color: var(--bg-dark);
            padding: 1rem 2rem;
            border-radius: 50px;
            font-weight: 700;
            text-decoration: none;
            margin-top: 1rem;
        }}
        
        footer {{
            background: var(--bg-card);
            padding: 3rem 2rem;
            margin-top: 4rem;
            border-top: 1px solid #27272a;
            text-align: center;
            color: var(--text-muted);
        }}
        
        @media (max-width: 768px) {{
            h1 {{ font-size: 1.8rem; }}
            .header-content {{ flex-direction: column; gap: 1rem; }}
            nav a {{ margin: 0 0.75rem; }}
        }}
    </style>
    
    <!-- Google Analytics -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
    <script>
        window.dataLayer = window.dataLayer || [];
        function gtag(){{dataLayer.push(arguments);}}
        gtag('js', new Date());
        gtag('config', 'G-XXXXXXXXXX');
    </script>
</head>
<body>
    <header>
        <div class="header-content">
            <a href="/" class="logo">{blog_config['name']}</a>
            <nav>
                <a href="/">Home</a>
                <a href="/latest">Latest</a>
                <a href="https://shoeswiper.com">ShoeSwiper App</a>
            </nav>
        </div>
    </header>
    
    <main>
        <article>
            <h1>{content_data['title']}</h1>
            <div class="meta">
                Published on {datetime.now().strftime('%B %d, %Y')} • 
                {len(content_data.get('content', '').split()) // 200} min read
            </div>
            
            <div class="content">
                {content_data.get('content', '')}
                
                {products_html}
            </div>
            
            <div class="cta-box">
                <h3>Discover More with ShoeSwiper</h3>
                <p>Get personalized sneaker recommendations with our TikTok-style discovery app</p>
                <a href="https://shoeswiper.com">Try ShoeSwiper Free</a>
            </div>
        </article>
    </main>
    
    <footer>
        <p>&copy; {datetime.now().year} {blog_config['name']} | Part of the ShoeSwiper Network</p>
        <p>
            <a href="/privacy">Privacy</a> • 
            <a href="/terms">Terms</a> • 
            <a href="/contact">Contact</a>
        </p>
        <p style="margin-top: 1rem; font-size: 0.9rem;">
            As an Amazon Associate, we earn from qualifying purchases.
        </p>
    </footer>
</body>
</html>"""
    
    return html


def publish_to_s3(html_content: str, slug: str, bucket: str) -> str:
    """Upload blog post HTML to S3"""
    
    key = f"posts/{slug}/index.html"
    
    s3.put_object(
        Bucket=bucket,
        Key=key,
        Body=html_content.encode('utf-8'),
        ContentType='text/html',
        CacheControl='max-age=3600'
    )
    
    return f"https://{bucket}.s3.amazonaws.com/{key}"


def save_metadata(content_data: dict, blog_type: str, s3_url: str):
    """Save post metadata to DynamoDB"""
    
    table = dynamodb.Table(os.environ.get('POSTS_TABLE', 'shoeswiper-blog-posts'))
    
    post_id = hashlib.md5(
        f"{blog_type}-{content_data['slug']}-{datetime.now().isoformat()}".encode()
    ).hexdigest()[:12]
    
    table.put_item(Item={
        'post_id': post_id,
        'blog_type': blog_type,
        'title': content_data['title'],
        'slug': content_data['slug'],
        'meta_description': content_data['meta_description'],
        'keywords': content_data.get('keywords', []),
        's3_url': s3_url,
        'created_at': datetime.now().isoformat(),
        'status': 'published',
        'views': 0,
        'clicks': 0
    })
    
    return post_id


def lambda_handler(event, context):
    """
    Lambda handler for content generation
    
    Event format:
    {
        "blog_type": "sneaker|shoes|workwear|music",
        "topic": "optional specific topic"
    }
    """
    
    try:
        blog_type = event.get('blog_type', 'sneaker')
        topic = event.get('topic')
        
        print(f"Generating content for blog: {blog_type}")
        
        # Get blog config
        config = BLOG_CONFIGS.get(blog_type)
        if not config:
            return {
                'statusCode': 400,
                'body': json.dumps({'error': f'Unknown blog type: {blog_type}'})
            }
        
        # Generate content
        content_data = generate_content(blog_type, topic)
        print(f"Generated: {content_data['title']}")
        
        # Create HTML page
        html = create_html_page(content_data, config)
        
        # Publish to S3
        s3_url = publish_to_s3(html, content_data['slug'], config['bucket'])
        print(f"Published to: {s3_url}")
        
        # Save metadata
        post_id = save_metadata(content_data, blog_type, s3_url)
        
        return {
            'statusCode': 200,
            'body': json.dumps({
                'success': True,
                'post_id': post_id,
                'title': content_data['title'],
                'url': f"https://{config['domain']}/{content_data['slug']}",
                's3_url': s3_url
            })
        }
        
    except Exception as e:
        print(f"Error: {str(e)}")
        return {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)})
        }


if __name__ == '__main__':
    # Local testing
    test_event = {
        'blog_type': 'sneaker',
        'topic': 'Best Nike Dunks for Summer 2024'
    }
    result = lambda_handler(test_event, None)
    print(json.dumps(result, indent=2))
