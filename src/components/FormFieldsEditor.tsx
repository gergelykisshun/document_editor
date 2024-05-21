import { FC } from "react";
import { IFormFieldChangeProps, IFormFieldDTO } from "../interfaces/document";
import SectionEditorForm from "./SectionEditorForm";

type Props = {
  formFields: IFormFieldDTO[];
  onFormFieldChange: (props: IFormFieldChangeProps) => void;
};

const FormFieldsEditor: FC<Props> = ({ formFields, onFormFieldChange }) => {
  return (
    <div>
      {formFields.map((field, fieldIdx) => (
        <div key={field.fieldType.id}>
          <h2>{field.fieldType.name}</h2>
          {field.sections.map((section, sectionIdx) => (
            <SectionEditorForm
              key={sectionIdx}
              section={section}
              i={sectionIdx}
              onSectionChange={(sectionIdx, sectionStyle) =>
                onFormFieldChange({ sectionIdx, sectionStyle, fieldIdx })
              }
            />
          ))}
        </div>
      ))}
    </div>
  );
};

export default FormFieldsEditor;
