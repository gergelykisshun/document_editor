import { PDFDocument, StandardFonts } from "pdf-lib";

type Props = {
  fontType: StandardFonts;
  fontSize: number;
};
export const calcFontHeight = async ({
  fontSize,
  fontType,
}: Props): Promise<number> => {
  const tempDoc = await PDFDocument.create();
  const font = await tempDoc.embedFont(fontType);
  return font.heightAtSize(fontSize);
};
