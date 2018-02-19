import React from 'react';
import times from 'lodash/fp/times';
import flow from 'lodash/fp/flow';
import map from 'lodash/fp/map';
import flatten from 'lodash/fp/flatten';
import curry from 'lodash/curry';
import random from 'lodash/random';
import get from 'lodash/fp/get';
import triangulate from 'delaunay-triangulate';
import {
  createVector,
  randomVector,
  add as addVectors,
  scale as scaleVector,
} from '../util/vector'

const createNode = createVector;

const randomNodes = times(
  () => createNode(random(0, 1, true), random(0, 1, true))
);

const nodesEqual = curry((a, b) => (
  a.x === b.x && a.y === b.y
));

const nodeToArray = ({ x, y }) => [x, y];

const scaleNode = curry((width, height, { x, y }) => createNode(x * width, y * height));

const createEdge = (nodeA, nodeB) => [nodeA, nodeB];

const edgesEqual = curry((a, b) => (
  nodesEqual(a[0], b[0]) && nodesEqual(a[1], b[1])
));

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
  node,
  speed: scaleVector(0.00001, randomVector())
});

const updateAnimatedNode = ({ node, speed }) => ({
  node: addVectors(node, speed),
  speed: addVectors(speed, scaleVector(0.000001, randomVector())),
});

const drawEdge = curry(({ context, width, height }, edge) => {
  const [a, b] = edge.map(flow(
    scaleNode(width, height),
    nodeToArray
  ));
  context.beginPath();
  context.moveTo(...a);
  context.lineTo(...b);
  context.closePath();
  context.stroke();
});

const updateCanvasSize = canvas => {
  canvas.width = canvas.scrollWidth * window.devicePixelRatio;
  canvas.height = canvas.scrollHeight * window.devicePixelRatio;
}

const run = canvas => {
  console.log(canvas);
  updateCanvasSize(canvas);

  window.addEventListener('resize', () => updateCanvasSize(canvas), false);

  const loop = (nodes) => {
    const { width, height } = canvas;
    const edges = edgesForNodes(nodes.map(get('node')));
    const context = canvas.getContext('2d');
    const execDrawEdge = drawEdge({
      context,
      width,
      height,
    });

    context.fillStyle = '#eee';
    context.globalCompositeOperation = 'source-over';
    context.fillRect(0, 0, width, height);

    context.strokeStyle = '#000';
    context.lineWidth = 4;
    context.globalCompositeOperation = 'destination-out';

    edges.forEach(execDrawEdge);

    requestAnimationFrame(
      () => loop(nodes.map(updateAnimatedNode))
    );
  }

  const nodes = randomNodes(200).map(createAnimatedNode);
  loop(nodes);
}

export default ({ className }) => (
  <canvas className={className} style={{ width: '100%', height: '100%' }} ref={run} />
);
