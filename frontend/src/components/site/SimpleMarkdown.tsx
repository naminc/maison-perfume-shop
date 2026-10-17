import { Fragment } from "react";

interface Props {
  content: string;
}

type Block =
  | { type: "heading"; text: string }
  | { type: "list"; items: string[] }
  | { type: "paragraph"; text: string };

/**
 * Renderer markdown tối giản và an toàn: chỉ hỗ trợ "## heading", danh sách "- ",
 * và đoạn văn. Không dùng dangerouslySetInnerHTML nên nội dung luôn là plain text.
 */
export function SimpleMarkdown({ content }: Props) {
  const blocks = parseBlocks(content);

  return (
    <>
      {blocks.map((block, index) => (
        <Fragment key={index}>
          {block.type === "heading" && (
            <h2 className="mt-8 text-xl font-semibold text-stone-900">{block.text}</h2>
          )}
          {block.type === "list" && (
            <ul className="mt-3 space-y-2 leading-relaxed">
              {block.items.map((item, itemIndex) => (
                <li key={itemIndex}>• {item}</li>
              ))}
            </ul>
          )}
          {block.type === "paragraph" && (
            <p className="mt-4 leading-relaxed">{block.text}</p>
          )}
        </Fragment>
      ))}
    </>
  );
}

function parseBlocks(content: string): Block[] {
  const blocks: Block[] = [];
  const lines = content.replace(/\r\n/g, "\n").split("\n");
  let paragraph: string[] = [];
  let list: string[] = [];

  const flushParagraph = () => {
    if (paragraph.length > 0) {
      blocks.push({ type: "paragraph", text: paragraph.join(" ") });
      paragraph = [];
    }
  };

  const flushList = () => {
    if (list.length > 0) {
      blocks.push({ type: "list", items: list });
      list = [];
    }
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (line === "") {
      flushParagraph();
      flushList();
      continue;
    }

    if (line.startsWith("## ")) {
      flushParagraph();
      flushList();
      blocks.push({ type: "heading", text: line.slice(3).trim() });
      continue;
    }

    if (line.startsWith("- ") || line.startsWith("• ")) {
      flushParagraph();
      list.push(line.slice(2).trim());
      continue;
    }

    flushList();
    paragraph.push(line);
  }

  flushParagraph();
  flushList();

  return blocks;
}
