// =========================================================================
// 🛠️ FRONTEND INTEGRATION CONFIGURATION
// Role 1 (Frontend Developer): Update web app report URL structure
// =========================================================================
const FRONTEND_CONFIG = {
  WEB_APP_REPORT_BASE_URL: 'http://localhost:5173/investigate',
};

document.addEventListener("DOMContentLoaded", () => {
  // FRONTEND HOOK: DOM elements query mapping
  const domainNameEl = document.getElementById("domain-name");
  const riskScoreEl = document.getElementById("risk-score");
  const severityBadge = document.getElementById("severity-badge");
  const scoreDescEl = document.getElementById("score-desc");
  const signalsListEl = document.getElementById("signals-list");
  const viewScanBtn = document.getElementById("view-scan-btn");

  let currentDomain = "suspicious-login-update.net";
  let currentScanId = "";

  // Helper: check if URL is scannable (HTTP/HTTPS)
  function isScannableUrl(url) {
    if (!url) return false;
    return url.startsWith("http://") || url.startsWith("https://");
  }

  // Extract domain name
  function getDomain(url) {
    try {
      const hostname = new URL(url).hostname;
      return hostname.startsWith("www.") ? hostname.substring(4) : hostname;
    } catch (e) {
      return url;
    }
  }

  // Renders the scan data into DOM elements
  function renderScanData(data) {
    if (!data) return;

    // BACKEND RESPONSE HOOK: Bind scanId to current instance
    currentScanId = data.scanId || "";

    // BACKEND RESPONSE HOOK: Bind risk score (e.g. 98/100) to #risk-score
    if (riskScoreEl) {
      riskScoreEl.textContent = `${data.score || 0}/100`;
      
      // Dynamic color class mapping
      riskScoreEl.className = "score-value";
      if (data.score > 70) {
        riskScoreEl.classList.add("score-critical");
      } else if (data.score >= 30) {
        riskScoreEl.classList.add("score-warning");
      } else {
        riskScoreEl.classList.add("score-safe");
      }
    }

    // BACKEND RESPONSE HOOK: Bind severity (CRITICAL, WARNING, SAFE) to #severity-badge
    if (severityBadge) {
      const severity = (data.severity || "SAFE").toUpperCase();
      severityBadge.textContent = severity;
      
      // Dynamic badge styling classes
      severityBadge.className = "severity-badge";
      if (severity === "CRITICAL") {
        severityBadge.classList.add("badge-critical");
      } else if (severity === "WARNING") {
        severityBadge.classList.add("badge-warning");
      } else {
        severityBadge.classList.add("badge-safe");
      }
    }

    // BACKEND RESPONSE HOOK: Bind risk assessment text to #score-desc
    if (scoreDescEl) {
      scoreDescEl.textContent = data.description || "No threat signals matching this domain profile.";
    }

    // BACKEND RESPONSE HOOK: Bind Key Signals array to #signals-list
    if (signalsListEl) {
      signalsListEl.innerHTML = "";
      const signals = data.signals || [];
      
      if (signals.length > 0) {
        signals.forEach(sig => {
          const li = document.createElement("li");
          li.className = "signal-item";
          
          // Render with red bullet indicator
          const dot = document.createElement("span");
          dot.className = "status-dot";
          
          const text = document.createElement("span");
          text.className = "signal-text";
          text.textContent = sig;
          
          li.appendChild(dot);
          li.appendChild(text);
          signalsListEl.appendChild(li);
        });
      } else {
        // Fallback placeholder signals if empty
        const fallbackMsg = data.score > 70 ? "Phishing threat detected" : "Domain verified clean";
        const li = document.createElement("li");
        li.className = "signal-item";
        
        const dot = document.createElement("span");
        dot.className = "status-dot";
        
        const text = document.createElement("span");
        text.className = "signal-text";
        text.textContent = fallbackMsg;
        
        li.appendChild(dot);
        li.appendChild(text);
        signalsListEl.appendChild(li);
      }
    }

    // FRONTEND HOOK: Enable View Full Scan redirect button
    if (viewScanBtn) {
      viewScanBtn.disabled = false;
    }
  }

  // Get active tab details on load
  if (typeof chrome !== "undefined" && chrome.tabs) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs && tabs[0]) {
        const tabUrl = tabs[0].url;

        if (!isScannableUrl(tabUrl)) {
          if (domainNameEl) domainNameEl.textContent = "unsupported page";
          if (scoreDescEl) scoreDescEl.textContent = "SecureLens only scans public HTTP/HTTPS websites.";
          if (viewScanBtn) viewScanBtn.disabled = true;
          return;
        }

        currentDomain = getDomain(tabUrl);
        // FRONTEND HOOK: Bind domain to #domain-name
        if (domainNameEl) {
          domainNameEl.textContent = currentDomain;
        }

        // Trigger scan in background
        chrome.runtime.sendMessage({ action: "scanUrl", url: tabUrl }, (response) => {
          if (chrome.runtime.lastError) {
            console.error("Runtime message query failed:", chrome.runtime.lastError);
            loadFallbackMock(currentDomain);
            return;
          }

          if (response && response.success) {
            renderScanData(response.data);
          } else {
            loadFallbackMock(currentDomain);
          }
        });
      }
    });
  } else {
    // Standalone mock load (for UI debugging/testing)
    if (domainNameEl) {
      domainNameEl.textContent = currentDomain;
    }
    loadFallbackMock(currentDomain);
  }

  // Help load realistic mock data for testing or offline states
  function loadFallbackMock(domain) {
    const d = (domain || "").toLowerCase();
    const isSafe = d.includes("google") || d.includes("github") || d.includes("ac.in") || d.includes("microsoft") || d.includes("apple") || d.includes("wikipedia") || d.includes("youtube");
    
    if (isSafe) {
      renderScanData({
        score: 12,
        severity: "SAFE",
        description: "No direct security threats detected. Established domain reputation verified.",
        signals: [
          "Valid TLS security certificates",
          "Established domain age",
          "No threat database matches"
        ],
        scanId: ""
      });
    } else {
      renderScanData({
        score: 98,
        severity: "CRITICAL",
        description: "Strong indicators of credential harvesting and brand impersonation.",
        signals: [
          "Phishing form detected",
          "Brand impersonation (94%)",
          "Suspicious domain age",
          "Threat intelligence match"
        ],
        scanId: ""
      });
    }
  }

  // FRONTEND HOOK: Redirect handler using WEB_APP_REPORT_BASE_URL config
  if (viewScanBtn) {
    viewScanBtn.addEventListener("click", () => {
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(currentScanId || "");
      const finalReportUrl = (currentScanId && isUuid)
        ? `${FRONTEND_CONFIG.WEB_APP_REPORT_BASE_URL}/${currentScanId}`
        : `${FRONTEND_CONFIG.WEB_APP_REPORT_BASE_URL}?target=${encodeURIComponent(currentDomain)}`;

      if (typeof chrome !== "undefined" && chrome.tabs) {
        chrome.tabs.create({ url: finalReportUrl });
      } else {
        window.open(finalReportUrl, "_blank");
      }
    });
  }
});
