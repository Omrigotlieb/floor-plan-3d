#!/usr/bin/env node
/**
 * Generates data/sample-floor-plan.pdf — a minimal synthetic PDF containing
 * geometric wall paths (moveTo/lineTo) that the pdfjs vector parser can extract.
 *
 * The PDF is hand-crafted using the PDF 1.4 specification to avoid runtime
 * dependencies on headless browsers or PDF libraries.
 *
 * Usage:
 *   node scripts/generate-sample-pdf.js
 *
 * Output:
 *   data/sample-floor-plan.pdf
 */

import { writeFileSync, mkdirSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_PATH = resolve(__dirname, "../data/sample-floor-plan.pdf");

// ---------------------------------------------------------------------------
// PDF primitive helpers
// ---------------------------------------------------------------------------

/** Cross-reference table entry. */
const xref = [];

function bytes(str) {
  return Buffer.from(str, "latin1");
}

/** Serialise a PDF content stream (walls drawn as paths). */
function buildContentStream() {
  // Coordinate space: 595×842 pt (A4)
  // Draw outer rectangle + two interior walls
  const ops = [
    "q",
    // Outer wall rectangle
    "50 50 m", "420 50 l", "420 340 l", "50 340 l", "50 50 l", "S",
    // Vertical divider between living room and bedroom
    "250 50 m", "250 200 l", "S",
    // Horizontal divider
    "50 200 m", "420 200 l", "S",
    // Second vertical divider (kitchen vs bathroom)
    "200 210 m", "200 340 l", "S",
    "Q",
  ].join("\n");
  return ops;
}

// ---------------------------------------------------------------------------
// Build PDF
// ---------------------------------------------------------------------------

const parts = [];
let offset = 0;

function push(str) {
  const buf = bytes(str);
  parts.push(buf);
  offset += buf.length;
  return offset;
}

// %PDF-1.4
push("%PDF-1.4\n");

// Object 1: Catalog
xref.push(offset);
push("1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n");

// Object 2: Pages
xref.push(offset);
push("2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n");

// Object 3: Page (A4, 595×842)
xref.push(offset);
push(
  "3 0 obj\n<< /Type /Page /Parent 2 0 R " +
    "/MediaBox [0 0 595 842] /Contents 4 0 R /Resources << >> >>\nendobj\n"
);

// Object 4: Content stream
const contentStream = buildContentStream();
xref.push(offset);
push(
  `4 0 obj\n<< /Length ${contentStream.length} >>\nstream\n${contentStream}\nendstream\nendobj\n`
);

// Cross-reference table
const xrefOffset = offset;
let xrefStr = "xref\n";
xrefStr += `0 ${xref.length + 1}\n`;
xrefStr += "0000000000 65535 f \n";
for (const off of xref) {
  xrefStr += String(off).padStart(10, "0") + " 00000 n \n";
}
push(xrefStr);

// Trailer
push(
  `trailer\n<< /Size ${xref.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`
);

// Write file
mkdirSync(resolve(__dirname, "../data"), { recursive: true });
writeFileSync(OUT_PATH, Buffer.concat(parts));
console.log(`✓ Written ${OUT_PATH} (${Buffer.concat(parts).length} bytes)`);
