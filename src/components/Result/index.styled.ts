import styled from "styled-components";

export const ResultTitle = styled.h1`
  font-family: "Roboto Mono", monospace;
  font-size: 1.3rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  color: var(--cl-green-6);
  margin-bottom: 8px;

  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

export const Tries = styled.h4`
  font-family: "Roboto Mono", monospace;
  font-size: 0.85rem;
  font-weight: 400;
  color: var(--cl-gray-8);
  margin: 0 0 16px 0;
`;

export const SongTitle = styled.h3`
  font-family: "Roboto Mono", monospace;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--cl-white);
  margin: 0 0 4px 0;
`;

export const TimeToNext = styled.h4`
  font-family: "Roboto Mono", monospace;
  font-size: 0.8rem;
  font-weight: 400;
  color: var(--cl-gray-6);
  margin-top: 16px;
`;

export const GroupStatus = styled.div`
  margin-top: 14px;
  padding: 10px 12px;
  border: 1px solid var(--cl-gray-4);
  border-radius: 6px;
  width: 100%;
  max-width: 560px;
`;

export const GroupHeading = styled.h4`
  font-family: "Roboto Mono", monospace;
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--cl-white);
  margin: 0 0 6px 0;
`;

export const GroupMeta = styled.p`
  font-family: "Roboto Mono", monospace;
  font-size: 0.8rem;
  font-weight: 400;
  color: var(--cl-gray-7);
  margin: 0;

  strong {
    color: var(--cl-green-6);
  }

  & + & {
    margin-top: 6px;
  }
`;
