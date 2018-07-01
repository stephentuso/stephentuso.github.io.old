const transform = (transformer) => (obj) => ({
  ...obj,
  ...transformer(obj),
});

export default transform;
