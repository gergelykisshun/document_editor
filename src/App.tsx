import { useEffect, useState } from "react";
import PdfViewer from "./components/PdfViewer";
import "./style/index.css";
import { DrawMode } from "./enums/drawingCanvas";
import { MOCK_DOCUMENT_SINGLE_PAGE } from "./constant/document";
import SectionSelectorModal from "./components/SectionSelectorModal";
import FieldTypesSelector from "./components/FieldTypesSelector";
import {
  IDocumentType,
  IFieldType,
  IFormFieldDTO,
  IInputSection,
  ISectionStyleProps,
} from "./interfaces/document";
import FormFieldsEditor from "./components/FormFieldsEditor";
import { DEFAULT_SECTION_STYLE } from "./constant/sections";
import TwButton from "./components/TwButton";
import { drawFieldsOnPdf } from "./utils/drawFieldsOnPdf";

function App() {
  const [mode, setMode] = useState<DrawMode>(DrawMode.IDLE);
  const [documentType] = useState<IDocumentType>(MOCK_DOCUMENT_SINGLE_PAGE);

  // This will be fetched and stored in the state var
  const originalFileUrl = "/test.pdf";
  const [fileUrl, setFileUrl] = useState<string>(originalFileUrl);

  const [sections, setSections] = useState<ISectionStyleProps[]>([]);
  const [fieldTypeForSectionSelection, setFieldTypeForSectionSelection] =
    useState<IFieldType | null>(null);
  const [sectionSelectorOpen, setSectionSelectorOpen] =
    useState<boolean>(false);

  const [formFields, setFormFields] = useState<IFormFieldDTO[]>([]);

  // Methods
  const startDrawingSections = (sections: ISectionStyleProps[]) => {
    setSections(sections);
    setMode(DrawMode.RECT);
  };

  const selectFieldTypeForDraw = (fieldType: IFieldType) => {
    if (fieldType.type === "bool" || fieldType.type === "underline") {
      startDrawingSections([DEFAULT_SECTION_STYLE]);
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

  const handleSubmit = () => {
    // TODO think this part through
    const cleanFields: IDocumentType["fields"] = formFields.map(
      (field, idx) => {
        return {
          ...field,
          id: idx,
          sections: field.sections.map((section) => {
            return section;
          }),
        };
      }
    );

    const doc: IDocumentType = { ...documentType, fields: cleanFields };
    console.log(JSON.stringify(doc));
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
    <div className="px-4">
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

          {formFields.length > 0 && (
            <TwButton onClick={handleSubmit}>Submit</TwButton>
          )}
        </div>

        <div className="col-span-5">
          <PdfViewer
            fileUrl={fileUrl}
            mode={mode}
            saveDrawing={async (rect) => {
              if (sections.length === 0) return;

              const { style, characterEnd, characterStart } = sections[0];

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
                  characterStart,
                  characterEnd,
                  style: {
                    ...style,
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
    </div>
  );
}

export default App;
