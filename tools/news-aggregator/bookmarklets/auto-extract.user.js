// ==UserScript==
// @name         News Aggregator Auto-Extract
// @namespace    http://localhost:3001
// @version      1.0
// @description  Automatically extract articles from Bloomberg/WSJ and send to News Aggregator
// @author       News Aggregator
// @match        https://www.bloomberg.com/*
// @match        https://www.wsj.com/*
// @grant        GM_xmlhttpRequest
// @grant        GM_notification
// @connect      localhost
// ==/UserScript==

(function() {
    'use strict';
    
    const SERVER_URL = 'http://localhost:3001';
    const EXTRACTION_DELAY = 3000; // Wait 3 seconds for page to load
    const MAX_ARTICLES = 10;
    
    // Determine source from URL
    const source = window.location.hostname.includes('bloomberg') ? 'bloomberg' : 'wsj';
    
    console.log(`📰 News Aggregator: Auto-extracting from ${source}`);
    
    // Wait for page to load, then extract
    setTimeout(extractAndSend, EXTRACTION_DELAY);
    
    function extractAndSend() {
        const articles = extractArticles();
        
        if (articles.length === 0) {
            console.log('📰 No articles found on this page');
            return;
        }
        
        console.log(`📊 Found ${articles.length} articles from ${source}`);
        sendToServer(articles);
    }
    
    function extractArticles() {
        const articles = [];
        const selectors = getSelectorsForSource(source);
        
        for (const selector of selectors) {
            if (articles.length >= MAX_ARTICLES) break;
            
            const links = document.querySelectorAll(selector);
            links.forEach(link => {
                if (articles.length >= MAX_ARTICLES) return;
                
                const href = link.href;
                const text = link.textContent?.trim() || link.innerText?.trim() || '';
                
                if (isValidArticle(href, text, source)) {
                    const parent = link.closest('article, div, section, li') || link.parentElement;
                    const parentText = parent?.textContent?.trim() || text;
                    const title = parentText.length > text.length ? parentText : text;
                    
                    articles.push({
                        title: cleanTitle(title),
                        url: href,
                        source: source,
                        timestamp: Date.now()
                    });
                }
            });
        }
        
        return removeDuplicates(articles);
    }
    
    function getSelectorsForSource(source) {
        if (source === 'bloomberg') {
            return [
                'a[href*="/news/articles/"]',
                'article a',
                '.story-list a',
                '.headline a',
                '[data-component="headline"] a',
                'h1 a', 'h2 a', 'h3 a'
            ];
        } else { // wsj
            return [
                'a[href*="/articles/"]',
                'article a',
                '.WSJTheme--headline--',
                '[data-testid="headline"] a',
                '.headline a',
                'h1 a', 'h2 a', 'h3 a'
            ];
        }
    }
    
    function isValidArticle(href, text, source) {
        if (!href || !text) return false;
        if (text.length < 10 || text.length > 200) return false;
        
        const blockedTerms = ['Subscribe', 'Sign In', 'Log In', 'Register', 'Account'];
        if (blockedTerms.some(term => text.includes(term))) return false;
        
        // Source-specific URL validation
        if (source === 'bloomberg' && !href.includes('bloomberg.com')) return false;
        if (source === 'wsj' && !href.includes('wsj.com')) return false;
        
        return true;
    }
    
    function cleanTitle(title) {
        return title
            .substring(0, 150)
            .replace(/\s+/g, ' ')
            .replace(/\n/g, ' ')
            .trim();
    }
    
    function removeDuplicates(articles) {
        const unique = [];
        const seen = new Set();
        
        for (const article of articles) {
            if (!seen.has(article.url)) {
                seen.add(article.url);
                unique.push(article);
            }
        }
        
        return unique;
    }
    
    function sendToServer(articles) {
        GM_xmlhttpRequest({
            method: 'POST',
            url: `${SERVER_URL}/api/bookmarklet`,
            headers: {
                'Content-Type': 'application/json'
            },
            data: JSON.stringify({
                articles: articles,
                source: source,
                url: window.location.href,
                auto: true
            }),
            onload: function(response) {
                if (response.status === 200) {
                    console.log(`✅ Sent ${articles.length} articles to News Aggregator`);
                    
                    // Optional: Show notification
                    if (typeof GM_notification !== 'undefined') {
                        GM_notification({
                            title: 'News Aggregator',
                            text: `Added ${articles.length} articles from ${source}`,
                            timeout: 3000
                        });
                    }
                } else {
                    console.error('❌ Server error:', response.status, response.responseText);
                }
            },
            onerror: function(error) {
                console.error('❌ Network error:', error);
            }
        });
    }
    
    // Also extract on URL changes (SPA navigation)
    let lastUrl = location.href;
    new MutationObserver(() => {
        const url = location.href;
        if (url !== lastUrl) {
            lastUrl = url;
            setTimeout(extractAndSend, EXTRACTION_DELAY);
        }
    }).observe(document, {subtree: true, childList: true});
    
})();