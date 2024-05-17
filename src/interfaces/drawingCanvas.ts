import { IInputSectionBBox } from "./document";

export interface ICanvasSize {
  width: number;
  height: number;
}

export interface IRectangleDrawn {
  boundingBox: IInputSectionBBox;
  page: number;
  pdfSize: ICanvasSize;
}
