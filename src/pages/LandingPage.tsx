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

  @media (max-width: 480px) {
    padding: 16px;
    gap: 14px;
  }
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
  max-width: 540px;
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

const GroupHub = styled.section`
  width: 100%;
  max-width: 620px;
  display: flex;
  flex-direction: column;
  gap: 14px;

  @media (max-width: 480px) {
    gap: 10px;
  }
`;

const MembershipCard = styled.div<{ active: boolean }>`
  border: 1px solid ${({ active }) => (active ? "var(--cl-cyan-6)" : "var(--cl-gray-4)")};
  border-radius: 10px;
  padding: 16px;
  background: var(--cl-gray-1);
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const MembershipTitleRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
`;

const MembershipTitle = styled.h3`
  margin: 0;
  font-family: "Roboto Mono", monospace;
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--cl-white);
  letter-spacing: 0.04em;
  text-transform: uppercase;
`;

const MembershipBadge = styled.span<{ active: boolean }>`
  border: 1px solid ${({ active }) => (active ? "var(--cl-cyan-6)" : "var(--cl-gray-5)")};
  color: ${({ active }) => (active ? "var(--cl-cyan-6)" : "var(--cl-gray-6)")};
  border-radius: 999px;
  padding: 3px 8px;
  font-family: "Roboto Mono", monospace;
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
`;

const MembershipSummary = styled.p`
  margin: 0;
  font-family: "Roboto Mono", monospace;
  font-size: 0.82rem;
  color: var(--cl-gray-7);
`;

const MembershipGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;

  @media (max-width: 680px) {
    grid-template-columns: 1fr;
  }
`;

const MembershipDetail = styled.div`
  border: 1px solid var(--cl-gray-3);
  border-radius: 8px;
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const MembershipDetailLabel = styled.span`
  font-family: "Roboto Mono", monospace;
  font-size: 0.68rem;
  color: var(--cl-gray-6);
  text-transform: uppercase;
  letter-spacing: 0.08em;
`;

const MembershipDetailValue = styled.span`
  font-family: "Roboto Mono", monospace;
  font-size: 0.86rem;
  color: var(--cl-white);
  word-break: break-word;
`;

const GroupActions = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;

  @media (max-width: 680px) {
    grid-template-columns: 1fr;
  }
`;

const GroupActionPanel = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const ActionToggle = styled.button<{ active?: boolean }>`
  width: 100%;
  border: 1px solid ${({ active }) => (active ? "var(--cl-cyan-6)" : "var(--cl-gray-4)")};
  border-radius: 8px;
  background: transparent;
  color: ${({ active }) => (active ? "var(--cl-cyan-6)" : "var(--cl-white)")};
  padding: 10px 12px;
  font-family: "Roboto Mono", monospace;
  font-size: 0.82rem;
  font-weight: 700;
  text-align: left;
  cursor: pointer;

  &:hover {
    border-color: var(--cl-cyan-6);
  }
`;

const GroupCard = styled.div`
  border: 1px solid var(--cl-gray-4);
  border-radius: 10px;
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  background: var(--cl-gray-1);

  @media (max-width: 480px) {
    padding: 12px;
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

  @media (max-width: 640px) {
    flex-direction: column;
    flex-wrap: nowrap;
    gap: 8px;
  }
`;

const GroupInput = styled.input`
  flex: 1;
  min-width: 160px;
  background: transparent;
  border: 1px solid var(--cl-gray-4);
  color: var(--cl-white);
  padding: 10px;
  font-family: "Roboto Mono", monospace;
  font-size: 0.8rem;

  @media (max-width: 640px) {
    width: 100%;
    min-width: 0;
  }
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

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  @media (max-width: 640px) {
    width: 100%;
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
      setJoinMessage("");
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
      setCreateMessage("");
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
          <img src="https://yena.pinapelz.com/kheardle/nmixx.webp" alt="NMIXX" />
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

      <GroupHub>
        <MembershipCard active={Boolean(currentMembership)}>
          <MembershipTitleRow>
            <MembershipTitle>Your Group</MembershipTitle>
            <MembershipBadge active={Boolean(currentMembership)}>
              {currentMembership ? "Active" : "Not Joined"}
            </MembershipBadge>
          </MembershipTitleRow>

          {currentMembership ? (
            <>
              <MembershipSummary>
                You&apos;re currently playing with this group identity.
              </MembershipSummary>
              <MembershipGrid>
                <MembershipDetail>
                  <MembershipDetailLabel>Group</MembershipDetailLabel>
                  <MembershipDetailValue>
                    {currentMembership.groupName}
                  </MembershipDetailValue>
                </MembershipDetail>
                <MembershipDetail>
                  <MembershipDetailLabel>Username</MembershipDetailLabel>
                  <MembershipDetailValue>
                    {currentMembership.username}
                  </MembershipDetailValue>
                </MembershipDetail>
                <MembershipDetail>
                  <MembershipDetailLabel>Join Token</MembershipDetailLabel>
                  <MembershipDetailValue>
                    {currentMembership.joinToken ?? "—"}
                  </MembershipDetailValue>
                </MembershipDetail>
              </MembershipGrid>
            </>
          ) : (
            <MembershipSummary>
              You&apos;re not in a group yet. Create one or join with a token below.
            </MembershipSummary>
          )}
        </MembershipCard>

        <GroupActions>
          <GroupActionPanel>
            <ActionToggle
              active={isCreateOpen}
              onClick={() => setIsCreateOpen((open) => !open)}
            >
              {isCreateOpen ? "▾" : "▸"} Create Group
            </ActionToggle>

            {isCreateOpen && (
              <GroupCard>
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
              </GroupCard>
            )}
          </GroupActionPanel>

          <GroupActionPanel>
            <ActionToggle active={isJoinOpen} onClick={() => setIsJoinOpen((open) => !open)}>
              {isJoinOpen ? "▾" : "▸"} Join Group
            </ActionToggle>

            {isJoinOpen && (
              <GroupCard>
                <GroupJoinTitle>Join Group</GroupJoinTitle>
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
                {joinMessage && <GroupStatus>{joinMessage}</GroupStatus>}
              </GroupCard>
            )}
          </GroupActionPanel>
        </GroupActions>
      </GroupHub>

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
