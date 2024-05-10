import PdfEditor from "./components/PdfEditor";
import PdfViewer from "./components/PdfViewer";
import "./style/index.css";

function App() {
  return (
    <>
      <h1 className="text-indigo-600">Document viewer test</h1>

      {/*     <DocViewer /> */}
      <h2>This is the editor</h2>
      <PdfEditor />

      <h2>This is the viewer</h2>
      <PdfViewer />
    </>
  );
}

export default App;
