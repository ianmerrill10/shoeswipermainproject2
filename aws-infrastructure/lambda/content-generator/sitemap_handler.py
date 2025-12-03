"""
Sitemap Generator Lambda for ShoeSwiper Blogs
Generates XML sitemaps and sitemap index, pings search engines
"""

import json
import boto3
import os
import urllib.request
import urllib.parse
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from xml.etree.ElementTree import Element, SubElement, tostring
from xml.dom import minidom
import logging
import hashlib

# Configure logging
logger = logging.getLogger()
logger.setLevel(logging.INFO)

# Initialize AWS clients
dynamodb = boto3.resource('dynamodb')
s3 = boto3.client('s3')

# Configuration
DYNAMODB_TABLE = os.environ.get('BLOG_POSTS_TABLE', 'shoeswiper-blog-posts')
S3_BUCKET = os.environ.get('BLOG_BUCKET', 'shoeswiper-blogs')
DOMAIN = os.environ.get('DOMAIN', 'https://shoeswiper.com')

# Blog configurations
BLOG_CONFIGS = {
    'sneaker': {
        'path': 'blog/sneaker',
        'priority': '0.8',
        'changefreq': 'daily'
    },
    'shoes': {
        'path': 'blog/shoes',
        'priority': '0.8',
        'changefreq': 'daily'
    },
    'workwear': {
        'path': 'blog/workwear',
        'priority': '0.7',
        'changefreq': 'weekly'
    },
    'music': {
        'path': 'blog/music',
        'priority': '0.7',
        'changefreq': 'weekly'
    }
}

# Search engine ping URLs
SEARCH_ENGINE_PINGS = {
    'google': 'https://www.google.com/ping?sitemap=',
    'bing': 'https://www.bing.com/ping?sitemap=',
    'yandex': 'https://webmaster.yandex.com/ping?sitemap='
}


