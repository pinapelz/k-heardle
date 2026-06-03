import styled from "styled-components";

export const Container = styled.div`
  position: relative;
  width: 100%;
  margin-top: 16px;
`;

export const SearchContainer = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  height: 48px;
  background-color: var(--cl-gray-1);
  border: 1px solid ${({ theme }) => theme.border};
  color: ${({ theme }) => theme.text};
`;

export const SearchPadding = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  padding: 0 12px;
  color: var(--cl-gray-5);
`;

export const Input = styled.input`
  width: 100%;
  height: 100%;
  margin: 0 10px;
  background-color: transparent;
  border: none;
  outline: none !important;
  font-family: "Roboto Mono", monospace;
  font-size: 0.9rem;
  color: ${({ theme }) => theme.text};

  &::placeholder {
    color: var(--cl-gray-5);
  }
`;

export const ResultsContainer = styled.div`
  position: absolute;
  bottom: 48px;
  z-index: 1;
  display: flex;
  flex-direction: column;
  width: 100%;
  max-height: 280px;
  overflow-y: auto;
  border: 1px solid ${({ theme }) => theme.border};
  border-bottom: none;
`;

export const Result = styled.div`
  padding: 0 12px;
  background-color: var(--cl-gray-1);
  border-bottom: 1px solid ${({ theme }) => theme.border};
  cursor: pointer;

  &:hover {
    background-color: var(--cl-gray-2);
  }
`;

export const ResultText = styled.p`
  margin: 8px 0;
  font-family: "Roboto Mono", monospace;
  font-size: 0.82rem;
  color: ${({ theme }) => theme.text};
  user-select: none;
`;
