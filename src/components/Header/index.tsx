import React from "react";
import { IoInformationCircleOutline } from "react-icons/io5";
import { appName } from "../../constants";

import * as Styled from "./index.styled";

interface Props {
  openInfoPopUp: () => void;
}

export function Header({ openInfoPopUp }: Props) {
  return (
    <Styled.Container>
      <Styled.Content>
        <IoInformationCircleOutline
          onClick={openInfoPopUp}
          size={30}
          width={30}
          height={30}
        />
        <a href="/">
        <Styled.Logo>{appName}</Styled.Logo>
        </a>
      </Styled.Content>
    </Styled.Container>
  );
}
