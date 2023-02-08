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
    setCompiledTemplate(mjml2html(value).html);
  }, [value]);

  return (
    <Card style={{ padding: "2rem" }}>
      {!!compiledTemplate.length && <div dangerouslySetInnerHTML={{ __html: compiledTemplate }} />}
    </Card>
  );
};
