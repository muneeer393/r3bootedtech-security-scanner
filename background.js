// background.js - Handles security checks for HTTPS and SSL certificates

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "scan") {
        const url = message.url;
        console.log("📩 Message received in background script:", message);

        // Run the security checks
        checkSecurity(url).then(result => {
            console.log("📤 Sending response to popup:", result);
            sendResponse(result);
        }).catch(err => {
            console.error("⚠️ Error during security check:", err);
            sendResponse({ level: "red", details: ["An error occurred while scanning."] });
        });

        // Return true to indicate we'll respond asynchronously
        return true;
    }
});

async function checkSecurity(url) {
    let securityLevel = "green"; // Default: Secure
    let details = [];

    // Ensure URL is properly formed
    if (!url) {
        throw new Error("No URL provided");
    }

    // Check if the site uses HTTPS
    if (!url.startsWith("https://")) {
        securityLevel = "yellow"; // Moderate Risk
        details.push("Site is not using HTTPS.");
    } else {
        // Check if the site is reachable and has a valid SSL certificate
        try {
            const response = await fetch(url, { method: "HEAD", mode: "no-cors" });

            // Check response status (non-200 status means potential vulnerability)
            if (!response.ok) {
                securityLevel = "red"; // High Risk
                details.push("Site may not have a valid SSL certificate or is unreachable.");
            } else {
                details.push("Website is secure.");
            }
        } catch (error) {
            // If there's an error (network issue, SSL issue, etc.)
            securityLevel = "red"; // High Risk
            details.push("Site may not have a valid SSL certificate or is unreachable.");
        }
    }

    return { level: securityLevel, details };
}


