import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { IFormFieldDTO } from "../interfaces/document";

export const drawFieldsOnPdf = async (
  formFields: IFormFieldDTO[],
  fileUrl: string
): Promise<string> => {
  const url = fileUrl;
  const existingPdfBytes = await fetch(url).then((res) => res.arrayBuffer());

  const pdfDoc = await PDFDocument.load(existingPdfBytes);

  await Promise.all(
    formFields.map(async (field) => {
      // Using map to support async operation
      field.sections.map(async (section) => {
        // Load font
        const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

        const page = pdfDoc.getPage(section.pageNumber - 1);

        let curX = section.boundingBox.xPosition + section.boundingBox.paddingX;
        for (const char of field.fieldType.placeholder) {
          page.drawText(char, {
            x: curX,
            y:
              section.boundingBox.yPosition +
              section.boundingBox.height +
              section.boundingBox.paddingY,
            font: helveticaFont,
            size: section.style.fontSize,
            color: rgb(0, 0, 0),
          });
          curX +=
            helveticaFont.widthOfTextAtSize(char, section.style.fontSize) +
            section.style.characterSpacing;
        }
      });
    })
  );

  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([pdfBytes], { type: "application/pdf" });

  return URL.createObjectURL(blob);
};
