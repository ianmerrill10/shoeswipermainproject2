"""
RSS Feed Generator Lambda for ShoeSwiper Blogs
Generates RSS 2.0 and Atom feeds for 4 blog categories
"""

import json
import boto3
import os
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from xml.etree.ElementTree import Element, SubElement, tostring
from xml.dom import minidom
import hashlib
import logging

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
        'title': 'ShoeSwiper Sneaker Blog',
        'description': 'Latest sneaker news, releases, reviews, and style guides from ShoeSwiper',
        'category': 'Fashion/Sneakers',
        'language': 'en-us',
        'path': 'blog/sneaker',
        'image': f'{DOMAIN}/images/blogs/sneaker-blog-logo.png'
    },
    'shoes': {
        'title': 'ShoeSwiper Shoes Blog',
        'description': 'Comprehensive shoe guides, reviews, and recommendations for every occasion',
        'category': 'Fashion/Footwear',
        'language': 'en-us',
        'path': 'blog/shoes',
        'image': f'{DOMAIN}/images/blogs/shoes-blog-logo.png'
    },
    'workwear': {
        'title': 'ShoeSwiper Workwear Blog',
        'description': 'Professional footwear guides, work boot reviews, and safety shoe recommendations',
        'category': 'Fashion/Workwear',
        'language': 'en-us',
        'path': 'blog/workwear',
        'image': f'{DOMAIN}/images/blogs/workwear-blog-logo.png'
    },
    'music': {
        'title': 'ShoeSwiper Music & Style Blog',
        'description': 'Where music meets sneaker culture - artist collaborations, concert style, and more',
        'category': 'Entertainment/Music',
        'language': 'en-us',
        'path': 'blog/music',
        'image': f'{DOMAIN}/images/blogs/music-blog-logo.png'
    }
}


