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
