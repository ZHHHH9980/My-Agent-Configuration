const fs = require('fs');
const path = require('path');
const os = require('os');

class BrowserUtils {
  constructor() {
    this.cookieDir = path.join(__dirname, '../../.cookies');
    this.ensureCookieDir();
  }

  ensureCookieDir() {
    if (!fs.existsSync(this.cookieDir)) {
      fs.mkdirSync(this.cookieDir, { recursive: true });
    }
  }

  // Get Chrome user data directory for macOS
  getChromeUserDataDir() {
    const homeDir = os.homedir();
    const chromePaths = [
      path.join(homeDir, 'Library/Application Support/Google/Chrome'),
      path.join(homeDir, 'Library/Application Support/Chromium'),
    ];
    
    for (const chromePath of chromePaths) {
      if (fs.existsSync(chromePath)) {
        return chromePath;
      }
    }
    
    return null;
  }

  // Get default Chrome profile path
  getDefaultChromeProfile() {
    const chromeDir = this.getChromeUserDataDir();
    if (!chromeDir) return null;
    
    const defaultProfile = path.join(chromeDir, 'Default');
    if (fs.existsSync(defaultProfile)) {
      return defaultProfile;
    }
    
    // Try to find any profile
    const profiles = fs.readdirSync(chromeDir)
      .filter(item => item.startsWith('Profile') || item === 'Default');
    
    if (profiles.length > 0) {
      return path.join(chromeDir, profiles[0]);
    }
    
    return null;
  }

  // Enhanced browser launch options with advanced stealth
  getEnhancedLaunchOptions() {
    const chromeProfile = this.getDefaultChromeProfile();
    const launchOptions = {
      headless: false, // Use visible browser for debugging
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu',
        '--window-size=1920,1080',
        '--disable-blink-features=AutomationControlled',
        '--disable-features=IsolateOrigins,site-per-process',
        '--disable-web-security',
        '--disable-features=AudioServiceOutOfProcess',
        '--disable-background-timer-throttling',
        '--disable-backgrounding-occluded-windows',
        '--disable-renderer-backgrounding',
        '--disable-background-networking',
        '--disable-sync',
        '--metrics-recording-only',
        '--disable-default-apps',
        '--mute-audio',
        '--no-default-browser-check',
        '--no-first-run',
        '--disable-component-update',
        '--disable-domain-reliability',
        '--disable-client-side-phishing-detection',
        '--disable-hang-monitor',
        '--disable-prompt-on-repost',
        '--disable-ipc-flooding-protection',
        '--disable-breakpad',
        '--disable-component-extensions-with-background-pages',
        '--disable-extensions',
        '--disable-features=TranslateUI,BlinkGenPropertyTrees',
        '--enable-features=NetworkService,NetworkServiceInProcess',
        '--hide-scrollbars',
        '--disable-logging',
        '--disable-dev-tools',
        '--remote-debugging-port=0',
        '--disable-search-engine-choice-screen',
        '--password-store=basic',
        '--use-mock-keychain',
        '--disable-infobars',
        `--user-agent=Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36`,
        `--lang=en-US,en;q=0.9`,
      ]
    };

    // Add Chrome executable path
    const chromePaths = [
      '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
      '/Applications/Chromium.app/Contents/MacOS/Chromium',
      '/usr/bin/google-chrome-stable',
      '/usr/bin/google-chrome',
      '/usr/bin/chromium',
      '/usr/bin/chrome'
    ];

    for (const chromePath of chromePaths) {
      if (fs.existsSync(chromePath)) {
        launchOptions.executablePath = chromePath;
        break;
      }
    }

    // Add user data directory if available
    if (chromeProfile) {
      launchOptions.userDataDir = chromeProfile;
      console.log(`📂 Using Chrome profile: ${chromeProfile}`);
    } else {
      console.log('⚠️ No Chrome profile found, using fresh session');
    }

