(function () {
    'use strict';

    // ── 1. Disable Right-Click (Context Menu) ────────────────────────────────
    document.addEventListener('contextmenu', function (e) {
        e.preventDefault();
    });

    // ── 2. Block DevTools Keyboard Shortcuts (Desktop) ───────────────────────
    document.addEventListener('keydown', function (e) {
        // F12
        if (e.key === 'F12' || e.keyCode === 123) {
            e.preventDefault();
            return false;
        }
        // Ctrl+Shift+I  (Inspector)
        if (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.keyCode === 73)) {
            e.preventDefault();
            return false;
        }
        // Ctrl+Shift+J  (Console)
        if (e.ctrlKey && e.shiftKey && (e.key === 'J' || e.key === 'j' || e.keyCode === 74)) {
            e.preventDefault();
            return false;
        }
        // Ctrl+Shift+C  (Element Inspector)
        if (e.ctrlKey && e.shiftKey && (e.key === 'C' || e.key === 'c' || e.keyCode === 67)) {
            e.preventDefault();
            return false;
        }
        // Ctrl+U (View Source)
        if (e.ctrlKey && (e.key === 'u' || e.key === 'U' || e.keyCode === 85)) {
            e.preventDefault();
            return false;
        }
        // Ctrl+S (Save Page)
        if (e.ctrlKey && (e.key === 's' || e.key === 'S' || e.keyCode === 83)) {
            e.preventDefault();
            return false;
        }
        // Mac: Cmd+Option+I, Cmd+Option+J, Cmd+Option+C, Cmd+Option+U
        if (e.metaKey && e.altKey && (
            e.key === 'i' || e.key === 'I' ||
            e.key === 'j' || e.key === 'J' ||
            e.key === 'c' || e.key === 'C' ||
            e.key === 'u' || e.key === 'U'
        )) {
            e.preventDefault();
            return false;
        }
    });

    // ── 3. Helper: Detect Mobile / Tablet Devices ───────────────────────────
    // Mobile browsers (Safari on iPhone, Chrome on Android) have dynamic toolbars,
    // address bars, and on-screen keyboards where window.outerHeight - window.innerHeight
    // naturally exceeds 150-300px. Also, mobile browsers do not dock devtools.
    function isMobileDevice() {
        return (
            /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
            (navigator.maxTouchPoints && navigator.maxTouchPoints > 2)
        );
    }

    function isFullscreen() {
        return !!(
            document.fullscreenElement ||
            document.webkitFullscreenElement ||
            document.mozFullScreenElement ||
            document.msFullscreenElement
        );
    }

    function redirectHome() {
        if (window.location.pathname !== '/' && window.location.pathname !== '/index.html') {
            window.location.replace('/');
        }
    }

    // ── 4. DevTools Window-Size Heuristics (Desktop Only) ────────────────────
    var devtoolsOpen = false;
    var THRESHOLD = 180;

    function checkDevTools() {
        // NEVER run size check on mobile devices or during fullscreen video
        if (isMobileDevice() || isFullscreen()) {
            return;
        }

        // On desktop, docked DevTools creates a large difference between outer and inner dimensions
        var widthDiff  = window.outerWidth  - window.innerWidth;
        var heightDiff = window.outerHeight - window.innerHeight;

        if (widthDiff > THRESHOLD || heightDiff > THRESHOLD) {
            if (!devtoolsOpen) {
                devtoolsOpen = true;
                redirectHome();
            }
        } else {
            devtoolsOpen = false;
        }
    }

    // Run size check only on non-mobile desktop browsers
    if (!isMobileDevice()) {
        setInterval(checkDevTools, 1500);
        window.addEventListener('resize', checkDevTools);
    }

    // ── 5. Console Override (Silence Logs) ──────────────────────────────────
    (function () {
        var noop = function () {};
        try {
            console.log   = noop;
            console.warn  = noop;
            console.error = noop;
            console.info  = noop;
            console.debug = noop;
            console.table = noop;
            console.dir   = noop;
        } catch (e) {}
    })();

})();
