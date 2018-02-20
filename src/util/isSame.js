import curry from 'lodash/fp/curry';

export default isSame = curry((a, b) => a === b);
