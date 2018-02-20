import curry from 'lodash/curry';
import transform from './transform';

const transformIf = curry((checkCondition, transformer) => obj =>
  checkCondition(obj)
    ? transform(transformer)(obj)
    : obj
);

export default transformIf;
