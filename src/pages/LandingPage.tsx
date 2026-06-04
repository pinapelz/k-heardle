import React from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";

import { appName } from "../constants";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  gap: 24px;
`;

const Title = styled.h1`
  font-family: "Roboto Mono", monospace;
  font-size: 2rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--cl-white);
`;

const Subtitle = styled.p`
  font-family: "Roboto Mono", monospace;
  font-size: 0.9rem;
  color: var(--cl-gray-6);
  margin: 0;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 16px;
  margin-top: 16px;

  @media (max-width: 480px) {
    flex-direction: column;
    width: 100%;
    padding: 0 24px;
  }
`;

const ModeButton = styled.button<{ variant?: "green" | "purple" }>`
  font-family: "Roboto Mono", monospace;
  font-size: 1rem;
  font-weight: 600;
  padding: 16px 32px;
  border: 2px solid
    ${({ variant }) =>
      variant === "purple" ? "var(--cl-purple, #a855f7)" : "var(--cl-green-6)"};
  background: transparent;
  color: ${({ variant }) =>
    variant === "purple" ? "var(--cl-purple, #a855f7)" : "var(--cl-green-6)"};
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    background: ${({ variant }) =>
      variant === "purple" ? "var(--cl-purple, #a855f7)" : "var(--cl-green-6)"};
    color: var(--cl-black, #000);
  }
`;

const ModeDescription = styled.span`
  display: block;
  font-size: 0.7rem;
  font-weight: 400;
  color: var(--cl-gray-6);
  margin-top: 4px;
`;

export function LandingPage() {
  const navigate = useNavigate();

  return (
    <Container>
      <Title>{appName}</Title>
      <Subtitle>Choose a game mode</Subtitle>
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
    </Container>
  );
}
