"use client";

import React, { useState } from "react";
import { Check, Copy } from "lucide-react";

export function inlineFmt(s: string) {
  return s
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/`(.+?)`/g, '<code class="px-1.5 py-0.5 rounded text-xs" style="background: var(--bg-secondary)">$1</code>')
    .replace(/\[(\d+)\]/g, '<sup class="text-blue-400 text-[10px] font-bold cursor-pointer">[$1]</sup>');
}

function CodeBlockCopyButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      className="flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium transition-colors"
      style={{ color: "var(--text-tertiary)", background: "var(--bg-hover)" }}
      title="Copy code">
      {copied ? <><Check className="w-3 h-3 text-green-500" /> Copied</> : <><Copy className="w-3 h-3" /> Copy</>}
    </button>
  );
}

function CodeBlock({ code, language }: { code: string; language?: string }) {
  return (
    <div className="my-3 rounded-lg overflow-hidden" style={{ border: "1px solid var(--border-primary)" }}>
      <div className="flex items-center justify-between px-3 py-1.5" style={{ background: "var(--bg-tertiary)", borderBottom: "1px solid var(--border-primary)" }}>
        <span className="text-[11px] font-medium" style={{ color: "var(--text-tertiary)" }}>{language || "code"}</span>
        <CodeBlockCopyButton code={code} />
      </div>
      <pre className="p-3 text-xs overflow-x-auto" style={{ background: "var(--bg-secondary)", margin: 0 }}>
        <code>{code}</code>
      </pre>
    </div>
  );
}

export function renderMarkdown(text: string) {
  const lines = text.split("\n");
  const elements: React.ReactNode[] = [];
  let inCodeBlock = false;
  let codeContent = "";
  let codeLang = "";

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.startsWith("```")) {
      if (!inCodeBlock) {
        inCodeBlock = true;
        codeContent = "";
        codeLang = line.slice(3).trim();
      } else {
        elements.push(<CodeBlock key={i} code={codeContent} language={codeLang} />);
        inCodeBlock = false;
        codeContent = "";
        codeLang = "";
      }
      continue;
    }
    if (inCodeBlock) { codeContent += (codeContent ? "\n" : "") + line; continue; }

    if (line.startsWith("### ")) {
      elements.push(<h3 key={i} className="text-base font-semibold mt-4 mb-2">{line.slice(4)}</h3>);
    } else if (line.startsWith("## ")) {
      elements.push(<h2 key={i} className="text-lg font-semibold mt-4 mb-2">{line.slice(3)}</h2>);
    } else if (line.startsWith("# ")) {
      elements.push(<h1 key={i} className="text-xl font-bold mt-4 mb-2">{line.slice(2)}</h1>);
    } else if (line.startsWith("- ") || line.startsWith("* ")) {
      elements.push(<div key={i} className="flex gap-2 ml-2"><span style={{ color: "var(--text-tertiary)" }}>&bull;</span><span dangerouslySetInnerHTML={{ __html: inlineFmt(line.replace(/^[-*]\s/, "")) }} /></div>);
    } else if (line.match(/^\d+\.\s/)) {
      const num = line.match(/^(\d+)\.\s/)![1];
      elements.push(<div key={i} className="flex gap-2 ml-2"><span style={{ color: "var(--text-tertiary)" }}>{num}.</span><span dangerouslySetInnerHTML={{ __html: inlineFmt(line.replace(/^\d+\.\s/, "")) }} /></div>);
    } else if (line.trim() === "") {
      elements.push(<div key={i} className="h-2" />);
    } else {
      elements.push(<p key={i} dangerouslySetInnerHTML={{ __html: inlineFmt(line) }} />);
    }
  }
  if (inCodeBlock && codeContent) {
    elements.push(<CodeBlock key="unclosed" code={codeContent} language={codeLang} />);
  }
  return elements;
}
