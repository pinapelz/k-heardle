import React from "react";
import { useNavigate } from "react-router-dom";
import { appName } from "../constants";
import {
  createGroup,
  getStoredGroupMembership,
  joinGroupByToken,
  saveGroupMembership,
  removeGroupMembership,
} from "../helpers/group";
import * as Styles from "../styles/landing-styles";

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
    <Styles.Container>
      <Styles.Hero>
        <Styles.Title>{appName}</Styles.Title>
        <Styles.HeroImage>
          <img src="https://yena.pinapelz.com/kheardle/nmixx.webp" alt="NMIXX" />
        </Styles.HeroImage>
        <Styles.Subtitle>a kpop music guessing game</Styles.Subtitle>
      </Styles.Hero>

      <Styles.ModeGroups>
        <div>
          <Styles.GroupLabel>Song Guessing</Styles.GroupLabel>
          <Styles.ButtonGroup>
            <Styles.ModeButton onClick={() => navigate("/daily")}>
              Daily
              <Styles.ModeDescription>One song per day</Styles.ModeDescription>
            </Styles.ModeButton>
            <Styles.ModeButton variant="purple" onClick={() => navigate("/unlimited")}>
              Unlimited
              <Styles.ModeDescription>Endless songs, no limits</Styles.ModeDescription>
            </Styles.ModeButton>
          </Styles.ButtonGroup>
        </div>
        <div>
          <Styles.GroupLabel>Music Video Guessing</Styles.GroupLabel>
          <Styles.ButtonGroup>
            <Styles.ModeButton variant="cyan" onClick={() => navigate("/mv")}>
              Daily MV
              <Styles.ModeDescription>Guess the MV from frames</Styles.ModeDescription>
            </Styles.ModeButton>
          </Styles.ButtonGroup>
        </div>
      </Styles.ModeGroups>

      <Styles.GroupHub>
        <Styles.MembershipCard active={Boolean(currentMembership)}>
          <Styles.MembershipTitleRow>
            <Styles.MembershipTitle>Your Group</Styles.MembershipTitle>
            <Styles.MembershipBadge active={Boolean(currentMembership)}>
              {currentMembership ? "Active" : "Not Joined"}
            </Styles.MembershipBadge>
          </Styles.MembershipTitleRow>

          {currentMembership ? (
            <>
              <Styles.MembershipSummary>
                You&apos;re currently playing with this group identity.
              </Styles.MembershipSummary>
              <Styles.MembershipGrid>
                <Styles.MembershipDetail>
                  <Styles.MembershipDetailLabel>Group</Styles.MembershipDetailLabel>
                  <Styles.MembershipDetailValue>
                    {currentMembership.groupName}
                  </Styles.MembershipDetailValue>
                </Styles.MembershipDetail>
                <Styles.MembershipDetail>
                  <Styles.MembershipDetailLabel>Username</Styles.MembershipDetailLabel>
                  <Styles.MembershipDetailValue>
                    {currentMembership.username}
                  </Styles.MembershipDetailValue>
                </Styles.MembershipDetail>
                <Styles.MembershipDetail>
                  <Styles.MembershipDetailLabel>Join Token</Styles.MembershipDetailLabel>
                  <Styles.MembershipDetailValue>
                    {currentMembership.joinToken ?? "—"}
                  </Styles.MembershipDetailValue>
                </Styles.MembershipDetail>
              </Styles.MembershipGrid>
              <Styles.GroupActions>
                <Styles.GroupActionPanel>
                  <Styles.LeaveGroupButton onClick={removeGroupMembership}>Leave Group</Styles.LeaveGroupButton>
                </Styles.GroupActionPanel>
              </Styles.GroupActions>
            </>
          ) : (
            <Styles.MembershipSummary>
              You&apos;re not in a group yet. Create one or join with a token below.
            </Styles.MembershipSummary>
          )}
        </Styles.MembershipCard>

        <Styles.GroupActions>
          <Styles.GroupActionPanel>
            <Styles.ActionToggle
              active={isCreateOpen}
              onClick={() => setIsCreateOpen((open) => !open)}
            >
              {isCreateOpen ? "▾" : "▸"} Create Group
            </Styles.ActionToggle>

            {isCreateOpen && (
              <Styles.GroupCard>
                <Styles.GroupJoinTitle>Create Group</Styles.GroupJoinTitle>
                <Styles.GroupJoinRow>
                  <Styles.GroupInput
                    placeholder="Group name"
                    value={groupName}
                    onChange={(event) => setGroupName(event.target.value)}
                    maxLength={64}
                  />
                  <Styles.GroupInput
                    placeholder="Username"
                    value={username}
                    onChange={(event) => setUsername(event.target.value)}
                    maxLength={32}
                  />
                  <Styles.JoinButton onClick={createNewGroup} disabled={isCreating}>
                    {isCreating ? "Creating..." : "Create"}
                  </Styles.JoinButton>
                </Styles.GroupJoinRow>
                {createMessage && <Styles.GroupStatus>{createMessage}</Styles.GroupStatus>}
              </Styles.GroupCard>
            )}
          </Styles.GroupActionPanel>

          <Styles.GroupActionPanel>
            <Styles.ActionToggle active={isJoinOpen} onClick={() => setIsJoinOpen((open) => !open)}>
              {isJoinOpen ? "▾" : "▸"} Join Group
            </Styles.ActionToggle>

            {isJoinOpen && (
              <Styles.GroupCard>
                <Styles.GroupJoinTitle>Join Group</Styles.GroupJoinTitle>
                <Styles.GroupJoinRow>
                  <Styles.GroupInput
                    placeholder="Join token"
                    value={joinToken}
                    onChange={(event) => setJoinToken(event.target.value.toUpperCase())}
                    maxLength={12}
                  />
                  <Styles.GroupInput
                    placeholder="Username"
                    value={username}
                    onChange={(event) => setUsername(event.target.value)}
                    maxLength={32}
                  />
                  <Styles.JoinButton onClick={joinGroup} disabled={isJoining}>
                    {isJoining ? "Joining..." : "Join"}
                  </Styles.JoinButton>
                </Styles.GroupJoinRow>
                {joinMessage && <Styles.GroupStatus>{joinMessage}</Styles.GroupStatus>}
              </Styles.GroupCard>
            )}
          </Styles.GroupActionPanel>
        </Styles.GroupActions>
      </Styles.GroupHub>

      <Styles.Footer>
        <Styles.GitHubLink
          href="https://github.com/pinapelz/k-heardle"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Styles.GitHubIcon viewBox="0 0 16 16">
            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0016 8c0-4.42-3.58-8-8-8z" />
          </Styles.GitHubIcon>
          Source Code
        </Styles.GitHubLink>
      </Styles.Footer>
    </Styles.Container>
  );
}
