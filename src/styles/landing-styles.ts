import styled from "styled-components";


export const getColor = (variant?: "pink" | "purple" | "cyan") => {
  switch (variant) {
    case "purple":
      return "var(--cl-magenta-7)";
    case "cyan":
      return "var(--cl-cyan-6)";
    default:
      return "var(--cl-magenta-8)";
  }
};

export const Container = styled.div`
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

export const Hero = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  text-align: center;
`;

export const HeroImage = styled.div`
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

export const Title = styled.h1`
  font-family: "Roboto Mono", monospace;
  font-size: clamp(1.75rem, 4vw, 2.5rem);
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  margin: 0;
  text-align: center;
  color: var(--cl-gray-9);
`;

export const Subtitle = styled.p`
  font-family: "Roboto Mono", monospace;
  font-size: 0.9rem;
  color: var(--cl-gray-7);
  margin: 0;
  text-align: center;
  letter-spacing: 0.05em;
`;

export const ModeGroups = styled.div`
  display: flex;
  flex-direction: column;
  gap: 22px;
  width: 100%;
  max-width: 540px;
`;

export const ButtonGroup = styled.div`
  display: flex;
  gap: 16px;
  justify-content: center;
  flex-wrap: wrap;

  @media (max-width: 480px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

export const GroupLabel = styled.span`
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

export const ModeButton = styled.button<{ variant?: "pink" | "purple" | "cyan" }>`
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

export const ModeDescription = styled.span`
  font-size: 0.72rem;
  font-weight: 400;
  color: var(--cl-gray-6);
  margin-top: 6px;
`;

export const GroupHub = styled.section`
  width: 100%;
  max-width: 620px;
  display: flex;
  flex-direction: column;
  gap: 14px;

  @media (max-width: 480px) {
    gap: 10px;
  }
`;

export const MembershipCard = styled.div<{ active: boolean }>`
  border: 1px solid ${({ active }) => (active ? "var(--cl-cyan-6)" : "var(--cl-gray-4)")};
  border-radius: 10px;
  padding: 16px;
  background: var(--cl-gray-1);
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

export const MembershipTitleRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
`;

export const MembershipTitle = styled.h3`
  margin: 0;
  font-family: "Roboto Mono", monospace;
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--cl-white);
  letter-spacing: 0.04em;
  text-transform: uppercase;
`;

export const MembershipBadge = styled.span<{ active: boolean }>`
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

export const MembershipSummary = styled.p`
  margin: 0;
  font-family: "Roboto Mono", monospace;
  font-size: 0.82rem;
  color: var(--cl-gray-7);
`;

export const MembershipGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;

  @media (max-width: 680px) {
    grid-template-columns: 1fr;
  }
`;

export const MembershipDetail = styled.div`
  border: 1px solid var(--cl-gray-3);
  border-radius: 8px;
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

export const MembershipDetailLabel = styled.span`
  font-family: "Roboto Mono", monospace;
  font-size: 0.68rem;
  color: var(--cl-gray-6);
  text-transform: uppercase;
  letter-spacing: 0.08em;
`;

export const MembershipDetailValue = styled.span`
  font-family: "Roboto Mono", monospace;
  font-size: 0.86rem;
  color: var(--cl-white);
  word-break: break-word;
`;

export const GroupActions = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;

  @media (max-width: 680px) {
    grid-template-columns: 1fr;
  }
`;

export const GroupActionPanel = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const ActionToggle = styled.button<{ active?: boolean }>`
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

export const GroupCard = styled.div`
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

export const GroupJoinTitle = styled.h3`
  margin: 0;
  font-family: "Roboto Mono", monospace;
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--cl-white);
`;

export const GroupJoinRow = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;

  @media (max-width: 640px) {
    flex-direction: column;
    flex-wrap: nowrap;
    gap: 8px;
  }
`;

export const GroupInput = styled.input`
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

export const JoinButton = styled.button`
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

export const GroupStatus = styled.p`
  margin: 0;
  font-family: "Roboto Mono", monospace;
  font-size: 0.76rem;
  color: var(--cl-gray-7);
`;

export const Footer = styled.div`
  margin-top: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: "Roboto Mono", monospace;
  font-size: 0.8rem;
`;

export const GitHubLink = styled.a`
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

export const GitHubIcon = styled.svg`
  width: 16px;
  height: 16px;
  fill: currentColor;
`;

export const LeaveGroupButton = styled.button`
  border: 1px solid var(--cl-red-6);
  color: var(--cl-red-6);
  background: transparent;
  padding: 10px 14px;
  font-family: "Roboto Mono", monospace;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;

  &:hover {
    background: var(--cl-red-6);
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