class RSSFeedGenerator:
    """Generates RSS 2.0 feeds for blog categories"""
    
    def __init__(self, blog_type: str):
        self.blog_type = blog_type
        self.config = BLOG_CONFIGS[blog_type]
        self.table = dynamodb.Table(DYNAMODB_TABLE)
    
    def fetch_posts(self, limit: int = 50) -> List[Dict[str, Any]]:
        """Fetch published posts from DynamoDB"""
        try:
            response = self.table.query(
                IndexName='category-published_at-index',
                KeyConditionExpression='category = :cat AND published_at <= :now',
                ExpressionAttributeValues={
                    ':cat': self.blog_type,
                    ':now': datetime.now(timezone.utc).isoformat()
                },
                ScanIndexForward=False,
                Limit=limit
            )
            return response.get('Items', [])
        except Exception as e:
            logger.error(f"Error fetching posts: {str(e)}")
            # Fallback to scan if index doesn't exist
            response = self.table.scan(
                FilterExpression='category = :cat AND #status = :status',
                ExpressionAttributeNames={'#status': 'status'},
                ExpressionAttributeValues={
                    ':cat': self.blog_type,
                    ':status': 'published'
                }
            )
            items = response.get('Items', [])
            # Sort by published_at descending
            items.sort(key=lambda x: x.get('published_at', ''), reverse=True)
            return items[:limit]
    
    def generate_rss(self, posts: List[Dict[str, Any]]) -> str:
        """Generate RSS 2.0 XML feed"""
        rss = Element('rss')
        rss.set('version', '2.0')
        rss.set('xmlns:atom', 'http://www.w3.org/2005/Atom')
        rss.set('xmlns:media', 'http://search.yahoo.com/mrss/')
        rss.set('xmlns:dc', 'http://purl.org/dc/elements/1.1/')
        rss.set('xmlns:content', 'http://purl.org/rss/1.0/modules/content/')
        
        channel = SubElement(rss, 'channel')
        
        # Channel metadata
        SubElement(channel, 'title').text = self.config['title']
        SubElement(channel, 'link').text = f"{DOMAIN}/{self.config['path']}"
        SubElement(channel, 'description').text = self.config['description']
        SubElement(channel, 'language').text = self.config['language']
        SubElement(channel, 'category').text = self.config['category']
        SubElement(channel, 'generator').text = 'ShoeSwiper RSS Generator v1.0'
        SubElement(channel, 'docs').text = 'https://www.rssboard.org/rss-specification'
        SubElement(channel, 'ttl').text = '60'
        
        # Last build date
        SubElement(channel, 'lastBuildDate').text = self._format_rfc822(datetime.now(timezone.utc))
        
        # Atom self link
        atom_link = SubElement(channel, '{http://www.w3.org/2005/Atom}link')
        atom_link.set('href', f"{DOMAIN}/{self.config['path']}/feed.xml")
        atom_link.set('rel', 'self')
        atom_link.set('type', 'application/rss+xml')
        
        # Channel image
        image = SubElement(channel, 'image')
        SubElement(image, 'url').text = self.config['image']
        SubElement(image, 'title').text = self.config['title']
        SubElement(image, 'link').text = f"{DOMAIN}/{self.config['path']}"
        SubElement(image, 'width').text = '144'
        SubElement(image, 'height').text = '144'
        
        # Add items
        for post in posts:
            self._add_item(channel, post)
        
        # Pretty print XML
        xml_string = tostring(rss, encoding='unicode')
        dom = minidom.parseString(xml_string)
        return dom.toprettyxml(indent='  ', encoding=None)
    
    def _add_item(self, channel: Element, post: Dict[str, Any]) -> None:
        """Add a single item to the RSS feed"""
        item = SubElement(channel, 'item')
        
        post_url = f"{DOMAIN}/{self.config['path']}/{post.get('slug', post.get('id'))}"
        
        SubElement(item, 'title').text = post.get('title', 'Untitled')
        SubElement(item, 'link').text = post_url
        SubElement(item, 'description').text = post.get('excerpt', post.get('meta_description', ''))
        
        # Full content (encoded)
        content_encoded = SubElement(item, '{http://purl.org/rss/1.0/modules/content/}encoded')
        content_encoded.text = f"<![CDATA[{post.get('content_html', post.get('content', ''))}]]>"
        
        # GUID
        guid = SubElement(item, 'guid')
        guid.set('isPermaLink', 'true')
        guid.text = post_url
        
        # Publication date
        pub_date = post.get('published_at', post.get('created_at', datetime.now(timezone.utc).isoformat()))
        if isinstance(pub_date, str):
            pub_date = datetime.fromisoformat(pub_date.replace('Z', '+00:00'))
        SubElement(item, 'pubDate').text = self._format_rfc822(pub_date)
        
        # Author
        author_email = post.get('author_email', 'hello@shoeswiper.com')
        author_name = post.get('author_name', 'ShoeSwiper Team')
        SubElement(item, 'author').text = f"{author_email} ({author_name})"
        SubElement(item, '{http://purl.org/dc/elements/1.1/}creator').text = author_name
        
        # Categories/Tags
        tags = post.get('tags', [])
        if isinstance(tags, str):
            tags = json.loads(tags) if tags.startswith('[') else [tags]
        for tag in tags:
            SubElement(item, 'category').text = tag
        
        # Featured image as enclosure
        featured_image = post.get('featured_image', post.get('image_url'))
        if featured_image:
            enclosure = SubElement(item, 'enclosure')
            enclosure.set('url', featured_image)
            enclosure.set('type', self._get_mime_type(featured_image))
            enclosure.set('length', str(post.get('image_size', 0)))
            
            # Media RSS
            media_content = SubElement(item, '{http://search.yahoo.com/mrss/}content')
            media_content.set('url', featured_image)
            media_content.set('type', self._get_mime_type(featured_image))
            
            media_title = SubElement(item, '{http://search.yahoo.com/mrss/}title')
            media_title.text = post.get('image_alt', post.get('title', ''))
    
    def _format_rfc822(self, dt: datetime) -> str:
        """Format datetime to RFC 822 format"""
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        return dt.strftime('%a, %d %b %Y %H:%M:%S %z')
    
    def _get_mime_type(self, url: str) -> str:
        """Get MIME type from URL"""
        url_lower = url.lower()
        if url_lower.endswith('.png'):
            return 'image/png'
        elif url_lower.endswith('.gif'):
            return 'image/gif'
        elif url_lower.endswith('.webp'):
            return 'image/webp'
        return 'image/jpeg'
    
    def generate_atom(self, posts: List[Dict[str, Any]]) -> str:
        """Generate Atom feed"""
        feed = Element('feed')
        feed.set('xmlns', 'http://www.w3.org/2005/Atom')
        feed.set('xmlns:media', 'http://search.yahoo.com/mrss/')
        
        # Feed metadata
        SubElement(feed, 'title').text = self.config['title']
        SubElement(feed, 'subtitle').text = self.config['description']
        
        link_self = SubElement(feed, 'link')
        link_self.set('href', f"{DOMAIN}/{self.config['path']}/atom.xml")
        link_self.set('rel', 'self')
        link_self.set('type', 'application/atom+xml')
        
        link_alt = SubElement(feed, 'link')
        link_alt.set('href', f"{DOMAIN}/{self.config['path']}")
        link_alt.set('rel', 'alternate')
        link_alt.set('type', 'text/html')
        
        SubElement(feed, 'id').text = f"{DOMAIN}/{self.config['path']}"
        SubElement(feed, 'updated').text = datetime.now(timezone.utc).isoformat()
        
        # Generator
        generator = SubElement(feed, 'generator')
        generator.set('uri', DOMAIN)
        generator.set('version', '1.0')
        generator.text = 'ShoeSwiper Atom Generator'
        
        # Icon and Logo
        SubElement(feed, 'icon').text = f"{DOMAIN}/favicon.ico"
        SubElement(feed, 'logo').text = self.config['image']
        
        # Author
        author = SubElement(feed, 'author')
        SubElement(author, 'name').text = 'ShoeSwiper Team'
        SubElement(author, 'email').text = 'hello@shoeswiper.com'
        SubElement(author, 'uri').text = DOMAIN
        
        # Add entries
        for post in posts:
            self._add_atom_entry(feed, post)
        
        xml_string = tostring(feed, encoding='unicode')
        dom = minidom.parseString(xml_string)
        return dom.toprettyxml(indent='  ', encoding=None)
    
    def _add_atom_entry(self, feed: Element, post: Dict[str, Any]) -> None:
        """Add a single entry to the Atom feed"""
        entry = SubElement(feed, 'entry')
        
        post_url = f"{DOMAIN}/{self.config['path']}/{post.get('slug', post.get('id'))}"
        
        SubElement(entry, 'title').text = post.get('title', 'Untitled')
        
        link = SubElement(entry, 'link')
        link.set('href', post_url)
        link.set('rel', 'alternate')
        link.set('type', 'text/html')
        
        SubElement(entry, 'id').text = f"urn:uuid:{self._generate_uuid(post_url)}"
        
        pub_date = post.get('published_at', post.get('created_at', datetime.now(timezone.utc).isoformat()))
        if isinstance(pub_date, str):
            pub_date_dt = datetime.fromisoformat(pub_date.replace('Z', '+00:00'))
        else:
            pub_date_dt = pub_date
        
        SubElement(entry, 'published').text = pub_date_dt.isoformat()
        
        updated = post.get('updated_at', pub_date)
        if isinstance(updated, str):
            updated_dt = datetime.fromisoformat(updated.replace('Z', '+00:00'))
        else:
            updated_dt = updated
        SubElement(entry, 'updated').text = updated_dt.isoformat()
        
        # Author
        author = SubElement(entry, 'author')
        SubElement(author, 'name').text = post.get('author_name', 'ShoeSwiper Team')
        
        # Summary
        SubElement(entry, 'summary').text = post.get('excerpt', post.get('meta_description', ''))
        
        # Content
        content = SubElement(entry, 'content')
        content.set('type', 'html')
        content.text = post.get('content_html', post.get('content', ''))
        
        # Categories
        tags = post.get('tags', [])
        if isinstance(tags, str):
            tags = json.loads(tags) if tags.startswith('[') else [tags]
        for tag in tags:
            category = SubElement(entry, 'category')
            category.set('term', tag)
            category.set('label', tag)
        
        # Featured image
        featured_image = post.get('featured_image', post.get('image_url'))
        if featured_image:
            media_content = SubElement(entry, '{http://search.yahoo.com/mrss/}content')
            media_content.set('url', featured_image)
            media_content.set('type', self._get_mime_type(featured_image))
    
    def _generate_uuid(self, content: str) -> str:
        """Generate UUID from content"""
        hash_obj = hashlib.md5(content.encode())
        hex_dig = hash_obj.hexdigest()
        return f"{hex_dig[:8]}-{hex_dig[8:12]}-{hex_dig[12:16]}-{hex_dig[16:20]}-{hex_dig[20:]}"


