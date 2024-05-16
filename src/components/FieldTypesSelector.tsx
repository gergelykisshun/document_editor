import { FC } from "react";
import { IDocumentType, IFieldType } from "../interfaces/document";
import TwButton from "./TwButton";

type Props = {
  documentType: IDocumentType;
  onSelect: (fieldType: IFieldType) => void;
};

const FieldTypesSelector: FC<Props> = ({ documentType, onSelect }) => {
  return (
    <div className="flex flex-wrap gap-2">
      {documentType.fieldTypes.map((fieldType) => {
        return (
          <TwButton key={fieldType.id} onClick={() => onSelect(fieldType)}>
            Add {fieldType.type} for {fieldType.name}
          </TwButton>
        );
      })}
    </div>
  );
};

export default FieldTypesSelector;
