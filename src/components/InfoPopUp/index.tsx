import { Button } from "..";

import * as Styled from "./index.styled";

interface Props {
  onClose: () => void;
  gameMode: string;
}

export function InfoPopUp({ onClose, gameMode }: Props) {
  let firstLine = "Listen to the audio clip, then find the correct song in the list."
  if (gameMode === "dailyMV") {
    firstLine = "Find the correct song in the list based on photos from the music video.";
  }
  return (
    <Styled.Container>
      <Styled.PopUp>
        <h1>HOW TO PLAY</h1>
        <Styled.Spacer />
        <Styled.Section>
          <p>
            {firstLine}
          </p>
        </Styled.Section>
        <Styled.Section>
          <p>Skipped or incorrect attempts unlock more of the intro.</p>
        </Styled.Section>
        <Styled.Section>
          <p>Answer in as few tries as possible and share your score!</p>
        </Styled.Section>
        <Styled.Spacer />
        <Styled.Section>
          <p>⬜ Skipped</p>
          <p>🟥 Incorrect Song, Incorrect Artist</p>
          <p>🟨 Correct Artist, Incorrect Song</p>
          <p>🟩 You guessed it!</p>
        </Styled.Section>
        <Button variant="green" style={{ marginTop: 20 }} onClick={onClose}>
          Play
        </Button>
      </Styled.PopUp>
    </Styled.Container>
  );
}
