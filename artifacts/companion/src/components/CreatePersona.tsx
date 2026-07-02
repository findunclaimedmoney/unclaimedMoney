import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Upload, Loader2, RefreshCw } from "lucide-react";

interface CustomPersona {
  id: "custom";
  name: string;
  portraitBase64: string;
  faceDescription: string;
}

interface Props {
  onComplete: (persona: CustomPersona) => void;
  onBack: () => void;
}

type Stage = "upload" | "generating" | "preview";

export function CreatePersona({ onComplete, onBack }: Props) {
  const [stage, setStage] = useState<Stage>("upload");
  const [preview, setPreview] = useState<string | null>(null);
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>("image/jpeg");
  const [statusText, setStatusText] = useState("");
  const [generatedPortrait, setGeneratedPortrait] = useState<string | null>(null);
  const [faceDescription, setFaceDescription] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    setError(null);
    const mime = file.type || "image/jpeg";
    setMimeType(mime);
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setPreview(dataUrl);
      const base64 = dataUrl.split(",")[1] ?? "";
      setPhotoBase64(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) handleFile(file);
  };

  const generate = async () => {
    if (!photoBase64) return;
    setStage("generating");
    setError(null);
    setStatusText("Analysing your photo...");

    try {
      const base = import.meta.env.BASE_URL.replace(/\/$/, "");
      const apiBase = base.replace("/companion", "");

      const res = await fetch(`${apiBase}/api/companion/persona/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ photoBase64, mimeType }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({})) as { error?: string };
        throw new Error(err.error ?? "Generation failed");
      }

      setStatusText("Generating portrait...");
      const data = await res.json() as {
        portraitBase64: string;
        faceDescription: string;
        suggestedName: string;
      };

      setGeneratedPortrait(data.portraitBase64);
      setFaceDescription(data.faceDescription);
      setName(data.suggestedName || "");
      setStage("preview");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setStage("upload");
    }
  };

  const confirm = () => {
    if (!generatedPortrait || !name.trim()) return;
    const persona: CustomPersona = {
      id: "custom",
      name: name.trim(),
      portraitBase64: generatedPortrait,
      faceDescription,
    };
    localStorage.setItem("companion_custom_persona", JSON.stringify(persona));
    onComplete(persona);
  };

  const retry = () => {
    setStage("upload");
    setGeneratedPortrait(null);
    setPreview(null);
    setPhotoBase64(null);
  };

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center p-6 w-full max-w-lg mx-auto">
      <button
        onClick={onBack}
        className="self-start flex items-center gap-2 text-muted-foreground hover:text-white transition-colors mb-8 text-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      {stage === "upload" && (
        <div className="w-full space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-light">Create your companion</h2>
            <p className="text-muted-foreground">Upload a photo and we'll bring them to life</p>
          </div>

          <div
            className="relative border border-white/10 rounded-2xl overflow-hidden cursor-pointer group hover:border-primary/40 transition-all"
            style={{ minHeight: 280 }}
            onClick={() => inputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
          >
            {preview ? (
              <img
                src={preview}
                alt="Preview"
                className="w-full h-full object-cover"
                style={{ maxHeight: 360 }}
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full py-16 space-y-4 text-muted-foreground group-hover:text-white transition-colors">
                <Upload className="w-10 h-10" />
                <div className="text-center">
                  <p className="font-medium">Drop a photo here</p>
                  <p className="text-sm opacity-60 mt-1">or click to browse</p>
                </div>
              </div>
            )}
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFile(file);
              }}
            />
          </div>

          {error && (
            <p className="text-destructive text-sm text-center">{error}</p>
          )}

          {preview && (
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 border-white/10"
                onClick={() => { setPreview(null); setPhotoBase64(null); }}
              >
                Change photo
              </Button>
              <Button className="flex-1" onClick={generate}>
                Generate companion
              </Button>
            </div>
          )}

          {!preview && (
            <Button className="w-full" variant="outline" onClick={() => inputRef.current?.click()}>
              Choose a photo
            </Button>
          )}
        </div>
      )}

      {stage === "generating" && (
        <div className="flex flex-col items-center justify-center space-y-8 py-16 w-full">
          <div className="relative">
            <div className="w-32 h-32 rounded-full overflow-hidden opacity-40">
              {preview && <img src={preview} alt="" className="w-full h-full object-cover" />}
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="w-10 h-10 animate-spin text-primary" />
            </div>
          </div>
          <div className="text-center space-y-2">
            <p className="text-lg font-light">{statusText}</p>
            <p className="text-sm text-muted-foreground">This takes about 15 seconds</p>
          </div>
        </div>
      )}

      {stage === "preview" && generatedPortrait && (
        <div className="w-full space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-light">Meet your companion</h2>
            <p className="text-muted-foreground">Give them a name to begin</p>
          </div>

          <div className="flex justify-center">
            <div className="w-48 h-48 rounded-full overflow-hidden ring-2 ring-primary/30 ring-offset-4 ring-offset-background">
              <img
                src={`data:image/png;base64,${generatedPortrait}`}
                alt="Generated companion"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Their name..."
            className="text-center text-xl font-light bg-secondary/50 border-white/10 rounded-full h-14 px-6"
            maxLength={30}
            autoFocus
          />

          <div className="flex gap-3">
            <Button
              variant="outline"
              className="border-white/10"
              size="icon"
              onClick={retry}
              title="Try again"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
            <Button
              className="flex-1 h-12 text-base"
              disabled={!name.trim()}
              onClick={confirm}
            >
              {name.trim() ? `Meet ${name}` : "Enter a name"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
