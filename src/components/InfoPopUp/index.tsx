import { Button } from "..";

import * as Styled from "./index.styled";

interface Props {
  onClose: () => void;
}

export function InfoPopUp({ onClose }: Props) {
  return (
    <Styled.Container>
      <Styled.PopUp>
        <h1>HOW TO PLAY</h1>
        <Styled.Spacer />
        <Styled.Section>
          <p>
            Listen to the audio clip, then find the correct song in the list.
          </p>
        </Styled.Section>
        <Styled.Section>
          <p>Skipped or incorrect attempts unlock more of the intro.</p>
        </Styled.Section>
        <Styled.Section>
          <p>Answer in as few tries as possible and share your score!</p>
        </Styled.Section>
        <Button variant="green" style={{ marginTop: 20 }} onClick={onClose}>
          Play
        </Button>
      </Styled.PopUp>
    </Styled.Container>
  );
}