class SitemapGenerator:
    """Generates XML sitemaps for blog content"""
    
    def __init__(self):
        self.table = dynamodb.Table(DYNAMODB_TABLE)
        self.namespace = 'http://www.sitemaps.org/schemas/sitemap/0.9'
        self.image_namespace = 'http://www.google.com/schemas/sitemap-image/1.1'
        self.news_namespace = 'http://www.google.com/schemas/sitemap-news/0.9'
    
    def fetch_posts(self, category: str, limit: int = 50000) -> List[Dict[str, Any]]:
        """Fetch all published posts for a category"""
        posts = []
        last_key = None
        
        while True:
            try:
                params = {
                    'IndexName': 'category-published_at-index',
                    'KeyConditionExpression': 'category = :cat',
                    'ExpressionAttributeValues': {':cat': category},
                    'ScanIndexForward': False
                }
                
                if last_key:
                    params['ExclusiveStartKey'] = last_key
                
                response = self.table.query(**params)
                posts.extend(response.get('Items', []))
                
                last_key = response.get('LastEvaluatedKey')
                if not last_key or len(posts) >= limit:
                    break
                    
            except Exception as e:
                logger.error(f"Error fetching posts: {str(e)}")
                # Fallback to scan
                response = self.table.scan(
                    FilterExpression='category = :cat AND #status = :status',
                    ExpressionAttributeNames={'#status': 'status'},
                    ExpressionAttributeValues={
                        ':cat': category,
                        ':status': 'published'
                    }
                )
                posts = response.get('Items', [])
                break
        
        return posts[:limit]
    
    def generate_sitemap(self, category: str, posts: List[Dict[str, Any]]) -> str:
        """Generate sitemap XML for a category"""
        config = BLOG_CONFIGS[category]
        
        urlset = Element('urlset')
        urlset.set('xmlns', self.namespace)
        urlset.set('xmlns:image', self.image_namespace)
        urlset.set('xmlns:xhtml', 'http://www.w3.org/1999/xhtml')
        
        # Add category index page
        index_url = SubElement(urlset, 'url')
        SubElement(index_url, 'loc').text = f"{DOMAIN}/{config['path']}"
        SubElement(index_url, 'lastmod').text = datetime.now(timezone.utc).strftime('%Y-%m-%d')
        SubElement(index_url, 'changefreq').text = 'daily'
        SubElement(index_url, 'priority').text = '1.0'
        
        # Add individual posts
        for post in posts:
            url_element = SubElement(urlset, 'url')
            
            slug = post.get('slug', post.get('id'))
            loc = f"{DOMAIN}/{config['path']}/{slug}"
            SubElement(url_element, 'loc').text = loc
            
            # Last modified date
            lastmod = post.get('updated_at', post.get('published_at', ''))
            if lastmod:
                if isinstance(lastmod, str):
                    try:
                        dt = datetime.fromisoformat(lastmod.replace('Z', '+00:00'))
                        lastmod = dt.strftime('%Y-%m-%d')
                    except:
                        lastmod = datetime.now(timezone.utc).strftime('%Y-%m-%d')
                else:
                    lastmod = lastmod.strftime('%Y-%m-%d')
            else:
                lastmod = datetime.now(timezone.utc).strftime('%Y-%m-%d')
            SubElement(url_element, 'lastmod').text = lastmod
            
            # Change frequency based on post age
            published_at = post.get('published_at', '')
            if published_at:
                try:
                    if isinstance(published_at, str):
                        pub_dt = datetime.fromisoformat(published_at.replace('Z', '+00:00'))
                    else:
                        pub_dt = published_at
                    
                    days_old = (datetime.now(timezone.utc) - pub_dt).days
                    
                    if days_old < 7:
                        changefreq = 'daily'
                    elif days_old < 30:
                        changefreq = 'weekly'
                    elif days_old < 180:
                        changefreq = 'monthly'
                    else:
                        changefreq = 'yearly'
                except:
                    changefreq = config['changefreq']
            else:
                changefreq = config['changefreq']
            
            SubElement(url_element, 'changefreq').text = changefreq
            SubElement(url_element, 'priority').text = config['priority']
            
            # Add image information
            featured_image = post.get('featured_image', post.get('image_url'))
            if featured_image:
                image = SubElement(url_element, '{%s}image' % self.image_namespace)
                SubElement(image, '{%s}loc' % self.image_namespace).text = featured_image
                
                image_title = post.get('image_alt', post.get('title', ''))
                if image_title:
                    SubElement(image, '{%s}title' % self.image_namespace).text = image_title
                
                image_caption = post.get('image_caption', post.get('excerpt', ''))
                if image_caption:
                    SubElement(image, '{%s}caption' % self.image_namespace).text = image_caption[:1000]
        
        # Pretty print
        xml_string = tostring(urlset, encoding='unicode')
        return self._prettify_xml(xml_string)
    
    def generate_news_sitemap(self, category: str, posts: List[Dict[str, Any]]) -> str:
        """Generate Google News sitemap for recent posts"""
        config = BLOG_CONFIGS[category]
        
        # Filter to posts from last 2 days (Google News requirement)
        cutoff = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
        cutoff = cutoff.replace(day=cutoff.day - 2)
        
        recent_posts = []
        for post in posts:
            published_at = post.get('published_at', '')
            if published_at:
                try:
                    if isinstance(published_at, str):
                        pub_dt = datetime.fromisoformat(published_at.replace('Z', '+00:00'))
                    else:
                        pub_dt = published_at
                    
                    if pub_dt >= cutoff:
                        recent_posts.append(post)
                except:
                    pass
        
        if not recent_posts:
            return None
        
        urlset = Element('urlset')
        urlset.set('xmlns', self.namespace)
        urlset.set('xmlns:news', self.news_namespace)
        
        for post in recent_posts:
            url_element = SubElement(urlset, 'url')
            
            slug = post.get('slug', post.get('id'))
            SubElement(url_element, 'loc').text = f"{DOMAIN}/{config['path']}/{slug}"
            
            news = SubElement(url_element, '{%s}news' % self.news_namespace)
            
            publication = SubElement(news, '{%s}publication' % self.news_namespace)
            SubElement(publication, '{%s}name' % self.news_namespace).text = 'ShoeSwiper'
            SubElement(publication, '{%s}language' % self.news_namespace).text = 'en'
            
            published_at = post.get('published_at', datetime.now(timezone.utc).isoformat())
            if isinstance(published_at, str):
                pub_dt = datetime.fromisoformat(published_at.replace('Z', '+00:00'))
            else:
                pub_dt = published_at
            SubElement(news, '{%s}publication_date' % self.news_namespace).text = pub_dt.strftime('%Y-%m-%dT%H:%M:%S+00:00')
            
            SubElement(news, '{%s}title' % self.news_namespace).text = post.get('title', 'Untitled')
            
            keywords = post.get('keywords', post.get('tags', []))
            if keywords:
                if isinstance(keywords, list):
                    keywords_str = ', '.join(keywords[:10])
                else:
                    keywords_str = keywords
                SubElement(news, '{%s}keywords' % self.news_namespace).text = keywords_str
        
        xml_string = tostring(urlset, encoding='unicode')
        return self._prettify_xml(xml_string)
    
    def generate_sitemap_index(self, sitemaps: List[Dict[str, str]]) -> str:
        """Generate sitemap index file"""
        sitemapindex = Element('sitemapindex')
        sitemapindex.set('xmlns', self.namespace)
        
        for sitemap in sitemaps:
            sitemap_element = SubElement(sitemapindex, 'sitemap')
            SubElement(sitemap_element, 'loc').text = sitemap['loc']
            SubElement(sitemap_element, 'lastmod').text = sitemap.get('lastmod', datetime.now(timezone.utc).strftime('%Y-%m-%d'))
        
        xml_string = tostring(sitemapindex, encoding='unicode')
        return self._prettify_xml(xml_string)
    
    def generate_static_pages_sitemap(self) -> str:
        """Generate sitemap for static pages"""
        urlset = Element('urlset')
        urlset.set('xmlns', self.namespace)
        
        static_pages = [
            {'loc': DOMAIN, 'priority': '1.0', 'changefreq': 'daily'},
            {'loc': f'{DOMAIN}/app', 'priority': '0.9', 'changefreq': 'weekly'},
            {'loc': f'{DOMAIN}/about', 'priority': '0.7', 'changefreq': 'monthly'},
            {'loc': f'{DOMAIN}/contact', 'priority': '0.6', 'changefreq': 'monthly'},
            {'loc': f'{DOMAIN}/privacy', 'priority': '0.3', 'changefreq': 'yearly'},
            {'loc': f'{DOMAIN}/terms', 'priority': '0.3', 'changefreq': 'yearly'},
            {'loc': f'{DOMAIN}/blog', 'priority': '0.9', 'changefreq': 'daily'},
        ]
        
        # Add blog landing pages
        for category, config in BLOG_CONFIGS.items():
            static_pages.append({
                'loc': f"{DOMAIN}/{config['path']}",
                'priority': '0.9',
                'changefreq': 'daily'
            })
        
        for page in static_pages:
            url = SubElement(urlset, 'url')
            SubElement(url, 'loc').text = page['loc']
            SubElement(url, 'lastmod').text = datetime.now(timezone.utc).strftime('%Y-%m-%d')
            SubElement(url, 'changefreq').text = page['changefreq']
            SubElement(url, 'priority').text = page['priority']
        
        xml_string = tostring(urlset, encoding='unicode')
        return self._prettify_xml(xml_string)
    
    def _prettify_xml(self, xml_string: str) -> str:
        """Prettify XML with proper declaration"""
        dom = minidom.parseString(xml_string)
        pretty_xml = dom.toprettyxml(indent='  ', encoding=None)
        # Remove extra blank lines
        lines = [line for line in pretty_xml.split('\n') if line.strip()]
        return '\n'.join(lines)


