import { IInputSectionBBox } from "./document";

export interface ICanvasSize {
  width: number;
  height: number;
}

// TODO This is bounding box top-right
// For text position I also need to save the bottom-left
export interface IRectangleDrawn {
  x: number;
  y: number;
  boundingBox: IInputSectionBBox;
  page: number;
  pdfSize: ICanvasSize;
}
