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

    // ---- animated network background (particles + connecting lines) ----
    if (parentDoc.getElementById("jarvis-bg-canvas")) return;

    const canvas = parentDoc.createElement("canvas");
    canvas.id = "jarvis-bg-canvas";
    Object.assign(canvas.style, {
        position: "fixed",
        inset: "0",
        width: "100vw",
        height: "100vh",
        zIndex: "-2",
        pointerEvents: "none"
    });
    parentDoc.body.appendChild(canvas);

    const ctx = canvas.getContext("2d");
    let W, H, particles;

    function resize() {
        W = canvas.width = window.parent.innerWidth;
        H = canvas.height = window.parent.innerHeight;
    }

    function initParticles() {
        const count = Math.floor((W * H) / 22000); // density scales with screen size
        particles = Array.from({ length: count }, () => ({
            x: Math.random() * W,
            y: Math.random() * H,
            vx: (Math.random() - 0.5) * 0.25,
            vy: (Math.random() - 0.5) * 0.25,
            r: Math.random() * 1.4 + 0.6
        }));
    }

    function step() {
        ctx.clearRect(0, 0, W, H);

        // move + draw particles
        particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            if (p.x < 0 || p.x > W) p.vx *= -1;
            if (p.y < 0 || p.y > H) p.vy *= -1;

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fillStyle = "rgba(0, 229, 255, 0.55)";
            ctx.fill();
        });

        // connect nearby particles with faint lines
        const maxDist = 130;
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const a = particles[i], b = particles[j];
                const dx = a.x - b.x, dy = a.y - b.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < maxDist) {
                    ctx.beginPath();
                    ctx.moveTo(a.x, a.y);
                    ctx.lineTo(b.x, b.y);
                    ctx.strokeStyle = `rgba(0, 229, 255, ${0.12 * (1 - dist / maxDist)})`;
                    ctx.lineWidth = 1;
                    ctx.stroke();
                }
            }
        }

        requestAnimationFrame(step);
    }

    resize();
    initParticles();
    step();

    window.parent.addEventListener("resize", () => {
        resize();
        initParticles();
    });
})();
