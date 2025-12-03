/**
 * Health Check Script for ShoeSwiper Deployments
 *
 * Verifies that the deployed application is accessible and functioning correctly.
 *
 * Usage: node health-check.js <deployment-url>
 *
 * Exit codes:
 *   0 - All checks passed
 *   1 - One or more checks failed
 */

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 5000;

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchWithRetry(url, options = {}, retries = MAX_RETRIES) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'User-Agent': 'ShoeSwiper-HealthCheck/1.0',
          ...options.headers,
        },
      });
      return response;
    } catch (error) {
      console.log(`  Attempt ${attempt}/${retries} failed: ${error.message}`);
      if (attempt < retries) {
        console.log(`  Retrying in ${RETRY_DELAY_MS / 1000}s...`);
        await sleep(RETRY_DELAY_MS);
      } else {
        throw error;
      }
    }
  }
}

async function checkMainPage(baseUrl) {
  console.log('\n📄 Checking main page...');
  try {
    const response = await fetchWithRetry(baseUrl);
    if (response.status === 200) {
      console.log('  ✅ Main page returns HTTP 200');
      return { success: true };
    } else {
      console.log(`  ❌ Main page returned HTTP ${response.status}`);
      return { success: false, error: `HTTP ${response.status}` };
    }
  } catch (error) {
    console.log(`  ❌ Failed to reach main page: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function checkHtmlContent(baseUrl) {
  console.log('\n📝 Checking HTML content...');
  try {
    const response = await fetchWithRetry(baseUrl);
    const html = await response.text();

    // Check for essential HTML elements
    const checks = [
      { name: 'DOCTYPE', pattern: /<!DOCTYPE html>/i },
      { name: 'Root div', pattern: /<div id="root"/ },
      { name: 'Script tag', pattern: /<script.*type="module"/ },
    ];

    let allPassed = true;
    for (const check of checks) {
      if (check.pattern.test(html)) {
        console.log(`  ✅ ${check.name} found`);
      } else {
        console.log(`  ❌ ${check.name} not found`);
        allPassed = false;
      }
    }

    return { success: allPassed };
  } catch (error) {
    console.log(`  ❌ Failed to check HTML content: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function checkStaticAssets(baseUrl) {
  console.log('\n🎨 Checking static assets...');
  try {
    // Get the main page and extract asset URLs
    const response = await fetchWithRetry(baseUrl);
    const html = await response.text();

    // Look for JS and CSS assets
    const jsMatches = html.match(/src="([^"]+\.js)"/g) || [];
    const cssMatches = html.match(/href="([^"]+\.css)"/g) || [];

    const assets = [];

    // Extract JS asset paths
    jsMatches.forEach((match) => {
      const path = match.match(/src="([^"]+)"/)?.[1];
      if (path && path.startsWith('/')) {
        assets.push({ type: 'JS', path });
      }
    });

    // Extract CSS asset paths
    cssMatches.forEach((match) => {
      const path = match.match(/href="([^"]+)"/)?.[1];
      if (path && path.startsWith('/') && path.endsWith('.css')) {
        assets.push({ type: 'CSS', path });
      }
    });

    if (assets.length === 0) {
      console.log('  ℹ️  No static assets found to check (may be inline or CDN)');
      return { success: true };
    }

    let allPassed = true;
    for (const asset of assets) {
      const assetUrl = new URL(asset.path, baseUrl).toString();
      try {
        const assetResponse = await fetchWithRetry(assetUrl);
        if (assetResponse.status === 200) {
          console.log(`  ✅ ${asset.type}: ${asset.path}`);
        } else {
          console.log(`  ❌ ${asset.type}: ${asset.path} (HTTP ${assetResponse.status})`);
          allPassed = false;
        }
      } catch (error) {
        console.log(`  ❌ ${asset.type}: ${asset.path} (${error.message})`);
        allPassed = false;
      }
    }

    return { success: allPassed };
  } catch (error) {
    console.log(`  ❌ Failed to check static assets: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function checkResponseTime(baseUrl) {
  console.log('\n⏱️  Checking response time...');
  const startTime = Date.now();
  try {
    await fetchWithRetry(baseUrl);
    const responseTime = Date.now() - startTime;
    const threshold = 10000; // 10 seconds

    if (responseTime < threshold) {
      console.log(`  ✅ Response time: ${responseTime}ms (threshold: ${threshold}ms)`);
      return { success: true, responseTime };
    } else {
      console.log(
        `  ⚠️  Response time: ${responseTime}ms exceeds threshold of ${threshold}ms`
      );
      return { success: true, responseTime, warning: true }; // Warning but not failure
    }
  } catch (error) {
    console.log(`  ❌ Failed to measure response time: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function runHealthChecks(deploymentUrl) {
  console.log('🏥 ShoeSwiper Health Check');
  console.log('==========================');
  console.log(`📍 Target: ${deploymentUrl}`);
  console.log(`🕐 Time: ${new Date().toISOString()}`);

  const results = {
    mainPage: await checkMainPage(deploymentUrl),
    htmlContent: await checkHtmlContent(deploymentUrl),
    staticAssets: await checkStaticAssets(deploymentUrl),
    responseTime: await checkResponseTime(deploymentUrl),
  };

  // Summary
  console.log('\n📊 Summary');
  console.log('==========');

  const passed = Object.entries(results).filter(([, r]) => r.success).length;
  const total = Object.keys(results).length;

  Object.entries(results).forEach(([name, result]) => {
    const status = result.success ? '✅' : '❌';
    console.log(`${status} ${name}`);
  });

  console.log(`\nTotal: ${passed}/${total} checks passed`);

  // Determine exit code
  const allPassed = Object.values(results).every((r) => r.success);

  if (allPassed) {
    console.log('\n🎉 All health checks passed!');
    return 0;
  } else {
    console.log('\n💥 Some health checks failed!');
    return 1;
  }
}

// Main execution
const deploymentUrl = process.argv[2] || process.env.DEPLOYMENT_URL;

if (!deploymentUrl) {
  console.error('❌ Error: No deployment URL provided');
  console.error('Usage: node health-check.js <deployment-url>');
  console.error('Or set DEPLOYMENT_URL environment variable');
  process.exit(1);
}

// Validate URL
try {
  new URL(deploymentUrl);
} catch {
  console.error(`❌ Error: Invalid URL: ${deploymentUrl}`);
  process.exit(1);
}

runHealthChecks(deploymentUrl)
  .then((exitCode) => process.exit(exitCode))
  .catch((error) => {
    console.error('❌ Unexpected error:', error);
    process.exit(1);
  });
