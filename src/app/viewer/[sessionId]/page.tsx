"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useParams } from "next/navigation";
import type { FloorPlanSchema } from "@/types/floor-plan";

// Three.js canvas must be dynamically imported — no SSR
const FloorPlan3DScene = dynamic(() => import("./FloorPlan3DScene"), { ssr: false });

type PageStatus = "loading" | "ready" | "error";

export default function ViewerPage() {
  const params = useParams();
  const sessionId = typeof params.sessionId === "string" ? params.sessionId : "";
  const [schema, setSchema] = useState<FloorPlanSchema | null>(null);
  const [pageStatus, setPageStatus] = useState<PageStatus>("loading");
  const [exportError, setExportError] = useState<string>("");
  const downloadAnchorRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem(`floor-plan-${sessionId}`);
    if (!raw) {
      setPageStatus("error");
      return;
    }
    try {
      setSchema(JSON.parse(raw) as FloorPlanSchema);
      setPageStatus("ready");
    } catch {
      setPageStatus("error");
    }
  }, [sessionId]);

  const handleExportGltf = async () => {
    if (!schema) return;
    setExportError("");
    try {
      const res = await fetch("/api/export-gltf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(schema),
      });
      if (!res.ok) throw new Error(`Export failed: ${res.status}`);
      const blob = await res.blob();
      triggerDownload(blob, "floor-plan.glb");
    } catch (err) {
      setExportError(err instanceof Error ? err.message : "Export failed");
    }
  };

  const handleExportObj = async () => {
    if (!schema) return;
    setExportError("");
    try {
      const res = await fetch("/api/export-obj", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(schema),
      });
      if (!res.ok) throw new Error(`Export failed: ${res.status}`);
      const blob = await res.blob();
      triggerDownload(blob, "floor-plan.obj");
    } catch (err) {
      setExportError(err instanceof Error ? err.message : "Export failed");
    }
  };

  function triggerDownload(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const a = downloadAnchorRef.current;
    if (!a) return;
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "sans-serif" }}>
      {/* Sidebar */}
      <aside
        aria-label="Room list and export controls"
        style={{
          width: 280,
          flexShrink: 0,
          borderRight: "1px solid #e0e0e0",
          padding: "1.5rem",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
        }}
      >
        <Link href="/" style={{ color: "#0070f3", textDecoration: "none", fontSize: "0.9rem" }}>
          ← Back to home
        </Link>

        <h1 style={{ fontSize: "1.2rem", margin: 0 }}>Floor Plan Viewer</h1>

        {pageStatus === "ready" && schema && (
          <>
            {/* Room list */}
            <section aria-labelledby="room-list-heading">
              <h2 id="room-list-heading" style={{ fontSize: "1rem", marginBottom: "0.5rem" }}>
                Rooms
              </h2>
              <ul style={{ padding: 0, margin: 0, listStyle: "none" }}>
                {schema.rooms.map((room, i) => (
                  <li
                    key={i}
                    style={{
                      padding: "0.4rem 0",
                      borderBottom: "1px solid #f0f0f0",
                      fontSize: "0.9rem",
                    }}
                  >
                    <strong>{room.name}</strong>
                    {room.area != null && (
                      <span style={{ color: "#666", marginLeft: "0.5rem" }}>
                        {room.area.toFixed(1)} m²
                      </span>
                    )}
                  </li>
                ))}
                {schema.rooms.length === 0 && (
                  <li style={{ color: "#767676", fontSize: "0.9rem" }}>No rooms detected</li>
                )}
              </ul>
            </section>

            {/* Extraction metadata */}
            <p style={{ fontSize: "0.8rem", color: "#767676", margin: 0 }}>
              Method: <strong>{schema.extractionMethod}</strong> | Confidence:{" "}
              <strong>{schema.confidence}</strong>
            </p>

            {/* Export buttons */}
            <section aria-labelledby="export-heading">
              <h2 id="export-heading" style={{ fontSize: "1rem", marginBottom: "0.5rem" }}>
                Export
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <button
                  onClick={handleExportGltf}
                  aria-label="Download 3D model as GLB (glTF binary)"
                  style={btnStyle}
                >
                  Download glTF (.glb)
                </button>
                <button
                  onClick={handleExportObj}
                  aria-label="Download 3D model as OBJ for Blender or SketchUp"
                  style={btnStyle}
                >
                  Download OBJ
                </button>
              </div>
              {exportError && (
                <p role="alert" style={{ color: "#d32f2f", fontSize: "0.85rem", marginTop: "0.5rem" }}>
                  {exportError}
                </p>
              )}
            </section>
          </>
        )}

        {pageStatus === "error" && (
          <p role="alert" style={{ color: "#d32f2f" }}>
            Session not found. Please{" "}
            <Link href="/upload" style={{ color: "#0070f3" }}>
              upload a new floor plan
            </Link>
            .
          </p>
        )}

        {pageStatus === "loading" && (
          <p aria-live="polite" aria-busy="true" style={{ color: "#555" }}>
            Loading…
          </p>
        )}
      </aside>

      {/* 3D canvas */}
      <main
        aria-label="3D floor plan canvas"
        style={{ flex: 1, position: "relative", background: "#f7f7f7" }}
      >
        {pageStatus === "ready" && schema ? (
          <FloorPlan3DScene schema={schema} />
        ) : pageStatus === "loading" ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              color: "#888",
            }}
            aria-live="polite"
            aria-busy="true"
          >
            Loading 3D viewer…
          </div>
        ) : null}
      </main>

      {/* Hidden anchor for file downloads */}
      {/* eslint-disable-next-line jsx-a11y/anchor-has-content */}
      <a ref={downloadAnchorRef} style={{ display: "none" }} aria-hidden="true" />
    </div>
  );
}

const btnStyle: React.CSSProperties = {
  background: "#0070f3",
  color: "#fff",
  border: "none",
  borderRadius: 6,
  padding: "0.6rem 1rem",
  cursor: "pointer",
  fontWeight: 600,
  fontSize: "0.9rem",
  textAlign: "left",
};
