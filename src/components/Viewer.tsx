import DocumentViewer, { DocViewerRenderers } from "react-doc-viewer";

const Viewer = () => {
  return (
    <DocumentViewer
      pluginRenderers={DocViewerRenderers}
      style={{ height: "500px" }}
      documents={[
        {
          uri: "https://nav.gov.hu/pfile/file?path=/ado/szja/adoeloleg-nyilatkozatok/2022_ANY_EHK_20211228.docx1",
          fileType: "docx",
        },
      ]}
    />
  );
};

export default Viewer;
