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

    // ---- animated rain background (cyan theme, cursor-driven wind + right-click lightning) ----
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
    let W, H, drops;
    let mouseX = null; // used to steer wind direction
    let flash = 0;      // current lightning flash brightness (0-1)
    let bolts = [];      // active lightning bolt paths

    function resize() {
        W = canvas.width = window.parent.innerWidth;
        H = canvas.height = window.parent.innerHeight;
    }

    function initDrops() {
        const count = Math.floor((W * H) / 9000);
        drops = Array.from({ length: count }, () => ({
            x: Math.random() * W,
            y: Math.random() * H,
            len: Math.random() * 14 + 8,
            speed: Math.random() * 4 + 6,
            opacity: Math.random() * 0.35 + 0.15
        }));
    }

    function currentWind() {
        // wind tilt based on cursor horizontal position relative to screen center
        if (mouseX === null) return 0;
        const norm = (mouseX - W / 2) / (W / 2); // -1 .. 1
        return norm * 3.5; // px of horizontal drift per frame at the extremes
    }

    function drawLightningBolt(x, y) {
        // generate a jagged path from top of screen down to (x, y)
        const points = [{ x, y: 0 }];
        let cx = x;
        let steps = 8;
        for (let i = 1; i <= steps; i++) {
            cx += (Math.random() - 0.5) * 60;
            const cy = (y / steps) * i;
            points.push({ x: cx, y: cy });
        }
        bolts.push({ points, life: 1 });
        flash = 1;
    }

    function step() {
        ctx.clearRect(0, 0, W, H);

        const wind = currentWind();

        // rain drops
        ctx.strokeStyle = "rgba(0, 229, 255, 0.5)";
        ctx.lineWidth = 1;
        drops.forEach(d => {
            ctx.globalAlpha = d.opacity;
            ctx.beginPath();
            ctx.moveTo(d.x, d.y);
            ctx.lineTo(d.x + wind * 0.6, d.y + d.len);
            ctx.stroke();

            d.y += d.speed;
            d.x += wind * 0.15;

            if (d.y > H) {
                d.y = -d.len;
                d.x = Math.random() * W;
            }
            if (d.x < -20) d.x = W + 20;
            if (d.x > W + 20) d.x = -20;
        });
        ctx.globalAlpha = 1;

        // lightning flash overlay
        if (flash > 0) {
            ctx.fillStyle = `rgba(180, 240, 255, ${flash * 0.35})`;
            ctx.fillRect(0, 0, W, H);
            flash -= 0.06;
            if (flash < 0) flash = 0;
        }

        // lightning bolt paths
        bolts.forEach(b => {
            ctx.beginPath();
            ctx.moveTo(b.points[0].x, b.points[0].y);
            b.points.slice(1).forEach(p => ctx.lineTo(p.x, p.y));
            ctx.strokeStyle = `rgba(150, 235, 255, ${b.life})`;
            ctx.lineWidth = 2;
            ctx.shadowColor = "rgba(0, 229, 255, 0.9)";
            ctx.shadowBlur = 12;
            ctx.stroke();
            ctx.shadowBlur = 0;
            b.life -= 0.05;
        });
        bolts = bolts.filter(b => b.life > 0);

        requestAnimationFrame(step);
    }

    resize();
    initDrops();
    step();

    window.parent.addEventListener("resize", () => {
        resize();
        initDrops();
    });

    window.parent.document.addEventListener("mousemove", (e) => {
        mouseX = e.clientX;
    });

    // right-click anywhere on the app triggers a lightning strike at that x position
    window.parent.document.addEventListener("contextmenu", (e) => {
        e.preventDefault();
        drawLightningBolt(e.clientX, e.clientY);
    });
})();
