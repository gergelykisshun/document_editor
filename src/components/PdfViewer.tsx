import { useState, useRef, FC, useEffect, useMemo } from "react";
import { usePdf } from "@mikecousins/react-pdf";
import { Layer, Rect, Stage } from "react-konva";
import { Stage as StageType } from "konva/lib/Stage";
import { DEFAULT_CONTAINER_SIZE } from "../constant/drawingCanvas";
import { ICanvasSize } from "../interfaces/drawingCanvas";

const PdfViewer: FC = () => {
  const [page, setPage] = useState(1);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const stageRef = useRef<StageType | null>(null);

  const [pdfSize, setPdfSize] = useState<ICanvasSize | null>(null);

  const [canvasSize, setCanvasSize] = useState<ICanvasSize>(
    DEFAULT_CONTAINER_SIZE
  );
  const canvasContainerRef = useRef<HTMLDivElement | null>(null);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [startX, setStartX] = useState<number | null>(null);
  const [startY, setStartY] = useState<number | null>(null);
  const [endX, setEndX] = useState<number | null>(null);
  const [endY, setEndY] = useState<number | null>(null);

  const rectangleDrawn = useMemo<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(() => {
    if (!startX || !startY || !endX || !endY) return null;

    return {
      x: startX,
      y: startY,
      width: endX - startX,
      height: endY - startY,
    };
  }, [startX, startY, endX, endY]);

  const scale = useMemo(
    () => ({
      x: canvasSize.width / (pdfSize?.width || 1),
      y: (-1 * canvasSize.height) / (pdfSize?.height || 1),
    }),
    [canvasSize, pdfSize]
  );

  // From url
  /*  const { pdfDocument } = usePdf({
    file: "https://pdf-lib.js.org/assets/with_update_sections.pdf",
    page,
    canvasRef,
    scale: 2,
  }); */

  // Local pdf
  const { pdfDocument } = usePdf({
    file: "/test.pdf",
    page,
    canvasRef,
    scale: 2,
  });

  useEffect(() => {
    const updateCanvasSize = () => {
      // Canvas container inital size only should be determined if we have the pdfDocument loaded
      if (!pdfDocument) return;

      if (canvasContainerRef.current) {
        const containerRect =
          canvasContainerRef.current.getBoundingClientRect();

        setCanvasSize({
          width: containerRect.width,
          height: containerRect.height,
        });
      }
    };

    // Initial size update
    updateCanvasSize();

    // Listen for window resize events
    window.addEventListener("resize", updateCanvasSize);

    // Clean up event listener
    return () => {
      window.removeEventListener("resize", updateCanvasSize);
    };
  }, [pdfDocument]);

  useEffect(() => {
    const updatePdfSize = async () => {
      const pageData = await pdfDocument?.getPage(page);
      const viewPort = pageData?.getViewport({ scale: 1 });

      if (viewPort) {
        setPdfSize({ width: viewPort.width, height: viewPort.height });
      }
    };

    updatePdfSize();
  }, [pdfDocument, page]);

  // Methods
  const handleMouseDown = () => {
    if (!stageRef.current) return;

    const pointerPosition = stageRef.current.getRelativePointerPosition();

    if (!pointerPosition) return;

    setEndX(null);
    setEndY(null);
    setStartX(pointerPosition.x);
    setStartY(pointerPosition.y);
    setIsDrawing(true);
  };

  const handleMouseUp = () => {
    if (isDrawing) {
      setIsDrawing(false);
    }
  };

  const handleMouseMove = () => {
    if (!stageRef.current || !isDrawing) return;

    const pointerPosition = stageRef.current.getRelativePointerPosition();

    if (!pointerPosition) return;

    setEndX(pointerPosition.x);
    setEndY(pointerPosition.y);
  };

  return (
    <div>
      <div ref={canvasContainerRef} className="size-full relative">
        <canvas ref={canvasRef} className="size-full" />

        <div className="absolute inset-0 z-50 w-full h-full">
          {pdfSize && (
            <Stage
              width={canvasSize.width}
              height={canvasSize.height}
              onMouseDown={handleMouseDown}
              onMouseUp={handleMouseUp}
              onMouseMove={handleMouseMove}
              scale={scale}
              y={canvasSize.height}
              ref={stageRef}
            >
              <Layer>
                {!!rectangleDrawn && (
                  <Rect {...rectangleDrawn} stroke="#4f46e5" />
                )}
              </Layer>
            </Stage>
          )}
        </div>
      </div>

      {Boolean(pdfDocument && pdfDocument.numPages) && (
        <nav>
          <ul className="pager">
            <li className="previous">
              <button disabled={page === 1} onClick={() => setPage(page - 1)}>
                Previous
              </button>
            </li>
            <li className="next">
              <button
                disabled={page === pdfDocument?.numPages}
                onClick={() => setPage(page + 1)}
              >
                Next
              </button>
            </li>
          </ul>
        </nav>
      )}
    </div>
  );
};

export default PdfViewer;
