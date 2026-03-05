"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { FloorPlanSchema } from "@/types/floor-plan";

type Status = "idle" | "uploading" | "parsing" | "error";

export default function UploadPage() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [isDragOver, setIsDragOver] = useState(false);

  const processFile = useCallback(
    async (file: File) => {
      setErrorMsg("");

      if (!file.name.toLowerCase().endsWith(".pdf") && file.type !== "application/pdf") {
        setStatus("error");
        setErrorMsg("Only PDF files are supported.");
        return;
      }

      if (file.size > 20 * 1024 * 1024) {
        setStatus("error");
        setErrorMsg("File exceeds the 20 MB limit.");
        return;
      }

      setStatus("uploading");

      const formData = new FormData();
      formData.append("file", file);

      let schema: FloorPlanSchema;
      try {
        setStatus("parsing");
        const res = await fetch("/api/parse", { method: "POST", body: formData });
        const json = await res.json();
        if (!res.ok) {
          throw new Error(json.error ?? `Server error ${res.status}`);
        }
        schema = json as FloorPlanSchema;
      } catch (err) {
        setStatus("error");
        setErrorMsg(err instanceof Error ? err.message : "Unknown error");
        return;
      }

      // Persist schema in sessionStorage keyed by a new session id
      const sessionId = crypto.randomUUID();
      try {
        sessionStorage.setItem(`floor-plan-${sessionId}`, JSON.stringify(schema));
      } catch {
        // Storage quota exceeded — still proceed
      }

      router.push(`/viewer/${sessionId}`);
    },
    [router]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragOver(false);
      const file = e.dataTransfer.files?.[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => setIsDragOver(false), []);

  const isProcessing = status === "uploading" || status === "parsing";

  return (
    <main
      style={{ fontFamily: "sans-serif", maxWidth: 600, margin: "0 auto", padding: "3rem 1rem" }}
    >
      <h1 style={{ marginBottom: "0.5rem" }}>Upload Floor Plan</h1>
      <p style={{ color: "#555", marginBottom: "2rem" }}>
        Drag and drop a PDF floor plan, or click to browse. Maximum 20 MB.
      </p>

      {/* Drop zone */}
      <div
        role="button"
        tabIndex={0}
        aria-label="Drop zone: drag and drop a PDF here, or press Enter to browse files"
        aria-disabled={isProcessing}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !isProcessing && inputRef.current?.click()}
        onKeyDown={(e) => {
          if ((e.key === "Enter" || e.key === " ") && !isProcessing) {
            inputRef.current?.click();
          }
        }}
        style={{
          border: `2px dashed ${isDragOver ? "#0070f3" : "#ccc"}`,
          borderRadius: 12,
          padding: "3rem",
          textAlign: "center",
          cursor: isProcessing ? "not-allowed" : "pointer",
          background: isDragOver ? "#e8f0fe" : "#fafafa",
          transition: "border-color 0.2s, background 0.2s",
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,application/pdf"
          aria-label="Select PDF file"
          onChange={handleFileInput}
          style={{ display: "none" }}
        />
        {isProcessing ? (
          <p aria-live="polite" aria-busy="true" style={{ margin: 0, color: "#555" }}>
            {status === "uploading" ? "Uploading…" : "Parsing floor plan…"}
          </p>
        ) : (
          <p style={{ margin: 0, color: "#767676" }}>
            Drop PDF here or <strong>click to browse</strong>
          </p>
        )}
      </div>

      {/* Processing status */}
      {isProcessing && (
        <p
          role="status"
          aria-live="polite"
          style={{ marginTop: "1rem", color: "#0070f3", fontWeight: 500 }}
        >
          {status === "parsing"
            ? "Analysing floor plan with AI — this may take a few seconds…"
            : "Uploading file…"}
        </p>
      )}

      {/* Error */}
      {status === "error" && (
        <p
          role="alert"
          aria-live="assertive"
          style={{ marginTop: "1rem", color: "#d32f2f", fontWeight: 500 }}
        >
          {errorMsg}
        </p>
      )}
    </main>
  );
}
