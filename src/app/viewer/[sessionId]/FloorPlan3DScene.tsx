/// <reference types="@react-three/fiber" />
"use client";

import { useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Text } from "@react-three/drei";
import * as THREE from "three";
import type { FloorPlanSchema, Room, Wall } from "@/types/floor-plan";
import { DEFAULT_WALL_HEIGHT } from "@/lib/geometry";

/** Room colour palette keyed by room name keywords. */
const ROOM_COLOURS: Record<string, string> = {
  living: "#a8d8ea",
  bedroom: "#b5ead7",
  kitchen: "#ffd6a5",
  bathroom: "#d0e8ff",
  hallway: "#ffe5b4",
  corridor: "#ffe5b4",
  office: "#e8d5f5",
  dining: "#fce1e4",
};

function roomColour(name: string): string {
  const lower = name.toLowerCase();
  for (const [keyword, colour] of Object.entries(ROOM_COLOURS)) {
    if (lower.includes(keyword)) return colour;
  }
  return "#d9d9d9";
}

function WallMesh({ wall, scale }: { wall: Wall; scale: number }) {
  const dx = (wall.end[0] - wall.start[0]) * scale;
  const dz = (wall.end[1] - wall.start[1]) * scale;
  const length = Math.sqrt(dx * dx + dz * dz);
  const cx = ((wall.start[0] + wall.end[0]) / 2) * scale;
  const cz = ((wall.start[1] + wall.end[1]) / 2) * scale;
  const angle = Math.atan2(dz, dx);

  return (
    <mesh
      position={[cx, DEFAULT_WALL_HEIGHT / 2, cz]}
      rotation={[0, -angle, 0]}
      aria-label="Wall segment"
    >
      <boxGeometry args={[length, DEFAULT_WALL_HEIGHT, wall.thickness]} />
      <meshStandardMaterial color="#8c8c8c" />
    </mesh>
  );
}

function RoomLabel({ room, scale }: { room: Room; scale: number }) {
  if (room.vertices.length === 0) return null;

  const xs = room.vertices.map((v) => v[0] * scale);
  const zs = room.vertices.map((v) => v[1] * scale);
  const cx = (Math.min(...xs) + Math.max(...xs)) / 2;
  const cz = (Math.min(...zs) + Math.max(...zs)) / 2;
  const area = room.area != null ? `${room.area.toFixed(1)} m²` : "";

  return (
    <group position={[cx, 0.05, cz]}>
      {/* Subtle floor tint */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry
          args={[Math.max(...xs) - Math.min(...xs), Math.max(...zs) - Math.min(...zs)]}
        />
        <meshStandardMaterial color={roomColour(room.name)} opacity={0.6} transparent />
      </mesh>
      {/* Room name label */}
      <Text
        position={[0, 0.5, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.3}
        color="#222"
        anchorX="center"
        anchorY="middle"
        aria-label={`Room: ${room.name}${area ? `, ${area}` : ""}`}
      >
        {`${room.name}${area ? `\n${area}` : ""}`}
      </Text>
    </group>
  );
}

export default function FloorPlan3DScene({ schema }: { schema: FloorPlanSchema }) {
  const orbitRef = useRef(null);

  return (
    <Canvas
      camera={{ position: [5, 8, 12], fov: 50 }}
      style={{ width: "100%", height: "100%" }}
      aria-label="Interactive 3D floor plan viewer"
      role="img"
    >
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 20, 10]} intensity={0.8} castShadow />

      {/* Floor plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial color="#f0ece4" />
      </mesh>

      {/* Walls */}
      {schema.walls.map((wall, i) => (
        <WallMesh key={i} wall={wall} scale={schema.scale} />
      ))}

      {/* Room labels + colour */}
      {schema.rooms.map((room, i) => (
        <RoomLabel key={i} room={room} scale={schema.scale} />
      ))}

      <OrbitControls ref={orbitRef} makeDefault enableDamping />
    </Canvas>
  );
}
