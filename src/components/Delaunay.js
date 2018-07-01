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
const MAX_SPEED = 0.01;
const MIN_SPEED = 0.00002;
const MOUSE_RADIUS = 0.12;

const nodeToArray = ({ x, y }) => [x, y];

const scaleNode = (width) => (height) => ({ x, y }) => createNode(x * width, y * height);

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

const limitSpeedMinX = node =>
  (node.x < 0)
    ? { ...node, speed: bounceMinX(node.speed) }
    : node;

const limitSpeedMaxX = (width) => (node) =>
  (node.x > width)
    ? { ...node, speed: bounceMaxX(node.speed) }
    : node;

const limitSpeedMinY = node =>
  (node.y < 0)
    ? { ...node, speed: bounceMinY(node.speed) }
    : node;

const limitSpeedMaxY = (height) => (node) =>
  (node.y > height)
    ? { ...node, speed: bounceMaxY(node.speed) }
    : node;

const performBounce = flow(
  limitSpeedMinX,
  limitSpeedMaxX(1),
  limitSpeedMinY,
  limitSpeedMaxY(1),
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

const limitPosition = transform(({ x, y }) => ({
  x: Math.max(Math.min(x, 1), 0),
  y: Math.max(Math.min(y, 1), 0),
}))

const updateAnimatedNode = (mousePosition) => flow(
  updateAcceleration(mousePosition),
  updateSpeed,
  updatePosition,
  performBounce,
  limitPosition,
);

const drawEdge = ({ context, width, height }) => (edge) => {
  const [a, b] = edge.map(flow(
    scaleNode(width)(height),
    nodeToArray
  ));
  context.beginPath();
  context.moveTo(...a);
  context.lineTo(...b);
  context.closePath();
  context.stroke();
};

const drawNode = ({ context, width, height }) => (node) => {
  const { x, y } = scaleNode(width)(height)(node);
  context.beginPath();
  context.arc(x, y, 5, 0, 2 * Math.PI);
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
    const updateNode = updateAnimatedNode(instance.mousePosition);
    const nodes = lastNodes.map(updateNode);

    const edges = edgesForNodes(nodes);
    const execDrawEdge = drawEdge({ context, width, height });
    const execDrawNode = drawNode({ context, width, height })

    context.fillStyle = '#eee';
    context.globalCompositeOperation = 'source-over';
    context.fillRect(0, 0, width, height);

    context.strokeStyle = '#000';
    context.lineWidth = 10;
    context.globalCompositeOperation = 'destination-out';

    edges.forEach(execDrawEdge);
    nodes.forEach(execDrawNode)

    if (instance.unmounted) {
      return;
    }

    requestAnimationFrame(
      () => loop(nodes)
    );
  }

  const nodes = times(() => createNode(0.5, 0.5), NODE_COUNT).map(createAnimatedNode);
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
    const { width, height } = this.canvas;
    const pos = getMousePosition(this.canvas, event);
    this.mousePosition = scaleNode(1 / width)(1 / height)(pos);
  }

  enterHandler = flow(
    this.addMovementListener,
    this.removeEnterListener,
    this.addExitListener,
  )

  exitHandler = flow(
    this.removeMovementListener,
    this.removeExitListener,
    this.addEnterListener,
    () => { this.mousePosition = null }
  )

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
