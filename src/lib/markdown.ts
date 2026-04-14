export function renderSimpleMarkdown(src: string): string {
  const escape = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  const lines = src.split("\n");
  const out: string[] = [];
  let para: string[] = [];

  const flushPara = () => {
    if (para.length === 0) return;
    let text = escape(para.join(" "));
    text = text
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
      .replace(/\*([^*]+)\*/g, "<em>$1</em>");
    out.push(`<p>${text}</p>`);
    para = [];
  };

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      flushPara();
      continue;
    }
    if (trimmed.startsWith("# ")) {
      flushPara();
      out.push(`<h1>${escape(trimmed.slice(2))}</h1>`);
    } else if (trimmed.startsWith("## ")) {
      flushPara();
      out.push(`<h2>${escape(trimmed.slice(3))}</h2>`);
    } else if (trimmed.startsWith("### ")) {
      flushPara();
      out.push(`<h3>${escape(trimmed.slice(4))}</h3>`);
    } else if (trimmed === "---") {
      flushPara();
      out.push("<hr />");
    } else {
      para.push(trimmed);
    }
  }
  flushPara();
  return out.join("\n");
}
