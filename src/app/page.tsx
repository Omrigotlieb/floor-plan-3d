import Link from "next/link";

export default function Home() {
  return (
    <main style={{ fontFamily: "sans-serif", maxWidth: 900, margin: "0 auto", padding: "2rem" }}>
      {/* Hero */}
      <section aria-labelledby="hero-heading" style={{ textAlign: "center", padding: "4rem 0 3rem" }}>
        <h1 id="hero-heading" style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>
          Floor Plan 3D Builder
        </h1>
        <p style={{ fontSize: "1.2rem", color: "#555", marginBottom: "2rem" }}>
          Upload a PDF floor plan and get an interactive 3D model in seconds — powered by AI.
        </p>
        <Link
          href="/upload"
          style={{
            display: "inline-block",
            background: "#0070f3",
            color: "#fff",
            padding: "0.85rem 2rem",
            borderRadius: 8,
            textDecoration: "none",
            fontSize: "1.1rem",
            fontWeight: 600,
          }}
          aria-label="Upload your floor plan PDF to get started"
        >
          Upload Floor Plan
        </Link>
      </section>

      {/* How it works */}
      <section aria-labelledby="how-it-works-heading" style={{ padding: "3rem 0" }}>
        <h2 id="how-it-works-heading" style={{ textAlign: "center", marginBottom: "2rem" }}>
          How It Works
        </h2>
        <ol
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "1.5rem",
            listStyle: "none",
            padding: 0,
            maxWidth: 600,
            margin: "0 auto",
          }}
          aria-label="Steps to create a 3D floor plan"
        >
          <li style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>
            <span
              aria-hidden="true"
              style={{
                background: "#0070f3",
                color: "#fff",
                borderRadius: "50%",
                width: 32,
                height: 32,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                fontWeight: 700,
              }}
            >
              1
            </span>
            <div>
              <strong>Upload your PDF</strong>
              <p style={{ margin: "0.25rem 0 0", color: "#555" }}>
                Drag and drop any architectural PDF floor plan (up to 20 MB).
              </p>
            </div>
          </li>
          <li style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>
            <span
              aria-hidden="true"
              style={{
                background: "#0070f3",
                color: "#fff",
                borderRadius: "50%",
                width: 32,
                height: 32,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                fontWeight: 700,
              }}
            >
              2
            </span>
            <div>
              <strong>AI extracts the floor plan</strong>
              <p style={{ margin: "0.25rem 0 0", color: "#555" }}>
                Vector paths are parsed directly; if unavailable, Claude Vision AI analyses the image.
              </p>
            </div>
          </li>
          <li style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>
            <span
              aria-hidden="true"
              style={{
                background: "#0070f3",
                color: "#fff",
                borderRadius: "50%",
                width: 32,
                height: 32,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                fontWeight: 700,
              }}
            >
              3
            </span>
            <div>
              <strong>Explore the 3D model</strong>
              <p style={{ margin: "0.25rem 0 0", color: "#555" }}>
                Rotate, pan, and zoom the interactive 3D viewer. Export as glTF or OBJ.
              </p>
            </div>
          </li>
        </ol>
      </section>
    </main>
  );
}
