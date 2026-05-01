import { useEffect, useRef } from "react";

interface Dot {
  originX: number;
  originY: number;
  x: number;
  y: number;
  phase: number;
}

export default function DotGrid() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouse = useRef({ x: -1000, y: -1000 });
  const animationId = useRef<number>(0);
  const dotsRef = useRef<Dot[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const spacing = 18;
    const dotRadius = 0.8;
    const attractRadius = 120;
    const attractStrength = 14;
    const returnSpeed = 0.08;
    const baseAlpha = 0.5;
    const maxAlpha = 0.9;

    const buildGrid = () => {
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      const dots: Dot[] = [];
      for (let x = spacing / 2; x < w; x += spacing) {
        for (let y = spacing / 2; y < h; y += spacing) {
          dots.push({
            originX: x,
            originY: y,
            x,
            y,
            phase: Math.random() * Math.PI * 2,
          });
        }
      }
      dotsRef.current = dots;
    };

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = canvas.offsetWidth * dpr;
      canvas.height = canvas.offsetHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      buildGrid();
    };

    const draw = (timestamp: number) => {
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      ctx.clearRect(0, 0, w, h);

      const t = timestamp * 0.001;
      const mx = mouse.current.x;
      const my = mouse.current.y;
      const dots = dotsRef.current;

      for (let i = 0; i < dots.length; i++) {
        const dot = dots[i];
        const dx = dot.originX - mx;
        const dy = dot.originY - my;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // Attract toward cursor
        if (dist < attractRadius && dist > 0) {
          const force = 1 - dist / attractRadius;
          const ease = force * force;
          const targetX = dot.originX - (dx / dist) * ease * attractStrength;
          const targetY = dot.originY - (dy / dist) * ease * attractStrength;
          dot.x += (targetX - dot.x) * 0.15;
          dot.y += (targetY - dot.y) * 0.15;
        } else {
          dot.x += (dot.originX - dot.x) * returnSpeed;
          dot.y += (dot.originY - dot.y) * returnSpeed;
        }

        // Animated greyscale: each dot pulses through grey tones
        const wave = Math.sin(t * 0.8 + dot.phase + dot.originX * 0.02 + dot.originY * 0.015);
        const grey = Math.floor(100 + wave * 80); // range ~20–180

        // Brightness based on cursor distance
        const curDx = dot.x - mx;
        const curDy = dot.y - my;
        const curDist = Math.sqrt(curDx * curDx + curDy * curDy);

        let alpha = baseAlpha;
        let r = dotRadius;

        if (curDist < attractRadius) {
          const proximity = 1 - curDist / attractRadius;
          const e = proximity * proximity;
          alpha = baseAlpha + (maxAlpha - baseAlpha) * e;
          r = dotRadius + 1.2 * e;
        }

        ctx.beginPath();
        ctx.arc(dot.x, dot.y, r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${grey}, ${grey}, ${grey}, ${alpha})`;
        ctx.fill();
      }

      animationId.current = requestAnimationFrame(draw);
    };

    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.current.x = e.clientX - rect.left;
      mouse.current.y = e.clientY - rect.top;
    };

    const onMouseLeave = () => {
      mouse.current.x = -1000;
      mouse.current.y = -1000;
    };

    window.addEventListener("resize", resize);
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseleave", onMouseLeave);

    resize();
    animationId.current = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener("resize", resize);
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseleave", onMouseLeave);
      cancelAnimationFrame(animationId.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
    />
  );
}
