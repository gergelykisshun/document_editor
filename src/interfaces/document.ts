export interface IDocumentType {
  id: number;
  name: string; // pl. Első házasok
  fieldTypes: IFieldType[]; // Milyen field típusok kellenek rá
  fields: IFormField[]; // Field típusok példányai, konkrét inputfieldek koordinátákkal
}

export interface IFieldType {
  id: number;
  name: string;
  type: "text" | "number" | "bool" | "date" | "underline";
  placeholder: string;
}

export interface IFormFieldDTO {
  documentType: number;
  fieldType: IFieldType;
  sections: IInputSection[];
}
export interface IFormField extends IFormFieldDTO {
  id: number;
}

export interface IInputSection {
  pageNumber: number;
  xPosition: number; // X
  yPosition: number; // Y pozíció
  xCanvasSize: number; // Mekkora canvasen vettem fel
  yCanvasSize: number;
  dateType?: string; // Dátumnl (év | hónap | nap)
  characterStart?: number; // Több input sectionnél melyik rész kerül bele pl: adószám 2 input boxába 8-9
  characterEnd?: number;
  maxLength?: number;
  width: number;
  height: number;
  style: {
    fontSize: number;
    fontType: string;
    characterSpacing: number;
  };
}

export interface ISectionLength {
  length: number;
}
