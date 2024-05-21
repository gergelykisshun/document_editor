import { StandardFonts } from "pdf-lib";

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

export interface IInputSection extends ISectionStyleProps {
  pageNumber: number;
  boundingBox: IInputSectionBBox;
  xCanvasSize: number; // Mekkora canvasen vettem fel
  yCanvasSize: number;
  dateType?: string; // Dátumnl (év | hónap | nap)
}

export interface IInputSectionBBox {
  xPosition: number; // StartX
  yPosition: number; // StartY
  width: number;
  height: number;
  paddingX: number;
  paddingY: number;
}

export interface ISectionStyleProps {
  characterStart?: number; // Több input sectionnél melyik rész kerül bele pl: adószám 2 input boxába 8-9
  characterEnd?: number;
  maxLength?: number;
  style: {
    fontSize: number;
    fontType: StandardFonts;
    characterSpacing: number;
  };
}
