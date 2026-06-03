import React from "react";
import { IoBug, IoHeart } from "react-icons/io5";
import { Button } from "..";

import * as Styled from "./index.styled";

export function Footer() {
  const showDebugButton = location.hostname == "localhost" || location.port == "3000";
  const [showDebugMenu, setShowDebugMenu] = React.useState<boolean>(false);

  const toggleDebugMenu = React.useCallback(() => {
    setShowDebugMenu(show => !show)
  }, []);

  const clearLocalStorage = React.useCallback(() => {
    localStorage.clear();
    location.reload();
  }, []);

  return (
    <footer>
      <Styled.Text>
        <Styled.Link href="https://github.com/pinapelz/k-heardle">
          Source Code
        </Styled.Link>
      </Styled.Text>
      {showDebugButton &&
        <Styled.Text>
          <Button onClick={toggleDebugMenu}><IoBug /> Debug Options</Button><br />
          {showDebugMenu &&
            <Button variant="red" onClick={clearLocalStorage}>
              Clear Local Storage & Reload
            </Button>
          }
        </Styled.Text>
      }
    </footer>
  );
}
