import styled from "styled-components";
import { theme } from "../../constants";

export const Button = styled.button<{ variant?: keyof typeof theme }>`
  background-color: transparent;
  border: 1px solid ${({ theme, variant }) =>
    variant ? theme[variant] : theme.border};
  color: ${({ theme, variant }) =>
    variant ? theme[variant] : theme.text};

  font-family: "Roboto Mono", monospace;
  font-size: 0.8rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;

  padding: 10px 20px;
  width: max-content;
  cursor: pointer;
  transition: background-color 0.1s, color 0.1s;

  &:hover {
    background-color: ${({ theme, variant }) =>
      variant ? theme[variant] : theme.border};
    color: var(--cl-gray-0);
  }
`;
