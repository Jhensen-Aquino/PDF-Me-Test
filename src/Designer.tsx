import { useEffect, useRef } from "react";
import { Template, checkTemplate } from "@pdfme/common";
import { Designer } from "@pdfme/ui";
import {
  getFontsData,
  getTemplate,
  readFile,
  cloneDeep,
  getPlugins,
  handleLoadTemplate,
  generatePDF,
  downloadJsonFile,
} from "./helper";

const headerHeight = 65;

function App() {
  const designerRef = useRef<HTMLDivElement | null>(null);
  const designer = useRef<Designer | null>(null);

  useEffect(() => {
    let template: Template = getTemplate();
    try {
      const templateString = localStorage.getItem("template");
      const templateJson = templateString
        ? JSON.parse(templateString)
        : getTemplate();
      checkTemplate(templateJson);
      template = templateJson as Template;
    } catch {
      localStorage.removeItem("template");
    }

    getFontsData().then((font) => {
      if (designerRef.current) {
        designer.current = new Designer({
          domContainer: designerRef.current,
          template,
          options: { font },
          plugins: getPlugins(),
        });
        designer.current.onSaveTemplate(onSaveTemplate);
      }
    });
    return () => {
      if (designer.current) {
        designer.current.destroy();
      }
    };
  }, [designerRef]);

  const onChangeBasePDF = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target && e.target.files) {
      readFile(e.target.files[0], "dataURL").then(async (basePdf) => {
        if (designer.current) {
          designer.current.updateTemplate(
            Object.assign(cloneDeep(designer.current.getTemplate()), {
              basePdf,
            })
          );
        }
      });
    }
  };

  const onDownloadTemplate = () => {
    if (designer.current) {
      downloadJsonFile(designer.current.getTemplate(), "template");
      console.log(designer.current.getTemplate());
    }
  };

  const onSaveTemplate = (template?: Template) => {
    if (designer.current) {
      localStorage.setItem(
        "template",
        JSON.stringify(template || designer.current.getTemplate())
      );
      alert("Saved!");
    }
  };

  const onResetTemplate = () => {
    if (designer.current) {
      designer.current.updateTemplate(getTemplate());
      localStorage.removeItem("template");
    }
  };

  return (
    <div>
{/*       <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginRight: 120, }}> */}
      <header style={{ display: "none", alignItems: "center", justifyContent: "space-between", marginRight: 120, }}>
        <strong>Designer</strong>
        <span style={{ margin: "0 1rem" }}>:</span>
        <label style={{ width: 180 }}>
          Change BasePDF
          <input id="ChangePDF" type="file" accept="application/pdf" onChange={onChangeBasePDF} />
        </label>
        <span style={{ margin: "0 1rem" }}>/</span>
        <label style={{ width: 180 }}>
          Load Template
          <input id="LoadTemplate" type="text" placeholder="Enter JSON data here" onChange={(e) => handleLoadTemplate(e.target.value, designer.current)} />
        </label>
        <span style={{ margin: "0 1rem" }}>/</span>
        <button id="DownloadTemplate" onClick={onDownloadTemplate}>Download Template</button>
        <span style={{ margin: "0 1rem" }}>/</span>
        <button id="SaveTemplate" onClick={() => onSaveTemplate()}>Save Template</button>
        <span style={{ margin: "0 1rem" }}>/</span>
        <button id="ResetTemplate" onClick={onResetTemplate}>Reset Template</button>
        <span style={{ margin: "0 1rem" }}>/</span>
        <button id="GeneratePDF" onClick={() => generatePDF(designer.current)}>Generate PDF</button>
      </header>
      <div ref={designerRef} style={{ width: '100%', height: `calc(100vh - ${headerHeight}px)` }} />
    </div>
  );
}

export default App;