def upload_to_s3(content: str, key: str) -> bool:
    """Upload sitemap to S3"""
    try:
        s3.put_object(
            Bucket=S3_BUCKET,
            Key=key,
            Body=content.encode('utf-8'),
            ContentType='application/xml',
            CacheControl='public, max-age=3600',
            ACL='public-read'
        )
        logger.info(f"Successfully uploaded {key}")
        return True
    except Exception as e:
        logger.error(f"Error uploading {key}: {str(e)}")
        return False


def ping_search_engines(sitemap_url: str) -> Dict[str, bool]:
    """Ping search engines about sitemap update"""
    results = {}
    
    for engine, ping_url in SEARCH_ENGINE_PINGS.items():
        try:
            full_url = ping_url + urllib.parse.quote(sitemap_url, safe='')
            request = urllib.request.Request(
                full_url,
                headers={'User-Agent': 'ShoeSwiper-SitemapBot/1.0'}
            )
            
            with urllib.request.urlopen(request, timeout=10) as response:
                status = response.getcode()
                results[engine] = status == 200
                logger.info(f"Pinged {engine}: status {status}")
                
        except Exception as e:
            logger.error(f"Error pinging {engine}: {str(e)}")
            results[engine] = False
    
    return results


def generate_robots_txt() -> str:
    """Generate robots.txt content"""
    robots = f"""# ShoeSwiper Robots.txt
# Generated: {datetime.now(timezone.utc).isoformat()}

User-agent: *
Allow: /

# Sitemaps
Sitemap: {DOMAIN}/sitemap.xml
Sitemap: {DOMAIN}/sitemap-static.xml
"""
    
    for category, config in BLOG_CONFIGS.items():
        robots += f"Sitemap: {DOMAIN}/{config['path']}/sitemap.xml\n"
    
    robots += f"""
# Crawl-delay for polite crawlers
Crawl-delay: 1

# Disallow admin and API paths
Disallow: /api/
Disallow: /admin/
Disallow: /_next/
Disallow: /supabase/

# Allow important paths
Allow: /blog/
Allow: /app
Allow: /about
Allow: /contact

# Block AI training bots (optional)
User-agent: GPTBot
Disallow: /

User-agent: ChatGPT-User
Disallow: /

User-agent: CCBot
Disallow: /
"""
    return robots


