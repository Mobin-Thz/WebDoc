"use client";

import { Highlight, themes } from "prism-react-renderer";
import { useState } from "react";

import { Button } from "@/components/ui/button";

export function CodeSnippet({
  code,
  language = "text",
}: {
  code: string;
  language?: string;
}) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="code-block">
      <div className="code-toolbar">
        <span>{language}</span>
        <Button size="sm" type="button" variant="secondary" onClick={copy}>
          {copied ? "Copied" : "Copy"}
        </Button>
      </div>
      <Highlight
        code={code.trimEnd()}
        language={language}
        theme={themes.nightOwl}
      >
        {({ className, getLineProps, getTokenProps, style, tokens }) => (
          <pre className={className} style={style} tabIndex={0}>
            {tokens.map((line, lineIndex) => (
              <div key={lineIndex} {...getLineProps({ line })}>
                {line.map((token, tokenIndex) => (
                  <span key={tokenIndex} {...getTokenProps({ token })} />
                ))}
              </div>
            ))}
          </pre>
        )}
      </Highlight>
    </div>
  );
}
