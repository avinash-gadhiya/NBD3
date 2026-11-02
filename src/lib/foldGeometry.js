import { MathUtils, Matrix4, Vector3 } from 'three';

/* Rigid V-fold: both base edges are fixed to the book pages, and both
   printed panels share one crease. All positions derive from the book angle.
   Each panel is placed with a CSS matrix3d built from a three.js Matrix4. */

const { clamp, degToRad } = MathUtils;

// Panel basis: u runs along the panel width, v down the crease, n is the face normal.
function panelMatrix(u, v, position) {
  const n = new Vector3().crossVectors(u, v).normalize();
  return new Matrix4().makeBasis(u, v, n).setPosition(position).elements;
}

export function bifold(angle, { width, height, beta = 30, origin = [380, 278, 1] }) {
  const theta = Math.PI - degToRad(clamp(angle, 0, 180));
  const b = degToRad(beta), c = Math.cos(b), s = Math.sin(b), half = theta / 2;
  const base = new Vector3(...origin);
  const left = new Vector3(-c * Math.cos(theta), s, c * Math.sin(theta));
  const right = new Vector3(c, s, 0);
  const crease = new Vector3(s * Math.sin(half), -c * Math.sin(half), s * Math.cos(half)).normalize();
  const top = base.clone().addScaledVector(crease, height);
  const v = crease.clone().negate();
  return {
    left: panelMatrix(left.clone().negate(), v, top.clone().addScaledVector(left, width)),
    right: panelMatrix(right, v, top),
  };
}

export function rightPageFold(angle, { width, height, beta = 18, origin = [650, 398, 1.3] }) {
  const phi = clamp(angle, 0, 180) * Math.PI / 360;
  const chi = degToRad(beta) * Math.sin(phi), c = Math.cos(chi), s = Math.sin(chi);
  const crease = new Vector3(0, -Math.cos(phi), Math.sin(phi));
  const leftU = new Vector3(c, -s * Math.sin(phi), -s * Math.cos(phi));
  const right = new Vector3(c, s * Math.sin(phi), s * Math.cos(phi));
  const left = leftU.clone().negate();
  const v = crease.clone().negate();
  const top = new Vector3(...origin).addScaledVector(crease, height);
  return {
    left: panelMatrix(leftU, v, top.clone().addScaledVector(left, width)),
    right: panelMatrix(right, v, top),
  };
}

export const toMatrix3d = elements => `matrix3d(${elements.join(',')})`;
