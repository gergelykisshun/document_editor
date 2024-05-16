import { useEffect, useState } from "react";
import PdfViewer from "./components/PdfViewer";
import "./style/index.css";
import { DrawMode } from "./enums/drawingCanvas";
import { MOCK_DOCUMENT } from "./constant/document";
import SectionSelectorModal from "./components/SectionSelectorModal";
import FieldTypesSelector from "./components/FieldTypesSelector";
import {
  IDocumentType,
  IFieldType,
  ISectionLength,
} from "./interfaces/document";
import { IRectangleDrawn } from "./interfaces/drawingCanvas";

function App() {
  const [mode, setMode] = useState<DrawMode>(DrawMode.IDLE);
  const [documentType, setDocumentType] =
    useState<IDocumentType>(MOCK_DOCUMENT);

  const [sections, setSections] = useState<ISectionLength[]>([]);
  const [typeForSectionSelection, setTypeForSectionSelection] = useState<
    IFieldType["type"] | null
  >(null);

  const [rectanglesDrawn, setRectanglesDrawn] = useState<IRectangleDrawn[]>([]);

  // Methods
  const startDrawingSections = (sections: ISectionLength[]) => {
    setSections(sections);
    setMode(DrawMode.RECT);
  };

  const selectFieldTypeForDraw = (fieldType: IFieldType) => {
    if (fieldType.type === "bool" || fieldType.type === "underline") {
      startDrawingSections([{ length: 1 }]);
    } else {
      setTypeForSectionSelection(fieldType.type);
    }
  };

  useEffect(() => {
    if (sections.length === 0) {
      setMode(DrawMode.IDLE);
    }
  }, [sections]);

  return (
    <>
      <h1 className="text-indigo-600">{documentType.name}</h1>

      {/*  <h2>This is the editor</h2>
      <PdfEditor /> */}

      <FieldTypesSelector
        documentType={documentType}
        onSelect={(fieldType) => selectFieldTypeForDraw(fieldType)}
      />

      {typeForSectionSelection && (
        <SectionSelectorModal
          isOpen={!!typeForSectionSelection}
          handleClose={() => setTypeForSectionSelection(null)}
          onSave={(sections) => {
            startDrawingSections(sections);
          }}
        />
      )}

      <PdfViewer
        mode={mode}
        saveDrawing={(rect) => {
          setRectanglesDrawn((prev) => [...prev, rect]);
          setSections((prev) => {
            const newSections = [...prev];
            newSections.shift();
            return newSections;
          });
        }}
        rectanglesDrawn={rectanglesDrawn}
      />
    </>
  );
}

export default App;
