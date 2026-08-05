import styled from "styled-components";

export const Container = styled.div`
  width: 100%;
  max-width: 760px;
  margin: 0 auto;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 18px;

  @media (max-width: 480px) {
    padding: 16px;
    gap: 14px;
  }
`;

export const Header = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

export const Title = styled.h1`
  margin: 0;
  font-family: "Roboto Mono", monospace;
  font-size: clamp(1.4rem, 3vw, 2rem);
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--cl-gray-9);
  word-break: break-word;
`;

export const Subtitle = styled.p`
  margin: 0;
  font-family: "Roboto Mono", monospace;
  font-size: 0.85rem;
  color: var(--cl-gray-7);
`;

export const Controls = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: stretch;

  @media (max-width: 480px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

export const ControlField = styled.label`
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
  min-width: 140px;
`;

export const ControlLabel = styled.span`
  font-family: "Roboto Mono", monospace;
  font-size: 0.68rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--cl-gray-6);
`;

export const MonthInput = styled.input`
  background: var(--cl-gray-1);
  border: 1px solid var(--cl-gray-4);
  color: var(--cl-white);
  padding: 10px 12px;
  font-family: "Roboto Mono", monospace;
  font-size: 0.85rem;
  border-radius: 6px;
  cursor: pointer;
  width: 100%;

  &::-webkit-calendar-picker-indicator {
    filter: invert(0.8);
    cursor: pointer;
  }

  &:focus {
    outline: none;
    border-color: var(--cl-cyan-6);
  }
`;

export const ModeSelect = styled.select`
  background: var(--cl-gray-1);
  border: 1px solid var(--cl-gray-4);
  color: var(--cl-white);
  padding: 10px 12px;
  font-family: "Roboto Mono", monospace;
  font-size: 0.85rem;
  border-radius: 6px;
  cursor: pointer;
  width: 100%;

  &:focus {
    outline: none;
    border-color: var(--cl-cyan-6);
  }

  option {
    background: var(--cl-gray-1);
    color: var(--cl-white);
  }
`;

export const LoadButton = styled.button`
  border: 1px solid var(--cl-cyan-6);
  color: var(--cl-cyan-6);
  background: transparent;
  padding: 10px 18px;
  font-family: "Roboto Mono", monospace;
  font-size: 0.85rem;
  font-weight: 600;
  border-radius: 6px;
  cursor: pointer;
  align-self: flex-end;

  &:hover {
    background: var(--cl-cyan-6);
    color: var(--cl-white, #fff);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  @media (max-width: 480px) {
    align-self: stretch;
  }
`;

export const BackLink = styled.button`
  align-self: flex-start;
  border: 1px solid var(--cl-gray-4);
  background: transparent;
  color: var(--cl-gray-7);
  padding: 8px 12px;
  font-family: "Roboto Mono", monospace;
  font-size: 0.78rem;
  border-radius: 6px;
  cursor: pointer;

  &:hover {
    border-color: var(--cl-cyan-6);
    color: var(--cl-cyan-6);
  }
`;

export const Status = styled.p`
  margin: 0;
  font-family: "Roboto Mono", monospace;
  font-size: 0.8rem;
  color: var(--cl-gray-7);
  text-align: center;
`;

export const Error = styled(Status)`
  color: var(--cl-red-6);
`;

export const HeatmapCard = styled.div`
  border: 1px solid var(--cl-gray-3);
  border-radius: 10px;
  padding: 16px;
  background: var(--cl-gray-1);
  display: flex;
  flex-direction: column;
  gap: 12px;

  @media (max-width: 480px) {
    padding: 12px;
  }
`;
