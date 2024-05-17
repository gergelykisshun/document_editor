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
  IFormFieldDTO,
  IInputSection,
  ISectionProps,
} from "./interfaces/document";
import FormFieldsEditor from "./components/FormFieldsEditor";
import { PDFDocument, StandardFonts } from "pdf-lib";

function App() {
  const [mode, setMode] = useState<DrawMode>(DrawMode.IDLE);
  const [documentType] = useState<IDocumentType>(MOCK_DOCUMENT);

  // This will be fetched and stored in the state var
  const originalFileUrl = "/multiPage.pdf";
  const [fileUrl] = useState<string>(originalFileUrl);

  const [sections, setSections] = useState<ISectionProps[]>([]);
  const [fieldTypeForSectionSelection, setFieldTypeForSectionSelection] =
    useState<IFieldType | null>(null);
  const [sectionSelectorOpen, setSectionSelectorOpen] =
    useState<boolean>(false);

  const [formFields, setFormFields] = useState<IFormFieldDTO[]>([]);

  // Methods
  const startDrawingSections = (sections: ISectionProps[]) => {
    setSections(sections);
    setMode(DrawMode.RECT);
  };

  const selectFieldTypeForDraw = (fieldType: IFieldType) => {
    if (fieldType.type === "bool" || fieldType.type === "underline") {
      startDrawingSections([{ start: 0, end: 1 }]);
    } else {
      // Need to select sections before proceeding
      setSectionSelectorOpen(true);
    }
    setFieldTypeForSectionSelection(fieldType);
  };

  const handleRectSelect = (
    formField: IFormFieldDTO,
    section: IInputSection
  ) => {
    console.log(formField);
    console.log(section);
  };

  useEffect(() => {
    if (sections.length === 0) {
      setMode(DrawMode.IDLE);
    }
  }, [sections]);

  return (
    <>
      <h1 className="text-indigo-600">{documentType.name}</h1>
      <div className="grid grid-cols-6 divide-x">
        <div>
          <FieldTypesSelector
            documentType={documentType}
            onSelect={(fieldType) => selectFieldTypeForDraw(fieldType)}
          />

          <FormFieldsEditor
            formFields={formFields}
            setFormFields={setFormFields}
          />
        </div>

        <div className="col-span-5">
          <PdfViewer
            fileUrl={fileUrl}
            mode={mode}
            saveDrawing={async (rect) => {
              // This is going to be from section 0
              // TODO test here
              const fontStyle = StandardFonts.Helvetica;
              const fontSize = 35;
              const letterSpacing = 1;
              const tempDoc = await PDFDocument.create();
              const font = await tempDoc.embedFont(fontStyle);
              const fontHeight = font.heightAtSize(fontSize);

              setFormFields((prev) => {
                if (!fieldTypeForSectionSelection) return prev;

                const formFieldFound = prev.find(
                  (field) =>
                    field.fieldType.id === fieldTypeForSectionSelection?.id
                );

                const newSection: IInputSection = {
                  pageNumber: rect.page,
                  xCanvasSize: rect.pdfSize.width,
                  yCanvasSize: rect.pdfSize.height,
                  boundingBox: rect.boundingBox,
                  dateType: fieldTypeForSectionSelection.type,
                  characterStart: sections[0].start,
                  characterEnd: sections[0].end,
                  style: {
                    fontSize: fontSize,
                    fontType: fontStyle,
                    characterSpacing: letterSpacing,
                    fontHeight,
                  },
                };

                if (!formFieldFound) {
                  return [
                    ...prev,
                    {
                      documentType: documentType.id,
                      fieldType: fieldTypeForSectionSelection,
                      sections: [newSection],
                    },
                  ];
                } else {
                  return prev.map((field) => {
                    if (field.fieldType.id === formFieldFound.fieldType.id) {
                      return {
                        ...field,
                        sections: [...field.sections, newSection],
                      };
                    } else {
                      return field;
                    }
                  });
                }
              });

              setSections((prev) => {
                const newSections = [...prev];
                newSections.shift();
                return newSections;
              });
            }}
            formFields={formFields}
            onRectSelected={handleRectSelect}
          />
        </div>
      </div>

      {fieldTypeForSectionSelection && (
        <SectionSelectorModal
          isOpen={sectionSelectorOpen}
          handleClose={() => setSectionSelectorOpen(false)}
          onSave={(sections) => {
            startDrawingSections(sections);
          }}
        />
      )}
    </>
  );
}

export default App;
