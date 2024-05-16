export interface ICanvasSize {
  width: number;
  height: number;
}

export interface IRectangleDrawn {
  x: number;
  y: number;
  width: number;
  height: number;
  page: number;
  pdfSize: ICanvasSize;
}
