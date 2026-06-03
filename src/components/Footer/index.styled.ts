import styled from "styled-components";

export const Text = styled.p`
  text-align: center;
  font-family: "Roboto Mono", monospace;
  font-size: 0.75rem;
  color: var(--cl-gray-5);
  margin-top: 48px;
`;

export const Link = styled.a`
  color: var(--cl-gray-6) !important;
  &:hover { color: var(--cl-magenta-7) !important; }
`;
