import * as Styled from "./index.styled";

export function Score() {
  return (
    <Styled.Container>
      <Styled.Text>Score: {localStorage.getItem("unlimitedScore") ?? "0"} | High Score: {localStorage.getItem("unlimitedHighScore") ?? "0"}</Styled.Text>
      <Styled.Text></Styled.Text>
    </Styled.Container>
  );
}
