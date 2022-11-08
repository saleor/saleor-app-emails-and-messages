import { Grid } from "@material-ui/core";
import Editor from "@monaco-editor/react";
import { Button } from "@saleor/macaw-ui";
import { NextPage } from "next";
import { useEffect, useRef, useState } from "react";
import { Navigation } from "../components/navigation";
import { MJML_DEFAULT_TEMPLATE } from "../consts";

const PreviewPage: NextPage = () => {
  const [, setMounted] = useState(false);
  const [parsedHtml, setParsedHtml] = useState("");

  // Get all enums of events ??

  // Get saved template from api
  const [emailTemplate, setEmailTemplate] = useState(MJML_DEFAULT_TEMPLATE);
  const editorRef = useRef(null);

  // @ts-ignore
  function handleEditorDidMount(editor, monaco) {
    editorRef.current = editor;
  }

  const handleSave = async () => {
    const xdd = await fetch("/api/parseMjml", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ mjml: emailTemplate }),
    });

    const response = await xdd.json();

    // @ts-ignore
    setParsedHtml(response.rawHtml);
  };

  useEffect(() => {
    handleSave();
  }, [emailTemplate]);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <>
      <Navigation />
      <div>
        <h1>Emailing app uwu</h1>

        <Grid spacing={2} container>
          <Grid item xs={6}>
            <Editor
              height="60vh"
              defaultLanguage="xml"
              defaultValue={emailTemplate}
              onMount={handleEditorDidMount}
              onChange={(value) => setEmailTemplate(value!)}
            />
          </Grid>

          <Grid item xs={6}>
            <div>Preview</div>
            <div dangerouslySetInnerHTML={{ __html: parsedHtml }} />
            <Button onClick={handleSave}>Save</Button>
          </Grid>
        </Grid>
      </div>
    </>
  );
};

export default PreviewPage;
