import React from 'react';
import styled, { keyframes, css } from 'styled-components';
import Delaunay from './components/Delaunay';
import Icon from '@fortawesome/react-fontawesome';
import faGithub from '@fortawesome/fontawesome-free-brands/faGithub';
import faTwitter from '@fortawesome/fontawesome-free-brands/faTwitter';
import wrap from './util/wrap';
import flow from 'lodash/fp/flow';

const smallMargin = '16px';
const margin = '48px';
const textColor = '#ff014f';
const gradientStart = '#ffaf00';
const gradientEnd = '#ff1b8e';

const switchColors = keyframes`
  from {
    color: ${textColor};
  }
  
  30% {
    color: ${gradientStart}
  }
  
  to {
    color: ${gradientEnd}
  }
`;

const switchColorAnimation = css`
  animation: 1s linear infinite alternate ${switchColors};
`;

const Container = styled.div`
  font-family: Roboto, Helvetica Neue, sans-serif;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #eee;
`;

const ContentContainer = styled.div`
  display: flex;
  flex-direction: column;
  color: ${textColor};
  text-align: center;
`;

const Animation = styled(Delaunay)`
  width: 400px;
  height: 400px;
  background: linear-gradient(to bottom right, ${gradientStart}, ${gradientEnd});
`;

const WithMargin = styled.div`
  margin-bottom: ${margin};
`;

const Name = styled.h1`
  letter-spacing: 0.1em;
  text-transform: uppercase;
  margin-bottom: ${smallMargin};
  font-size: 1.6rem;
`;

const Title = styled.div`
  font-style: italic;
  transition: color 0.2s;
`;

const StyledLink = styled.a`
  transition: color 0.3s;
  color: inherit;
  
  :hover {
    ${switchColorAnimation}
  }
`;

const Work = flow(styled(StyledLink), wrap(WithMargin))`
  font-style: italic;
`;

const Links = styled.div`
  > * {
    margin: ${smallMargin};
  }
`;

const Link = ({ href, icon }) => (
  <StyledLink href={href}>
    <Icon icon={icon} size="2x" />
  </StyledLink>
)

export default () => (
  <Container>
    <ContentContainer>
      <Animation />
      <Name>Stephen Tuso</Name>
      <Title>Software Developer</Title>
      <Work href="https://starchive.io">@starchive</Work>
      <Links>
        <Link href="https://github.com/stephentuso" icon={faGithub} />
        <Link href="https://twitter.com/s_tuso" icon={faTwitter} />
      </Links>
    </ContentContainer>
  </Container>
);
