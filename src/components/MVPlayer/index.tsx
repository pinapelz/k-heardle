import React from "react";
import * as Styled from "./index.styled";

interface Props {
  currentTry: number;
  date: string;
}

const MV_CDN_URL = import.meta.env.VITE_CDN_URL || "";

function getRevealedCount(currentTry: number): number {
  if (currentTry >= 5) return 3;
  if (currentTry >= 2) return 2;
  return 1;
}

export function MVPlayer({ currentTry, date }: Props) {
  const revealed = getRevealedCount(currentTry);
  const [errored, setErrored] = React.useState<Set<number>>(new Set());

  const [activeImage, setActiveImage] = React.useState<string | null>(null);

  const markError = React.useCallback((index: number) => {
    setErrored((prev) => {
      const next = new Set(prev);
      next.add(index);
      return next;
    });
  }, []);

  React.useEffect(() => {
    setErrored(new Set());
    setActiveImage(null);
  }, [date]);

  return (
    <Styled.Frame>
      <Styled.Images>
        {Array.from({ length: 3 }, (_, i) => {
          const index = i + 1;
          const isRevealed = index <= revealed;
          const src = `${MV_CDN_URL}/k-heardle-mvs/${date}/${index}.jpg`;
          const hasError = errored.has(index);

          return (
            <Styled.ImageSlot key={index} $revealed={isRevealed}>
              {isRevealed && !hasError ? (
                <img
                  src={src}
                  alt={`MV frame ${index}`}
                  onError={() => markError(index)}
                  onClick={() => setActiveImage(src)}
                  style={{ cursor: "zoom-in" }}
                />
              ) : isRevealed && hasError ? (
                <Styled.Placeholder>
                  Frame {index} not available yet.
                </Styled.Placeholder>
              ) : (
                <Styled.Placeholder>?</Styled.Placeholder>
              )}
            </Styled.ImageSlot>
          );
        })}
      </Styled.Images>

      <Styled.Hint>
        {revealed < 3
          ? `More frames unlock as you guess. (${revealed}/3 revealed)`
          : "All frames revealed."}
      </Styled.Hint>

      {activeImage && (
        <Styled.Overlay onClick={() => setActiveImage(null)}>
          <Styled.LightboxImage
            src={activeImage}
            alt="Full size MV frame"
            onClick={(e) => e.stopPropagation()}
          />
        </Styled.Overlay>
      )}
    </Styled.Frame>
  );
}
