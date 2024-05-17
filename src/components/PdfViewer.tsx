import { useState, useRef, FC, useEffect, useMemo } from "react";
import { usePdf } from "@mikecousins/react-pdf";
import { Group, Layer, Rect, Stage, Text } from "react-konva";
import { Stage as StageType } from "konva/lib/Stage";
import { DEFAULT_CONTAINER_SIZE } from "../constant/drawingCanvas";
import { ICanvasSize, IRectangleDrawn } from "../interfaces/drawingCanvas";
import { DrawMode } from "../enums/drawingCanvas";
import TwButton from "./TwButton";
import { IFormFieldDTO, IInputSection } from "../interfaces/document";

type Props = {
  fileUrl: string;
  mode: DrawMode;
  saveDrawing: (rect: IRectangleDrawn) => void;
  formFields: IFormFieldDTO[];
  onRectSelected: (formField: IFormFieldDTO, section: IInputSection) => void;
};

const PdfViewer: FC<Props> = ({
  mode,
  saveDrawing,
  formFields,
  fileUrl,
  onRectSelected,
}) => {
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
    if (mode !== DrawMode.RECT || !startX || !startY || !endX || !endY)
      return null;

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
    file: fileUrl,
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
      page,
      pdfSize,
    });
    resetDrawing();
  };

  useEffect(() => {
    if (mode === DrawMode.IDLE) {
      resetDrawing();
    }
  }, [mode]);

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
                      if (section.pageNumber === page) {
                        return (
                          <Group key={idx}>
                            <Rect
                              x={section.boundingBox.xPosition}
                              y={section.boundingBox.yPosition}
                              width={section.boundingBox.width}
                              height={section.boundingBox.height}
                              stroke="#ff0000"
                              onClick={() => onRectSelected(formField, section)}
                            />
                            <Text
                              x={
                                section.boundingBox.xPosition +
                                section.boundingBox.paddingX
                              }
                              y={
                                section.boundingBox.yPosition +
                                section.boundingBox.height +
                                section.boundingBox.paddingY +
                                (section.style.fontHeight || 0)
                              }
                              fill="#000"
                              text={formField.fieldType.placeholder.slice(
                                section.characterStart,
                                section.characterEnd
                              )}
                              letterSpacing={section.style.characterSpacing}
                              fontSize={section.style.fontSize}
                              fontFamily={section.style.fontType}
                              scaleY={-1}
                            />
                          </Group>
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
          <TwButton disabled={page === 1} onClick={() => setPage(page - 1)}>
            Previous
          </TwButton>

          <TwButton
            disabled={page === pdfDocument?.numPages}
            onClick={() => setPage(page + 1)}
          >
            Next
          </TwButton>
        </div>
      )}
    </div>
  );
};

export default PdfViewer;
