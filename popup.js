document.addEventListener('DOMContentLoaded', function() {
    const maxRetriesInput = document.getElementById('maxRetries');
    const refreshRateInput = document.getElementById('refreshRate');
    const saveStatus = document.getElementById('saveStatus');

    chrome.storage.sync.get({ maxRetries: 10 }, function(items) {
        maxRetriesInput.value = items.maxRetries;
    });
    chrome.storage.sync.get({ refreshRate: 60 }, function(items) {
        refreshRateInput.value = items.refreshRate;
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
                saveStatus.style.display = 'block';
                setTimeout(() => {
                    saveStatus.style.display = 'none';
                }, 2000);
            });
        }
    });
});