def upload_to_s3(content: str, key: str, content_type: str = 'application/xml') -> bool:
    """Upload content to S3"""
    try:
        s3.put_object(
            Bucket=S3_BUCKET,
            Key=key,
            Body=content.encode('utf-8'),
            ContentType=content_type,
            CacheControl='public, max-age=3600',
            ACL='public-read'
        )
        logger.info(f"Successfully uploaded {key} to S3")
        return True
    except Exception as e:
        logger.error(f"Error uploading to S3: {str(e)}")
        return False


def generate_opml() -> str:
    """Generate OPML file listing all blog feeds"""
    opml = Element('opml')
    opml.set('version', '2.0')
    
    head = SubElement(opml, 'head')
    SubElement(head, 'title').text = 'ShoeSwiper Blog Feeds'
    SubElement(head, 'dateCreated').text = datetime.now(timezone.utc).strftime('%a, %d %b %Y %H:%M:%S %z')
    SubElement(head, 'ownerName').text = 'ShoeSwiper'
    SubElement(head, 'ownerEmail').text = 'hello@shoeswiper.com'
    
    body = SubElement(opml, 'body')
    
    for blog_type, config in BLOG_CONFIGS.items():
        outline = SubElement(body, 'outline')
        outline.set('text', config['title'])
        outline.set('title', config['title'])
        outline.set('type', 'rss')
        outline.set('xmlUrl', f"{DOMAIN}/{config['path']}/feed.xml")
        outline.set('htmlUrl', f"{DOMAIN}/{config['path']}")
    
    xml_string = tostring(opml, encoding='unicode')
    dom = minidom.parseString(xml_string)
    return dom.toprettyxml(indent='  ', encoding=None)


