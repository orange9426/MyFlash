import type { ClothingItem } from "@/lib/game/types";

export type Vec3 = [number, number, number];
export type Pt = { x: number; y: number; depth: number };

export type VolumeKind = "body" | "face" | "worn" | "idle" | "removed";

/** 没戴时仍以灰色块面画出，不消失 */
const PERSISTENT_ITEMS: ClothingItem[] = [];

export interface Volume {
  id: string;
  kind: VolumeKind;
  item?: ClothingItem;
  /** 已脱时是否并入该件的单条虚影 */
  ghost?: boolean;
  /** 始终深灰的配件描边 */
  tone?: "base";
  /** 对应衣物穿上时不再画这节身体，避免套两层椭球 */
  coveredBy?: ClothingItem;
  c: Vec3;
  r: Vec3;
  axes: { x: Vec3; y: Vec3; z: Vec3 };
}

export interface Wire {
  item: ClothingItem;
  points: Vec3[];
  tone?: "base";
  width?: number;
}

export interface MannequinModel {
  volumes: Volume[];
  garments: Record<ClothingItem, Volume[]>;
  wires: Wire[];
  anchors: Record<ClothingItem, Vec3>;
  ground: Vec3[];
}

export interface ProjectedPoly {
  id: string;
  kind: VolumeKind;
  item?: ClothingItem;
  tone?: "base";
  points: Pt[];
  depth: number;
}

export interface MannequinView {
  ground: Pt[];
  shadow: Pt[];
  parts: ProjectedPoly[];
  wires: {
    item: ClothingItem;
    points: Pt[];
    worn: boolean;
    tone?: "base";
    width?: number;
  }[];
  anchors: Record<ClothingItem, Pt>;
}

const WORLD_X: Vec3 = [1, 0, 0];
const WORLD_Y: Vec3 = [0, 1, 0];
const WORLD_Z: Vec3 = [0, 0, 1];

const add = (a: Vec3, b: Vec3): Vec3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const sub = (a: Vec3, b: Vec3): Vec3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const scale = (a: Vec3, s: number): Vec3 => [a[0] * s, a[1] * s, a[2] * s];
const dot = (a: Vec3, b: Vec3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a: Vec3, b: Vec3): Vec3 => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
];
const hypot3 = (a: Vec3) => Math.hypot(a[0], a[1], a[2]);
const norm = (a: Vec3): Vec3 => {
  const l = hypot3(a) || 1;
  return [a[0] / l, a[1] / l, a[2] / l];
};
const mid = (a: Vec3, b: Vec3): Vec3 => scale(add(a, b), 0.5);

function basisFromY(dir: Vec3): { x: Vec3; y: Vec3; z: Vec3 } {
  const y = norm(dir);
  const tmp: Vec3 = Math.abs(y[1]) > 0.92 ? WORLD_X : WORLD_Y;
  const x = norm(cross(tmp, y));
  const z = cross(y, x);
  return { x, y, z };
}

const aligned = (c: Vec3, r: Vec3): Pick<Volume, "c" | "r" | "axes"> => ({
  c,
  r,
  axes: { x: WORLD_X, y: WORLD_Y, z: WORLD_Z },
});

function ball(c: Vec3, radius: number): Pick<Volume, "c" | "r" | "axes"> {
  return aligned(c, [radius, radius, radius]);
}

function capsule(a: Vec3, b: Vec3, radius: number): Pick<Volume, "c" | "r" | "axes"> {
  const d = sub(b, a);
  const half = hypot3(d) / 2;
  return {
    c: mid(a, b),
    r: [radius, half + radius * 0.18, radius],
    axes: basisFromY(d),
  };
}

function localToWorld(v: Pick<Volume, "c" | "r" | "axes">, local: Vec3): Vec3 {
  return add(
    v.c,
    add(add(scale(v.axes.x, local[0]), scale(v.axes.y, local[1])), scale(v.axes.z, local[2])),
  );
}

function sampleVolume(v: Pick<Volume, "c" | "r" | "axes">, lat: number, lon: number): Vec3[] {
  const pts: Vec3[] = [];
  for (let i = 0; i <= lat; i++) {
    const phi = (i / lat) * Math.PI;
    const sp = Math.sin(phi);
    const cp = Math.cos(phi);
    const n = i === 0 || i === lat ? 1 : lon;
    for (let j = 0; j < n; j++) {
      const th = (j / n) * Math.PI * 2;
      pts.push(
        localToWorld(v, [
          v.r[0] * sp * Math.cos(th),
          v.r[1] * cp,
          v.r[2] * sp * Math.sin(th),
        ]),
      );
    }
  }
  return pts;
}

