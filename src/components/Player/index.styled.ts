import styled from "styled-components";

export const ProgressBackground = styled.div`
  position: relative;
  width: 100%;
  height: 12px;
  background-color: var(--cl-gray-2);
  border: 1px solid ${({ theme }) => theme.border};
  margin: 24px 0 4px 0;
`;

export const Progress = styled.div<{ value: number }>`
  width: ${({ value }) => value * 6.25}%;
  height: 100%;
  background-color: ${({ theme }) => theme.green};
  transition: width 0.5s;
`;

export const Separator = styled.div`
  position: absolute;
  top: 0;
  width: 1px;
  height: 100%;
  background-color: ${({ theme }) => theme.border};
`;

export const TimeStamps = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
  margin-bottom: 12px;
`;

export const TimeStamp = styled.p`
  margin: 0;
  font-family: "Roboto Mono", monospace;
  font-size: 0.7rem;
  color: var(--cl-gray-5);
`;
