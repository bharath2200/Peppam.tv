(function () {
    'use strict';

    // ── 1. Disable Right-Click ──────────────────────────────────────────────
    document.addEventListener('contextmenu', function (e) {
        e.preventDefault();
    });

    // ── 2. Block DevTools Keyboard Shortcuts ────────────────────────────────
    document.addEventListener('keydown', function (e) {
        // F12
        if (e.key === 'F12' || e.keyCode === 123) {
            e.preventDefault();
            return false;
        }
        // Ctrl+Shift+I  (Chrome DevTools)
        if (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.keyCode === 73)) {
            e.preventDefault();
            return false;
        }
        // Ctrl+Shift+J  (Console)
        if (e.ctrlKey && e.shiftKey && (e.key === 'J' || e.keyCode === 74)) {
            e.preventDefault();
            return false;
        }
        // Ctrl+Shift+C  (Inspector)
        if (e.ctrlKey && e.shiftKey && (e.key === 'C' || e.keyCode === 67)) {
            e.preventDefault();
            return false;
        }
        // Ctrl+U  (View Source)
        if (e.ctrlKey && (e.key === 'u' || e.key === 'U' || e.keyCode === 85)) {
            e.preventDefault();
            return false;
        }
        // Ctrl+S  (Save page)
        if (e.ctrlKey && (e.key === 's' || e.key === 'S' || e.keyCode === 83)) {
            e.preventDefault();
            return false;
        }
    });

    // ── 3. DevTools Size Detection & Redirect ───────────────────────────────
    var devtoolsOpen = false;
    var THRESHOLD = 160;

    function redirectHome() {
        if (window.location.pathname !== '/') {
            window.location.replace('/');
        }
    }

    function checkDevTools() {
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

    // ── 4. debugger-based Detection (fires when DevTools console is active) ─
    var devtoolsChecker = new Image();
    Object.defineProperty(devtoolsChecker, 'id', {
        get: function () {
            devtoolsOpen = true;
            redirectHome();
        }
    });

    // ── 5. console.log override (clears anything logged) ───────────────────
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

    // ── 6. Poll every second for DevTools open ──────────────────────────────
    setInterval(checkDevTools, 1000);
    window.addEventListener('resize', checkDevTools);

})();
