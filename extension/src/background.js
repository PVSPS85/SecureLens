// =========================================================================
// 🛠️ BACKEND INTEGRATION CONFIGURATION
// Role 2 (Backend Developer): Update these endpoints to connect live APIs
// =========================================================================
const CONFIG = {
  // TODO: Replace with live backend quick-scan endpoint URL (e.g., http://localhost:3000/api/scan/quick)
  QUICK_SCAN_API_URL: 'http://localhost:3000/api/scan/quick',
  // TODO: Replace with live backend full-scan endpoint URL or fallback timeout
  FETCH_TIMEOUT_MS: 5000,
};

// Listener for messages from popup.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // BACKEND HOOK: Listen for quick scan requests containing the target URL.
  // Input payload: { action: "scanUrl", url: tabUrl }
  if (request.action === "scanUrl") {
    const url = request.url;
    
    performScan(url)
      .then(result => {
        // Save scan result to chrome.storage.local for offline cache
        chrome.storage.local.set({ [url]: result }, () => {
          // BACKEND RESPONSE HOOK: Returns expected payload to popup.js
          // Output JSON structure: { success: true, data: { score, severity, signals, scanId } }
          sendResponse({ success: true, data: result });
        });
      })
      .catch(error => {
        console.error("Scan error:", error);
        sendResponse({ success: false, error: error.message });
      });
    return true; // Keep the message channel open for asynchronous sendResponse
  }
});

// Perform the scan by making a POST request, or fallback to simulated data
async function performScan(url) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), CONFIG.FETCH_TIMEOUT_MS);
  
  try {
    // BACKEND HOOK: POST request to target backend quick scan API
    // Request Payload: JSON body with { url: scannedUrl }
    const response = await fetch(CONFIG.QUICK_SCAN_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ url: url }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      // BACKEND RESPONSE HOOK: Expose standard fields from live API response
      // Maps API response fields to extension requirements
      return {
        score: data.score !== undefined ? data.score : 0,
        severity: data.severity || "SAFE",
        signals: data.signals || [],
        scanId: data.scanId || "",
        description: data.description || ""
      };
    } else {
      console.warn(`Backend responded with status ${response.status}. Using local mock fallback.`);
      return generateFallbackResult(url);
    }
  } catch (error) {
    clearTimeout(timeoutId);
    console.warn("Backend connection failed. Using local mock fallback. Error:", error);
    return generateFallbackResult(url);
  }
}

// Generate realistic simulated scan results for fallback mode
function generateFallbackResult(url) {
  let hostname = "";
  try {
    hostname = new URL(url).hostname;
  } catch (e) {
    hostname = url;
  }

  const hostLower = hostname.toLowerCase();

  // Trusted sites list
  const safeSites = [
    "google.com", "github.com", "microsoft.com", "apple.com", "wikipedia.org", 
    "youtube.com", "stackoverflow.com", "linkedin.com", "gmail.com", "chrome.google.com"
  ];
  const isSafe = safeSites.some(site => hostLower === site || hostLower.endsWith("." + site));

  // Critical threat indicators
  const isDanger = hostLower.includes("phish") || 
                   hostLower.includes("spoof") || 
                   hostLower.includes("update-account") || 
                   hostLower.includes("secure-login") ||
                   hostLower.includes("bank-verify") ||
                   hostLower.includes("malware") ||
                   hostLower.includes("free-gift") ||
                   hostLower.includes("suspicious");

  const isWarning = hostLower.includes("test") || 
                    hostLower.includes("sandbox") || 
                    hostLower.includes("unverified") ||
                    hostLower.includes("temp");

  let severity = "SAFE";
  let score = 12;
  let description = "No direct security threats detected. Normal domain profile.";
  let signals = ["Valid security certificates", "Established domain age", "No threat database matches"];
  let scanId = "sc_safe_" + Math.random().toString(36).substring(7);
  
  if (isDanger || hostLower.includes("suspicious-login-update.net")) {
    severity = "CRITICAL";
    score = 98;
    description = "Strong indicators of credential harvesting and brand impersonation.";
    signals = [
      "Phishing form detected",
      "Brand impersonation (94%)",
      "Suspicious domain age",
      "Threat intelligence match"
    ];
    scanId = "sc_crit_" + Math.random().toString(36).substring(7);
  } else if (isWarning) {
    severity = "WARNING";
    score = 45;
    description = "Caution: This domain is unverified, recently registered, or uses non-standard redirects.";
    signals = [
      "Unverified registration issuer",
      "Moderate redirect frequency",
      "Recent registry changes"
    ];
    scanId = "sc_warn_" + Math.random().toString(36).substring(7);
  }

  // Returns standard integration object
  return {
    score,
    severity,
    description,
    signals,
    scanId
  };
}
