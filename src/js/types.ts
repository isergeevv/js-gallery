export type GalleryOptions = {
  selector: HTMLElement | string;
  images?: GalleryImage[];
  mainImage?: boolean;
  extraImages?: boolean;
  excludeMainFromExtraImages?: boolean;
  transitionSpeed?: number;
  navButtons?: boolean;
  modalEnable: boolean;
  modalClickExtraImageOpenModal?: boolean;
  modalMainImageFollowModal?: boolean;
};

export type GalleryImage = {
  src: string;
  alt: string;
};

export type Position = {
  top: number;
  left: number;
};

export type Size = {
  width: number;
  height: number;
};

export type HTMLAttributes = {
  [key: string]: string;
};

