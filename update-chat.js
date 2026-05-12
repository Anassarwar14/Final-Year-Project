const fs = require('fs');
let code = fs.readFileSync('components/chat-interface.tsx', 'utf8');

code = code.replace(
  'import { advisorApi } from \"@/lib/advisor-api\"',
  'import { advisorApi } from \"@/lib/advisor-api\"\\nimport ReactMarkdown from \"react-markdown\"\\nimport remarkGfm from \"remark-gfm\"'
);

const parseMarkdownRegex = /\/\/ Enhanced markdown parser[\s\S]*?return html\n\}/;
const componentsDef = \const MarkdownComponents = {
  h1: ({node, ...props}: any) => <h1 className=\"text-xl md:text-2xl font-bold mt-6 mb-4 text-primary tracking-tight\" {...props} />,
  h2: ({node, ...props}: any) => <h2 className=\"text-lg md:text-xl font-semibold mt-5 mb-3 text-secondary-foreground border-b pb-2\" {...props} />,
  h3: ({node, ...props}: any) => <h3 className=\"text-base md:text-lg font-semibold mt-4 mb-2 text-foreground\" {...props} />,
  p: ({node, ...props}: any) => <p className=\"mb-4 text-sm md:text-[15px] leading-[1.75] text-foreground/90\" {...props} />,
  ul: ({node, ...props}: any) => <ul className=\"list-disc pl-6 mb-4 space-y-2 text-foreground/90 marker:text-primary/70\" {...props} />,
  ol: ({node, ...props}: any) => <ol className=\"list-decimal pl-6 mb-4 space-y-2 text-foreground/90 marker:text-primary/70\" {...props} />,
  li: ({node, ...props}: any) => <li className=\"text-sm md:text-[15px] leading-[1.65]\" {...props} />,
  table: ({node, ...props}: any) => (
    <div className=\"my-6 w-full overflow-x-auto rounded-lg border border-border bg-card shadow-sm\">
      <table className=\"w-full text-left text-sm whitespace-nowrap\" {...props} />
    </div>
  ),
  thead: ({node, ...props}: any) => <thead className=\"bg-muted/60 text-muted-foreground uppercase text-xs font-semibold tracking-wider\" {...props} />,
  th: ({node, ...props}: any) => <th className=\"px-4 py-3 border-b border-border/80\" {...props} />,
  td: ({node, ...props}: any) => <td className=\"px-4 py-3 border-b border-border/40 align-middle\" {...props} />,
  tbody: ({node, ...props}: any) => <tbody className=\"divide-y divide-border/40\" {...props} />,
  tr: ({node, ...props}: any) => <tr className=\"hover:bg-muted/30 transition-colors duration-150\" {...props} />,
  strong: ({node, ...props}: any) => <strong className=\"font-semibold text-foreground\" {...props} />,
  blockquote: ({node, ...props}: any) => (
    <blockquote className=\"border-l-4 border-primary/50 pl-4 py-1.5 my-5 italic text-muted-foreground bg-muted/20 rounded-r-lg\" {...props} />
  ),
  a: ({node, ...props}: any) => <a className=\"font-medium text-primary hover:text-primary/80 underline underline-offset-4 decoration-primary/30 transition-colors\" target=\"_blank\" rel=\"noopener noreferrer\" {...props} />,
  code: ({node, inline, className, children, ...props}: any) => {
    return inline ? (
      <code className=\"bg-muted/80 px-1.5 py-0.5 rounded-md text-[13px] font-mono text-foreground font-medium\" {...props}>{children}</code>
    ) : (
      <div className=\"my-5 overflow-hidden rounded-xl border border-border shadow-sm max-w-full\">
        <div className=\"flex items-center justify-between bg-zinc-950 px-4 py-2\">
          <span className=\"text-xs font-medium text-zinc-400\">Code Insight</span>
        </div>
        <div className=\"overflow-x-auto p-4 text-[13px] leading-relaxed bg-zinc-900 text-zinc-50 font-mono\">
          <code {...props}>{children}</code>
        </div>
      </div>
    )
  },
}\;
code = code.replace(parseMarkdownRegex, componentsDef);

code = code.replace(
  /<div\\s*className=\"prose[^>]*>\\s*<div\\s*dangerouslySetInnerHTML={{ __html: parseMarkdown\\(message\\.content\\) }}\\s*\\/>/g,
  '<div className=\"w-full max-w-none break-words\">\n                          <ReactMarkdown remarkPlugins={[remarkGfm]} components={MarkdownComponents}>{message.content}</ReactMarkdown>'
);

code = code.replace(
  /<div\\s*className=\"prose[^>]*>\\s*<div dangerouslySetInnerHTML={{ __html: parseMarkdown\\(streamingMessage\\) }} \\/>/g,
  '<div className=\"w-full max-w-none break-words\">\n                        <ReactMarkdown remarkPlugins={[remarkGfm]} components={MarkdownComponents}>{streamingMessage}</ReactMarkdown>'
);

fs.writeFileSync('components/chat-interface.tsx', code);
console.log('Done script');
