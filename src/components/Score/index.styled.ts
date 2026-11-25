import styled from "styled-components";

export const Container = styled.div`
  width: 100%;
  margin: 3px 0;

  display: flex;
  align-items: center;
  justify-content: center;
`;

export const Text = styled.p`
  margin: 0;
  font-family: "Roboto Mono", monospace;
  font-size: 0.85rem;
  color: ${({ theme }) => theme.text};
  text-align: center;
`;
