interface UserDocument {
  id: number; 
  name: string; // Első házasok
  fields: IFormField[]; // Milyen fieldek kellenek rá
}

interface IFormField {
  id: number;
  name: string; // angolul kellene a fordítás miatt pl. name, taxnumber, weddingDate
  type: "text" | "date" | "number" | "boolean";
  placeholder: string;
  sections: IInputSection[]
}


interface IInputSection {
  position: [number, number]; // X, Y pozíció
  canvasSize: number; // Mekkora canvasen vettem fel
  length?: number;
  style: {
    fontSize: number;
    fontFamily: string;
    letterSpacing: number;
    lineHeight: number;
  };
}