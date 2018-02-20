import curry from 'lodash/curry';

const isNotSame = curry((a, b) => a !== b);

export default isNotSame;
