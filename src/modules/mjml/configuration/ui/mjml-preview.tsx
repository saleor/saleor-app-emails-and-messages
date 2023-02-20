import { Card } from "@material-ui/core";
import React, { useState } from "react";
import { useEffect } from "react";

type Props = {
  value: string;
};

export const MjmlPreview = ({ value }: Props) => {
  const [compiledTemplate, setCompiledTemplate] = useState("");

  useEffect(() => {
    const mjml2html = require("mjml-browser");
    try {
      setCompiledTemplate(mjml2html(value).html);
    } catch (error) {
      console.error("Error during compiling the template");
    }
  }, [value]);

  return (
    <Card style={{ padding: "2rem", width: "100%" }}>
      {!!compiledTemplate.length && <div dangerouslySetInnerHTML={{ __html: compiledTemplate }} />}
    </Card>
  );
};