function convexHull(pts: Pt[]): Pt[] {
  if (pts.length < 3) return pts;
  const p = [...pts].sort((a, b) => a.x - b.x || a.y - b.y);
  const cr = (o: Pt, a: Pt, b: Pt) => (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
  const lower: Pt[] = [];
  for (const pt of p) {
    while (lower.length >= 2 && cr(lower[lower.length - 2], lower[lower.length - 1], pt) <= 0) {
      lower.pop();
    }
    lower.push(pt);
  }
  const upper: Pt[] = [];
  for (let i = p.length - 1; i >= 0; i--) {
    const pt = p[i];
    while (upper.length >= 2 && cr(upper[upper.length - 2], upper[upper.length - 1], pt) <= 0) {
      upper.pop();
    }
    upper.push(pt);
  }
  lower.pop();
  upper.pop();
  return lower.concat(upper);
}

function circleOnGround(radius: number, n = 40): Vec3[] {
  const pts: Vec3[] = [];
  for (let i = 0; i <= n; i++) {
    const a = (i / n) * Math.PI * 2;
    pts.push([radius * Math.cos(a), 0, radius * Math.sin(a)]);
  }
  return pts;
}

const ELEVATION = (30 * Math.PI) / 180;
const TARGET: Vec3 = [0, 0.95, 0.06];
const DIST = 4.2;

function camBasis(yawDeg: number) {
  const yaw = (yawDeg * Math.PI) / 180;
  const eye: Vec3 = [
    TARGET[0] + DIST * Math.cos(ELEVATION) * Math.sin(yaw),
    TARGET[1] + DIST * Math.sin(ELEVATION),
    TARGET[2] + DIST * Math.cos(ELEVATION) * Math.cos(yaw),
  ];
  const forward = norm(sub(TARGET, eye));
  const right = norm(cross(forward, WORLD_Y));
  const up = cross(right, forward);
  return { eye, forward, right, up };
}

function toCam(p: Vec3, b: ReturnType<typeof camBasis>) {
  const rel = sub(p, b.eye);
  return {
    x: dot(rel, b.right),
    y: dot(rel, b.up),
    depth: dot(rel, b.forward),
  };
}

export const VIEW_W = 400;
export const VIEW_H = 460;

export function buildMannequin(): MannequinModel {
  const vol = (
    id: string,
    kind: VolumeKind,
    geo: Pick<Volume, "c" | "r" | "axes">,
    extra?: Partial<Pick<Volume, "item" | "ghost" | "tone" | "coveredBy">>,
  ): Volume => ({ id, kind, ghost: true, ...geo, ...extra });

  const volumes: Volume[] = [];

  // 自然站立：双臂微张下垂、双脚与髋同宽
  volumes.push(vol("head", "body", aligned([0, 1.66, 0.04], [0.09, 0.125, 0.1])));
  volumes.push(vol("neck", "body", aligned([0, 1.52, 0.03], [0.03, 0.05, 0.03])));

  const shoulderGeo = aligned([0, 1.43, 0.02], [0.19, 0.062, 0.085]);
  const chestGeo = aligned([0, 1.27, 0.035], [0.15, 0.12, 0.095]);
  const waistGeo = aligned([0, 1.11, 0.025], [0.115, 0.078, 0.08]);
  const hipsGeo = aligned([0, 0.93, 0.02], [0.145, 0.088, 0.098]);

  volumes.push(vol("shoulder", "body", shoulderGeo, { coveredBy: "上衣" }));
  volumes.push(vol("chest", "body", chestGeo, { coveredBy: "上衣" }));
  volumes.push(vol("waist", "body", waistGeo, { coveredBy: "上衣" }));
  volumes.push(vol("hips", "body", hipsGeo, { coveredBy: "内裤" }));

  const shR: Vec3 = [0.19, 1.42, 0.01];
  const elR: Vec3 = [0.23, 1.14, 0.03];
  const wrR: Vec3 = [0.21, 0.88, 0.04];
  const shL: Vec3 = [-0.19, 1.42, 0.02];
  const elL: Vec3 = [-0.23, 1.14, 0.05];
  const wrL: Vec3 = [-0.21, 0.88, 0.07];

  volumes.push(vol("uarmR", "body", capsule(shR, elR, 0.042), { coveredBy: "上衣" }));
  volumes.push(vol("larmR", "body", capsule(elR, wrR, 0.032)));
  volumes.push(vol("handR", "body", aligned([0.2, 0.84, 0.05], [0.036, 0.03, 0.026])));
  volumes.push(vol("uarmL", "body", capsule(shL, elL, 0.042), { coveredBy: "上衣" }));
  volumes.push(vol("larmL", "body", capsule(elL, wrL, 0.032)));
  volumes.push(vol("handL", "body", aligned([-0.2, 0.84, 0.08], [0.036, 0.03, 0.026])));

  const hpR: Vec3 = [0.09, 0.87, 0];
  const knR: Vec3 = [0.1, 0.47, 0.01];
  const anR: Vec3 = [0.1, 0.07, 0.03];
  const hpL: Vec3 = [-0.09, 0.87, 0.03];
  const knL: Vec3 = [-0.1, 0.47, 0.06];
  const anL: Vec3 = [-0.1, 0.07, 0.09];

  volumes.push(vol("thighR", "body", capsule(hpR, knR, 0.064), { coveredBy: "长裤" }));
  volumes.push(vol("shinR", "body", capsule(knR, anR, 0.042), { coveredBy: "长裤" }));
  volumes.push(vol("footR", "body", aligned([0.1, 0.03, 0.12], [0.04, 0.024, 0.1]), { coveredBy: "短袜" }));
  volumes.push(vol("thighL", "body", capsule(hpL, knL, 0.064), { coveredBy: "长裤" }));
  volumes.push(vol("shinL", "body", capsule(knL, anL, 0.042), { coveredBy: "长裤" }));
  volumes.push(vol("footL", "body", aligned([-0.1, 0.03, 0.18], [0.04, 0.024, 0.1]), { coveredBy: "短袜" }));

  const shell = (
    id: string,
    item: ClothingItem,
    geo: Pick<Volume, "c" | "r" | "axes">,
  ): Volume => vol(id, "worn", geo, { item });

  const garments: Record<ClothingItem, Volume[]> = {
    上衣: [
      shell("shirt-shoulder", "上衣", shoulderGeo),
      shell("shirt-chest", "上衣", chestGeo),
      shell("shirt-waist", "上衣", waistGeo),
      shell("shirt-sleeveR", "上衣", capsule(shR, elR, 0.042)),
      shell("shirt-sleeveL", "上衣", capsule(shL, elL, 0.042)),
    ],
    长裤: [
      shell("pant-thighR", "长裤", capsule(hpR, knR, 0.064)),
      shell("pant-thighL", "长裤", capsule(hpL, knL, 0.064)),
      shell("pant-shinR", "长裤", capsule(knR, anR, 0.042)),
      shell("pant-shinL", "长裤", capsule(knL, anL, 0.042)),
    ],
    内裤: [shell("brief", "内裤", hipsGeo)],
    短袜: [
      shell("sockR", "短袜", aligned([0.1, 0.03, 0.12], [0.04, 0.024, 0.1])),
      shell("sockL", "短袜", aligned([-0.1, 0.03, 0.18], [0.04, 0.024, 0.1])),
    ],
    护膝: [
      shell("kneeR", "护膝", ball(knR, 0.05)),
      shell("kneeL", "护膝", ball(knL, 0.05)),
    ],
  };

  const wires: Wire[] = [];

  const anchors: Record<ClothingItem, Vec3> = {
    上衣: [0, 1.28, 0.14],
    内裤: [0, 0.9, 0.12],
    长裤: [0.12, 0.62, 0.07],
    护膝: [0.11, 0.47, 0.04],
    短袜: [0.1, 0.04, 0.14],
  };

  return {
    volumes,
    garments,
    wires,
    anchors,
    ground: circleOnGround(0.78),
  };
}

export function projectMannequin(
  model: MannequinModel,
  clothing: Record<ClothingItem, boolean>,
  yawDeg: number,
  opts?: { width?: number; height?: number; pad?: number },
): MannequinView {
  const width = opts?.width ?? VIEW_W;
  const height = opts?.height ?? VIEW_H;
  const pad = opts?.pad ?? 88;
  const cam = camBasis(yawDeg);

  const hullOf = (geo: Pick<Volume, "c" | "r" | "axes">, lat = 8, lon = 16): Pt[] => {
    const raw = sampleVolume(geo, lat, lon).map((p) => {
      const q = toCam(p, cam);
      return { x: q.x, y: q.y, depth: q.depth };
    });
    return convexHull(raw);
  };

  const meanDepth = (pts: Pt[]) => pts.reduce((s, p) => s + p.depth, 0) / (pts.length || 1);

  const fitPts: Pt[] = [];
  const bodyParts: ProjectedPoly[] = [];
  for (const v of model.volumes) {
    if (v.coveredBy && clothing[v.coveredBy]) continue;
    const fine = v.kind === "face";
    const points = hullOf(v, fine ? 5 : 8, fine ? 10 : 16);
    fitPts.push(...points);
    bodyParts.push({ id: v.id, kind: v.kind, points, depth: meanDepth(points) });
  }

  const wornParts: ProjectedPoly[] = [];
  (Object.keys(model.garments) as ClothingItem[]).forEach((key) => {
    const on = !!clothing[key];
    if (!on && !PERSISTENT_ITEMS.includes(key)) return;
    const kind: VolumeKind = on ? "worn" : "idle";
    for (const g of model.garments[key]) {
      const points = hullOf(g, 7, 14);
      fitPts.push(...points);
      wornParts.push({
        id: on ? g.id : `idle-${g.id}`,
        kind,
        item: key,
        tone: g.tone,
        points,
        depth: meanDepth(points),
      });
    }
  });

  const groundRaw = model.ground.map((p) => {
    const q = toCam(p, cam);
    return { x: q.x, y: q.y, depth: q.depth };
  });
  const shadowRaw = circleOnGround(0.26).map((p) => {
    const q = toCam(p, cam);
    return { x: q.x, y: q.y, depth: q.depth };
  });

  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  for (const p of fitPts) {
    if (p.x < minX) minX = p.x;
    if (p.x > maxX) maxX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.y > maxY) maxY = p.y;
  }
  const scaleXY = Math.min(
    (width - pad * 2) / (maxX - minX || 1),
    (height - pad * 2) / (maxY - minY || 1),
  );
  const offX = pad + (width - pad * 2 - (maxX - minX) * scaleXY) / 2 - minX * scaleXY;
  const offY = pad + (height - pad * 2 - (maxY - minY) * scaleXY) / 2 - minY * scaleXY;

  const mapPt = (p: Pt): Pt => ({
    x: p.x * scaleXY + offX,
    y: height - (p.y * scaleXY + offY),
    depth: p.depth,
  });
  const mapPoly = (p: ProjectedPoly): ProjectedPoly => ({
    ...p,
    points: p.points.map(mapPt),
  });

  const layer = (k: VolumeKind) =>
    k === "face" ? 3 : k === "worn" ? 2 : k === "idle" ? 1 : 0;
  const parts = [...bodyParts.map(mapPoly), ...wornParts.map(mapPoly)].sort((a, b) => {
    const dd = b.depth - a.depth;
    if (Math.abs(dd) > 0.002) return dd;
    return layer(a.kind) - layer(b.kind);
  });

  const anchors = {} as Record<ClothingItem, Pt>;
  for (const key of Object.keys(model.anchors) as ClothingItem[]) {
    const q = toCam(model.anchors[key], cam);
    anchors[key] = mapPt({ x: q.x, y: q.y, depth: q.depth });
  }

  const wires = model.wires
    .filter((w) => clothing[w.item] || PERSISTENT_ITEMS.includes(w.item))
    .map((w) => ({
      item: w.item,
      tone: w.tone,
      width: w.width,
      worn: !!clothing[w.item],
      points: w.points.map((p) => {
        const q = toCam(p, cam);
        return mapPt({ x: q.x, y: q.y, depth: q.depth });
      }),
    }));

  return {
    ground: groundRaw.map(mapPt),
    shadow: shadowRaw.map(mapPt),
    parts,
    wires,
    anchors,
  };
}

export function polyPoints(pts: Pt[]): string {
  return pts.map((p) => `${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(" ");
}
