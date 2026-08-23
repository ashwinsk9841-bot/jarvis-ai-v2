// =========================================================
// JARVIS AI — HUD micro-interactions
// Runs inside a Streamlit components.html iframe with
// access to the parent document, so it can decorate the
// real app shell without touching Python/backend logic.
// =========================================================

(function () {
    const parentDoc = window.parent.document;

    // Avoid double-injecting on Streamlit reruns
    if (parentDoc.getElementById("jarvis-boot-style")) return;

    // ---- one-time boot flicker on the whole app ----
    const bootStyle = parentDoc.createElement("style");
    bootStyle.id = "jarvis-boot-style";
    bootStyle.textContent = `
        @keyframes jarvisBoot {
            0%   { filter: brightness(0.4); }
            15%  { filter: brightness(1.1); }
            25%  { filter: brightness(0.6); }
            40%  { filter: brightness(1); }
            100% { filter: brightness(1); }
        }
        .stApp { animation: jarvisBoot 0.9s ease-out; }
    `;
    parentDoc.head.appendChild(bootStyle);

    // ---- small "SYSTEM ONLINE" HUD badge, top-right ----
    const badge = parentDoc.createElement("div");
    badge.textContent = "● SYSTEM ONLINE";
    Object.assign(badge.style, {
        position: "fixed",
        top: "10px",
        right: "18px",
        zIndex: "9999",
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: "11px",
        letterSpacing: "1px",
        color: "#00e5ff",
        opacity: "0.75",
        textShadow: "0 0 6px rgba(0,229,255,0.6)",
        pointerEvents: "none"
    });
    parentDoc.body.appendChild(badge);
})();