import styled from "styled-components";

export const Container = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  z-index: 10;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.85);
`;

export const PopUp = styled.div`
  width: 90%;
  max-width: 480px;
  padding: 32px;
  background-color: var(--cl-gray-1);
  border: 1px solid ${({ theme }) => theme.border};
  display: flex;
  flex-direction: column;
  align-items: center;

  h1 {
    font-family: "Roboto Mono", monospace;
    font-size: 1rem;
    font-weight: 700;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--cl-green-6);
    margin: 0;
  }
`;

export const Spacer = styled.div`
  width: 100%;
  height: 1px;
  margin: 20px 0;
  background-color: ${({ theme }) => theme.border};
`;

export const Section = styled.div`
  width: 100%;
  margin: 4px 0;

  p {
    font-size: 0.82rem;
    line-height: 1.6;
    color: var(--cl-gray-9);
    margin: 0 0 8px 0;
  }

  a { color: var(--cl-orange-6); }
`;

export const Contact = styled.p`
  margin-top: 5%;
  font-size: 0.75rem;
  opacity: 0.5;

  a { color: ${({ theme }) => theme.text}; }
`;
