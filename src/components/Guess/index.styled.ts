import styled from "styled-components";
import { GuessState } from "../../types/guess";

const stateColor = (theme: any, active: boolean, state: GuessState | undefined) => {
  if (active)                                return theme.border;
  if (state === GuessState.Correct)          return theme.green;
  if (state === GuessState.PartiallyCorrect) return theme.yellow;
  if (state === GuessState.Incorrect)        return theme.red;
  return theme.border100;
};

export const Container = styled.div<{
  active: boolean;
  state: GuessState | undefined;
}>`
  width: 100%;
  height: 44px;
  margin: 3px 0;

  display: flex;
  align-items: center;

  background-color: var(--cl-gray-1);

  border: 1px solid ${({ theme, active, state }) => stateColor(theme, active, state)};
  border-left: 4px solid ${({ theme, active, state }) => stateColor(theme, active, state)};

  color: ${({ theme }) => theme.text};
`;

export const Text = styled.p`
  margin: 0;
  padding: 0 12px;
  width: 100%;
  font-family: "Roboto Mono", monospace;
  font-size: 0.85rem;
  color: ${({ theme }) => theme.text};
`;
