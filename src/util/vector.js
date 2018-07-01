import random from 'lodash/random';
import flow from 'lodash/fp/flow';

export const createVector = (x = 0, y = 0) => ({ x, y });

export const randomVector = () => createVector(
  random(-1, 1, true),
  random(-1, 1, true),
);

export const add = (b) => (a) => createVector(a.x + b.x, a.y + b.y);

export const subtract = (b) => (a) => createVector(a.x - b.x, a.y - b.y);

export const scale = (s) => ({ x, y }) => createVector(x * s, y * s);

export const length = ({ x, y }) => Math.sqrt(x * x + y * y);

export const setLength = (length) => flow(
  normalize,
  scale(length),
);

export const maxLength = (max) => (vector) =>
  (length(vector) > max)
    ? setLength(max)(vector)
    : vector;

export const minLength = (min) => (vector) =>
  (length(vector) < min)
    ? setLength(min)(vector)
    : vector;

export const normalize = ({ x, y }) => {
  const l = length({ x, y }) || 1;
  return createVector(x / l, y / l);
}

export const inverse = ({ x, y }) => ({ x: -x, y: -y });

export const bounceMinX = ({ x, y }) => ({
  x: Math.abs(x),
  y,
});

export const bounceMaxX = ({ x, y }) => ({
  x: -Math.abs(x),
  y,
});

export const bounceMinY = ({ x, y }) => ({
  x,
  y: Math.abs(y),
});

export const bounceMaxY = ({ x, y }) => ({
  x,
  y: -Math.abs(y),
});

export const limitToBounds = ({ width, height }) => ({});
