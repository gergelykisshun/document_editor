import { FC } from "react";
import { IFormFieldDTO, ISectionStyleProps } from "../interfaces/document";
import SectionEditorForm from "./SectionEditorForm";

type Props = {
  formFields: IFormFieldDTO[];
  setFormFields: React.Dispatch<React.SetStateAction<IFormFieldDTO[]>>;
};

const FormFieldsEditor: FC<Props> = ({ formFields, setFormFields }) => {
  const handleSectionChange = (
    sectionIdx: number,
    newSectionStyle: ISectionStyleProps,
    fieldIdx: number
  ) => {
    setFormFields((fields) =>
      fields.map((prevF, prevFIdx) => {
        if (fieldIdx === prevFIdx) {
          return {
            ...prevF,
            sections: prevF.sections.map((prevS, prevSIdx) => {
              if (prevSIdx === sectionIdx) {
                return { ...prevS, ...newSectionStyle };
              } else {
                return prevS;
              }
            }),
          };
        } else {
          return prevF;
        }
      })
    );
  };

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
              onSectionChange={(i, section) =>
                handleSectionChange(i, section, fieldIdx)
              }
            />
          ))}
        </div>
      ))}
    </div>
  );
};

export default FormFieldsEditor;
