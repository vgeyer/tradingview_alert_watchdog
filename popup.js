document.addEventListener('DOMContentLoaded', function() {
    const maxRetriesInput = document.getElementById('maxRetries');
    const saveStatus = document.getElementById('saveStatus');

    chrome.storage.sync.get({ maxRetries: 10 }, function(items) {
        maxRetriesInput.value = items.maxRetries;
    });

    maxRetriesInput.addEventListener('change', function() {
        const value = parseInt(maxRetriesInput.value);
        if (value >= 1 && value <= 20) {
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
});