def lambda_handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Lambda handler for RSS feed generation
    
    Triggers:
    - Scheduled (EventBridge): Generate all feeds
    - API Gateway: Generate specific feed
    - SNS: Generate feed for updated blog
    """
    logger.info(f"Event received: {json.dumps(event)}")
    
    results = {
        'success': [],
        'failed': [],
        'timestamp': datetime.now(timezone.utc).isoformat()
    }
    
    # Determine which blogs to process
    blogs_to_process = list(BLOG_CONFIGS.keys())
    
    # Check if specific blog requested
    if 'pathParameters' in event and event['pathParameters']:
        blog_type = event['pathParameters'].get('blog_type')
        if blog_type and blog_type in BLOG_CONFIGS:
            blogs_to_process = [blog_type]
    
    # Check SNS message
    if 'Records' in event:
        for record in event['Records']:
            if 'Sns' in record:
                message = json.loads(record['Sns']['Message'])
                if 'blog_type' in message:
                    blogs_to_process = [message['blog_type']]
    
    # Generate feeds for each blog
    for blog_type in blogs_to_process:
        try:
            generator = RSSFeedGenerator(blog_type)
            posts = generator.fetch_posts(limit=50)
            
            if not posts:
                logger.warning(f"No posts found for {blog_type}")
                results['failed'].append({
                    'blog': blog_type,
                    'error': 'No posts found'
                })
                continue
            
            # Generate and upload RSS feed
            rss_content = generator.generate_rss(posts)
            rss_key = f"{BLOG_CONFIGS[blog_type]['path']}/feed.xml"
            if upload_to_s3(rss_content, rss_key):
                results['success'].append({
                    'blog': blog_type,
                    'type': 'rss',
                    'url': f"{DOMAIN}/{rss_key}"
                })
            
            # Generate and upload Atom feed
            atom_content = generator.generate_atom(posts)
            atom_key = f"{BLOG_CONFIGS[blog_type]['path']}/atom.xml"
            if upload_to_s3(atom_content, atom_key):
                results['success'].append({
                    'blog': blog_type,
                    'type': 'atom',
                    'url': f"{DOMAIN}/{atom_key}"
                })
            
            logger.info(f"Successfully generated feeds for {blog_type}")
            
        except Exception as e:
            logger.error(f"Error generating feeds for {blog_type}: {str(e)}")
            results['failed'].append({
                'blog': blog_type,
                'error': str(e)
            })
    
    # Generate OPML
    try:
        opml_content = generate_opml()
        if upload_to_s3(opml_content, 'blog/feeds.opml', 'text/x-opml'):
            results['success'].append({
                'type': 'opml',
                'url': f"{DOMAIN}/blog/feeds.opml"
            })
    except Exception as e:
        logger.error(f"Error generating OPML: {str(e)}")
        results['failed'].append({
            'type': 'opml',
            'error': str(e)
        })
    
    # Return response
    status_code = 200 if not results['failed'] else 207
    
    return {
        'statusCode': status_code,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps(results)
    }


# For local testing
if __name__ == '__main__':
    # Mock event for testing
    test_event = {
        'source': 'local-test'
    }
    result = lambda_handler(test_event, None)
    print(json.dumps(result, indent=2))
