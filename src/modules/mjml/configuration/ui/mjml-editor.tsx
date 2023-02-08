import React, { useRef } from "react";

import Editor from "@monaco-editor/react";

type Props = {
  onChange(value: string): void;
  initialTemplate: string;
  value: string;
};

export const MjmlEditor = ({ initialTemplate, onChange, value }: Props) => {
  const editorRef = useRef(null);

  // @ts-ignore
  function handleEditorDidMount(editor, monaco) {
    editorRef.current = editor;
  }

  return (
    <>
      <Editor
        height="60vh"
        value={value}
        defaultLanguage="xml"
        defaultValue={initialTemplate}
        onMount={handleEditorDidMount}
        onChange={(value) => {
          onChange(value ?? "");
        }}
      />
    </>
  );
};
