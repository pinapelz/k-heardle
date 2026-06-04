import styled from "styled-components";

export const Container = styled.header`
  width: 100%;
  border-bottom: 1px solid ${({ theme }) => theme.border};
  padding-bottom: 16px;
  margin-bottom: 32px;
`;

export const Content = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  align-items: center;
  max-width: 680px;
  margin: 0 auto;

  svg {
    color: var(--cl-gray-6);
    &:hover {
      cursor: pointer;
      color: var(--cl-white);
    }
  }

  a { text-decoration: none; color: ${({ theme }) => theme.text}; }
`;

export const Logo = styled.h1`
  font-family: "Roboto Mono", monospace;
  font-size: 1rem;
  font-weight: 700;
  letter-spacing: 0.3em;
  text-transform: uppercase;
  text-align: center;
  color: var(--cl-green-6);
  margin: 0;

  user-select: none;
`;
