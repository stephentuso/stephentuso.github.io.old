import React from 'react';
import styled from 'styled-components'
import times from 'lodash/fp/times';
import flow from 'lodash/fp/flow';
import map from 'lodash/fp/map';
import flatten from 'lodash/fp/flatten';
import random from 'lodash/random';
import triangulate from 'delaunay-triangulate';
import {
  createVector,
  randomVector,
  add as addVectors,
  subtract as subtractVectors,
  scale as scaleVector,
  length as vectorLength,
  inverse as vectorInverse,
  bounceMinX,
  bounceMaxX,
  bounceMinY,
  bounceMaxY, maxLength, setLength, minLength,
} from '../util/vector'
import transform from '../util/transform';

const createNode = createVector;

const NODE_COUNT = 100;
const MAX_SPEED = 7;
const MIN_SPEED = 0.1;
const MOUSE_RADIUS = 50 * window.devicePixelRatio;

const nodeToArray = ({ x, y }) => [x, y];

const createEdge = (nodeA, nodeB) => [nodeA, nodeB];

const edgesForTriangle = nodes => ([a, b, c]) => ([
  createEdge(nodes[a], nodes[b]),
  createEdge(nodes[b], nodes[c]),
  createEdge(nodes[c], nodes[a]),
]);

const edgesForNodes = nodes => flow(
  map(nodeToArray),
  triangulate,
  map(edgesForTriangle(nodes)),
  flatten,
)(nodes);

const createAnimatedNode = node => ({
  ...node,
  speed: setLength(random(MIN_SPEED, MAX_SPEED))(randomVector()),
  acceleration: createVector(),
});

const limitSpeedMinX = (min) => node =>
  (node.x < min)
    ? { ...node, speed: bounceMinX(node.speed) }
    : node;

const limitSpeedMaxX = (max) => (node) =>
  (node.x > max)
    ? { ...node, speed: bounceMaxX(node.speed) }
    : node;

const limitSpeedMinY = (min) => node =>
  (node.y < min)
    ? { ...node, speed: bounceMinY(node.speed) }
    : node;

const limitSpeedMaxY = (max) => (node) =>
  (node.y > max)
    ? { ...node, speed: bounceMaxY(node.speed) }
    : node;

const performBounce = ({ width, height, nodeRadius }) => flow(
  limitSpeedMinX(nodeRadius),
  limitSpeedMaxX(width - nodeRadius),
  limitSpeedMinY(nodeRadius),
  limitSpeedMaxY(height - nodeRadius),
);

const updateSpeed = transform(({ acceleration, speed }) => ({
  speed: flow(
    addVectors(acceleration),
    maxLength(MAX_SPEED),
    minLength(MIN_SPEED),
  )(speed)
}));

const updatePosition = transform(({ x, y, speed }) => ({
  ...addVectors({ x, y })(speed),
}));

const updateAcceleration = (mousePosition) => (node) => transform(() => {
  const defaultAcceleration = flow(
    vectorInverse,
    scaleVector(0.01)
  )(node.speed)

  if (!mousePosition) {
    return { acceleration: defaultAcceleration }
  }

  const mouseVector = subtractVectors(mousePosition)(node);
  const length = vectorLength(mouseVector);
  const radius = MOUSE_RADIUS;
  if (length > radius) {
    return { acceleration: defaultAcceleration }
  }
  const accelerationLength = radius - length;
  const acceleration = flow(
    setLength(accelerationLength),
    scaleVector(0.01)
  )(mouseVector);
  return {
    acceleration,
  };
})(node);

const limitPosition = ({ width, height, nodeRadius }) => transform(({ x, y }) => ({
  x: Math.max(Math.min(x, width - nodeRadius), nodeRadius),
  y: Math.max(Math.min(y, height - nodeRadius), nodeRadius),
}))

