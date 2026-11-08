window.goatcounter = window.goatcounter || {};
window.goatcounter.endpoint = 'https://guidoivetta.goatcounter.com/count';

const FOOTER_SELECTOR = '.md-footer-meta__inner';
const COUNTER_CONTAINER_ID = 'visible-visit-counter';

function getCounterContainer() {
    const parent = document.querySelector(FOOTER_SELECTOR) || document.body;
    let container = document.getElementById(COUNTER_CONTAINER_ID);

    if (!container) {
        container = document.createElement('div');
        container.id = COUNTER_CONTAINER_ID;
        container.tabIndex = 0;
        container.setAttribute('aria-label', 'Visit counter');
        parent.appendChild(container);
    }

    return container;
}

function setCounterStatus(text) {
    const container = getCounterContainer();
    container.textContent = text;
}

function appendVisibleVisitCount() {
    if (!window.goatcounter || typeof window.goatcounter.visit_count !== 'function') {
        return false;
    }

    getCounterContainer();
    window.goatcounter.visit_count({ append: '#' + COUNTER_CONTAINER_ID });
    return true;
}

function loadScriptWithFallback(urls) {
    return new Promise(function (resolve, reject) {
        let index = 0;

        function tryNext() {
            if (index >= urls.length) {
                reject(new Error('All GoatCounter script URLs were blocked.'));
                return;
            }

            const script = document.createElement('script');
            script.async = true;
            script.src = urls[index];
            script.onload = function () {
                resolve(true);
            };
            script.onerror = function () {
                index += 1;
                tryNext();
            };
            document.head.appendChild(script);
        }

        tryNext();
    });
}

document.addEventListener('DOMContentLoaded', function () {
    loadScriptWithFallback([
        'https://guidoivetta.goatcounter.com/count.js',
        'https://gc.zgo.at/count.js'
    ]).then(function () {
        if (appendVisibleVisitCount()) {
            return;
        }

        let attempts = 0;
        const maxAttempts = 20;
        const retryMs = 250;
        const timer = setInterval(function () {
            attempts += 1;
            if (appendVisibleVisitCount()) {
                clearInterval(timer);
                return;
            }

            if (attempts >= maxAttempts) {
                clearInterval(timer);
                setCounterStatus('Visits unavailable right now.');
            }
        }, retryMs);
    }).catch(function () {
        setCounterStatus('Visits unavailable (blocked by browser extension).');
    });
});
