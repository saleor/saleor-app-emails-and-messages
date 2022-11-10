import { Card, CircularProgress, Grid, Switch, Typography } from "@material-ui/core";
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

const updatedMetadata = (
  metadata: MetadataEntry[],
  entryId: string,
  value: string,
  isActive: boolean
) => {
  const updatedMetadata = metadata.map((metadataEntry) => {
    if (metadataEntry.key === entryId) {
      return {
        ...metadataEntry,
        value: JSON.stringify({
          mjmlTemplate: value,
          isActive,
        } as EmailMetadataValue),
      };
    }

    return metadataEntry;
  });

  if (!updatedMetadata.find((metadataEntry) => metadataEntry.key === entryId)) {
    updatedMetadata.push({
      key: entryId,
      value: JSON.stringify({
        mjmlTemplate: value,
        isActive,
      } as EmailMetadataValue),
    });
  }

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
    console.log({ response });
    setMetadata(response.metadata);

    return response.metadata;
  };

  const getEventMetadata = async (entryId: string) => {
    const metadata = await getMetadata();
    return metadata.filter((metadataEntry: MetadataItem) => metadataEntry.key === entryId)[0];
  };

  const setMetadataIfExists = async (entryId: string) => {
    const savedMetadata = await getEventMetadata(entryId);
    const value = savedMetadata?.value;

    if (value) {
      const { mjmlTemplate, isActive } = JSON.parse(value) as EmailMetadataValue;

      setEmailTemplate(mjmlTemplate);
      setIsActive(isActive!);
    } else {
      setEmailTemplate(MJML_DEFAULT_TEMPLATE);
    }
  };

  useEffect(() => {
    setMetadataIfExists(ORDER_CREATED_ID);
  }, []);

  const handleParseMjml = async () => {
    if (emailTemplate) {
      const { rawHtml } = (await parseMjml(emailTemplate)) as { rawHtml: string };

      // @ts-ignore
      setParsedHtml(rawHtml);
    }
  };

  const getUpdatedMetadata = () =>
    updatedMetadata(metadata, ORDER_CREATED_ID, emailTemplate!, isActive);

  const handleSaveToMetadata = async () => {
    setTransitionState("loading");
    fetch("/api/metadata", {
      method: "POST",
      headers: [
        ["content-type", "application/json"],
        [SALEOR_DOMAIN_HEADER, appBridgeState?.domain!],
        [SALEOR_AUTHORIZATION_BEARER_HEADER, appBridgeState?.token!],
      ],
      body: JSON.stringify(getUpdatedMetadata()),
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
        <Typography variant="h6" style={{ margin: "1rem" }}>
          Emailing app uwu
        </Typography>

        <Grid spacing={2} container>
          <Grid item xs={6}>
            <Card style={{ padding: "2rem" }}>
              <Typography variant="h6" style={{ marginBottom: "1rem" }}>
                MJML Editor
              </Typography>

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
            </Card>
          </Grid>

          <Grid item xs={6}>
            <Card style={{ padding: "2rem" }}>
              <Typography variant="h6">Preview</Typography>
              <div dangerouslySetInnerHTML={{ __html: parsedHtml }} />
            </Card>

            <Card style={{ padding: "2rem", marginTop: "2rem" }}>
              <Grid>
                <Grid item style={{ display: "flex", alignItems: "center" }}>
                  <Typography variant="h6">Active</Typography>
                  <Switch onChange={() => setIsActive(!isActive)} checked={isActive} />
                </Grid>

                <Grid item>
                  <ConfirmButton
                    onClick={handleSaveToMetadata}
                    transitionState={transitionState}
                    labels={{
                      confirm: "Save",
                      error: "Error",
                    }}
                    fullWidth
                  >
                    Save
                  </ConfirmButton>
                </Grid>
              </Grid>
            </Card>
          </Grid>
        </Grid>
      </div>
    </>
  );
};

export default PreviewPage;
