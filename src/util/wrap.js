import React from 'react';

const wrap = Wrapper => Component => props => (
  <Wrapper>
    <Component {...props} />
  </Wrapper>
);

export default wrap;