const updateAnimatedNode = (mousePosition, params) => flow(
  updateAcceleration(mousePosition),
  updateSpeed,
  updatePosition,
  performBounce(params),
  limitPosition(params),
);

const drawEdge = ({ context, width, height }) => (edge) => {
  const [a, b] = edge.map(nodeToArray);
  context.beginPath();
  context.moveTo(...a);
  context.lineTo(...b);
  context.closePath();
  context.stroke();
};

const drawNode = ({ context, nodeRadius }) => (node) => {
  const { x, y } = node;
  context.beginPath();
  context.arc(x, y, nodeRadius, 0, 2 * Math.PI);
  context.closePath();
  context.fill();
};

const updateCanvasSize = (canvas, pixelRatio) => {
  canvas.width = canvas.scrollWidth * pixelRatio;
  canvas.height = canvas.scrollHeight * pixelRatio;
}

const getMousePosition = (canvas, event) => {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;

  return {
    x: (event.clientX - rect.left) * scaleX,
    y: (event.clientY - rect.top) * scaleY,
  };
}

const run = (instance) => (canvas) => {
  const resize = () => updateCanvasSize(canvas, window.devicePixelRatio);
  window.addEventListener('resize', resize, false);
  resize();

  const context = canvas.getContext('2d');

  const loop = (lastNodes) => {
    const { width, height } = canvas;
    const nodeRadius = 5 * window.devicePixelRatio;
    const params = { width, height, nodeRadius };
    const updateNode = updateAnimatedNode(instance.mousePosition, params);
    const nodes = lastNodes.map(updateNode);

    const edges = edgesForNodes(nodes);
    const execDrawEdge = drawEdge({ context });
    const execDrawNode = drawNode({ context, nodeRadius })

    context.fillStyle = '#eee';
    context.globalCompositeOperation = 'source-over';
    context.fillRect(0, 0, width, height);

    context.strokeStyle = '#000';
    context.lineWidth = 4 * window.devicePixelRatio;
    context.globalCompositeOperation = 'destination-out';

    edges.forEach(execDrawEdge);
    nodes.forEach(execDrawNode);

    if (instance.unmounted) {
      return;
    }

    requestAnimationFrame(
      () => loop(nodes)
    );
  }

  const { width, height } = canvas;
  const nodes = times(() => createNode(width / 2, height / 2), NODE_COUNT).map(createAnimatedNode);
  loop(nodes);
};

const CanvasContainer = styled.div`
  width: 100%;
  height: 100%;
`;

export default class Delaunay extends React.Component {

  addEnterListener = () => this.canvas.addEventListener('mouseover', this.enterHandler);

  removeEnterListener = () => this.canvas.removeEventListener('mouseover', this.enterHandler);

  addExitListener = () => this.canvas.addEventListener('mouseleave', this.exitHandler);

  removeExitListener = () => this.canvas.addEventListener('mouseleave', this.exitHandler)

  addMovementListener = () => window.addEventListener('mousemove', this.movementHandler);

  removeMovementListener = () => window.removeEventListener('mousemove', this.movementHandler);

  movementHandler = (event) => {
    this.mousePosition = getMousePosition(this.canvas, event);
  }

  enterHandler = () => {
    this.addMovementListener();
    this.removeEnterListener();
    this.addExitListener();
  }

  exitHandler = () => {
    this.removeMovementListener();
    this.removeExitListener();
    this.addEnterListener();
    this.mousePosition = null;
  }

  constructor() {
    super();
    this.unmounted = false;
  }

  componentWillUnmount() {
    this.unmounted = true;
    this.removeMovementListener();
  }

  render() {
    const {
      className,
    } = this.props;

    return (
      <CanvasContainer className={className} >
        <canvas
          style={{ width: '100%', height: '100%' }}
          ref={canvas => {
            this.canvas = canvas;
            this.addMovementListener();
            run(this)(canvas);
          }}
        />
      </CanvasContainer>
    );
  }
};
