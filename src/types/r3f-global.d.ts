/**
 * Extends React 19's React.JSX.IntrinsicElements with Three.js / R3F primitives.
 * Required because @react-three/fiber 8.x augments the legacy global JSX namespace,
 * not React.JSX, which React 19 uses exclusively.
 */
import type { ThreeElements } from "@react-three/fiber";

declare global {
  namespace React {
    namespace JSX {
      interface IntrinsicElements extends ThreeElements {}
    }
  }
}
