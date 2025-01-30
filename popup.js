document.addEventListener('DOMContentLoaded', function() {
    const maxRetriesInput = document.getElementById('maxRetries');
    const refreshRateInput = document.getElementById('refreshRate');
    const enabledInput = document.getElementById('enabled');
    const saveStatus = document.getElementById('saveStatus');

    chrome.storage.sync.get({ maxRetries: 10 }, function(items) {
        maxRetriesInput.value = items.maxRetries;
    });
    chrome.storage.sync.get({ refreshRate: 60 }, function(items) {
        refreshRateInput.value = items.refreshRate;
    });
    chrome.storage.sync.get({ enabled: true }, function(items) {
        enabledInput.value = items.refreshRate;
    });

    maxRetriesInput.addEventListener('change', function() {
        const value = parseInt(maxRetriesInput.value);
        if (value >= 1 && value <= 10) {
            chrome.storage.sync.set({
                maxRetries: value
            }, function() {
                saveStatus.style.display = 'block';
                setTimeout(() => {
                    saveStatus.style.display = 'none';
                }, 2000);
            });
        }
    });

    refreshRateInput.addEventListener('change', function() {
        const value = parseInt(refreshRateInput.value);
        if (value >= 0 && value <= 1440) {
            chrome.storage.sync.set({
                refreshRate: value
            }, function() {
                saveStatus.innerText = "Page will reload for changes to take effect."
                saveStatus.style.display = 'block';
                setTimeout(() => {
                    saveStatus.style.display = 'none';
                    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                        const currentTabId = tabs[0].id;
                        chrome.tabs.reload(currentTabId);
                    });
                }, 2000);
            });
        }
    });

    enabledInput.addEventListener('change', function() {
        chrome.storage.sync.set({
            enabled: this.checked
        }, function() {
            saveStatus.innerText = "Page will reload for changes to take effect."
            saveStatus.style.display = 'block';

            setTimeout(() => {
                saveStatus.style.display = 'none';
                chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                    const currentTabId = tabs[0].id;
                    chrome.tabs.reload(currentTabId);
                });
            }, 2000);
        });
    });
});