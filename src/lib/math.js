export const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

// Smootherstep easing used for opening and closing the book.
export const smootherstep = t => t * t * t * (t * (t * 6 - 15) + 10);

// Catmull-Rom spline through 2D points, sampled at t in [0, points.length - 1].
export function spline(points, t) {
  const index = Math.min(points.length - 2, Math.floor(t)), f = t - index;
  const p0 = points[Math.max(0, index - 1)], p1 = points[index], p2 = points[index + 1], p3 = points[Math.min(points.length - 1, index + 2)];
  return [0, 1].map(k => .5 * ((2 * p1[k]) + (-p0[k] + p2[k]) * f + (2 * p0[k] - 5 * p1[k] + 4 * p2[k] - p3[k]) * f * f + (-p0[k] + 3 * p1[k] - 3 * p2[k] + p3[k]) * f * f * f));
}
