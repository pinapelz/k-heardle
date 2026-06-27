import { useNavigate } from "react-router-dom";
import styled from "styled-components";

import { appName } from "../constants";

const getColor = (variant?: "green" | "purple" | "cyan") => {
  switch (variant) {
    case "purple":
      return "var(--cl-purple, #a855f7)";
    case "cyan":
      return "var(--cl-cyan-6)";
    default:
      return "var(--cl-green-6)";
  }
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 70vh;
  padding: 24px;
  gap: 14px;
`;

const Title = styled.h1`
  font-family: "Roboto Mono", monospace;
  font-size: clamp(1.5rem, 3vw, 2rem);
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--cl-white);
  text-align: center;
  margin: 0;
`;

const Subtitle = styled.p`
  font-family: "Roboto Mono", monospace;
  font-size: 0.9rem;
  color: var(--cl-gray-6);
  margin: 4px 0 0;
  text-align: center;
`;

const ModeGroups = styled.div`
  display: flex;
  flex-direction: column;
  gap: 22px;
  width: 100%;
  max-width: 600px;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 16px;
  justify-content: center;
  flex-wrap: wrap;

  @media (max-width: 480px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const GroupLabel = styled.span`
  display: block;
  font-family: "Roboto Mono", monospace;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--cl-gray-6);
  text-align: center;
  margin-bottom: 10px;
`;

const ModeButton = styled.button<{ variant?: "green" | "purple" | "cyan" }>`
  font-family: "Roboto Mono", monospace;
  font-size: 1rem;
  font-weight: 600;
  padding: 16px 28px;
  min-width: 180px;

  border: 2px solid ${({ variant }) => getColor(variant)};
  background: transparent;
  color: ${({ variant }) => getColor(variant)};

  cursor: pointer;
  transition: all 0.15s ease;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;

  &:hover {
    background: ${({ variant }) => getColor(variant)};
    color: var(--cl-black, #000);
  }

  &:focus-visible {
    outline: 3px solid ${({ variant }) => getColor(variant)};
    outline-offset: 3px;
  }

  @media (max-width: 480px) {
    width: 100%;
    min-width: unset;
  }
`;

const ModeDescription = styled.span`
  font-size: 0.72rem;
  font-weight: 400;
  color: var(--cl-gray-6);
  margin-top: 6px;
`;


export function LandingPage() {
  const navigate = useNavigate();

  return (
    <Container>
      <Title>{appName}</Title>
      <Subtitle>a kpop music guessing game</Subtitle>
      <ModeGroups>
        <div>
          <GroupLabel>Song Guessing</GroupLabel>
          <ButtonGroup>
            <ModeButton onClick={() => navigate("/daily")}>
              Daily
              <ModeDescription>One song per day</ModeDescription>
            </ModeButton>
            <ModeButton variant="purple" onClick={() => navigate("/unlimited")}>
              Unlimited
              <ModeDescription>Endless songs, no limits</ModeDescription>
            </ModeButton>
          </ButtonGroup>
        </div>
        <div>
          <GroupLabel>Music Video Guessing</GroupLabel>
          <ButtonGroup>
            <ModeButton variant="cyan" onClick={() => navigate("/mv")}>
              Daily MV
              <ModeDescription>Guess the MV from frames</ModeDescription>
            </ModeButton>
          </ButtonGroup>
        </div>
      </ModeGroups>
    </Container>
  );
}
