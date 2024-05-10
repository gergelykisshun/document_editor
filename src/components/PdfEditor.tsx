import { degrees, PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { useState } from "react";

const PdfEditor = () => {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  async function modifyPdf() {
    const url = "https://pdf-lib.js.org/assets/with_update_sections.pdf";
    const existingPdfBytes = await fetch(url).then((res) => res.arrayBuffer());

    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

    const pages = pdfDoc.getPages();
    const firstPage = pages[0];
    const { height } = firstPage.getSize();
    firstPage.drawText("This text was added with JavaScript!", {
      x: 5,
      y: height / 2 + 300,
      size: 50,
      font: helveticaFont,
      color: rgb(0.95, 0.1, 0.1),
      rotate: degrees(-45),
    });

    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: "application/pdf" });

    setPdfUrl(URL.createObjectURL(blob));
  }

  return (
    <div>
      <h1>PdfEditor</h1>

      <button onClick={modifyPdf}>Modify pdf</button>

      {pdfUrl && <iframe src={pdfUrl} />}
    </div>
  );
};

export default PdfEditor;
