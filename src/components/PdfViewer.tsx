import { useState, useRef, FC, useEffect, useMemo, useCallback } from "react";
import { Layer, Rect, Stage } from "react-konva";
import { Stage as StageType } from "konva/lib/Stage";
import { DEFAULT_CONTAINER_SIZE } from "../constant/drawingCanvas";
import { ICanvasSize, IRectangleDrawn } from "../interfaces/drawingCanvas";
import { DrawMode } from "../enums/drawingCanvas";
import TwButton from "./TwButton";
import { IFormFieldDTO, IInputSection } from "../interfaces/document";
import { usePdf } from "../hooks/usePdf";

type Props = {
  fileUrl: string;
  mode: DrawMode;
  currentPage: number;
  onPageChange: (page: number) => void;
  saveDrawing: (rect: IRectangleDrawn) => void;
  formFields: IFormFieldDTO[];
  onRectSelected: (formField: IFormFieldDTO, section: IInputSection) => void;
};

const PdfViewer: FC<Props> = ({
  currentPage,
  mode,
  formFields,
  fileUrl,
  saveDrawing,
  onRectSelected,
  onPageChange,
}) => {
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
    if (mode !== DrawMode.RECT || !startX || !startY || !endX || !endY)
      return null;

    return {
      x: startX,
      y: startY,
      width: endX - startX,
      height: endY - startY,
    };
  }, [startX, startY, endX, endY, mode]);

  const scale = useMemo(
    () => ({
      x: canvasSize.width / (pdfSize?.width || 1),
      y: (-1 * canvasSize.height) / (pdfSize?.height || 1),
    }),
    [canvasSize, pdfSize]
  );

  // Local pdf
  const { pdfDocument } = usePdf({
    file: fileUrl,
    page: currentPage,
    canvasRef,
    scale: 2,
    onPageRenderSuccess: () => updateCanvasSize(),
  });

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
  const resetDrawing = () => {
    setStartX(null);
    setStartY(null);
    setEndX(null);
    setEndY(null);
    setIsDrawing(false);
  };

  const saveRectangle = () => {
    if (!pdfSize || !rectangleDrawn) return;
    saveDrawing({
      boundingBox: {
        xPosition: rectangleDrawn.x,
        yPosition: rectangleDrawn.y,
        height: rectangleDrawn.height,
        width: rectangleDrawn.width,
        paddingX: 3,
        paddingY: 3,
      },
      page: currentPage,
      pdfSize,
    });
    resetDrawing();
  };

  const updateCanvasSize = useCallback(() => {
    if (!pdfDocument) return;

    if (canvasContainerRef.current) {
      const containerRect = canvasContainerRef.current.getBoundingClientRect();

      setCanvasSize({
        width: containerRect.width,
        height: containerRect.height,
      });
    }
  }, [pdfDocument]);

  useEffect(() => {
    if (mode === DrawMode.IDLE) {
      resetDrawing();
    }
  }, [mode]);

  useEffect(() => {
    // Initial size update
    updateCanvasSize();

    // Listen for window resize events
    window.addEventListener("resize", updateCanvasSize);

    // Clean up event listener
    return () => {
      window.removeEventListener("resize", updateCanvasSize);
    };
  }, [updateCanvasSize]);

  useEffect(() => {
    const updatePdfSize = async () => {
      const pageData = await pdfDocument?.getPage(currentPage);
      const viewPort = pageData?.getViewport({ scale: 1 });

      if (viewPort) {
        setPdfSize({ width: viewPort.width, height: viewPort.height });
      }
    };

    updatePdfSize();
  }, [pdfDocument, currentPage]);

  return (
    <div>
      {rectangleDrawn && (
        <TwButton onClick={saveRectangle}>Save rectangle</TwButton>
      )}
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
                {formFields.length > 0 &&
                  formFields.map((formField) =>
                    formField.sections.map((section, idx) => {
                      if (section.pageNumber === currentPage) {
                        return (
                          <Rect
                            key={idx}
                            x={section.boundingBox.xPosition}
                            y={section.boundingBox.yPosition}
                            width={section.boundingBox.width}
                            height={section.boundingBox.height}
                            stroke="#ff0000"
                            onClick={() => onRectSelected(formField, section)}
                          />
                        );
                      } else {
                        return null;
                      }
                    })
                  )}

                {!!rectangleDrawn && (
                  <Rect {...rectangleDrawn} stroke="#4f46e5" />
                )}
              </Layer>
            </Stage>
          )}
        </div>
      </div>

      {Boolean(pdfDocument && pdfDocument.numPages) && (
        <div className="pager flex gap-2">
          <TwButton
            disabled={currentPage === 1}
            onClick={() => onPageChange(currentPage - 1)}
          >
            Previous
          </TwButton>

          <TwButton
            disabled={currentPage === pdfDocument?.numPages}
            onClick={() => onPageChange(currentPage + 1)}
          >
            Next
          </TwButton>
        </div>
      )}
    </div>
  );
};

export default PdfViewer;
