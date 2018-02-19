import React from 'react';
import styled from 'styled-components';
import Delaunay from './components/Delaunay';

const Container = styled.div`
  font-family: Roboto;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Background = styled(Delaunay)`
  position: absolute;
  top: 0;
  left: 0;
  z-index: -100;
  background: linear-gradient(to bottom right, #ffaf00, #ff1b8e);
`;

export default () => (
  <Container>
    <Background />
  </Container>
);
