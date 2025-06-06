(function() {
  'use strict';
  
  // Get the script tag to extract configuration
  const script = document.currentScript || document.querySelector('script[data-website-id]');
  if (!script) {
    console.warn('FastInsight: No script tag found with data-website-id');
    return;
  }
  
  const websiteId = script.getAttribute('data-website-id');
  const apiUrl = script.getAttribute('data-api-url') || '/api/collect';
  
  if (!websiteId) {
    console.warn('FastInsight: data-website-id is required');
    return;
  }
  
  // Generate visitor ID (stored in localStorage)
  function getVisitorId() {
    let visitorId = localStorage.getItem('fi_visitor_id');
    if (!visitorId) {
      visitorId = 'fi_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      localStorage.setItem('fi_visitor_id', visitorId);
    }
    return visitorId;
  }
  
  // Generate session ID (stored in sessionStorage)
  function getSessionId() {
    let sessionId = sessionStorage.getItem('fi_session_id');
    if (!sessionId) {
      sessionId = 'fs_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
      sessionStorage.setItem('fi_session_id', sessionId);
    }
    return sessionId;
  }
  
  // Send event to analytics API
  function sendEvent(eventData) {
    const data = {
      websiteId: websiteId,
      visitorId: getVisitorId(),
      sessionId: getSessionId(),
      timestamp: new Date().toISOString(),
      url: window.location.href,
      referrer: document.referrer || null,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      },
      domain: window.location.hostname,
      ...eventData
    };
    
    console.log('📤 Sending event:', data);
    
    // Use fetch instead of sendBeacon for better debugging
    fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
      keepalive: true
    })
    .then(function(response) {
      if (response.ok) {
        console.log('✅ Event sent successfully');
        return response.json();
      } else {
        console.error('❌ Event failed with status:', response.status);
        return response.text().then(function(text) {
          console.error('Error details:', text);
        });
      }
    })
    .then(function(result) {
      if (result) {
        console.log('📊 Event result:', result);
      }
    })
    .catch(function(err) {
      console.error('❌ Failed to send event:', err);
    });
  }
  
  // Track page view
  function trackPageView() {
    sendEvent({
      type: 'pageview',
      name: 'pageview'
    });
  }
  
  // Track custom event
  function trackEvent(eventName, properties) {
    properties = properties || {};
    sendEvent({
      type: 'custom',
      name: eventName,
      properties: properties
    });
  }
  
  // Track revenue event
  function trackRevenue(amount, currency, properties) {
    currency = currency || 'USD';
    properties = properties || {};
    sendEvent({
      type: 'revenue',
      name: 'purchase',
      amount: amount,
      currency: currency,
      properties: properties
    });
  }
  
  // Track outbound link clicks
  function trackOutboundLinks() {
    document.addEventListener('click', function(e) {
      const link = e.target.closest('a');
      if (link && link.href) {
        const url = new URL(link.href, window.location.href);
        if (url.hostname !== window.location.hostname) {
          sendEvent({
            type: 'outbound',
            name: 'external_link',
            properties: {
              url: link.href,
              text: link.textContent || link.innerText || ''
            }
          });
        }
      }
    });
  }
  
  // Track file downloads
  function trackDownloads() {
    const downloadExtensions = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.zip', '.rar', '.tar', '.gz'];
    
    document.addEventListener('click', function(e) {
      const link = e.target.closest('a');
      if (link && link.href) {
        const url = new URL(link.href, window.location.href);
        const pathname = url.pathname.toLowerCase();
        
        if (downloadExtensions.some(function(ext) { return pathname.endsWith(ext); })) {
          sendEvent({
            type: 'download',
            name: 'file_download',
            properties: {
              url: link.href,
              filename: pathname.split('/').pop() || '',
              text: link.textContent || link.innerText || ''
            }
          });
        }
      }
    });
  }
  
  // Initialize tracking
  function init() {
    // Track initial page view
    trackPageView();
    
    // Set up automatic tracking
    trackOutboundLinks();
    trackDownloads();
    
    // Track page visibility changes (for session duration)
    var startTime = Date.now();
    document.addEventListener('visibilitychange', function() {
      if (document.visibilityState === 'hidden') {
        var timeOnPage = Date.now() - startTime;
        sendEvent({
          type: 'engagement',
          name: 'time_on_page',
          properties: {
            duration: timeOnPage
          }
        });
      } else {
        startTime = Date.now();
      }
    });
    
    // Track before page unload
    window.addEventListener('beforeunload', function() {
      var timeOnPage = Date.now() - startTime;
      sendEvent({
        type: 'engagement',
        name: 'time_on_page',
        properties: {
          duration: timeOnPage
        }
      });
    });
  }
  
  // Expose public API
  window.fastinsight = {
    track: trackEvent,
    revenue: trackRevenue,
    pageview: trackPageView
  };
  
  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})(); 