import { FC } from "react";
import { IDocumentType, IFieldType } from "../interfaces/document";

type Props = {
  documentType: IDocumentType;
  onSelect: (fieldType: IFieldType) => void;
};

const FieldTypesSelector: FC<Props> = ({ documentType, onSelect }) => {
  return (
    <div className="flex flex-wrap gap-2">
      {documentType.fieldTypes.map((fieldType) => {
        return (
          <button
            key={fieldType.id}
            onClick={() => onSelect(fieldType)}
            className="border px-2 py-1 bg-indigo-600 text-white"
          >
            Add {fieldType.type} for {fieldType.name}
          </button>
        );
      })}
    </div>
  );
};

export default FieldTypesSelector;
