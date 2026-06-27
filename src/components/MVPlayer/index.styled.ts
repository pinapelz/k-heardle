import styled from "styled-components";

export const Frame = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  margin: 16px 0;
`;

export const Images = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
  width: 100%;
`;

export const ImageSlot = styled.div<{ $revealed: boolean }>`
  position: relative;
  width: 200px;
  height: 113px;
  background-color: var(--cl-gray-2);
  border: 1px solid ${({ theme }) => theme.border};
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
`;

export const Placeholder = styled.p`
  margin: 0;
  font-family: "Roboto Mono", monospace;
  font-size: 0.7rem;
  color: var(--cl-gray-5);
  text-align: center;
  padding: 0 8px;
`;

export const Hint = styled.p`
  margin: 0;
  font-family: "Roboto Mono", monospace;
  font-size: 0.75rem;
  color: var(--cl-gray-6);
`;

export const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  cursor: zoom-out;
`;

export const LightboxImage = styled.img`
  max-width: 90vw;
  max-height: 90vh;
  object-fit: contain;
  cursor: default;
`;
