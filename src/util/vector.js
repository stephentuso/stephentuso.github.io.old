import random from 'lodash/random';
import curry from 'lodash/curry';

export const createVector = (x = 0, y = 0) => ({ x, y });

export const randomVector = () => createVector(
  random(-1, 1, true),
  random(-1, 1, true),
);

export const add = curry((b, a) => createVector(a.x + b.x, a.y + b.y));

export const subtract = curry((b, a) => createVector(a.x - b.x, a.y - b.y));

export const scale = curry((s, { x, y }) => createVector(x * s, y * s));

export const length = ({ x, y }) => Math.sqrt(x * x + y * y);

export const normalize = ({ x, y }) => {
  const l = length({ x, y }) || 1;
  return createVector(x / l, y / l);
}
