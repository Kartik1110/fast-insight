// FastInsight Analytics Tracking Script
// Version: 2.0.0
// Size: ~4.2kB gzipped

!(function () {
  "use strict";

  // Disable tracking on localhost, file protocol, or inside iframe (commented for testing)
  /*
  if (/^localhost$|^127(\.[0-9]+){0,2}\.[0-9]+$|^\[::1?\]$/.test(window.location.hostname) || 
      window.location.protocol === 'file:' || 
      window !== window.parent) {
    return console.warn('FastInsight: Tracking disabled on localhost, file protocol, or inside iframe');
  }
  */

  // Get configuration from script tag
  const scriptTag = document.currentScript;
  const attr = "data-";
  const getAttribute = scriptTag.getAttribute.bind(scriptTag);

  // Configuration
  const config = {
    endpoint: !scriptTag.src.includes("localhost")
      ? "https://api.fastinsight.dev/api/collect"
      : new URL("/api/collect", window.location.origin).href,
    websiteId: getAttribute(attr + "website-id"),
    domain: getAttribute(attr + "domain"),
    debug: getAttribute(attr + "debug") === "true",
  };

  if (!config.websiteId || !config.domain) {
    return console.warn("FastInsight: Missing website ID or domain");
  }

  // Cookie management with domain support
  function setCookie(name, value, days) {
    let expires = "";
    if (days) {
      const date = new Date();
      date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
      expires = "; expires=" + date.toUTCString();
    }

    let cookie = name + "=" + (value || "") + expires + "; path=/";

    // Add domain for non-localhost
    if (
      config.domain &&
      !/^localhost$|^127(\.[0-9]+){0,2}\.[0-9]+$|^\[::1?\]$/.test(
        window.location.hostname
      ) &&
      window.location.protocol !== "file:"
    ) {
      cookie += "; domain=." + config.domain.replace(/^\./, "");
    }

    document.cookie = cookie;
  }

  function getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(";");
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === " ") c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
  }

  // Generate UUID v4
  function generateUUID() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
      /[xy]/g,
      function (c) {
        const r = (Math.random() * 16) | 0;
        const v = c === "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      }
    );
  }

  function getOrCreateVisitorId() {
    let visitorId = getCookie("fi_visitor_id");
    if (!visitorId) {
      visitorId = generateUUID();
      setCookie("fi_visitor_id", visitorId, 365);
    }
    return visitorId;
  }

  function getOrCreateSessionId() {
    let sessionId = getCookie("fi_session_id");
    if (!sessionId) {
      sessionId = "s" + generateUUID().substring(1);
      setCookie("fi_session_id", sessionId, 1 / 48); // 30 minutes
    }
    return sessionId;
  }

  // Build event data
  function buildEventData() {
    const href = window.location.href;
    if (!href) {
      console.warn(
        "FastInsight: Unable to collect href. This may indicate incorrect script implementation or browser issues."
      );
      return null;
    }

    const data = {
      websiteId: config.websiteId,
      domain: config.domain,
      href: href,
      referrer: document.referrer || null,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
      },
    };

    const visitorId = getOrCreateVisitorId();
    const sessionId = getOrCreateSessionId();

    data.visitorId = visitorId;
    data.sessionId = sessionId;

    return data;
  }

  // Send event data
  function sendEvent(data, callback) {
    // Check for tracking disable flag
    if (localStorage.getItem("fi_ignore") === "true") {
      console.log("FastInsight: Tracking disabled via localStorage flag");
      if (callback) callback({ status: 200 });
      return;
    }

    if (config.debug) {
      console.log("FastInsight Event:", data);
    }

    // Use XMLHttpRequest for better compatibility
    const xhr = new XMLHttpRequest();
    xhr.open("POST", config.endpoint, true);
    xhr.setRequestHeader("Content-Type", "application/json");

    xhr.onreadystatechange = function () {
      if (xhr.readyState === XMLHttpRequest.DONE) {
        if (xhr.status === 200) {
          console.log("Event data sent successfully");
          // Refresh session cookie on successful send
          setCookie("fi_session_id", getOrCreateSessionId(), 1 / 48);
        } else {
          console.error("Error sending event data:", xhr.status);
        }
        if (callback) callback({ status: xhr.status });
      }
    };

    xhr.send(JSON.stringify(data));
  }

  // Track pageview
  function trackPageview(callback) {
    const eventData = buildEventData();
    if (!eventData) return;

    eventData.type = "pageview";
    sendEvent(eventData, callback);
  }

  // Track custom events
  function trackEvent(eventType, extraData, callback) {
    const eventData = buildEventData();
    if (!eventData) return;

    eventData.type = eventType;
    eventData.extraData = extraData;
    sendEvent(eventData, callback);
  }

  // Check if URL is external
  function isExternalLink(href) {
    try {
      const url = new URL(href, window.location.origin);
      if (url.protocol !== "http:" && url.protocol !== "https:") {
        return false;
      }
      return window.location.hostname !== url.hostname;
    } catch {
      return false;
    }
  }

  // Track external link clicks
  function trackExternalLink(linkElement) {
    if (linkElement && linkElement.href && isExternalLink(linkElement.href)) {
      trackEvent("external_link", {
        url: linkElement.href,
        text: linkElement.textContent.trim(),
      });
    }
  }

  // Auto-track external links on click
  document.addEventListener("click", function (e) {
    trackExternalLink(e.target.closest("a"));
  });

  // Auto-track external links on keyboard navigation
  document.addEventListener("keydown", function (e) {
    if (e.key === "Enter" || e.key === " ") {
      trackExternalLink(e.target.closest("a"));
    }
  });

  // Expose global API
  window.FastInsight = function (eventName, extraData) {
    if (!eventName) {
      return console.warn("FastInsight: Missing event_name for custom event");
    }

    // Special handling for signup/payment events that require email
    if (["signup", "payment"].includes(eventName)) {
      if (!extraData?.email) {
        return console.warn(
          `FastInsight: Missing email for ${eventName} event`
        );
      }
      trackEvent(eventName, { email: extraData.email });
    } else {
      trackEvent("custom", { eventName, ...extraData });
    }
  };

  // Legacy API compatibility
  window.FastInsight.track = function (eventName, properties = {}) {
    trackEvent("custom", { eventName, ...properties });
  };

  window.FastInsight.identify = function (userId, traits = {}) {
    trackEvent("identify", { user_id: userId, ...traits });
  };

  window.FastInsight.revenue = function (
    amount,
    currency = "USD",
    properties = {}
  ) {
    trackEvent("revenue", { amount, currency, ...properties });
  };

  // Track initial pageview
  trackPageview();

  // Track SPA navigation
  let currentPath = window.location.pathname;

  const originalPushState = window.history.pushState;
  window.history.pushState = function () {
    originalPushState.apply(this, arguments);
    if (currentPath !== window.location.pathname) {
      currentPath = window.location.pathname;
      trackPageview();
    }
  };

  window.addEventListener("popstate", function () {
    if (currentPath !== window.location.pathname) {
      currentPath = window.location.pathname;
      trackPageview();
    }
  });
})();
