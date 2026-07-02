import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Camera, Download, RefreshCw, Zap } from "lucide-react";

const FILTERS = [
  { id: "normal", label: "Normal", css: "none" },
  { id: "noir", label: "Noir", css: "grayscale(100%) contrast(130%) brightness(0.9)" },
  { id: "warm", label: "Warm", css: "sepia(50%) saturate(130%) brightness(1.05)" },
  { id: "cool", label: "Cool", css: "hue-rotate(190deg) saturate(80%) brightness(1.05)" },
  { id: "vivid", label: "Vivid", css: "saturate(180%) contrast(110%)" },
];

interface Props {
  companionPortrait: string;
  companionName: string;
  onBack: () => void;
}

export function PhotoBooth({ companionPortrait, companionName, onBack }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const rafRef = useRef<number>(0);
  const overlayRef = useRef({ x: 0, y: 0, size: 180, loaded: false });
  const draggingRef = useRef<{ ox: number; oy: number } | null>(null);

  const [cameraOn, setCameraOn] = useState(false);
  const [filter, setFilter] = useState("normal");
  const [snaps, setSnaps] = useState<string[]>([]);
  const [stripUrl, setStripUrl] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const filterCss = FILTERS.find(f => f.id === filter)?.css ?? "none";

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = companionPortrait;
    img.onload = () => {
      imgRef.current = img;
      overlayRef.current.loaded = true;
      const canvas = canvasRef.current;
      if (canvas) {
        overlayRef.current.x = canvas.width - overlayRef.current.size - 24;
        overlayRef.current.y = canvas.height - Math.round((img.naturalHeight / img.naturalWidth) * overlayRef.current.size) - 24;
      }
    };
  }, [companionPortrait]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.filter = filterCss;

    if (cameraOn && video && video.readyState >= 2) {
      ctx.save();
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      ctx.restore();
    } else {
      ctx.fillStyle = "#09090b";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      if (!cameraOn) {
        ctx.filter = "none";
        ctx.fillStyle = "#27272a";
        ctx.font = "14px system-ui";
        ctx.textAlign = "center";
        ctx.fillText("Enable camera to start", canvas.width / 2, canvas.height / 2);
        ctx.textAlign = "left";
      }
    }

    const ov = overlayRef.current;
    const img = imgRef.current;
    if (img && ov.loaded) {
      const h = Math.round((img.naturalHeight / img.naturalWidth) * ov.size);
      ctx.filter = filterCss;
      ctx.save();
      ctx.beginPath();
      const radius = 12;
      ctx.moveTo(ov.x + radius, ov.y);
      ctx.lineTo(ov.x + ov.size - radius, ov.y);
      ctx.quadraticCurveTo(ov.x + ov.size, ov.y, ov.x + ov.size, ov.y + radius);
      ctx.lineTo(ov.x + ov.size, ov.y + h - radius);
      ctx.quadraticCurveTo(ov.x + ov.size, ov.y + h, ov.x + ov.size - radius, ov.y + h);
      ctx.lineTo(ov.x + radius, ov.y + h);
      ctx.quadraticCurveTo(ov.x, ov.y + h, ov.x, ov.y + h - radius);
      ctx.lineTo(ov.x, ov.y + radius);
      ctx.quadraticCurveTo(ov.x, ov.y, ov.x + radius, ov.y);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(img, ov.x, ov.y, ov.size, h);
      ctx.restore();

      ctx.filter = "none";
      ctx.fillStyle = "rgba(0,0,0,0.5)";
      ctx.font = "bold 11px system-ui";
      const img2 = imgRef.current;
      const labelH = img2 ? Math.round((img2.naturalHeight / img2.naturalWidth) * ov.size) : ov.size;
      ctx.fillText(companionName, ov.x + 8, ov.y + labelH - 8);
    }

    rafRef.current = requestAnimationFrame(draw);
  }, [cameraOn, filterCss, companionName]);

  useEffect(() => {
    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
  }, [draw]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 1280, height: 720 }, audio: false });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setCameraOn(true);
    } catch {
      alert("Camera access denied. Please allow camera access in your browser.");
    }
  };

  const stopCamera = () => {
    const stream = videoRef.current?.srcObject as MediaStream | null;
    stream?.getTracks().forEach(t => t.stop());
    if (videoRef.current) videoRef.current.srcObject = null;
    setCameraOn(false);
  };

  useEffect(() => () => stopCamera(), []);

  const snapPhoto = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
    setSnaps(prev => {
      const next = [...prev, dataUrl].slice(-4);
      if (next.length === 4) buildStrip(next);
      return next;
    });
  };

  const triggerCountdown = () => {
    let count = 3;
    setCountdown(count);
    const id = setInterval(() => {
      count--;
      if (count === 0) {
        clearInterval(id);
        setCountdown(null);
        snapPhoto();
      } else {
        setCountdown(count);
      }
    }, 1000);
  };

  const buildStrip = (photos: string[]) => {
    const W = 480;
    const H = 320;
    const GAP = 8;
    const TOTAL_H = H * photos.length + GAP * (photos.length + 1) + 48;
    const strip = document.createElement("canvas");
    strip.width = W + GAP * 2;
    strip.height = TOTAL_H;
    const ctx = strip.getContext("2d")!;
    ctx.fillStyle = "#09090b";
    ctx.fillRect(0, 0, strip.width, strip.height);
    photos.forEach((src, i) => {
      const img = new Image();
      img.src = src;
      img.onload = () => {
        ctx.drawImage(img, GAP, GAP + i * (H + GAP), W, H);
        if (i === photos.length - 1) {
          ctx.fillStyle = "rgba(255,255,255,0.15)";
          ctx.font = "bold 13px system-ui";
          ctx.textAlign = "center";
          ctx.fillText(`${companionName} & Me`, strip.width / 2, TOTAL_H - 14);
          setStripUrl(strip.toDataURL("image/jpeg", 0.92));
        }
      };
    });
  };

  const getCanvasPos = (e: React.MouseEvent) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) * (canvas.width / rect.width),
      y: (e.clientY - rect.top) * (canvas.height / rect.height),
    };
  };

  const onMouseDown = (e: React.MouseEvent) => {
    const pos = getCanvasPos(e);
    const ov = overlayRef.current;
    const img = imgRef.current;
    const h = img ? Math.round((img.naturalHeight / img.naturalWidth) * ov.size) : ov.size;
    if (pos.x >= ov.x && pos.x <= ov.x + ov.size && pos.y >= ov.y && pos.y <= ov.y + h) {
      draggingRef.current = { ox: pos.x - ov.x, oy: pos.y - ov.y };
    }
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!draggingRef.current) return;
    const pos = getCanvasPos(e);
    overlayRef.current.x = pos.x - draggingRef.current.ox;
    overlayRef.current.y = pos.y - draggingRef.current.oy;
  };

  const onMouseUp = () => { draggingRef.current = null; };

  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const pos = { x: (t.clientX - rect.left) * (canvas.width / rect.width), y: (t.clientY - rect.top) * (canvas.height / rect.height) };
    const ov = overlayRef.current;
    const img = imgRef.current;
    const h = img ? Math.round((img.naturalHeight / img.naturalWidth) * ov.size) : ov.size;
    if (pos.x >= ov.x && pos.x <= ov.x + ov.size && pos.y >= ov.y && pos.y <= ov.y + h) {
      draggingRef.current = { ox: pos.x - ov.x, oy: pos.y - ov.y };
    }
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (!draggingRef.current) return;
    const t = e.touches[0];
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const pos = { x: (t.clientX - rect.left) * (canvas.width / rect.width), y: (t.clientY - rect.top) * (canvas.height / rect.height) };
    overlayRef.current.x = pos.x - draggingRef.current.ox;
    overlayRef.current.y = pos.y - draggingRef.current.oy;
  };

  return (
    <div className="flex flex-col min-h-[100dvh] p-4 md:p-6 w-full max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={onBack} className="text-muted-foreground hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-xl font-medium">Photo Booth</h2>
        <span className="text-sm text-muted-foreground">with {companionName}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_200px] gap-6">
        <div className="space-y-3">
          <div className="relative rounded-xl overflow-hidden border border-white/8 bg-zinc-950">
            <canvas
              ref={canvasRef}
              width={900}
              height={600}
              className="w-full h-auto cursor-grab active:cursor-grabbing"
              onMouseDown={onMouseDown}
              onMouseMove={onMouseMove}
              onMouseUp={onMouseUp}
              onMouseLeave={onMouseUp}
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onMouseUp}
            />
            {countdown !== null && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className="text-8xl font-black text-white drop-shadow-2xl animate-ping">{countdown}</span>
              </div>
            )}
          </div>
          <video ref={videoRef} className="hidden" muted playsInline />

          <div className="flex flex-wrap gap-2 items-center">
            <Button size="sm" variant={cameraOn ? "destructive" : "default"} onClick={cameraOn ? stopCamera : startCamera}>
              <Camera className="w-4 h-4 mr-2" />
              {cameraOn ? "Stop" : "Enable Camera"}
            </Button>

            <Button size="sm" variant="outline" onClick={triggerCountdown} disabled={!cameraOn || countdown !== null}>
              <Zap className="w-4 h-4 mr-2" />
              Snap (3s)
            </Button>

            <Button size="sm" variant="ghost" onClick={snapPhoto} disabled={!cameraOn}>
              <Camera className="w-4 h-4 mr-2" />
              Instant
            </Button>

            {snaps.length > 0 && (
              <Button size="sm" variant="ghost" onClick={() => { setSnaps([]); setStripUrl(null); }} className="ml-auto text-muted-foreground">
                <RefreshCw className="w-4 h-4 mr-2" />
                Reset
              </Button>
            )}
          </div>

          <div className="flex gap-2">
            {FILTERS.map(f => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${filter === f.id ? "border-primary bg-primary/10 text-primary" : "border-white/8 text-muted-foreground hover:border-white/20"}`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <p className="text-xs text-muted-foreground">
            Drag {companionName}'s portrait to reposition. Take {4 - snaps.length} more photo{4 - snaps.length !== 1 ? "s" : ""} to build a strip.
          </p>
        </div>

        <div className="space-y-3">
          <p className="text-xs text-muted-foreground uppercase tracking-widest">
            Photos ({snaps.length}/4)
          </p>
          <div className="space-y-2">
            {snaps.map((s, i) => (
              <div key={i} className="rounded-lg overflow-hidden border border-white/8 aspect-video">
                <img src={s} alt={`Snap ${i + 1}`} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
          {stripUrl && (
            <a
              href={stripUrl}
              download={`${companionName.toLowerCase()}-photo-strip.jpg`}
              className="flex items-center justify-center gap-2 w-full py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              <Download className="w-4 h-4" />
              Download Strip
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
