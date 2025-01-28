class AlertMonitor {
    constructor() {
        this.checkAlertInterval = null;
        this.checkReloadInterval = null;
        this.retryTracking = new Map();
        this.reloadAvisedAt = null;
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
        if (this.checkAlertInterval) clearInterval(this.checkAlertInterval);
        this.checkAlertInterval = setInterval(() => this.checkActiveTab(), 10000);
        console.log('Alert monitoring started');

        if (this.checkReloadInterval) clearInterval(this.checkReloadInterval);
        this.checkReloadInterval = setInterval(() => this.reloadPage(), 10000);
        console.log('Reload ticker started');
    }

    olderThan(initialDateTime, refreshRate)  {
        const now = new Date();
        const timeDifference = now - initialDateTime;
        const minutesDifference = timeDifference / 60000;

        if (minutesDifference > refreshRate) {
            return true
        }
        return false
    };

    reloadPage() {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (!tabs?.length || !tabs[0]?.url?.includes('tradingview.com')) {
                return
            }
            chrome.storage.sync.get({ refreshRate: 60 }, (settings) => {
               if (this.reloadAvisedAt != null) {
                   if (!this.olderThan(this.reloadAvisedAt, settings.refreshRate)) {
                       return
                   } else {
                       this.reloadAvisedAt = null
                   }
               }

               chrome.scripting.executeScript({
                target: { tabId: tabs[0].id },
                args: [settings.refreshRate],
                func: function(refreshRate) {
                    const milliseconds = refreshRate * 60 * 1000;
                    try {
                       setInterval(() => {
                            window.location.reload();
                        }, milliseconds);
                        console.log(`Auto-reload started: page will refresh in ${refreshRate} minutes`);
                    } catch (error) {
                        console.error('Failed to start auto-reload:', error);
                    }
                }
                }).then(() => {
                    this.reloadAvisedAt = Date.now()
                });
            });
        });
    }
}

const monitor = new AlertMonitor();
chrome.runtime.onInstalled.addListener(() => monitor.start());
monitor.start();
