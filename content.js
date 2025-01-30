class AlertMonitor {
    constructor() {
        this.retryTracking = new Map();
    }


    monitor() {
        chrome.storage.sync.get({ maxRetries: 10 }, (settings) => {
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

                const tracking = this.retryTracking.get(alertName) || {
                    retryCount: 0,
                    lastAttempt: 0
                };

                if (status === 'active' || status    === 'aktiv') {
                    this.retryTracking.delete(alertName);

                    return;
                }

                if (status.low === 'stopped manually' || status === 'manuell beendet') {
                    this.retryTracking.delete(alertName);

                    return;
                }

                const restartButton = container.querySelector('div[data-name="alert-restart-button"]');
                if (!restartButton) {
                    return;
                }


                if (tracking.retryCount >= settings.maxRetries) {
                    chrome.runtime.sendMessage(`maximum retries reached (${settings.maxRetries}/${ settings.maxRetries})`);
                    return;
                }

                const waitTimeMinutes = tracking.retryCount + 1;
                const timeSinceLastAttempt = (Date.now() - tracking.lastAttempt) / (1000 * 60);

                if (tracking.lastAttempt === 0 || timeSinceLastAttempt >= waitTimeMinutes) {
                    chrome.runtime.sendMessage(`restarting (Attempt ${tracking.retryCount + 1}/${ settings.maxRetries})`);
                    restartButton.click();
                    tracking.retryCount++;
                    tracking.lastAttempt = Date.now();
                    this.retryTracking.set(alertName, tracking);
                }
            });
        });
    }



    adviseReloadPage() {
        chrome.storage.sync.get({ refreshRate: 60 }, (settings) => {
            const milliseconds = settings.refreshRate * 60 * 1000;
            try {
               setInterval(() => {
                   chrome.runtime.sendMessage('page reload');
                   window.location.reload();
                }, milliseconds);
            } catch (error) {
                chrome.runtime.sendMessage('reload failed');
            }
        });
    }

    start() {

        chrome.storage.sync.get({ enabled: false }, (settings) => {
            if(settings.enabled) {
                setInterval(() => this.monitor(), 10000);
                console.log('alert monitoring started');

                this.adviseReloadPage()
                console.log('advised reload of page');
            }
        });
    }
}

const monitor = new AlertMonitor();
monitor.start()
