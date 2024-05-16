import { FC } from "react";
import { IFormFieldDTO } from "../interfaces/document";

type Props = {
  formFields: IFormFieldDTO[];
  setFormFields: React.Dispatch<React.SetStateAction<IFormFieldDTO[]>>;
};

const FormFieldsEditor: FC<Props> = ({ formFields, setFormFields }) => {
  return (
    <div>
      {formFields.map((field, fieldIdx) => (
        <div key={field.fieldType.id}>
          <h2>{field.fieldType.name}</h2>
          {field.sections.map((section, sectionIdx) => (
            <div key={sectionIdx}>
              <input
                type="number"
                min={0}
                max={section.maxLength}
                value={section.characterStart || 0}
                onChange={(e) => {
                  const value = e.target.value;
                  setFormFields((fields) =>
                    fields.map((prevF, prevFIdx) => {
                      if (fieldIdx === prevFIdx) {
                        return {
                          ...prevF,
                          sections: prevF.sections.map((prevS, prevSIdx) => {
                            if (prevSIdx === sectionIdx) {
                              return {
                                ...prevS,
                                characterStart: Number(value),
                              };
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
                }}
              />
              <input
                type="number"
                min={0}
                max={section.maxLength}
                value={section.characterEnd || 0}
                onChange={(e) => {
                  const value = e.target.value;
                  setFormFields((fields) =>
                    fields.map((prevF, prevFIdx) => {
                      if (fieldIdx === prevFIdx) {
                        return {
                          ...prevF,
                          sections: prevF.sections.map((prevS, prevSIdx) => {
                            if (prevSIdx === sectionIdx) {
                              return {
                                ...prevS,
                                characterEnd: Number(value),
                              };
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
                }}
              />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default FormFieldsEditor;
