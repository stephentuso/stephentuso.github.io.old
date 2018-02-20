import curry from 'lodash/curry';

const transform = curry((transformer, obj) => ({
  ...obj,
  ...transformer(obj),
}));

export default transform;
