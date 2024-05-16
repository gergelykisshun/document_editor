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

        // TODO letter spacing
        page.drawText(
          field.fieldType.placeholder.slice(
            section.characterStart,
            section.characterEnd
          ),
          {
            // +3 is padding
            x: section.xPosition + 3,
            y: section.yPosition + section.height + 3,
            color: rgb(0, 0, 0),
            font: helveticaFont,
            size: section.style.fontSize,
          }
        );
      });
    })
  );

  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([pdfBytes], { type: "application/pdf" });

  return URL.createObjectURL(blob);
};