def lambda_handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Lambda handler for sitemap generation
    
    Event types:
    - Generate all: {} or {"generate_all": true}
    - Generate specific: {"category": "sneaker"}
    - Ping only: {"ping_only": true}
    """
    logger.info(f"Event received: {json.dumps(event)}")
    
    generator = SitemapGenerator()
    results = {
        'sitemaps': [],
        'pings': {},
        'timestamp': datetime.now(timezone.utc).isoformat()
    }
    
    # Handle SNS messages
    if 'Records' in event:
        for record in event['Records']:
            if 'Sns' in record:
                event = json.loads(record['Sns']['Message'])
    
    # Check if ping only
    if event.get('ping_only'):
        sitemap_url = f"{DOMAIN}/sitemap.xml"
        results['pings'] = ping_search_engines(sitemap_url)
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps(results)
        }
    
    # Determine categories to process
    categories = list(BLOG_CONFIGS.keys())
    if 'category' in event:
        categories = [event['category']]
    
    sitemaps_info = []
    
    # Generate sitemap for each category
    for category in categories:
        if category not in BLOG_CONFIGS:
            continue
            
        config = BLOG_CONFIGS[category]
        
        try:
            posts = generator.fetch_posts(category)
            logger.info(f"Found {len(posts)} posts for {category}")
            
            # Generate main sitemap
            sitemap_xml = generator.generate_sitemap(category, posts)
            sitemap_key = f"{config['path']}/sitemap.xml"
            
            if upload_to_s3(sitemap_xml, sitemap_key):
                sitemap_url = f"{DOMAIN}/{sitemap_key}"
                results['sitemaps'].append({
                    'category': category,
                    'type': 'main',
                    'url': sitemap_url,
                    'posts_count': len(posts)
                })
                sitemaps_info.append({
                    'loc': sitemap_url,
                    'lastmod': datetime.now(timezone.utc).strftime('%Y-%m-%d')
                })
            
            # Generate news sitemap for recent posts
            news_sitemap = generator.generate_news_sitemap(category, posts)
            if news_sitemap:
                news_key = f"{config['path']}/sitemap-news.xml"
                if upload_to_s3(news_sitemap, news_key):
                    news_url = f"{DOMAIN}/{news_key}"
                    results['sitemaps'].append({
                        'category': category,
                        'type': 'news',
                        'url': news_url
                    })
                    sitemaps_info.append({
                        'loc': news_url,
                        'lastmod': datetime.now(timezone.utc).strftime('%Y-%m-%d')
                    })
                    
        except Exception as e:
            logger.error(f"Error generating sitemap for {category}: {str(e)}")
            results['sitemaps'].append({
                'category': category,
                'error': str(e)
            })
    
    # Generate static pages sitemap
    try:
        static_sitemap = generator.generate_static_pages_sitemap()
        if upload_to_s3(static_sitemap, 'sitemap-static.xml'):
            static_url = f"{DOMAIN}/sitemap-static.xml"
            results['sitemaps'].append({
                'type': 'static',
                'url': static_url
            })
            sitemaps_info.append({
                'loc': static_url,
                'lastmod': datetime.now(timezone.utc).strftime('%Y-%m-%d')
            })
    except Exception as e:
        logger.error(f"Error generating static sitemap: {str(e)}")
    
    # Generate sitemap index
    try:
        if sitemaps_info:
            sitemap_index = generator.generate_sitemap_index(sitemaps_info)
            if upload_to_s3(sitemap_index, 'sitemap.xml'):
                results['sitemap_index'] = f"{DOMAIN}/sitemap.xml"
    except Exception as e:
        logger.error(f"Error generating sitemap index: {str(e)}")
    
    # Generate robots.txt
    try:
        robots_txt = generate_robots_txt()
        if upload_to_s3(robots_txt, 'robots.txt'):
            results['robots_txt'] = f"{DOMAIN}/robots.txt"
    except Exception as e:
        logger.error(f"Error generating robots.txt: {str(e)}")
    
    # Ping search engines
    if results.get('sitemap_index') and not event.get('skip_ping'):
        results['pings'] = ping_search_engines(results['sitemap_index'])
    
    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps(results)
    }


if __name__ == '__main__':
    test_event = {'generate_all': True, 'skip_ping': True}
    result = lambda_handler(test_event, None)
    print(json.dumps(json.loads(result['body']), indent=2))
