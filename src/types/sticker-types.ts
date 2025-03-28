export interface StickerPosition {
  x: number;
  y: number;
  rotation: number;
  scale: number;
}

export interface StickerItem {
  id: string;
  name: string;
  url: string;
  position?: StickerPosition;
}

export interface StickerLayout {
  id: string;
  name: string;
  stickers: {
    url: string;
    positions: StickerPosition[];
  }[];
}
