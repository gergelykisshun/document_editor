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
import { drawFieldsOnPdf } from "./utils/drawFieldsOnPdf";
import FormFieldsEditor from "./components/FormFieldsEditor";

function App() {
  const [mode, setMode] = useState<DrawMode>(DrawMode.IDLE);
  const [documentType] = useState<IDocumentType>(MOCK_DOCUMENT);
  const originalFileUrl = "/multiPage.pdf";
  const [fileUrl, setFileUrl] = useState<string>(originalFileUrl);

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

  useEffect(() => {
    const getPdfWithFieldsDrawn = async () => {
      const newPdfUrl = await drawFieldsOnPdf(formFields, originalFileUrl);
      setFileUrl(newPdfUrl);
    };

    if (formFields.length > 0) {
      getPdfWithFieldsDrawn();
    }
  }, [formFields]);

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
            saveDrawing={(rect) => {
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
                  xPosition: rect.x,
                  yPosition: rect.y,
                  boundingBox: rect.boundingBox,
                  dateType: fieldTypeForSectionSelection.type,
                  characterStart: sections[0].start,
                  characterEnd: sections[0].end,
                  style: {
                    fontSize: 12,
                    fontType: "helvetica",
                    characterSpacing: 2,
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
