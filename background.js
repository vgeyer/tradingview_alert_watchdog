class AlertMonitor {
    constructor() {
        this.checkInterval = null;
        this.retryTracking = new Map();
    }

    getWaitTimeMinutes(retryCount) {
        return retryCount;  // 1 minute for first retry, 2 for second, etc.
    }

    checkActiveTab() {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (!tabs?.length || !tabs[0]?.url?.includes('tradingview.com')) return;


            chrome.storage.sync.get({ maxRetries: 10 }, (settings) => {
                chrome.scripting.executeScript({
                    target: { tabId: tabs[0].id },
                    func: function(retryTrackingData, maxRetries) {
                        const retryTracking = new Map(retryTrackingData);

                        const allDivs = document.querySelectorAll('div');
                        for (const div of allDivs) {
                            if (div.textContent?.trim().toLowerCase() === 'verbindung unterbrochen' ||
                                div.textContent?.trim().toLowerCase() === 'session disconnected') {
                                console.log('Disconnection detected, reloading page...');
                                window.location.reload();
                                return;
                            }
                        }


                        const alertNameElements = document.querySelectorAll('div[data-name="alert-item-name"]');

                        alertNameElements.forEach(nameElement => {
                            const container = nameElement.parentElement;
                            if (!container) return;

                            const alertName = nameElement.textContent.trim();

                            const statusElement = container.querySelector('span[data-name="alert-item-status"]');
                            if (!statusElement) {
                                return;
                            }

                            const status = statusElement.textContent.trim().toLowerCase();
                            console.log(`- Status: ${status}`);

                            const tracking = retryTracking.get(alertName) || {
                                retryCount: 0,
                                lastAttempt: 0
                            };

                            if (status === 'active' || status === 'aktiv') {
                                retryTracking.delete(alertName);

                                return;
                            }

                            if (status.low === 'stopped manually' || status === 'manuell beendet') {
                                retryTracking.delete(alertName);

                                return;
                            }

                            const restartButton = container.querySelector('div[data-name="alert-restart-button"]');
                            if (!restartButton) {
                                return;
                            }


                            if (tracking.retryCount >= maxRetries) {
                                console.log(`- Maximum retries reached (${maxRetries}/${maxRetries})`);
                                return;
                            }

                            const waitTimeMinutes = tracking.retryCount + 1;
                            const timeSinceLastAttempt = (Date.now() - tracking.lastAttempt) / (1000 * 60);

                            if (tracking.lastAttempt === 0 || timeSinceLastAttempt >= waitTimeMinutes) {
                                console.log(`- Restarting (Attempt ${tracking.retryCount + 1}/${maxRetries})`);
                                restartButton.click();
                                tracking.retryCount++;
                                tracking.lastAttempt = Date.now();
                                retryTracking.set(alertName, tracking);
                            }
                        });

                        return Array.from(retryTracking.entries());
                    },
                    args: [Array.from(this.retryTracking.entries()), settings.maxRetries]
                }).then((results) => {
                    if (results?.[0]?.result) {
                        this.retryTracking = new Map(results[0].result);
                    }
                });
            });
        });
    }

    start() {
        if (this.checkInterval) clearInterval(this.checkInterval);
        this.checkInterval = setInterval(() => this.checkActiveTab(), 10000);
        console.log('Alert monitoring started');

        try {
            const intervalInMinutes = 60;
            const milliseconds = intervalInMinutes * 60 * 1000;

            this.intervalId = setInterval(() => {
                window.location.reload();
            }, milliseconds);
            console.log(`Auto-reload started: page will refresh every ${intervalInMinutes} minutes`);
        } catch (error) {
            console.error('Failed to start auto-reload:', error);
        }
    }
}

const monitor = new AlertMonitor();
chrome.runtime.onInstalled.addListener(() => monitor.start());
monitor.start();