    return launchOptions;
  }

  // Enhanced page setup with advanced stealth
  async setupEnhancedPage(page) {
    // Inject advanced stealth script
    await page.evaluateOnNewDocument(() => {
      // Override the Permissions API
      const originalQuery = window.navigator.permissions.query;
      window.navigator.permissions.query = (parameters) => (
        parameters.name === 'notifications' ?
          Promise.resolve({ state: Notification.permission }) :
          originalQuery(parameters)
      );

      // Override the plugins property
      Object.defineProperty(navigator, 'plugins', {
        get: () => [1, 2, 3, 4, 5],
      });

      // Override the languages property
      Object.defineProperty(navigator, 'languages', {
        get: () => ['en-US', 'en'],
      });

      // Override the webdriver property
      Object.defineProperty(navigator, 'webdriver', {
        get: () => false,
      });

      // Override chrome runtime
      window.chrome = {
        runtime: {},
        loadTimes: () => {},
        csi: () => {},
        app: {}
      };

      // Override permissions
      const originalPermissions = window.Notification.permission;
      Object.defineProperty(window.Notification, 'permission', {
        get: () => 'denied',
      });

      // Mock missing permissions
      Object.defineProperty(navigator, 'permissions', {
        get: () => ({
          query: () => Promise.resolve({ state: 'denied' })
        }),
      });

      // Add missing properties
      Object.defineProperty(navigator, 'connection', {
        get: () => ({
          downlink: 10,
          effectiveType: '4g',
          rtt: 50,
          saveData: false,
          type: 'wifi'
        }),
      });

      // Mock media devices
      Object.defineProperty(navigator, 'mediaDevices', {
        get: () => ({
          enumerateDevices: () => Promise.resolve([]),
          getUserMedia: () => Promise.reject(new Error('Permission denied'))
        }),
      });

      // Override console.debug to hide debug messages
      const originalDebug = console.debug;
      console.debug = () => {};

      // Mock WebGL
      const getParameter = WebGLRenderingContext.prototype.getParameter;
      WebGLRenderingContext.prototype.getParameter = function(parameter) {
        if (parameter === 37445) {
          return 'Intel Inc.';
        }
        if (parameter === 37446) {
          return 'Intel Iris OpenGL Engine';
        }
        return getParameter.call(this, parameter);
      };

      // Mock canvas fingerprinting
      const toDataURL = HTMLCanvasElement.prototype.toDataURL;
      HTMLCanvasElement.prototype.toDataURL = function(type) {
        if (type === 'image/png') {
          return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
        }
        return toDataURL.call(this, type);
      };
    });

    // Set viewport
    await page.setViewport({ 
      width: 1920, 
      height: 1080,
      deviceScaleFactor: 1,
      hasTouch: false,
      isLandscape: false,
      isMobile: false
    });

    // Set extra HTTP headers
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
      'Accept-Encoding': 'gzip, deflate, br',
      'Cache-Control': 'max-age=0',
      'Upgrade-Insecure-Requests': '1',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'none',
      'Sec-Fetch-User': '?1',
      'Sec-Ch-Ua': '"Google Chrome";v="120", "Chromium";v="120", "Not=A?Brand";v="99"',
      'Sec-Ch-Ua-Mobile': '?0',
      'Sec-Ch-Ua-Platform': '"macOS"',
      'Sec-Ch-Ua-Platform-Version': '"13.0"',
      'Sec-Ch-Ua-Full-Version': '"120.0.6099.129"',
      'Sec-Ch-Ua-Arch': '"x86"',
      'Sec-Ch-Ua-Model': '""',
      'Sec-Ch-Ua-Bitness': '"64"',
      'Sec-Ch-Ua-Wow64': '?0'
    });

    // Set JavaScript enabled
    await page.setJavaScriptEnabled(true);

    // Set offline mode to false
    await page.setOfflineMode(false);

    // Set cache enabled
    await page.setCacheEnabled(true);

    // Set request interception to modify requests
    await page.setRequestInterception(true);
    page.on('request', (request) => {
      // Block unnecessary resources
      const resourceType = request.resourceType();
      if (['image', 'stylesheet', 'font', 'media'].includes(resourceType)) {
        request.abort();
      } else {
        request.continue();
      }
    });
  }

  // Save cookies to file
  async saveCookies(page, source) {
    try {
      const cookies = await page.cookies();
      const cookieFile = path.join(this.cookieDir, `${source}-cookies.json`);
      fs.writeFileSync(cookieFile, JSON.stringify(cookies, null, 2));
      console.log(`🍪 Saved ${cookies.length} cookies for ${source}`);
      return true;
    } catch (error) {
      console.error(`Error saving cookies for ${source}:`, error.message);
      return false;
    }
  }

  // Load cookies from file
  async loadCookies(page, source) {
    try {
      const cookieFile = path.join(this.cookieDir, `${source}-cookies.json`);
      if (!fs.existsSync(cookieFile)) {
        console.log(`No saved cookies found for ${source}`);
        return false;
      }

      const cookiesData = fs.readFileSync(cookieFile, 'utf8');
      const cookies = JSON.parse(cookiesData);
      
      if (cookies.length > 0) {
        await page.setCookie(...cookies);
        console.log(`🍪 Loaded ${cookies.length} cookies for ${source}`);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error(`Error loading cookies for ${source}:`, error.message);
      return false;
    }
  }

  // Check if page is blocked
  async isPageBlocked(page) {
    const blockedIndicators = await page.evaluate(() => {
      const bodyText = document.body.textContent.toLowerCase();
      const blockedKeywords = [
        'unusual activity',
        'bot detected',
        'access denied',
        'please verify',
        'security check',
        'captcha',
        'cloudflare',
        'distil networks',
        'imperva',
        'akamai'
      ];
      
      return blockedKeywords.some(keyword => bodyText.includes(keyword));
    });
    
    if (blockedIndicators) {
      console.log('🚫 Page appears to be blocked by bot detection');
      return true;
    }
    
    return false;
  }

  // Simulate human-like behavior
  async simulateHumanBehavior(page) {
    // Random mouse movements
    await page.mouse.move(
      Math.floor(Math.random() * 500) + 100,
      Math.floor(Math.random() * 300) + 100
    );
    
    // Random scroll
    await page.evaluate(() => {
      window.scrollBy(0, Math.floor(Math.random() * 200) + 50);
    });
    
    // Random delay (1-3 seconds)
    await page.waitForTimeout(Math.floor(Math.random() * 2000) + 1000);
  }

  // Take screenshot for debugging
  async takeDebugScreenshot(page, filename) {
    try {
      const screenshotPath = `/tmp/${filename}-${Date.now()}.png`;
      await page.screenshot({ 
        path: screenshotPath, 
        fullPage: false,
        type: 'png'
      });
      console.log(`📸 Debug screenshot saved: ${screenshotPath}`);
      return screenshotPath;
    } catch (error) {
      console.error('Error taking screenshot:', error.message);
      return null;
    }
  }
}

module.exports = new BrowserUtils();