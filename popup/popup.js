// popup.js - Handles user interaction with the security scanner

document.addEventListener("DOMContentLoaded", () => {
    const scanCurrentButton = document.getElementById("scan-current");
    const scanCustomButton = document.getElementById("scan-custom");
    const resultDisplay = document.getElementById("result");
    const detailsSection = document.getElementById("details");
    const seeMoreButton = document.getElementById("seeMore");
    const customUrlInput = document.getElementById("custom-url");
    const securityBar = document.getElementById("securityBar");
    const securityBarContainer = document.getElementById("securityBarContainer");

    // Make security bar vertical
    securityBarContainer.style.width = "10px";
    securityBarContainer.style.height = "100px";
    securityBarContainer.style.position = "absolute";
    securityBarContainer.style.right = "5px";
    securityBarContainer.style.top = "50%";
    securityBarContainer.style.transform = "translateY(-50%)";
    securityBarContainer.style.backgroundColor = "#222";

    securityBar.style.width = "100%";
    securityBar.style.height = "0%";

    function updateSecurityBar(level) {
        const securityBar = document.getElementById("securityBar");
        if (level === "green") {
            securityBar.style.backgroundColor = "green";
            securityBar.style.height = "100%"; // Full height for secure
        } else if (level === "yellow") {
            securityBar.style.backgroundColor = "orange";
            securityBar.style.height = "50%"; // Half for moderate risk
        } else if (level === "red") {
            securityBar.style.backgroundColor = "red";
            securityBar.style.height = "25%"; // Small for high risk
        } else {
            securityBar.style.height = "0";
        }
    }          

    function performScan(url, isCurrentTab) {
        resultDisplay.innerHTML = "🔄 Scanning...";
        detailsSection.style.display = "none";
        seeMoreButton.style.display = "none";

        chrome.runtime.sendMessage({ action: "scan", url }, (response) => {
            if (!response) {
                resultDisplay.innerHTML = "❌ Error communicating with the background script.";
                return;
            }

            // Compact scan info
            let scannedInfo = `<p style="font-size: 0.75rem; color: #aaa; margin-top: 5px;">
                                ${isCurrentTab ? "(Scanned Current Tab)" : "(Scanned URL)"}
                              </p>`;

            let levelText = "";
            if (response.level === "green") {
                levelText = "✅ Site is Secure";
                resultDisplay.style.color = "green";
            } else if (response.level === "yellow") {
                levelText = "⚠️ Moderate Risk";
                resultDisplay.style.color = "orange";
            } else {
                levelText = "❌ Vulnerable / Unsafe";
                resultDisplay.style.color = "red";
            }

            resultDisplay.innerHTML = levelText + scannedInfo;
            updateSecurityBar(response.level);

            detailsSection.innerHTML = response.details.map(detail => `<li>${detail}</li>`).join("\n");
            if (response.details.length > 0) {
                seeMoreButton.style.display = "block";
            }
        });
    }

    scanCurrentButton.addEventListener("click", () => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs.length === 0) return;
            performScan(tabs[0].url, true);
        });
    });

    scanCustomButton.addEventListener("click", () => {
        const url = customUrlInput.value.trim();
        
        // Clear previous result before checking input
        resultDisplay.innerHTML = "";
        detailsSection.style.display = "none";
        seeMoreButton.style.display = "none";
        updateSecurityBar(""); // Reset security bar
        
        if (url === "") {
            resultDisplay.innerHTML = "❌ Please enter a valid URL.";
            return;
        }
    
        performScan(url, false);
    });
    
    seeMoreButton.addEventListener("click", () => {
        if (detailsSection.style.display === "none" || detailsSection.style.display === "") {
            detailsSection.style.display = "block";
            seeMoreButton.innerText = "See Less";
        } else {
            detailsSection.style.display = "none";
            seeMoreButton.innerText = "See More";
        }
    });

    // Style "See More" button properly
    seeMoreButton.style.backgroundColor = "black";
    seeMoreButton.style.border = "1px solid #555";
    seeMoreButton.style.color = "grey";
    seeMoreButton.style.padding = "5px 10px";
    seeMoreButton.style.cursor = "pointer";
    seeMoreButton.style.borderRadius = "5px";
});
