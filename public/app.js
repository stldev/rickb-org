if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
        navigator.serviceWorker.register('/sw.js').catch(function (error) {
            console.warn('Service worker registration failed:', error);
        });
    });
}

document.addEventListener('DOMContentLoaded', function () {
    // The homepage remains usable when Firebase is unavailable or blocked.
    if (typeof firebase !== 'undefined' && firebase.apps.length && typeof firebase.analytics === 'function') {
        try {
            firebase.analytics().logEvent('page_view', { page_title: document.title });
        } catch (error) {
            console.warn('Analytics unavailable:', error);
        }
    }
});
