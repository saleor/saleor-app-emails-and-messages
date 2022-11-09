import { CircularProgress, Grid } from "@material-ui/core";
import Editor from "@monaco-editor/react";
import { useAppBridge } from "@saleor/app-sdk/app-bridge";
import { SALEOR_AUTHORIZATION_BEARER_HEADER, SALEOR_DOMAIN_HEADER } from "@saleor/app-sdk/const";
import { MetadataEntry } from "@saleor/app-sdk/settings-manager";
import { ConfirmButton, ConfirmButtonTransitionState } from "@saleor/macaw-ui";
import { NextPage } from "next";
import { useEffect, useRef, useState } from "react";
import { MetadataItem } from "../../generated/graphql";
import { Navigation } from "../components/navigation";
import { MJML_DEFAULT_TEMPLATE } from "../consts";
import parseMjml from "../lib/mjmlParse";

const ORDER_CREATED_ID = "ORDER_CREATED";

type EmailMetadataValue = {
  isActive: boolean | undefined;
  mjmlTemplate: string | undefined;
};

const updatedMetadata = (metadata: MetadataEntry[], entryId: string, value: string) => {
  const updatedMetadata = metadata.map((metadataEntry) => {
    if (metadataEntry.key === entryId) {
      return {
        ...metadataEntry,
        value,
      };
    }

    return metadataEntry;
  });

  return updatedMetadata;
};

const PreviewPage: NextPage = () => {
  const [, setMounted] = useState(false);
  const [parsedHtml, setParsedHtml] = useState<string>("");
  const [metadata, setMetadata] = useState<MetadataEntry[]>([]);
  const [transitionState, setTransitionState] = useState<ConfirmButtonTransitionState>("default");
  const [isActive, setIsActive] = useState(false);
  const { appBridgeState, appBridge } = useAppBridge();

  // Get saved template from api
  const [emailTemplate, setEmailTemplate] = useState<string | undefined>();
  const editorRef = useRef(null);

  // @ts-ignore
  function handleEditorDidMount(editor, monaco) {
    editorRef.current = editor;
  }

  const getMetadata = async () => {
    const res = await fetch("/api/metadata", {
      method: "GET",
      headers: [
        ["content-type", "application/json"],
        [SALEOR_DOMAIN_HEADER, appBridgeState?.domain!],
        [SALEOR_AUTHORIZATION_BEARER_HEADER, appBridgeState?.token!],
      ],
    });

    const response = await res.json();

    console.log({ metadata });

    setMetadata(response.metadata);

    return response.metadata;
  };

  const getEventMetadata = async (entryId: string) => {
    const metadata = await getMetadata();
    return metadata.filter((metadataEntry: MetadataItem) => metadataEntry.key === entryId)[0];
  };

  const setMetadataIfExists = async (entryId: string) => {
    const savedMetadata = await getEventMetadata(entryId);

    console.log({ savedMetadata });

    const value = savedMetadata?.value;
    const { mjmlTemplate, isActive } = JSON.parse(value) as EmailMetadataValue;

    setEmailTemplate(mjmlTemplate ?? MJML_DEFAULT_TEMPLATE);
    setIsActive(isActive ?? false);
  };

  useEffect(() => {
    setMetadataIfExists(ORDER_CREATED_ID);
  }, []);

  const handleParseMjml = async () => {
    const { rawHtml } = await parseMjml(emailTemplate!);

    // @ts-ignore
    setParsedHtml(rawHtml);
  };

  // function that returns metadata with updated value

  const getUpdatedMetadata = () => {
    return updatedMetadata(metadata, ORDER_CREATED_ID, emailTemplate!);
  };

  const handleSaveToMetadata = async () => {
    setTransitionState("loading");
    fetch("/api/metadata", {
      method: "POST",
      headers: [
        ["content-type", "application/json"],
        [SALEOR_DOMAIN_HEADER, appBridgeState?.domain!],
        [SALEOR_AUTHORIZATION_BEARER_HEADER, appBridgeState?.token!],
      ],
      // @ts-ignore
      body: [
        {
          key: ORDER_CREATED_ID,
          value: { mjmlTemplate: JSON.stringify(emailTemplate), isActive } as EmailMetadataValue,
        },
      ],
    })
      .then(() => {
        appBridge?.dispatch({
          type: "notification",
          payload: {
            status: "success",
            title: "Template was saved",
            actionId: "",
          },
        });
        setTransitionState("success");
      })
      .catch(() => setTransitionState("error"));
  };

  useEffect(() => {
    handleParseMjml();
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
            {emailTemplate ? (
              <Editor
                height="60vh"
                defaultLanguage="xml"
                defaultValue={emailTemplate}
                onMount={handleEditorDidMount}
                onChange={(value) => setEmailTemplate(value ?? "")}
              />
            ) : (
              <CircularProgress />
            )}
          </Grid>

          <Grid item xs={6}>
            <div>Preview</div>
            <div dangerouslySetInnerHTML={{ __html: parsedHtml }} />
            <ConfirmButton
              onClick={handleSaveToMetadata}
              transitionState={transitionState}
              labels={{
                confirm: "Save",
                error: "Error",
              }}
            >
              Save
            </ConfirmButton>
          </Grid>
        </Grid>
      </div>
    </>
  );
};

export default PreviewPage;
