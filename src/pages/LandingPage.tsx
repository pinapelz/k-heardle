import React from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";

import { appName } from "../constants";
import {
  createGroup,
  getStoredGroupMembership,
  joinGroupByToken,
  saveGroupMembership,
} from "../helpers/group";

const getColor = (variant?: "pink" | "purple" | "cyan") => {
  switch (variant) {
    case "purple":
      return "var(--cl-magenta-7)";
    case "cyan":
      return "var(--cl-cyan-6)";
    default:
      return "var(--cl-magenta-8)";
  }
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 70vh;
  padding: 24px;
  gap: 18px;
`;

const Hero = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  text-align: center;
`;

const HeroImage = styled.div`
  width: clamp(180px, 28vw, 260px);
  height: clamp(180px, 28vw, 260px);
  border: 2px solid var(--cl-gray-3);
  background-color: var(--cl-gray-2);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-radius: 6px;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.06);

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
`;

const Title = styled.h1`
  font-family: "Roboto Mono", monospace;
  font-size: clamp(1.75rem, 4vw, 2.5rem);
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  margin: 0;
  text-align: center;
  color: var(--cl-gray-9);
`;

const Subtitle = styled.p`
  font-family: "Roboto Mono", monospace;
  font-size: 0.9rem;
  color: var(--cl-gray-7);
  margin: 0;
  text-align: center;
  letter-spacing: 0.05em;
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

const ModeButton = styled.button<{ variant?: "pink" | "purple" | "cyan" }>`
  font-family: "Roboto Mono", monospace;
  font-size: 1rem;
  font-weight: 600;
  padding: 16px 28px;
  min-width: 180px;

  border: 2px solid ${({ variant }) => getColor(variant)};
  background: transparent;
  color: ${({ variant }) => getColor(variant)};

  cursor: pointer;
  transition: background-color 0.12s ease, color 0.12s ease;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;

  &:hover {
    background: ${({ variant }) => getColor(variant)};
    color: var(--cl-white, #fff);
  }

  &:focus-visible {
    outline: 2px solid ${({ variant }) => getColor(variant)};
    outline-offset: 2px;
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

const GroupJoinCard = styled.div`
  width: 100%;
  max-width: 440px;
  border: 1px solid var(--cl-gray-4);
  border-radius: 8px;
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const ExpandButton = styled.button`
  width: 100%;
  max-width: 440px;
  border: 1px solid var(--cl-gray-4);
  border-radius: 8px;
  background: transparent;
  color: var(--cl-white);
  padding: 12px 14px;
  font-family: "Roboto Mono", monospace;
  font-size: 0.88rem;
  font-weight: 700;
  text-align: left;
  cursor: pointer;

  &:hover {
    border-color: var(--cl-cyan-6);
  }
`;

const GroupJoinTitle = styled.h3`
  margin: 0;
  font-family: "Roboto Mono", monospace;
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--cl-white);
`;

const GroupJoinRow = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
`;

const GroupInput = styled.input`
  flex: 1;
  min-width: 180px;
  background: transparent;
  border: 1px solid var(--cl-gray-4);
  color: var(--cl-white);
  padding: 10px;
  font-family: "Roboto Mono", monospace;
  font-size: 0.8rem;
`;

const JoinButton = styled.button`
  border: 1px solid var(--cl-cyan-6);
  color: var(--cl-cyan-6);
  background: transparent;
  padding: 10px 14px;
  font-family: "Roboto Mono", monospace;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;

  &:hover {
    background: var(--cl-cyan-6);
    color: var(--cl-white, #fff);
  }
`;

const GroupStatus = styled.p`
  margin: 0;
  font-family: "Roboto Mono", monospace;
  font-size: 0.76rem;
  color: var(--cl-gray-7);
`;

const Footer = styled.div`
  margin-top: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: "Roboto Mono", monospace;
  font-size: 0.8rem;
`;

const GitHubLink = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--cl-gray-7);
  text-decoration: none;
  padding: 6px 12px;
  border: 1px solid var(--cl-gray-3);
  transition: color 0.12s ease, border-color 0.12s ease;

  &:hover {
    color: var(--cl-magenta-7);
    border-color: var(--cl-magenta-7);
  }
`;

const GitHubIcon = styled.svg`
  width: 16px;
  height: 16px;
  fill: currentColor;
`;

export function LandingPage() {
  const navigate = useNavigate();
  const initialMembership = React.useMemo(() => getStoredGroupMembership(), []);
  const [currentMembership, setCurrentMembership] = React.useState(initialMembership);

  const [groupName, setGroupName] = React.useState("");
  const [joinToken, setJoinToken] = React.useState(
    initialMembership?.joinToken ?? ""
  );
  const [username, setUsername] = React.useState(
    initialMembership?.username ?? localStorage.getItem("groupUsername") ?? ""
  );
  const [joinMessage, setJoinMessage] = React.useState("");
  const [createMessage, setCreateMessage] = React.useState("");
  const [isJoining, setIsJoining] = React.useState(false);
  const [isCreating, setIsCreating] = React.useState(false);
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  const [isJoinOpen, setIsJoinOpen] = React.useState(false);

  const createNewGroup = React.useCallback(async () => {
    if (!groupName.trim() || !username.trim()) {
      setCreateMessage("Enter group name and username.");
      return;
    }

    setIsCreating(true);
    try {
      const membership = await createGroup(groupName, username);
      saveGroupMembership(membership);
      setCurrentMembership(membership);
      localStorage.setItem("groupUsername", membership.username);
      setJoinToken(membership.joinToken ?? "");
      setCreateMessage(
        `Created ${membership.groupName}. Join token: ${membership.joinToken}`
      );
    } catch (error) {
      setCreateMessage(
        error instanceof Error ? error.message : "Unable to create group."
      );
    } finally {
      setIsCreating(false);
    }
  }, [groupName, username]);

  const joinGroup = React.useCallback(async () => {
    if (!joinToken.trim() || !username.trim()) {
      setJoinMessage("Enter both token and username.");
      return;
    }

    setIsJoining(true);
    try {
      const membership = await joinGroupByToken(joinToken, username);
      saveGroupMembership(membership);
      setCurrentMembership(membership);
      localStorage.setItem("groupUsername", membership.username);
      setJoinMessage(`Joined ${membership.groupName} as ${membership.username}`);
    } catch (error) {
      setJoinMessage(
        error instanceof Error ? error.message : "Unable to join group."
      );
    } finally {
      setIsJoining(false);
    }
  }, [joinToken, username]);

  return (
    <Container>
      <Hero>
        <Title>{appName}</Title>
        <HeroImage>
          <img src="https://yena.pinapelz.com/kheardle/stress.png" alt="NMIXX Haewon Stress PNG" />
        </HeroImage>
        <Subtitle>a kpop music guessing game</Subtitle>
      </Hero>

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

      <ExpandButton onClick={() => setIsCreateOpen((open) => !open)}>
        {isCreateOpen ? "▾" : "▸"} Create Group
      </ExpandButton>
      {isCreateOpen && (
        <GroupJoinCard>
          <GroupJoinTitle>Create Group</GroupJoinTitle>
          <GroupJoinRow>
            <GroupInput
              placeholder="Group name"
              value={groupName}
              onChange={(event) => setGroupName(event.target.value)}
              maxLength={64}
            />
            <GroupInput
              placeholder="Username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              maxLength={32}
            />
            <JoinButton onClick={createNewGroup} disabled={isCreating}>
              {isCreating ? "Creating..." : "Create"}
            </JoinButton>
          </GroupJoinRow>
          {createMessage && <GroupStatus>{createMessage}</GroupStatus>}
        </GroupJoinCard>
      )}

      <ExpandButton onClick={() => setIsJoinOpen((open) => !open)}>
        {isJoinOpen ? "▾" : "▸"} Join Group
      </ExpandButton>
      {isJoinOpen && (
        <GroupJoinCard>
          <GroupJoinTitle>Join a Group</GroupJoinTitle>
          <GroupJoinRow>
            <GroupInput
              placeholder="Join token"
              value={joinToken}
              onChange={(event) => setJoinToken(event.target.value.toUpperCase())}
              maxLength={12}
            />
            <GroupInput
              placeholder="Username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              maxLength={32}
            />
            <JoinButton onClick={joinGroup} disabled={isJoining}>
              {isJoining ? "Joining..." : "Join"}
            </JoinButton>
          </GroupJoinRow>
          {currentMembership && (
            <GroupStatus>
              Current group: {currentMembership.groupName} ({currentMembership.username})
            </GroupStatus>
          )}
          {joinMessage && <GroupStatus>{joinMessage}</GroupStatus>}
        </GroupJoinCard>
      )}

      <Footer>
        <GitHubLink
          href="https://github.com/pinapelz/k-heardle"
          target="_blank"
          rel="noopener noreferrer"
        >
          <GitHubIcon viewBox="0 0 16 16">
            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0016 8c0-4.42-3.58-8-8-8z" />
          </GitHubIcon>
          Source Code
        </GitHubLink>
      </Footer>
    </Container>
  );
}
