import { useState, useEffect, useRef } from "react";
import * as pdfjs from "pdfjs-dist";
import type { PDFDocumentProxy, PDFPageProxy } from "pdfjs-dist";
import type { DocumentInitParameters } from "pdfjs-dist/types/src/display/api";

type PDFRenderTask = ReturnType<PDFPageProxy["render"]>;

type HookProps = {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  file: string;
  onDocumentLoadSuccess?: (document: PDFDocumentProxy) => void;
  onDocumentLoadFail?: () => void;
  onPageLoadSuccess?: (page: PDFPageProxy) => void;
  onPageLoadFail?: () => void;
  onPageRenderSuccess?: (page: PDFPageProxy) => void;
  onPageRenderFail?: () => void;
  scale?: number;
  rotate?: number;
  page?: number;
  cMapUrl?: string;
  cMapPacked?: boolean;
  workerSrc?: string;
  withCredentials?: boolean;
};

type HookReturnValues = {
  pdfDocument: PDFDocumentProxy | undefined;
  pdfPage: PDFPageProxy | undefined;
};

export const usePdf = ({
  canvasRef,
  file,
  onDocumentLoadSuccess,
  onDocumentLoadFail,
  onPageLoadSuccess,
  onPageLoadFail,
  onPageRenderSuccess,
  onPageRenderFail,
  scale = 1,
  rotate = 0,
  page = 1,
  cMapUrl,
  cMapPacked,
  workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.mjs`,
  withCredentials = false,
}: HookProps): HookReturnValues => {
  const [pdfDocument, setPdfDocument] = useState<PDFDocumentProxy>();
  const [pdfPage, setPdfPage] = useState<PDFPageProxy>();
  const renderTask = useRef<PDFRenderTask | null>(null);
  const lastPageRequestedRenderRef = useRef<PDFPageProxy | null>(null);
  const onDocumentLoadSuccessRef = useRef<
    typeof onDocumentLoadSuccess | undefined
  >(onDocumentLoadSuccess);
  const onDocumentLoadFailRef = useRef<typeof onDocumentLoadFail | undefined>(
    onDocumentLoadFail
  );
  const onPageLoadSuccessRef = useRef<typeof onPageLoadSuccess | undefined>(
    onPageLoadSuccess
  );
  const onPageLoadFailRef = useRef<typeof onPageLoadFail | undefined>(
    onPageLoadFail
  );
  const onPageRenderSuccessRef = useRef<typeof onPageRenderSuccess | undefined>(
    onPageRenderSuccess
  );
  const onPageRenderFailRef = useRef<typeof onPageRenderFail | undefined>(
    onPageRenderFail
  );

  // Assign callbacks to refs to avoid redrawing
  useEffect(() => {
    onDocumentLoadSuccessRef.current = onDocumentLoadSuccess;
  }, [onDocumentLoadSuccess]);

  useEffect(() => {
    onDocumentLoadFailRef.current = onDocumentLoadFail;
  }, [onDocumentLoadFail]);

  useEffect(() => {
    onPageLoadSuccessRef.current = onPageLoadSuccess;
  }, [onPageLoadSuccess]);

  useEffect(() => {
    onPageLoadFailRef.current = onPageLoadFail;
  }, [onPageLoadFail]);

  useEffect(() => {
    onPageRenderSuccessRef.current = onPageRenderSuccess;
  }, [onPageRenderSuccess]);

  useEffect(() => {
    onPageRenderFailRef.current = onPageRenderFail;
  }, [onPageRenderFail]);

  useEffect(() => {
    pdfjs.GlobalWorkerOptions.workerSrc = workerSrc;
  }, [workerSrc]);

  useEffect(() => {
    const config: DocumentInitParameters = { url: file, withCredentials };
    if (cMapUrl) {
      config.cMapUrl = cMapUrl;
      config.cMapPacked = cMapPacked;
    }

    pdfjs.getDocument(config).promise.then(
      (loadedPdfDocument) => {
        setPdfDocument(loadedPdfDocument);

        if (onDocumentLoadSuccessRef.current) {
          onDocumentLoadSuccessRef.current(loadedPdfDocument);
        }
      },
      () => {
        if (onDocumentLoadFailRef.current) {
          onDocumentLoadFailRef.current();
        }
      }
    );
  }, [file, withCredentials, cMapUrl, cMapPacked]);

  useEffect(() => {
    // Draw a page of the PDF
    const drawPDF = (page: PDFPageProxy) => {
      // Calculate rotation
      const rotation = rotate === 0 ? page.rotate : page.rotate + rotate;
      const viewport = page.getViewport({ scale, rotation });

      const canvasEl = canvasRef!.current;
      if (!canvasEl) {
        return;
      }

      const secondaryCanvas = document.createElement("canvas");
      const secondaryCanvasCtx = secondaryCanvas.getContext("2d");
      if (!secondaryCanvasCtx) {
        return;
      }

      // Set off-screen canvas dimensions and scale
      secondaryCanvas.height = viewport.height * window.devicePixelRatio;
      secondaryCanvas.width = viewport.width * window.devicePixelRatio;
      secondaryCanvasCtx.scale(
        window.devicePixelRatio,
        window.devicePixelRatio
      );

      // Cancel previous render task if not done
      if (renderTask.current) {
        lastPageRequestedRenderRef.current = page;
        renderTask.current.cancel();
        return;
      }

      renderTask.current = page.render({
        canvasContext: secondaryCanvasCtx,
        viewport,
      });

      return renderTask.current.promise.then(
        () => {
          renderTask.current = null;

          // Transfer off-screen canvas content to main canvas
          const mainCanvasContext = canvasEl.getContext("2d");
          if (mainCanvasContext) {
            canvasEl.height = viewport.height * window.devicePixelRatio;
            canvasEl.width = viewport.width * window.devicePixelRatio;
            mainCanvasContext.clearRect(0, 0, canvasEl.width, canvasEl.height);
            mainCanvasContext.drawImage(secondaryCanvas, 0, 0);
          }

          if (onPageRenderSuccessRef.current) {
            onPageRenderSuccessRef.current(page);
          }
        },
        (reason: Error) => {
          renderTask.current = null;

          if (reason && reason.name === "RenderingCancelledException") {
            const lastPageRequestedRender =
              lastPageRequestedRenderRef.current ?? page;
            lastPageRequestedRenderRef.current = null;
            drawPDF(lastPageRequestedRender);
          } else if (onPageRenderFailRef.current) {
            onPageRenderFailRef.current();
          }
        }
      );
    };

    if (pdfDocument) {
      pdfDocument.getPage(page).then(
        (loadedPdfPage) => {
          setPdfPage(loadedPdfPage);

          if (onPageLoadSuccessRef.current) {
            onPageLoadSuccessRef.current(loadedPdfPage);
          }

          drawPDF(loadedPdfPage);
        },
        () => {
          if (onPageLoadFailRef.current) {
            onPageLoadFailRef.current();
          }
        }
      );
    }
  }, [canvasRef, page, pdfDocument, rotate, scale]);

  return { pdfDocument, pdfPage };
};
