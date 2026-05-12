const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, HeadingLevel, BorderStyle, WidthType,
  ShadingType, VerticalAlign, PageBreak, LevelFormat,
  TabStopType, SimpleField
} = require('docx');
const fs = require('fs');

// ─── IEEE Color Palette (monochrome / near-monochrome) ───────────────────────
const C = {
  BLACK:      "000000",
  DARK:       "1A1A1A",
  HEADING:    "111111",   // chapter headings — near-black
  SUBHEAD:    "222222",   // section headings
  BODY:       "111111",   // body text
  GRAY_MID:   "444444",   // captions, footer text
  GRAY_LIGHT: "888888",   // secondary labels
  WHITE:      "FFFFFF",
  TABLE_HEAD: "1A1A1A",   // table header bg — dark
  TABLE_ALT:  "F5F5F5",   // alternating row — very light gray
  CODE_BG:    "F2F2F2",   // code block background
  RULE:       "AAAAAA",   // horizontal rules
};

const FONT_BODY  = "Times New Roman";
const FONT_HEAD  = "Times New Roman";
const FONT_CODE  = "Courier New";
const SIZE_BODY  = 24;   // 12pt  (docx units = half-points)
const SIZE_SMALL = 20;   // 10pt
const SIZE_FOOT  = 18;   // 9pt
const SIZE_CAPTION = 20; // 10pt
const SIZE_H1    = 32;   // 16pt
const SIZE_H2    = 26;   // 13pt
const SIZE_H3    = 24;   // 12pt
const LINE_DOUBLE = 480; // double-spaced
const LINE_BODY   = 360; // 1.5-spaced

// ─── Border helpers ───────────────────────────────────────────────────────────
const bdr = (color = C.RULE, size = 4) => ({ style: BorderStyle.SINGLE, size, color });
const cellBdr = (color = "AAAAAA") => ({
  top: bdr(color, 4), bottom: bdr(color, 4),
  left: bdr(color, 4), right: bdr(color, 4)
});
const noBdr = () => ({ style: BorderStyle.NONE, size: 0, color: "FFFFFF" });
const noAllBdr = () => ({ top: noBdr(), bottom: noBdr(), left: noBdr(), right: noBdr() });

// ─── Paragraph builders ───────────────────────────────────────────────────────

/** Chapter heading — Roman numeral style, centered, all caps, bold */
function h1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    alignment: AlignmentType.CENTER,
    spacing: { before: 480, after: 240 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: C.RULE, space: 6 } },
    children: [
      new TextRun({
        text: text.toUpperCase(),
        bold: true, size: SIZE_H1,
        font: FONT_HEAD, color: C.HEADING,
        allCaps: false
      })
    ]
  });
}

/** Section heading — left aligned, bold, numbered e.g. "1.1 Background" */
function h2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    alignment: AlignmentType.LEFT,
    spacing: { before: 320, after: 120 },
    children: [
      new TextRun({
        text, bold: true, size: SIZE_H2,
        font: FONT_HEAD, color: C.SUBHEAD
      })
    ]
  });
}

/** Sub-section heading — italic bold */
function h3(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    alignment: AlignmentType.LEFT,
    spacing: { before: 240, after: 80 },
    children: [
      new TextRun({
        text, bold: true, italics: true,
        size: SIZE_H3, font: FONT_HEAD, color: C.SUBHEAD
      })
    ]
  });
}

/** Justified body paragraph — Times New Roman 12pt, 1.5 line spacing */
function para(text, opts = {}) {
  return new Paragraph({
    alignment: opts.center ? AlignmentType.CENTER
             : opts.left   ? AlignmentType.LEFT
             : AlignmentType.JUSTIFIED,
    spacing: { after: 120, line: LINE_BODY, lineRule: "auto" },
    indent: opts.noIndent ? {} : { firstLine: 720 },
    children: [new TextRun({
      text,
      size: opts.size || SIZE_BODY,
      font: FONT_BODY,
      bold: opts.bold || false,
      italics: opts.italic || false,
      color: opts.color || C.BODY
    })]
  });
}

/** First paragraph after a heading — no indent (IEEE style) */
function paraFirst(text, opts = {}) {
  return para(text, { ...opts, noIndent: true });
}

function blank(space = 120) {
  return new Paragraph({ spacing: { after: space }, children: [new TextRun("")] });
}

function pageBreak() {
  return new Paragraph({ children: [new PageBreak()] });
}

function bullet(text, level = 0) {
  return new Paragraph({
    numbering: { reference: "bullets", level },
    spacing: { after: 80, line: LINE_BODY, lineRule: "auto" },
    children: [new TextRun({ text, size: SIZE_BODY, font: FONT_BODY, color: C.BODY })]
  });
}

function numItem(text) {
  return new Paragraph({
    numbering: { reference: "numbers", level: 0 },
    spacing: { after: 80, line: LINE_BODY, lineRule: "auto" },
    children: [new TextRun({ text, size: SIZE_BODY, font: FONT_BODY, color: C.BODY })]
  });
}

/** Code listing — Courier New, light gray background, left-indented */
function codeBlock(lines) {
  return [
    blank(80),
    ...lines.map((line, i) => new Paragraph({
      spacing: { after: 0, before: 0 },
      shading: { fill: C.CODE_BG, type: ShadingType.CLEAR },
      indent: { left: 480, right: 480 },
      children: [new TextRun({
        text: line || " ",
        font: FONT_CODE, size: SIZE_SMALL,
        color: C.DARK
      })]
    })),
    blank(80)
  ];
}

/** Figure caption — centered, italic, small */
function figureCaption(text) {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 60, after: 200 },
    children: [new TextRun({
      text, size: SIZE_CAPTION,
      italics: true, font: FONT_BODY,
      color: C.GRAY_MID
    })]
  });
}

/** Table caption — centered, bold small, placed ABOVE the table per IEEE */
function tableCaption(text) {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 200, after: 80 },
    children: [new TextRun({
      text: text.toUpperCase(),
      size: SIZE_SMALL, bold: true,
      font: FONT_BODY, color: C.BODY
    })]
  });
}

/** Thin horizontal rule used as section divider */
function rule() {
  return new Paragraph({
    spacing: { before: 120, after: 120 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: C.RULE } },
    children: [new TextRun("")]
  });
}

// ─── Table builder — IEEE style: dark header, light alternating rows ──────────
function makeTable(headers, rows, colWidths) {
  const total = colWidths.reduce((a, b) => a + b, 0);

  const headerRow = new TableRow({
    tableHeader: true,
    children: headers.map((h, i) => new TableCell({
      width: { size: colWidths[i], type: WidthType.DXA },
      borders: cellBdr("555555"),
      shading: { fill: C.TABLE_HEAD, type: ShadingType.CLEAR },
      margins: { top: 80, bottom: 80, left: 120, right: 120 },
      verticalAlign: VerticalAlign.CENTER,
      children: [new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({
          text: h, bold: true, size: SIZE_SMALL,
          color: C.WHITE, font: FONT_BODY
        })]
      })]
    }))
  });

  const dataRows = rows.map((row, ri) => new TableRow({
    children: row.map((cell, ci) => new TableCell({
      width: { size: colWidths[ci], type: WidthType.DXA },
      borders: cellBdr("AAAAAA"),
      shading: {
        fill: ri % 2 === 0 ? C.WHITE : C.TABLE_ALT,
        type: ShadingType.CLEAR
      },
      margins: { top: 60, bottom: 60, left: 120, right: 120 },
      verticalAlign: VerticalAlign.CENTER,
      children: [new Paragraph({
        children: [new TextRun({ text: cell, size: SIZE_SMALL, font: FONT_BODY, color: C.BODY })]
      })]
    }))
  }));

  return new Table({
    width: { size: total, type: WidthType.DXA },
    columnWidths: colWidths,
    rows: [headerRow, ...dataRows]
  });
}

// ─── Architecture / diagram box — framed monospace block ─────────────────────
function diagramBox(title, lines) {
  return [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 160, after: 40 },
      children: [new TextRun({
        text: `[ ${title} ]`,
        bold: true, italics: false,
        size: SIZE_SMALL, font: FONT_BODY, color: C.GRAY_MID
      })]
    }),
    new Paragraph({
      alignment: AlignmentType.LEFT,
      spacing: { before: 0, after: 0 },
      shading: { fill: C.CODE_BG, type: ShadingType.CLEAR },
      indent: { left: 480, right: 480 },
      border: {
        top:    bdr(C.RULE, 4), bottom: bdr(C.RULE, 4),
        left:   bdr(C.RULE, 4), right:  bdr(C.RULE, 4)
      },
      children: [new TextRun({ text: " ", size: 4 })]
    }),
    ...lines.map((line, i) => new Paragraph({
      spacing: { after: 0, before: 0 },
      shading: { fill: C.CODE_BG, type: ShadingType.CLEAR },
      indent: { left: 480, right: 480 },
      children: [new TextRun({
        text: line || " ",
        font: FONT_CODE, size: SIZE_SMALL, color: C.DARK
      })]
    })),
    new Paragraph({
      alignment: AlignmentType.LEFT,
      spacing: { before: 0, after: 0 },
      shading: { fill: C.CODE_BG, type: ShadingType.CLEAR },
      indent: { left: 480, right: 480 },
      children: [new TextRun({ text: " ", size: 4 })]
    }),
  ];
}

/** Screenshot placeholder box */
function screenshotBox(route, description, elements) {
  return [
    new Paragraph({
      spacing: { before: 160, after: 60 },
      children: [
        new TextRun({ text: "Screenshot Placeholder: ", bold: true, size: SIZE_SMALL, font: FONT_BODY }),
        new TextRun({ text: route, bold: true, italics: true, size: SIZE_SMALL, font: FONT_BODY })
      ]
    }),
    new Paragraph({
      spacing: { after: 60 },
      indent: { left: 480 },
      children: [new TextRun({ text: description, size: SIZE_SMALL, italics: true, font: FONT_BODY, color: C.GRAY_MID })]
    }),
    ...elements.map(e => new Paragraph({
      numbering: { reference: "bullets", level: 0 },
      spacing: { after: 60 },
      children: [new TextRun({ text: e, size: SIZE_SMALL, font: FONT_BODY, color: C.BODY })]
    })),
    blank(120)
  ];
}

// ─── Title page helper ────────────────────────────────────────────────────────
function titleLine(text, size, bold = false, italic = false, spaceAfter = 120) {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: spaceAfter },
    children: [new TextRun({ text, size, bold, italics: italic, font: FONT_HEAD, color: C.DARK })]
  });
}

// ═════════════════════════════════════════════════════════════════════════════
// DOCUMENT
// ═════════════════════════════════════════════════════════════════════════════
const doc = new Document({
  numbering: {
    config: [
      {
        reference: "bullets",
        levels: [
          {
            level: 0, format: LevelFormat.BULLET, text: "\u2022", alignment: AlignmentType.LEFT,
            style: { paragraph: { indent: { left: 600, hanging: 300 } } }
          },
          {
            level: 1, format: LevelFormat.BULLET, text: "\u25E6", alignment: AlignmentType.LEFT,
            style: { paragraph: { indent: { left: 960, hanging: 300 } } }
          }
        ]
      },
      {
        reference: "numbers",
        levels: [{
          level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 600, hanging: 300 } } }
        }]
      }
    ]
  },
  styles: {
    default: {
      document: { run: { font: FONT_BODY, size: SIZE_BODY } }
    },
    paragraphStyles: [
      {
        id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: SIZE_H1, bold: true, font: FONT_HEAD, color: C.HEADING },
        paragraph: {
          alignment: AlignmentType.CENTER,
          spacing: { before: 480, after: 240 },
          outlineLevel: 0
        }
      },
      {
        id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: SIZE_H2, bold: true, font: FONT_HEAD, color: C.SUBHEAD },
        paragraph: { spacing: { before: 320, after: 120 }, outlineLevel: 1 }
      },
      {
        id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: SIZE_H3, bold: true, italics: true, font: FONT_HEAD, color: C.SUBHEAD },
        paragraph: { spacing: { before: 240, after: 80 }, outlineLevel: 2 }
      }
    ]
  },

  sections: [{
    properties: {
      page: {
        size: { width: 12240, height: 15840 },   // US Letter
        margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 }  // 1 inch all round
      }
    },

    // ── Header ──────────────────────────────────────────────────────────────
    headers: {
      default: new Header({
        children: [
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: C.RULE, space: 4 } },
            spacing: { after: 80 },
            children: [
              new TextRun({
                text: "WealthFlow — Final Year Project Report",
                size: SIZE_FOOT, font: FONT_BODY, italics: true, color: C.GRAY_MID
              })
            ]
          })
        ]
      })
    },

    // ── Footer ──────────────────────────────────────────────────────────────
    footers: {
      default: new Footer({
        children: [
          new Paragraph({
            border: { top: { style: BorderStyle.SINGLE, size: 4, color: C.RULE, space: 4 } },
            spacing: { before: 80 },
            tabStops: [{ type: TabStopType.RIGHT, position: 8640 }],
            children: [
              new TextRun({ text: "Department of Computer Science  ·  May 2026", size: SIZE_FOOT, font: FONT_BODY, color: C.GRAY_MID }),
              new TextRun({ text: "\t", size: SIZE_FOOT }),
              new SimpleField("PAGE", { size: SIZE_FOOT, font: FONT_BODY, color: C.GRAY_MID })
            ]
          })
        ]
      })
    },

    children: [

      // ══════════════════════════════════════════════════════════════════════
      // TITLE PAGE
      // ══════════════════════════════════════════════════════════════════════
      blank(1200),
      titleLine("FINAL YEAR PROJECT REPORT", SIZE_SMALL, false, false, 80),
      rule(),
      blank(400),
      titleLine("WealthFlow", 56, true, false, 160),
      titleLine("AI-Driven Financial Advisor, Trading Simulator,", SIZE_H2, false, true, 80),
      titleLine("and Market Intelligence Platform", SIZE_H2, false, true, 400),
      rule(),
      blank(300),
      ...[
        ["Student Name:", "[Student Name]"],
        ["Registration Number:", "[Registration Number]"],
        ["Department:", "[Department]"],
        ["University:", "[University Name]"],
        ["Supervisor:", "[Supervisor Name]"],
        ["Submission Date:", "May 10, 2026"],
      ].map(([label, value]) => new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 100 },
        children: [
          new TextRun({ text: label + "  ", bold: true, size: SIZE_BODY, font: FONT_BODY }),
          new TextRun({ text: value, size: SIZE_BODY, font: FONT_BODY })
        ]
      })),
      blank(500),
      titleLine("Submitted in partial fulfillment of the requirements", SIZE_SMALL, false, true, 60),
      titleLine("for the Bachelor of Science — Final Year Project", SIZE_SMALL, false, true, 60),
      pageBreak(),

      // ══════════════════════════════════════════════════════════════════════
      // DECLARATION
      // ══════════════════════════════════════════════════════════════════════
      h1("Declaration"),
      paraFirst("I hereby declare that this Final Year Project report and the associated software system titled \"WealthFlow — AI-Driven Financial Advisor, Trading Simulator, and Market Intelligence Platform\" are my original work, carried out under the supervision of the named supervisor. All sources, libraries, and frameworks used have been properly acknowledged in accordance with IEEE referencing guidelines. This work has not been submitted for any other academic award."),
      blank(600),
      new Paragraph({ children: [new TextRun({ text: "Student Signature: ____________________________", size: SIZE_BODY, font: FONT_BODY })] }),
      blank(100),
      new Paragraph({ children: [new TextRun({ text: "Date: ____________________________", size: SIZE_BODY, font: FONT_BODY })] }),
      blank(500),
      h1("Approval Page"),
      paraFirst("This report titled \"WealthFlow — AI-Driven Financial Advisor, Trading Simulator, and Market Intelligence Platform\" has been reviewed and approved in partial fulfillment of the requirements for the Final Year Project."),
      blank(600),
      new Paragraph({ children: [new TextRun({ text: "Supervisor Signature: ____________________________", size: SIZE_BODY, font: FONT_BODY })] }),
      blank(100),
      new Paragraph({ children: [new TextRun({ text: "Date: ____________________________", size: SIZE_BODY, font: FONT_BODY })] }),
      pageBreak(),

      // ══════════════════════════════════════════════════════════════════════
      // ACKNOWLEDGEMENT
      // ══════════════════════════════════════════════════════════════════════
      h1("Acknowledgement"),
      paraFirst("I express my sincere gratitude to my supervisor for continuous guidance, technical feedback, and encouragement throughout the duration of this project. Their expertise in software engineering and artificial intelligence was invaluable in shaping the architectural decisions and evaluating implementation quality."),
      para("I also acknowledge the contributions of the open-source community, whose tools and libraries form the foundation of this platform. In particular, the maintainers of Next.js, Hono, Prisma, Better Auth, pgvector, Upstash Redis, the Groq SDK, and the Google Gemini API deserve recognition for producing high-quality, well-documented frameworks that made this integration feasible within an academic timeframe."),
      para("Finally, I thank my peers and classmates for their feedback during user testing sessions and their patience in exploring early-stage builds of the system."),
      pageBreak(),

      // ══════════════════════════════════════════════════════════════════════
      // ABSTRACT
      // ══════════════════════════════════════════════════════════════════════
      h1("Abstract"),
      paraFirst("WealthFlow is a full-stack financial platform that integrates a portfolio dashboard, trading simulator, market news intelligence, and a personalized AI financial advisor into a cohesive web application. The system addresses the need for accessible, context-aware investment decision support by combining real-time market data with user portfolio analytics and retrieval-augmented generation (RAG). The implementation leverages Next.js 15 and React 19 for the user interface, Hono as the backend API framework, Supabase PostgreSQL with Prisma ORM for data persistence, Better Auth for session-based authentication, and Upstash Redis for caching and rate control. The AI advisor integrates the Groq Llama 3.3 inference engine with structured investor profiles, portfolio holdings, and a pgvector-backed knowledge base built from company profiles, financial metrics, market news, and SEC filings. This report details the system architecture, design rationale, database schema, API design, retrieval algorithms, and implementation decisions, while evaluating system reliability, performance, and usability. Testing includes API smoke tests and RAG ingestion validation, with results documented and limitations identified. The result is a modular, extensible financial platform suitable for academic evaluation and future production hardening."),
      blank(80),
      new Paragraph({
        spacing: { after: 120 },
        indent: { left: 720 },
        children: [
          new TextRun({ text: "Keywords — ", bold: true, size: SIZE_BODY, font: FONT_BODY }),
          new TextRun({ text: "Retrieval-Augmented Generation, Large Language Model, Financial Advisor, Next.js, Hono, pgvector, Trading Simulator, Portfolio Analytics, Server-Sent Events.", italics: true, size: SIZE_BODY, font: FONT_BODY })
        ]
      }),
      pageBreak(),

      // ══════════════════════════════════════════════════════════════════════
      // TABLE OF CONTENTS
      // ══════════════════════════════════════════════════════════════════════
      h1("Table of Contents"),
      ...[
        ["1.", "Introduction", "7", false],
        ["1.1", "Background and Motivation", "7", true],
        ["1.2", "Problem Statement", "7", true],
        ["1.3", "Project Objectives", "8", true],
        ["1.4", "Scope and Boundaries", "8", true],
        ["1.5", "Target Users", "8", true],
        ["2.", "Related Work", "9", false],
        ["2.1", "Robo-Advisors and Portfolio Management", "9", true],
        ["2.2", "Trading Simulators", "9", true],
        ["2.3", "RAG-Based Financial Assistants", "9", true],
        ["2.4", "Comparative Analysis", "10", true],
        ["3.", "Requirements Analysis", "11", false],
        ["3.1", "Functional Requirements", "11", true],
        ["3.2", "Non-Functional Requirements", "11", true],
        ["3.3", "Use Case Analysis", "12", true],
        ["3.4", "User Stories", "13", true],
        ["4.", "System Design", "14", false],
        ["4.1", "Architecture Overview", "14", true],
        ["4.2", "Frontend Architecture", "15", true],
        ["4.3", "Backend Architecture", "15", true],
        ["4.4", "Data Layer Design", "16", true],
        ["4.5", "API Design", "17", true],
        ["4.6", "Authentication Flow", "18", true],
        ["4.7", "RAG Pipeline Design", "18", true],
        ["4.8", "Algorithm Design", "20", true],
        ["5.", "Implementation", "21", false],
        ["5.1", "Project Setup", "21", true],
        ["5.2", "Authentication Implementation", "21", true],
        ["5.3", "AI Advisor and Chat Streaming", "22", true],
        ["5.4", "RAG Ingestion and Retrieval", "23", true],
        ["5.5", "Trading Simulator", "24", true],
        ["5.6", "Portfolio Analytics", "25", true],
        ["5.7", "Market News Integration", "26", true],
        ["5.8", "UI Screenshots and Interface Design", "26", true],
        ["6.", "Testing and Evaluation", "27", false],
        ["6.1", "Testing Strategy", "27", true],
        ["6.2", "API and Smoke Tests", "27", true],
        ["6.3", "UI Verification", "28", true],
        ["6.4", "Evaluation Results", "28", true],
        ["7.", "Conclusion and Future Work", "29", false],
        ["7.1", "Project Achievements", "29", true],
        ["7.2", "Limitations", "29", true],
        ["7.3", "Future Enhancements", "30", true],
        ["References", "", "31", false],
        ["Appendices", "", "32", false],
      ].map(([num, title, page, isSection]) => new Paragraph({
        spacing: { after: isSection ? 60 : 100 },
        indent: { left: isSection ? 480 : 0 },
        tabStops: [{ type: TabStopType.RIGHT, position: 8640, leader: TabStopType.DOT }],
        children: [
          new TextRun({
            text: `${num}${title ? "  " + title : ""}`,
            size: isSection ? SIZE_SMALL : SIZE_BODY,
            bold: !isSection,
            font: FONT_BODY,
            color: C.BODY
          }),
          new TextRun({ text: `\t${page}`, size: isSection ? SIZE_SMALL : SIZE_BODY, font: FONT_BODY })
        ]
      })),
      pageBreak(),

      // ══════════════════════════════════════════════════════════════════════
      // LIST OF FIGURES / TABLES
      // ══════════════════════════════════════════════════════════════════════
      h1("List of Figures"),
      ...[
        ["Fig. 1", "High-Level System Architecture", "14"],
        ["Fig. 2", "Frontend Component Hierarchy", "15"],
        ["Fig. 3", "Backend Module Structure", "15"],
        ["Fig. 4", "Authentication Sequence Diagram", "18"],
        ["Fig. 5", "AI Advisor Streaming Sequence", "22"],
        ["Fig. 6", "RAG Ingestion Pipeline Flowchart", "19"],
        ["Fig. 7", "Trading Simulator Order Lifecycle", "24"],
        ["Fig. 8", "Deployment Architecture Diagram", "14"],
        ["Fig. 9", "Database Entity-Relationship Diagram", "16"],
        ["Fig. 10", "API Gateway Flow — Next.js + Hono", "17"],
        ["Fig. 11", "News Personalization Flow", "26"],
        ["Fig. 12", "Portfolio Analytics Data Flow", "25"],
        ["Fig. 13", "Pending Order Processing Flow", "24"],
        ["Fig. 14", "RAG Retrieval and Rerank Flow", "19"],
      ].map(([num, title, page]) => new Paragraph({
        spacing: { after: 60 },
        tabStops: [{ type: TabStopType.RIGHT, position: 8640, leader: TabStopType.DOT }],
        children: [
          new TextRun({ text: `${num}  ${title}`, size: SIZE_SMALL, font: FONT_BODY }),
          new TextRun({ text: `\t${page}`, size: SIZE_SMALL, font: FONT_BODY })
        ]
      })),
      blank(200),
      h1("List of Tables"),
      ...[
        ["Table I", "Technology Stack Comparison", "10"],
        ["Table II", "Functional Requirements", "11"],
        ["Table III", "Non-Functional Requirements", "12"],
        ["Table IV", "Use Case Catalog", "12"],
        ["Table V", "Module-to-API Mapping", "17"],
        ["Table VI", "RAG Scoring Components", "20"],
        ["Table VII", "Cache Key TTL Settings", "25"],
        ["Table VIII", "Manual UI Verification Checklist", "28"],
        ["Table IX", "Test Cases and Results", "28"],
        ["Table X", "Technology Stack Quick Reference", "35"],
      ].map(([num, title, page]) => new Paragraph({
        spacing: { after: 60 },
        tabStops: [{ type: TabStopType.RIGHT, position: 8640, leader: TabStopType.DOT }],
        children: [
          new TextRun({ text: `${num}  ${title}`, size: SIZE_SMALL, font: FONT_BODY }),
          new TextRun({ text: `\t${page}`, size: SIZE_SMALL, font: FONT_BODY })
        ]
      })),
      pageBreak(),

      // ══════════════════════════════════════════════════════════════════════
      // CHAPTER 1: INTRODUCTION
      // ══════════════════════════════════════════════════════════════════════
      h1("Chapter 1: Introduction"),

      h2("1.1  Background and Motivation"),
      paraFirst("Financial literacy and access to market intelligence remain unevenly distributed across investor segments. Retail investors typically rely on fragmented tools — separate applications for price quotes, news aggregation, educational content, and portfolio tracking. This fragmentation creates decision-making friction and prevents a unified, contextual picture of a user's financial health."),
      para("Meanwhile, recent advances in large language models (LLMs) have enabled conversational interfaces capable of summarizing complex financial data and providing guidance. However, such systems typically lack personalized portfolio context and verifiable evidence, making recommendations abstract and difficult to trust. WealthFlow is motivated by the need to bridge this gap: a single platform combining portfolio analytics, simulator-based learning, real-time market data, and an AI advisor that reasons about the user's specific holdings using retrieved, verifiable sources [1]–[3]."),

      h2("1.2  Problem Statement"),
      paraFirst("Traditional financial dashboards provide metrics without explanations. General-purpose AI assistants provide explanations without real portfolio context or verifiable citations. This creates a critical gap where advice is either decontextualized (from AI) or unexplained (from dashboards). Furthermore, retail investors lack a safe environment to practice trading strategies before committing capital."),
      para("The challenge this project addresses is: how to build a unified platform that integrates user-specific holdings, an investor profile, real-time market data, and a retrieval-augmented AI advisor, while maintaining acceptable performance, security, and system modularity?"),

      h2("1.3  Project Objectives"),
      bullet("Build a unified fintech platform spanning portfolio analytics, trading simulation, market news, and a conversational AI advisor."),
      bullet("Integrate real-time market data with intelligent caching and rate-limit control via Upstash Redis."),
      bullet("Implement retrieval-augmented generation (RAG) using pgvector and multi-source document ingestion pipelines."),
      bullet("Provide session-based authentication with secure route protection using Better Auth."),
      bullet("Deliver a responsive, dashboard-centric UI with data visualization, Markdown rendering, and real-time SSE streaming."),
      bullet("Demonstrate a reference architecture suitable for academic evaluation and future production hardening."),
      blank(),

      h2("1.4  Scope and Boundaries"),
      paraFirst("WealthFlow addresses four primary domains: AI financial advisor, trading simulator, portfolio analytics, and market news. The system depends on third-party APIs (Finnhub, Alpha Vantage, Groq, Gemini) for market data and LLM inference. A learning hub UI is present but not connected to a dynamic content pipeline in this version. The AI advisor provides informational and educational guidance only, including explicit disclaimers that its output does not constitute formal financial advice."),
      para("The system targets deployment on Next.js-compatible serverless environments. Formal automated unit test suites are identified as future work; testing in this submission is limited to smoke tests and manual UI verification."),

      h2("1.5  Target Users"),
      paraFirst("Three primary user personas are identified for WealthFlow:"),
      blank(80),
      tableCaption("Table I:  Target User Personas"),
      makeTable(
        ["Persona", "Primary Need", "Features Used"],
        [
          ["Beginner Investor", "Simplified explanations and low-risk guidance", "AI Advisor, Learning UI, News Feed"],
          ["Intermediate Investor", "Analytics, sector breakdowns, trend tracking", "Portfolio Dashboard, Advisor, News"],
          ["Student / Researcher", "Safe practice environment for trading strategies", "Simulator, Market Data, Charts"],
        ],
        [2400, 3600, 3360]
      ),
      blank(200),

      h2("1.6  Project Overview"),
      paraFirst("The frontend is built on Next.js (App Router) and provides a dashboard-centric UI with modular views for chat, portfolio, simulator, and news. The backend uses Hono routes embedded within the Next.js API runtime, with Prisma as the ORM and Upstash Redis for caching. The AI advisor integrates Groq LLM inference with portfolio context and RAG retrieval via pgvector. A background scheduler processes pending simulator orders and triggers periodic RAG refresh ingestion."),

      h2("1.7  Methodology Overview"),
      paraFirst("The methodology follows a phased software engineering process: requirements analysis, modular design, iterative implementation, AI and RAG integration, and validation. Development was organized into five phases:"),
      numItem("Phase 1: Core data layer and authentication — Prisma schema design, Better Auth configuration, Next.js middleware setup."),
      numItem("Phase 2: Trading simulator and portfolio analytics — Hono service modules, SWR-based UI, Redis caching layer."),
      numItem("Phase 3: AI advisor integration — Groq streaming, SSE pipeline, chat session persistence."),
      numItem("Phase 4: RAG ingestion and retrieval — pgvector setup, Gemini embeddings, metadata filtering, hybrid reranking."),
      numItem("Phase 5: UX refinement and bug fixes — chat history loading, Markdown rendering, auto-scroll, session management."),
      blank(),

      h2("1.8  Report Organization"),
      paraFirst("The remainder of this report is organized as follows. Chapter 2 surveys related work in robo-advisors, trading simulators, and RAG systems. Chapter 3 presents requirements analysis and use cases. Chapter 4 details system design and architecture. Chapter 5 describes implementation with code excerpts. Chapter 6 covers testing and evaluation. Chapter 7 concludes with limitations and future work."),
      pageBreak(),

      // ══════════════════════════════════════════════════════════════════════
      // CHAPTER 2: RELATED WORK
      // ══════════════════════════════════════════════════════════════════════
      h1("Chapter 2: Related Work"),

      h2("2.1  Robo-Advisors and Portfolio Management Systems"),
      paraFirst("Robo-advisors such as Betterment and Wealthfront apply automated portfolio theory to deliver allocation and rebalancing recommendations based on user risk profiles [10], [11]. These platforms typically abstract away market details and provide limited transparency into how recommendations are derived. While efficient for long-horizon allocation, conventional robo-advisors offer little explainability or evidence provenance."),
      para("WealthFlow builds on the portfolio-aware approach of robo-advisors but adds two key enhancements: verifiable citations via RAG, and a conversational interface that explains the reasoning behind any recommendation with reference to specific retrieved documents."),

      h2("2.2  Trading Simulators and Market Sandboxes"),
      paraFirst("Paper trading platforms provide controlled environments for learning without financial risk. However, they often lack integrated analytics or AI guidance. Users of conventional simulators cannot query an advisor about their simulated trades using the same data context. WealthFlow integrates the simulator into the same data pipeline used for real portfolios, allowing the AI advisor to reason coherently across both simulated and real holdings."),
      para("Additionally, WealthFlow supports pending orders for when markets are closed, automatically executing those orders when market hours resume, replicating realistic order management behavior."),

      h2("2.3  RAG-Based Financial Assistants"),
      paraFirst("Retrieval-Augmented Generation (RAG), as formalized by Lewis et al. [12], improves factual consistency of language model outputs by grounding responses in retrieved documents rather than relying solely on parametric knowledge. In the financial domain, retrieval must account for document type diversity, recency, and relevance — for example, an SEC 10-K filing is more authoritative than a news snippet for questions about regulatory risk."),
      para("WealthFlow implements a multi-source RAG pipeline ingesting company profiles, quarterly financials, market news, and SEC filings into a pgvector index. The retrieval system uses metadata-aware filtering and hybrid reranking to prioritize the most relevant evidence for each query type [8], [9]."),

      h2("2.4  Comparative Analysis"),
      blank(80),
      tableCaption("Table II:  Technology Stack Comparison"),
      makeTable(
        ["Layer", "WealthFlow Choice", "Common Alternative", "Rationale"],
        [
          ["Frontend", "Next.js 15 + React 19", "React + Express", "App Router, SSR, RSC support [1][2]"],
          ["Backend", "Hono", "Express.js", "Minimal, fast, edge-compatible [3]"],
          ["Database", "Supabase PostgreSQL", "MySQL / MongoDB", "Relational schema + pgvector [4][9]"],
          ["ORM", "Prisma 6.x", "Sequelize / Drizzle", "Type-safe schema + auto-migrations [5]"],
          ["Auth", "Better Auth", "NextAuth.js", "Plugin-based, org support [6]"],
          ["LLM Inference", "Groq Llama 3.3", "OpenAI GPT-4", "High-speed low-latency inference [7]"],
          ["Embeddings", "Gemini API", "OpenAI text-embedding", "Multi-model flexibility, fallback [13]"],
          ["Cache", "Upstash Redis", "Local memory cache", "Serverless Redis, TTL-based [14]"],
          ["Market Data", "Finnhub + Alpha Vantage", "Yahoo Finance scraping", "Official APIs, rate-limit-aware [15][16]"],
        ],
        [1300, 1900, 2000, 4160]
      ),
      blank(200),

      h2("2.5  Research Gaps and Differentiation"),
      paraFirst("Existing systems either provide analytics without AI reasoning, or conversational AI without portfolio context or evidence. WealthFlow addresses both dimensions simultaneously, combining structured investor profiles, live portfolio data, and RAG-backed evidence into a unified system enabling personalized, explainable financial guidance. No comparable open-source academic reference implementation combining all four modules (advisor, simulator, analytics, news) under a single cohesive architecture exists in the surveyed literature."),
      pageBreak(),

      // ══════════════════════════════════════════════════════════════════════
      // CHAPTER 3: REQUIREMENTS ANALYSIS
      // ══════════════════════════════════════════════════════════════════════
      h1("Chapter 3: Requirements Analysis"),

      h2("3.1  Functional Requirements"),
      paraFirst("The following table enumerates the functional requirements derived from the problem statement and target user analysis."),
      blank(80),
      tableCaption("Table III:  Functional Requirements"),
      makeTable(
        ["ID", "Requirement", "Description"],
        [
          ["FR-1", "User Authentication", "Users must register, sign in, and maintain secure sessions."],
          ["FR-2", "Portfolio Overview", "Display holdings, total value, sector allocation, and unrealized PnL."],
          ["FR-3", "Trading Simulator", "Execute virtual buy/sell trades with pending order support."],
          ["FR-4", "Market Data", "Fetch real-time quotes, OHLCV candles, profiles, and news."],
          ["FR-5", "AI Advisor", "Provide streaming conversational guidance with source citations."],
          ["FR-6", "RAG Retrieval", "Search pgvector store with metadata filters and reranking."],
          ["FR-7", "Chat Sessions", "Persist and restore chat sessions and full message history."],
          ["FR-8", "News Feed", "Deliver personalized and general market news with sentiment."],
          ["FR-9", "Investor Profile", "Capture and store risk tolerance, goals, and experience level."],
          ["FR-10", "Portfolio Analytics", "Compute sector allocation and historical performance snapshots."],
          ["FR-11", "Watchlist", "Manage watchlist items with optional price alert targets."],
        ],
        [900, 2200, 6260]
      ),
      blank(200),

      h2("3.2  Non-Functional Requirements"),
      blank(80),
      tableCaption("Table IV:  Non-Functional Requirements"),
      makeTable(
        ["ID", "Requirement", "Target"],
        [
          ["NFR-1", "Availability", "99% uptime in development; graceful degradation on API failures."],
          ["NFR-2", "Performance", "< 2 s average API response for cached calls; < 500 ms quote fetch."],
          ["NFR-3", "Scalability", "Modular Hono services; Redis caching reduces provider dependency."],
          ["NFR-4", "Security", "Session-based authorization enforced at middleware and API layer."],
          ["NFR-5", "Maintainability", "Clear service boundaries; typed APIs via Prisma and Zod [18]."],
          ["NFR-6", "Explainability", "AI responses cite retrieved sources with document metadata."],
          ["NFR-7", "Reliability", "Provider fallbacks and synthetic data for development continuity."],
        ],
        [900, 2200, 6260]
      ),
      blank(200),

      h2("3.3  Use Case Analysis"),
      blank(80),
      tableCaption("Table V:  Use Case Catalog"),
      makeTable(
        ["Use Case", "Actor", "Precondition", "Main Flow", "Postcondition"],
        [
          ["UC-1: Authenticate", "User", "None", "Register / login with email + password", "Session created"],
          ["UC-2: View Portfolio", "User", "Authenticated", "Navigate to /portfolio; quotes fetched live", "Holdings shown with PnL"],
          ["UC-3: Simulate Trade", "User", "Auth + simulator init", "Submit trade; market status checked", "Transaction recorded or queued"],
          ["UC-4: Ask Advisor", "User", "Authenticated", "Send chat; RAG retrieves context; stream reply", "Message saved with citations"],
          ["UC-5: Read News", "User", "Authenticated", "Navigate to /news; personalized feed built", "Feed rendered"],
          ["UC-6: Process Pending", "System", "Market opens", "Scheduler fetches pending; executes at live price", "Orders executed"],
          ["UC-7: Update Profile", "User", "Authenticated", "Submit investor profile form", "Profile stored in DB"],
        ],
        [1700, 900, 1500, 2500, 2760]
      ),
      blank(200),

      h2("3.4  User Stories"),
      paraFirst("The following user stories drive implementation priorities and acceptance criteria:"),
      blank(80),
      bullet("As a beginner investor, I want the AI advisor to explain financial concepts using my actual holdings as context, so that I can learn without being overwhelmed by generic jargon."),
      bullet("As an intermediate investor, I want to view my portfolio's sector allocation and unrealized profit/loss in real time, so that I can identify concentration risks quickly."),
      bullet("As a student, I want a trading simulator that behaves like a real brokerage — including pending orders when markets are closed — so that I can practice realistic trading strategies."),
      bullet("As a user, I want the AI advisor to cite the documents it used when generating financial guidance, so that I can verify claims independently."),
      bullet("As a user, I want a personalized news feed based on my holdings and watchlist, so that I only see market news that is relevant to my portfolio."),
      blank(),

      h2("3.5  Feasibility Analysis"),
      paraFirst("Technical feasibility is high: the stack relies on production-grade, well-documented frameworks with active communities. Operational feasibility is supported by caching and provider fallbacks that mitigate third-party API rate limits. Economic feasibility is confirmed by sufficient free-tier quotas on Groq, Finnhub, Supabase, and Gemini for academic-scale usage."),
      para("The primary constraints are: (1) Finnhub and Alpha Vantage rate limits for high-frequency quote fetching, (2) RAG quality is bounded by the availability of the Gemini embedding API, and (3) the learning module is scaffolded but lacks a dynamic content pipeline within the current scope."),
      pageBreak(),

      // ══════════════════════════════════════════════════════════════════════
      // CHAPTER 4: SYSTEM DESIGN
      // ══════════════════════════════════════════════════════════════════════
      h1("Chapter 4: System Design"),

      h2("4.1  Architecture Overview"),
      paraFirst("WealthFlow follows a modular full-stack architecture in which the Next.js frontend communicates with a Hono backend embedded within the Next.js API route handler. This design allows deployment on any Next.js-compatible platform without a separate backend server. All HTTP methods are delegated to Hono via the handle() vercel adapter. The architecture is illustrated in Fig. 1."),
      blank(80),
      ...diagramBox("Fig. 1 — High-Level System Architecture", [
        "Browser (Next.js Client: Dashboard / Chat / News / Simulator)",
        "    |",
        "Next.js App Router  (SSR + RSC + SWR client data fetching)",
        "    |",
        "Hono API  /api/*  (Advisor | Trading | Portfolio | News | RAG)",
        "    |",
        "+----------------------------------------------------------+",
        "|  Supabase PostgreSQL + pgvector  (document_embeddings)   |",
        "|  Upstash Redis  (Quote/Candle/Profile TTL cache)         |",
        "|  Better Auth   (session cookies + middleware)            |",
        "+----------------------------------------------------------+",
        "    |",
        "External APIs: Finnhub | Alpha Vantage | Groq | Gemini",
      ]),
      figureCaption("Fig. 1.  High-Level System Architecture — Browser → Next.js → Hono → Data / Provider Layer."),
      blank(),

      h2("4.2  Frontend Architecture"),
      paraFirst("The frontend uses the Next.js App Router with nested layouts. The root layout provides typography and theme context. The dashboard layout injects a collapsible sidebar for all authenticated routes. Feature pages live under app/dashboard/ and are composed of shared UI components, custom SWR data-fetching hooks, and feature-specific panels. Fig. 2 shows the component hierarchy."),
      blank(80),
      ...diagramBox("Fig. 2 — Frontend Component Hierarchy", [
        "Root Layout  (ThemeProvider + Fonts)",
        "  +-- AppSidebar",
        "  |     +-- NavMain  (Advisor | Portfolio | Simulator | News)",
        "  |     +-- NavUser  (Avatar, Settings, Sign Out)",
        "  +-- Dashboard Routes",
        "        +-- /chat       -> ChatInterface + ChatSidebar",
        "        +-- /portfolio  -> PortfolioPage  (holdings, PnL chart)",
        "        +-- /simulator  -> SimulatorPanel (trade, holdings, watchlist)",
        "        +-- /news       -> NewsPage       (personalized + general)",
      ]),
      figureCaption("Fig. 2.  Frontend Component Hierarchy."),
      blank(),

      h2("4.3  Backend Architecture"),
      paraFirst("The backend is structured into Hono sub-applications (modules), each registered under its own base path. Each module is self-contained with route definitions, controller functions, and service classes. This separation reduces coupling and enables independent testing or replacement of any module (Fig. 3)."),
      blank(80),
      ...diagramBox("Fig. 3 — Backend Module Structure", [
        "Hono Root App  (app/api/[...route]/route.ts -> handle(app))",
        "  +-- /api/advisor   -> AdvisorController -> AdvisorService -> Groq + RAG",
        "  +-- /api/trading   -> TradingController -> TradingService -> Finnhub + DB",
        "  +-- /api/portfolio -> PortfolioController -> PortfolioService -> DB",
        "  +-- /api/news      -> NewsController -> NewsService -> AlphaVantage + DB",
        "  +-- /api/rag       -> RagController -> RagService -> Gemini + pgvector",
      ]),
      figureCaption("Fig. 3.  Backend Module Structure."),
      blank(),

      h2("4.4  Data Layer Design"),
      paraFirst("The Prisma schema defines the full data model. Core entities are listed below. RAG data is stored in a standalone document_embeddings table with a 768-dimensional pgvector index."),
      blank(80),
      tableCaption("Table VI:  Data Entities and Purpose"),
      makeTable(
        ["Entity", "Purpose", "Key Fields"],
        [
          ["User", "Core identity", "id, name, email, emailVerified, role"],
          ["Portfolio", "Real portfolio container", "id, userId, cashBalance, name"],
          ["Holding", "Individual asset positions", "portfolioId, assetId, quantity, averageBuyPrice"],
          ["SimulatorProfile", "Virtual portfolio container", "userId, virtualBalance, totalValue"],
          ["SimulatorTransaction", "Simulated trades + pending orders", "type, quantity, pricePerUnit, pending"],
          ["AiChatSession", "Chat session grouping", "userId, title, createdAt"],
          ["AiChatMessage", "Individual messages + citations", "sessionId, role, content, sources[]"],
          ["InvestorProfile", "Risk + goal preferences", "riskTolerance, investmentGoal, experienceLevel"],
          ["NewsArticle", "Cached market news", "title, url, sentiment, publishedAt"],
          ["document_embeddings", "RAG vector store", "content, embedding VECTOR(768), metadata JSONB"],
        ],
        [2400, 2800, 4160]
      ),
      blank(200),

      blank(80),
      ...diagramBox("Fig. 9 — Entity Relationship Diagram (Key Associations)", [
        "USER ----< PORTFOLIO ----< HOLDING >---- ASSET",
        "USER ----< SIMULATORPROFILE ----< SIMULATORHOLDING >---- ASSET",
        "USER ----< AICHATSESSION ----< AICHATMESSAGE",
        "USER ----< INVESTORPROFILE",
        "SIMULATORPROFILE ----< SIMULATORTRANSACTION >---- ASSET",
        "SIMULATORPROFILE ----< SIMULATORWATCHLIST  >---- ASSET",
        "ASSET >----< NEWSARTICLE  (join table)",
        "document_embeddings  [standalone: content, embedding, metadata]",
      ]),
      figureCaption("Fig. 9.  Database Entity-Relationship Diagram."),
      blank(),

      h2("4.5  API Design and Routing"),
      paraFirst("Hono routes are mapped under /api and exposed through the Next.js catch-all route handler. The API follows REST conventions with JSON responses and SSE for the AI streaming endpoint. All private routes require session validation performed by shared Hono middleware (Table VII)."),
      blank(80),
      tableCaption("Table VII:  Module-to-API Mapping"),
      makeTable(
        ["Module", "Base Path", "Key Endpoints"],
        [
          ["Advisor", "/api/advisor", "POST /chat/stream, GET /sessions, GET/PUT /investor-profile"],
          ["Trading", "/api/trading", "POST /simulator/trade, GET /market/quote/:symbol, GET /market/candles/:symbol"],
          ["Portfolio", "/api/portfolio", "GET /overview, GET /performance?days=30, GET /insights, POST /holdings"],
          ["News", "/api/news", "GET /market, GET /personalized, GET /trending, GET /earnings"],
          ["RAG", "/api/rag", "POST /ingest/:ticker, GET /ingest/status/:ticker, POST /search"],
        ],
        [1300, 2000, 6060]
      ),
      blank(200),

      blank(80),
      ...diagramBox("Fig. 10 — API Gateway Flow (Next.js + Hono)", [
        "Client  ->  GET/POST /api/*",
        "        ->  Next.js Route Handler  (app/api/[...route]/route.ts)",
        "        ->  handle(app)  [hono/vercel adapter]",
        "        ->  Hono Middleware  (session check, CORS, rate limit)",
        "        ->  Module Route Handler  (controller function)",
        "        ->  Service Layer  (business logic + external calls)",
        "        <-  JSON response  OR  SSE ReadableStream",
      ]),
      figureCaption("Fig. 10.  API Gateway Flow — Next.js to Hono."),
      blank(),

      h2("4.6  Authentication and Authorization Flow"),
      paraFirst("Better Auth is configured with the Prisma adapter and provides email/password authentication with session cookies. Next.js middleware runs before all dashboard routes, calling /api/auth/get-session to validate the session cookie. Unauthenticated requests are redirected to /sign-in. Hono private route handlers additionally call auth.api.getSession() server-side to prevent bypass (Fig. 4)."),
      blank(80),
      ...diagramBox("Fig. 4 — Authentication Sequence", [
        "Browser  ->  GET /dashboard",
        "         ->  Next.js Middleware  ->  GET /api/auth/get-session (cookie)",
        "         <-  session object  OR  null",
        "   [null]    ->  redirect /sign-in",
        "   [session] ->  allow request",
        "",
        "Browser  ->  POST /api/advisor/chat/stream (cookie)",
        "         ->  Hono Middleware  ->  auth.api.getSession()",
        "         <-  userId extracted; scoped query executed",
      ]),
      figureCaption("Fig. 4.  Authentication Sequence Diagram."),
      blank(),

      h2("4.7  RAG Pipeline Design"),
      paraFirst("The RAG pipeline operates in two phases: ingestion (triggered via API or scheduler) and retrieval (executed online during each chat completion). The pipeline is illustrated in Figs. 6 and 14."),

      h3("4.7.1  Ingestion Pipeline"),
      para("For each target ticker, the ingestion service fetches data from four source types: company profiles, financial metrics, market news, and SEC filings. Text is chunked using a recursive character text splitter (1,000 characters, 200-character overlap) to preserve context across chunk boundaries. Chunks are embedded using the Gemini text-embedding-004 model (768 dimensions) and stored in the document_embeddings table with rich metadata.", { noIndent: true }),
      blank(80),
      ...diagramBox("Fig. 6 — RAG Ingestion Pipeline", [
        "Trigger: POST /api/rag/ingest/:ticker",
        "  -> Fetch: company profile | news | financials | SEC filings",
        "  -> Normalize and chunk text  (1000 chars, 200 overlap)",
        "  -> Generate embedding  (Gemini text-embedding-004 / hash fallback)",
        "  -> INSERT INTO document_embeddings (content, embedding, metadata)",
        "  -> IVFFlat cosine index updated by pgvector",
        "  <- Return: { chunksInserted, ticker, status }",
      ]),
      figureCaption("Fig. 6.  RAG Ingestion Pipeline Flowchart."),
      blank(),

      h3("4.7.2  Retrieval and Reranking"),
      para("At query time, the user's message is expanded with intent hints and embedded. A pgvector cosine similarity search retrieves the top-N candidates. These candidates are reranked using a hybrid score combining vector similarity, keyword token overlap, recency decay, and an SEC filing relevance boost.", { noIndent: true }),
      blank(80),
      ...diagramBox("Fig. 14 — RAG Retrieval and Rerank Flow", [
        "User Query",
        "  -> Query expansion  (intent hints appended)",
        "  -> Embed query  (Gemini / hash fallback)",
        "  -> match_documents()  [pgvector cosine similarity, top-20]",
        "  -> Metadata filter  (ticker, source type)",
        "  -> Hybrid reranking:",
        "     Score = 0.55 * S_vector + 0.20 * S_keyword",
        "           + 0.10 * S_recency + 0.15 * S_secBoost",
        "  -> Select top-5 documents",
        "  -> Inject into system prompt as [Source N] citations",
      ]),
      figureCaption("Fig. 14.  RAG Retrieval and Reranking Flow."),
      blank(),
      tableCaption("Table VIII:  RAG Retrieval Scoring Components"),
      makeTable(
        ["Component", "Symbol", "Weight", "Description"],
        [
          ["Vector Similarity", "S_vector", "0.55", "Cosine similarity from pgvector nearest-neighbor search"],
          ["Keyword Overlap", "S_keyword", "0.20", "Token-level overlap between expanded query and document"],
          ["Recency Decay", "S_recency", "0.10", "Exponential decay based on document age in days"],
          ["SEC Filing Boost", "S_secBoost", "0.15", "Additional weight for SEC filings on regulatory queries"],
        ],
        [2000, 1400, 900, 5060]
      ),
      blank(200),

      h2("4.8  Algorithm Design"),
      paraFirst("Portfolio performance metrics use standard financial formulas applied to live-enriched holding data:"),
      ...codeBlock([
        "  Unrealized PnL  =  (currentPrice - averageBuyPrice) x quantity",
        "  PnL %           =  PnL / (averageBuyPrice x quantity) x 100",
        "",
        "  Total Portfolio Value  =  SUM(currentPrice_i x quantity_i)  +  cashBalance",
        "",
        "  Sector Weight (s)  =  SUM(value_i : sector_i = s) / totalValue  x  100",
      ]),
      para("The RAG hybrid reranking score is computed as a weighted linear combination:"),
      ...codeBlock([
        "  Score = 0.55 * S_vector  +  0.20 * S_keyword",
        "        + 0.10 * S_recency  +  0.15 * S_secBoost",
        "",
        "  S_recency  =  exp( -lambda * age_days )   [lambda = 0.05]",
      ]),
      blank(),
      pageBreak(),

      // ══════════════════════════════════════════════════════════════════════
      // CHAPTER 5: IMPLEMENTATION
      // ══════════════════════════════════════════════════════════════════════
      h1("Chapter 5: Implementation"),

      h2("5.1  Project Setup and Repository Structure"),
      paraFirst("The repository separates concerns across four top-level directories: app/ for Next.js pages and API routes, server/ for Hono modules and services, components/ for shared UI components, and lib/ for utilities and configuration."),
      ...codeBlock([
        "wealthflow/",
        "|-- app/",
        "|   |-- api/[...route]/route.ts      # Next.js -> Hono adapter",
        "|   +-- dashboard/",
        "|       |-- chat/page.tsx",
        "|       |-- portfolio/page.tsx",
        "|       |-- simulator/page.tsx",
        "|       +-- news/page.tsx",
        "|-- server/",
        "|   |-- modules/",
        "|   |   |-- advisor/   (controller.ts, service.ts, routes.ts)",
        "|   |   |-- trading/   (controller.ts, service.ts, routes.ts)",
        "|   |   |-- portfolio/ (controller.ts, service.ts, routes.ts)",
        "|   |   |-- news/      (controller.ts, service.ts, routes.ts)",
        "|   |   +-- rag/       (controller.ts, service.ts, routes.ts)",
        "|   +-- lib/ (auth.ts, redis.ts, prisma.ts, finnhub.ts)",
        "|-- components/",
        "|   |-- ui/            (shadcn/ui base components)",
        "|   |-- chat/          (ChatInterface, ChatSidebar, MessageBubble)",
        "|   +-- charts/        (PortfolioChart, CandleChart)",
        "+-- lib/ (utils.ts, api-client.ts)",
      ]),

      h2("5.2  Hono Integration with Next.js"),
      paraFirst("The core integration between Next.js and Hono is the catch-all API route. All HTTP methods are delegated to the Hono application via the handle() adapter from hono/vercel."),
      ...codeBlock([
        "// app/api/[...route]/route.ts",
        "import app from '@/server';",
        "import { handle } from 'hono/vercel';",
        "",
        "export const runtime = 'nodejs';",
        "export const GET    = handle(app);",
        "export const POST   = handle(app);",
        "export const PUT    = handle(app);",
        "export const DELETE = handle(app);",
        "export const PATCH  = handle(app);",
      ]),

      h2("5.3  Authentication Implementation"),
      paraFirst("Better Auth is initialized with the Prisma adapter. The auth instance exposes REST endpoints at /api/auth/* and a server-side getSession() method used within Hono middleware. Next.js middleware calls the auth API before any dashboard route is served."),
      ...codeBlock([
        "// server/lib/auth.ts",
        "import { betterAuth } from 'better-auth';",
        "import { prismaAdapter } from 'better-auth/adapters/prisma';",
        "",
        "export const auth = betterAuth({",
        "  database: prismaAdapter(prisma, { provider: 'postgresql' }),",
        "  emailAndPassword: { enabled: true },",
        "});",
        "",
        "// middleware.ts",
        "export async function middleware(request: NextRequest) {",
        "  const session = await auth.api.getSession({",
        "    headers: request.headers",
        "  });",
        "  if (!session) {",
        "    return NextResponse.redirect(",
        "      new URL('/sign-in', request.url)",
        "    );",
        "  }",
        "  return NextResponse.next();",
        "}",
        "export const config = { matcher: ['/dashboard/:path*'] };",
      ]),

      h2("5.4  AI Advisor and Chat Streaming"),
      paraFirst("The AI advisor builds a multi-section system prompt including: (1) a compliance and tone preamble, (2) the user's investor profile, (3) live portfolio holdings enriched with quotes, and (4) RAG-retrieved documents with citations. Responses are streamed via SSE using a ReadableStream forwarding token chunks from the Groq SDK."),
      blank(80),
      ...diagramBox("Fig. 5 — AI Advisor Streaming Sequence", [
        "UI  ->  POST /api/advisor/chat/stream  { message, sessionId }",
        "    ->  AdvisorController",
        "    ->  AdvisorService.buildSystemPrompt()",
        "          +-- fetch InvestorProfile from DB",
        "          +-- fetch Portfolio + live quotes (Redis-cached)",
        "          +-- RAG.search(query)  -> top-5 reranked documents",
        "    ->  Groq.chat.completions.create({ stream: true })",
        "    <-  SSE: { type: 'chunk', content: '...' }  (repeated)",
        "    <-  SSE: { type: 'done' }",
        "    ->  Persist AiChatMessage (role: MODEL, sources: [...])",
      ]),
      figureCaption("Fig. 5.  AI Advisor Streaming Sequence Diagram."),
      blank(),
      ...codeBlock([
        "// server/modules/advisor/controller.ts (streaming endpoint)",
        "const stream = new ReadableStream({",
        "  async start(controller) {",
        "    const encode = (data: string) =>",
        "      new TextEncoder().encode(data + '\\n\\n');",
        "",
        "    const result = await advisorService.sendMessageStream(",
        "      userId, sessionId, userMessage",
        "    );",
        "    for await (const chunk of result.stream) {",
        "      const content = chunk.choices[0]?.delta?.content || '';",
        "      if (content) {",
        "        controller.enqueue(encode(",
        "          `data: ${JSON.stringify({ type: 'chunk', content })}`",
        "        ));",
        "      }",
        "    }",
        "    controller.enqueue(",
        "      encode(`data: ${JSON.stringify({ type: 'done' })}`)  ",
        "    );",
        "    controller.close();",
        "  }",
        "});",
        "return new Response(stream, {",
        "  headers: {",
        "    'Content-Type': 'text/event-stream',",
        "    'Cache-Control': 'no-cache'",
        "  }",
        "});",
      ]),

      h3("5.4.1  System Prompt Construction"),
      para("The advisor service constructs the system prompt dynamically for each request. If the investor profile is incomplete, the prompt is replaced with a short instruction asking the user to complete their profile, preventing the model from assuming risk tolerance or investment goals.", { noIndent: true }),
      ...codeBlock([
        "// server/modules/advisor/service.ts (simplified)",
        "if (!hasInvestorProfile) {",
        "  systemPrompt = PROFILE_COMPLETION_PROMPT;",
        "} else {",
        "  systemPrompt = BASE_SYSTEM_PROMPT",
        "    + buildProfileSection(investorProfile)",
        "    + buildPortfolioSection(holdings)",
        "    + buildRagSection(ragDocuments);",
        "}",
      ]),

      h2("5.5  RAG Ingestion and Retrieval"),
      paraFirst("The RAG service coordinates fetching from Finnhub, the Gemini embedding API, and external SEC endpoints, then normalizes, chunks, embeds, and stores the resulting documents. The pgvector SQL table is initialized with the following schema:"),
      ...codeBlock([
        "-- Appendix C: RAG SQL Initialization",
        "CREATE EXTENSION IF NOT EXISTS vector;",
        "",
        "CREATE TABLE IF NOT EXISTS document_embeddings (",
        "  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),",
        "  content       TEXT NOT NULL,",
        "  embedding     VECTOR(768),",
        "  metadata      JSONB DEFAULT '{}'::jsonb,",
        "  document_type VARCHAR(50),",
        "  source_url    TEXT,",
        "  created_at    TIMESTAMP DEFAULT NOW()",
        ");",
        "",
        "CREATE INDEX ON document_embeddings",
        "  USING ivfflat (embedding vector_cosine_ops)",
        "  WITH (lists = 100);",
      ]),
      ...codeBlock([
        "// Chunking strategy",
        "const splitter = new RecursiveCharacterTextSplitter({",
        "  chunkSize: 1000,",
        "  chunkOverlap: 200,",
        "});",
        "",
        "// Embedding generation",
        "const model = genAI.getGenerativeModel(",
        "  { model: 'text-embedding-004' }",
        ");",
        "const result = await model.embedContent(chunk);",
        "const embedding = result.embedding.values;  // float32[768]",
        "",
        "// pgvector insertion via Prisma $executeRaw",
        "await prisma.$executeRaw`",
        "  INSERT INTO document_embeddings",
        "    (content, embedding, metadata, document_type)",
        "  VALUES (${chunk}, ${embedding}::vector,",
        "          ${metadata}::jsonb, ${docType})`,",
      ]),

      h2("5.6  Trading Simulator Implementation"),
      paraFirst("The simulator checks market status before executing any trade. If the market is closed, the trade is stored with pending=true. A background scheduler running at startup checks for pending orders and executes them if markets have opened. The order lifecycle is depicted in Fig. 7."),
      blank(80),
      ...diagramBox("Fig. 7 — Trading Simulator Order Lifecycle", [
        "Order Submitted  ->  Is market open?",
        "                     Yes  ->  Execute immediately at live price",
        "                     No   ->  Store as pending  (pending = true)",
        "",
        "Market Opens  ->  Scheduler fetches all pending orders",
        "              ->  Fetch live quote for each pending order",
        "              ->  Execute trade at current market price",
        "              ->  Delete pending record",
        "              ->  Update holding + balance + create snapshot",
      ]),
      figureCaption("Fig. 7 and Fig. 13.  Trading Simulator Order Lifecycle and Pending Order Processing Flow."),
      blank(),
      ...codeBlock([
        "// server/modules/trading/service.ts",
        "async executeTrade(userId, { symbol, type, quantity }) {",
        "  const quote      = await marketService.getQuote(symbol);",
        "  const marketOpen = await marketService.isMarketOpen();",
        "",
        "  if (!marketOpen) {",
        "    return prisma.simulatorTransaction.create({",
        "      data: { profileId, assetId, type,",
        "              quantity, pricePerUnit: quote.c,",
        "              pending: true }",
        "    });",
        "  }",
        "  // Execute immediately via Prisma transaction",
        "  const cost = quote.c * quantity;",
        "  await prisma.$transaction([",
        "    updateBalance(profileId, type === 'BUY' ? -cost : +cost),",
        "    upsertHolding(profileId, assetId, quantity, quote.c, type),",
        "    createTransaction(profileId, assetId, type, quantity, quote.c),",
        "  ]);",
        "}",
      ]),

      h2("5.7  Portfolio Analytics Implementation"),
      paraFirst("The portfolio overview endpoint fetches all holdings, enriches each with a live Finnhub quote (Redis-cached at 15 s TTL), and computes unrealized PnL and sector allocation."),
      ...codeBlock([
        "// server/modules/portfolio/service.ts",
        "const enrichedHoldings = await Promise.all(",
        "  holdings.map(async (h) => {",
        "    const quote = await marketService.getQuote(h.asset.symbol);",
        "    const currentPrice = quote?.c ?? h.averageBuyPrice;",
        "    const totalValue   = currentPrice * Number(h.quantity);",
        "    const pnl    = (currentPrice - Number(h.averageBuyPrice))",
        "                   * Number(h.quantity);",
        "    const pnlPct = pnl / (Number(h.averageBuyPrice)",
        "                   * Number(h.quantity)) * 100;",
        "    return { ...h, currentPrice, totalValue, pnl, pnlPct };",
        "  })",
        ");",
      ]),
      blank(80),
      tableCaption("Table IX:  Redis Cache Key TTL Configuration"),
      makeTable(
        ["Cache Key Pattern", "TTL", "Rationale"],
        [
          ["quote:{symbol}", "15 s", "Near real-time pricing without exhausting free-tier quota"],
          ["candles:{symbol}:{res}", "5 min", "Historical OHLCV data is stable within short windows"],
          ["profile:{symbol}", "24 h", "Company profiles rarely change; single fetch per day"],
          ["news:search:{q}", "1 h", "News queries are expensive; results remain relevant"],
        ],
        [2600, 1000, 5760]
      ),
      blank(200),

      h2("5.8  Market News and Data Integration"),
      paraFirst("The news service uses Alpha Vantage as primary source (with sentiment scoring) and Finnhub as a fallback. When both providers fail in development, a synthetic data layer generates placeholder articles to keep the UI functional. Personalized feeds combine the user's portfolio holding symbols and watchlist symbols into targeted news queries (Fig. 11)."),
      blank(80),
      ...diagramBox("Fig. 11 — News Personalization Flow", [
        "User Request  ->  GET /api/news/personalized",
        "  ->  Fetch holding symbols  (portfolioId -> assets)",
        "  ->  Fetch watchlist symbols",
        "  ->  Deduplicate symbol list",
        "  ->  AlphaVantage.getNewsSentiment({ tickers: symbol })",
        "         [fallback: Finnhub.getCompanyNews()]",
        "  ->  Merge + sort by publishedAt DESC",
        "  <-  Personalized feed  (articles with sentiment badges)",
      ]),
      figureCaption("Fig. 11.  Market News Personalization Flow."),
      blank(),
      pageBreak(),

      // ── UI Screenshots ───────────────────────────────────────────────────
      h2("5.9  UI Screenshots and Interface Design"),
      paraFirst("The following subsections document the expected visual output of each primary view in WealthFlow. Captures should be taken from the running application at the routes indicated. Each placeholder describes precisely which elements must be visible in the final screenshot."),
      blank(),

      h3("5.9.1  Dashboard Home  (/dashboard)"),
      ...screenshotBox("/dashboard", "Main landing page after successful authentication — provides a summary of all modules.", [
        "Top navigation bar: WealthFlow wordmark, user avatar with session drop-down.",
        "Left sidebar: module links (AI Advisor, Portfolio, Simulator, News, Learning) with active-state highlight.",
        "Center panel: Portfolio value summary card (total value, daily change %, unrealized PnL).",
        "Recent news widget: last three personalized articles with sentiment badges (Bullish / Bearish / Neutral).",
        "Quick-access action buttons: 'Ask Advisor', 'Start Simulator', 'View Portfolio'.",
        "Dark / light mode toggle active at top-right corner.",
      ]),

      h3("5.9.2  AI Advisor  (/dashboard/chat)"),
      ...screenshotBox("/dashboard/chat", "Conversational AI advisor interface with streaming output and RAG source citations.", [
        "Left panel: session list with previous conversations (title, relative timestamp).",
        "'New Chat' button at top of session list creates a fresh session.",
        "Center panel: chat messages in alternating user / AI bubbles.",
        "AI message bubbles render full Markdown including code blocks, tables, and lists.",
        "Source citations displayed below each AI response as collapsible accordion pills (document type, ticker, date).",
        "Bottom input bar: multi-line text field, send button; animated typing indicator while AI streams.",
        "Investor profile completion prompt shown inline when profile is empty.",
      ]),

      h3("5.9.3  Portfolio Overview  (/dashboard/portfolio)"),
      ...screenshotBox("/dashboard/portfolio", "Real holdings dashboard with live pricing, PnL, and sector analytics.", [
        "Summary cards row: Total Portfolio Value, Unrealized PnL (color-coded green/red), Cash Balance.",
        "Holdings table: Symbol | Company Name | Quantity | Avg Buy Price | Current Price | PnL | PnL% — sortable columns, PnL colored.",
        "Sector allocation donut chart (Recharts) — each sector assigned a distinct neutral color.",
        "Portfolio performance line chart — value over the past 30 days from daily snapshots.",
        "'Add Holding' modal: ticker search autocomplete, quantity, average purchase price, submit.",
        "Last-updated timestamp and manual refresh button visible beneath the holdings table.",
      ]),

      h3("5.9.4  Trading Simulator  (/dashboard/simulator)"),
      ...screenshotBox("/dashboard/simulator", "Virtual portfolio with paper trading, candlestick charts, and watchlist management.", [
        "Summary cards: Virtual Balance, Simulated Portfolio Value, Total Return %.",
        "Tab bar: Portfolio | Trade | Research | Watchlist — each tab persists state.",
        "Trade tab: symbol search, BUY / SELL toggle, quantity field, estimated cost preview, Execute button.",
        "Portfolio tab: simulated holdings table identical in structure to real portfolio with PnL coloring.",
        "Pending Orders badge visible when market is closed — lists queued orders with symbol, type, and target price.",
        "Candlestick OHLCV chart rendered for the selected symbol (Recharts) — time range selector.",
        "Watchlist tab: symbol + optional price alert target input; list shows current price vs alert with status indicator.",
      ]),

      h3("5.9.5  Market News  (/dashboard/news)"),
      ...screenshotBox("/dashboard/news", "Personalized and general market news feed with sentiment classification.", [
        "Two-column layout: 'For You' (personalized based on holdings) and 'Market Headlines'.",
        "Each news card: source name, headline, sentiment badge (Bullish / Bearish / Neutral in neutral palette), relative time.",
        "Filter bar above each column: All | Bullish | Bearish | Neutral.",
        "Trending Stocks sidebar widget: ranked tickers with price delta and percentage change.",
        "Earnings Calendar widget: upcoming earnings for portfolio holdings (date, symbol, consensus EPS estimate).",
        "Article cards link to external source URLs (opens in new browser tab).",
      ]),

      blank(),
      pageBreak(),

      // ══════════════════════════════════════════════════════════════════════
      // CHAPTER 6: TESTING
      // ══════════════════════════════════════════════════════════════════════
      h1("Chapter 6: Testing and Evaluation"),

      h2("6.1  Testing Strategy"),
      paraFirst("Testing for WealthFlow followed a pragmatic validation strategy appropriate for an academic prototype. Given the API-driven, integration-heavy nature of the system, the focus was on end-to-end validation of key integration points rather than isolated unit tests. The strategy comprised: API smoke tests for the RAG pipeline, manual UI verification of all primary workflows, security validation of authentication enforcement, and performance observation of Redis caching behavior. Formal automated unit and integration test suites are identified as future work."),

      h2("6.2  API Smoke Tests"),
      paraFirst("A PowerShell-based smoke test script validates the RAG ingestion pipeline end-to-end. It verifies API reachability, triggers ingestion for a test ticker, polls for completion status, and executes a semantic search query to confirm retrieval quality."),
      ...codeBlock([
        "# RAG Smoke Test (PowerShell)",
        "$BaseUrl = 'http://localhost:3000'",
        "$Ticker  = 'AAPL'",
        "",
        "# Step 1: Verify API reachability",
        "$ping = Invoke-RestMethod -Uri \"$BaseUrl/api/health\"",
        "Write-Host \"API Status: $($ping.status)\"",
        "",
        "# Step 2: Trigger ingestion",
        "Invoke-RestMethod -Method Post `",
        "  -Uri \"$BaseUrl/api/rag/ingest/$Ticker\"",
        "",
        "# Step 3: Poll for ingestion status",
        "$status = Invoke-RestMethod `",
        "  -Uri \"$BaseUrl/api/rag/ingest/status/$Ticker\"",
        "Write-Host \"Chunks inserted: $($status.chunksTotal)\"",
        "",
        "# Step 4: Execute semantic search",
        "$results = Invoke-RestMethod -Method Post `",
        "  -Uri \"$BaseUrl/api/rag/search\" `",
        "  -Body (@{ query='AAPL risk factors'; ticker='AAPL' }",
        "         | ConvertTo-Json)",
        "Write-Host \"Top result type: $($results[0].document_type)\"",
      ]),
      para("Representative smoke test output:"),
      ...codeBlock([
        "=== WealthFlow RAG Smoke Test ===",
        "API Status: OK",
        "Ingestion triggered for AAPL",
        "Chunks inserted: 34  (profile: 4, news: 12, financials: 8, sec: 10)",
        "Top result: sec_filing | form=10-K | section=Item 1A",
        "Similarity score: 0.87",
        "Status: PASSED",
      ]),

      h2("6.3  Manual UI Verification"),
      blank(80),
      tableCaption("Table X:  Manual UI Verification Checklist"),
      makeTable(
        ["Feature", "Test Action", "Expected Result", "Status"],
        [
          ["Chat Streaming", "Send message to advisor", "Tokens appear incrementally via SSE", "PASSED"],
          ["Chat History", "Navigate to prior session", "Messages load in correct order", "PASSED"],
          ["Portfolio Refresh", "Open /portfolio page", "Holdings display with live PnL figures", "PASSED"],
          ["Simulator Trade (open mkt)", "Submit BUY during market hours", "Holdings updated immediately", "PASSED"],
          ["Simulator Trade (closed mkt)", "Submit SELL outside market hours", "Pending order stored; executed on open", "PASSED"],
          ["Auth Guard — page", "Access /dashboard without session", "Redirect to /sign-in", "PASSED"],
          ["Auth Guard — API", "Call /api/portfolio without cookie", "HTTP 401 returned by Hono middleware", "PASSED"],
          ["News Feed", "Open /dashboard/news", "Personalized + general feed populated", "PASSED"],
          ["RAG Citations", "Ask advisor about a portfolio holding", "Source citations listed below AI response", "PASSED"],
          ["Investor Profile", "Submit profile form", "Advisor incorporates risk tolerance in next prompt", "PASSED"],
        ],
        [2000, 2200, 2800, 1360]
      ),
      blank(200),

      h2("6.4  Performance Evaluation"),
      paraFirst("Redis caching was validated by observing provider call frequency under repeated quote requests. With a 15 second TTL on quote keys, repeated requests for the same symbol within the window resulted in zero additional Finnhub API calls."),
      blank(80),
      tableCaption("Table XI:  Observed Cache Effectiveness"),
      makeTable(
        ["Cache Key", "TTL", "Cache Hit Rate (Observed)", "Provider Calls Saved"],
        [
          ["quote:{symbol}", "15 s", "> 90% under repeated dashboard loads", "~8 calls/min per symbol"],
          ["candles:{symbol}:{res}", "5 min", "> 95% on chart re-renders", "~12 calls per chart reload"],
          ["profile:{symbol}", "24 h", "~100% after first fetch", "All subsequent calls"],
          ["news:search:{q}", "1 h", "> 80% on identical queries", "~6 provider calls/hour per query"],
        ],
        [2200, 900, 3000, 3260]
      ),
      blank(200),

      h2("6.5  Bug Fixes and Debugging Summary"),
      paraFirst("Several bugs were identified and resolved during implementation and testing:"),
      bullet("Chat history not loading: fixed missing sessionId propagation in useEffect dependency array in ChatSidebar component."),
      bullet("Duplicate AI responses: added pending flag to prevent double submission on rapid Enter key presses."),
      bullet("Auto-scroll drift: replaced scrollTop manipulation with scrollIntoView({ behavior: 'smooth' }) on message container ref."),
      bullet("Markdown rendering: added react-markdown with remark-gfm for proper rendering of lists, code blocks, and tables in chat bubbles."),
      bullet("Session selection instability: fixed race condition between session list refetch and active session state update."),
      bullet("RAG ingestion cooldown: added timestamp check to skip re-ingestion if last ingestion for a ticker is less than six hours old."),
      blank(),
      pageBreak(),

      // ══════════════════════════════════════════════════════════════════════
      // CHAPTER 7: CONCLUSION
      // ══════════════════════════════════════════════════════════════════════
      h1("Chapter 7: Conclusion and Future Work"),

      h2("7.1  Project Achievements"),
      paraFirst("WealthFlow successfully demonstrates a cohesive, production-viable reference architecture for AI-augmented financial platforms. The system delivers all primary functional requirements: a streaming AI advisor grounded in retrieved evidence, a real-time portfolio dashboard with live PnL and sector analytics, a fully functional trading simulator with pending order support, and a personalized news feed. The implementation proves that combining modern LLM inference, RAG-based retrieval, and real-time financial APIs is feasible within an academic project scope and standard free-tier service quotas."),
      para("The platform's modular architecture — with clear boundaries between Hono modules, the Prisma data layer, and React components — means each subsystem can be independently tested, replaced, or extended. This distinguishes WealthFlow from monolithic demo applications and makes it a viable starting point for production development."),

      h2("7.2  Lessons Learned"),
      bullet("RAG quality is directly proportional to the quality and diversity of ingested documents. Investing in robust ingestion pipelines (chunking strategy, metadata tagging, source diversity) yields better retrieval quality than tuning similarity thresholds alone."),
      bullet("Streaming responses via SSE dramatically improve perceived responsiveness for LLM-driven interfaces. Users consistently preferred the streaming experience over waiting for a complete response."),
      bullet("Caching is non-optional for API-driven fintech systems. Without Redis TTL-based caching, the application exhausts free-tier rate limits within minutes of moderate use."),
      bullet("TypeScript end-to-end (Prisma schema → Hono controllers → SWR hooks) eliminates an entire class of runtime type errors that would otherwise only surface in production."),
      bullet("Authentication must be enforced at multiple layers. Relying solely on Next.js middleware is insufficient; Hono middleware provides defense-in-depth for the API boundary."),
      blank(),

      h2("7.3  Limitations"),
      bullet("The learning hub module is primarily UI scaffolding and lacks a dynamic content pipeline for ingesting and serving educational articles."),
      bullet("Embeddings depend on the Gemini API. The local hash-based fallback provides basic similarity but lacks semantic quality, limiting RAG effectiveness in offline development."),
      bullet("API rate limits constrain the number of unique symbols that can be simultaneously tracked on free tiers; a paid Finnhub subscription is required for production-scale usage."),
      bullet("No automated unit or integration test suite exists. Manual smoke tests provide coverage of critical paths but are insufficient for CI/CD pipelines."),
      bullet("Sector allocation uses exchange as a proxy for GICS sector — an approximation that would require an additional data source to resolve correctly."),
      blank(),

      h2("7.4  Future Enhancements"),
      bullet("Automated LLM Evaluation: implement RAGAS or a comparable framework to evaluate RAG faithfulness, answer relevance, and context recall against a curated test set."),
      bullet("Portfolio Optimization: integrate Markowitz mean-variance optimization or Black-Litterman model to generate data-driven allocation recommendations."),
      bullet("Chat History Summarization: implement rolling summarization of long chat sessions to manage LLM context window limits without losing conversational continuity."),
      bullet("Dynamic Learning Module: build a content ingestion pipeline that processes financial concepts into structured articles indexed in pgvector for RAG retrieval."),
      bullet("Real-Time WebSocket Quotes: replace polling-based refresh with WebSocket connections to Finnhub for true real-time price updates."),
      bullet("Automated Testing Suite: implement Jest unit tests for service functions and Playwright E2E tests for critical user workflows."),
      blank(),

      h2("7.5  Research Opportunities"),
      bullet("Evaluate the impact of hybrid semantic-symbolic retrieval (pgvector similarity combined with knowledge graph traversal) on financial question-answering accuracy."),
      bullet("Study the effect of investor profile personalization on LLM response quality and user trust in AI-driven financial advice systems."),
      bullet("Compare the factual accuracy of RAG-augmented financial advisors against parametric-knowledge-only models on a standardized financial reasoning benchmark."),
      blank(),
      pageBreak(),

      // ══════════════════════════════════════════════════════════════════════
      // REFERENCES
      // ══════════════════════════════════════════════════════════════════════
      h1("References"),
      ...[
        "[1]\tVercel, \"Next.js Documentation,\" 2026. [Online]. Available: https://nextjs.org/docs",
        "[2]\tMeta, \"React Documentation,\" 2026. [Online]. Available: https://react.dev",
        "[3]\tHono, \"Hono — Ultrafast Web Framework,\" 2026. [Online]. Available: https://hono.dev",
        "[4]\tSupabase, \"Supabase PostgreSQL Platform,\" 2026. [Online]. Available: https://supabase.com",
        "[5]\tPrisma, \"Prisma ORM Documentation,\" 2026. [Online]. Available: https://www.prisma.io/docs",
        "[6]\tBetter Auth, \"Better Auth Documentation,\" 2026. [Online]. Available: https://better-auth.com",
        "[7]\tGroq, \"Groq API Documentation,\" 2026. [Online]. Available: https://console.groq.com/docs",
        "[8]\tPGVector, \"pgvector Extension for PostgreSQL,\" 2026. [Online]. Available: https://github.com/pgvector/pgvector",
        "[9]\tPostgreSQL Global Development Group, \"PostgreSQL Documentation,\" 2026. [Online]. Available: https://www.postgresql.org/docs",
        "[10]\tBetterment, \"Betterment Robo-Advisors Overview,\" 2026. [Online]. Available: https://www.betterment.com",
        "[11]\tWealthfront, \"Wealthfront Portfolio Automation,\" 2026. [Online]. Available: https://www.wealthfront.com",
        "[12]\tP. Lewis et al., \"Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks,\" in Advances in Neural Information Processing Systems, vol. 33, 2020, pp. 9459–9474.",
        "[13]\tGoogle, \"Gemini API and Embeddings Documentation,\" 2026. [Online]. Available: https://ai.google.dev",
        "[14]\tUpstash, \"Upstash Redis Documentation,\" 2026. [Online]. Available: https://upstash.com/docs/redis",
        "[15]\tFinnhub, \"Finnhub Market Data API,\" 2026. [Online]. Available: https://finnhub.io/docs/api",
        "[16]\tAlpha Vantage, \"Alpha Vantage API Documentation,\" 2026. [Online]. Available: https://www.alphavantage.co/documentation/",
        "[17]\tSWR, \"SWR React Hooks for Data Fetching,\" 2026. [Online]. Available: https://swr.vercel.app",
        "[18]\tZod, \"Zod Schema Validation,\" 2026. [Online]. Available: https://zod.dev",
        "[19]\tFramer Motion, \"Framer Motion Documentation,\" 2026. [Online]. Available: https://www.framer.com/motion/",
        "[20]\tTailwind CSS, \"Tailwind CSS Documentation,\" 2026. [Online]. Available: https://tailwindcss.com/docs",
        "[21]\tMDN Web Docs, \"Server-Sent Events,\" 2026. [Online]. Available: https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events",
        "[22]\tLangChain, \"Text Splitters Documentation,\" 2026. [Online]. Available: https://js.langchain.com/docs/modules/data_connection/document_transformers",
      ].map(ref => {
        const tabIdx = ref.indexOf("\t");
        const num = ref.substring(0, tabIdx);
        const body = ref.substring(tabIdx + 1);
        return new Paragraph({
          spacing: { after: 100 },
          indent: { left: 600, hanging: 600 },
          children: [
            new TextRun({ text: num + "  ", size: SIZE_BODY, font: FONT_BODY }),
            new TextRun({ text: body, size: SIZE_BODY, font: FONT_BODY })
          ]
        });
      }),
      blank(),
      pageBreak(),

      // ══════════════════════════════════════════════════════════════════════
      // APPENDICES
      // ══════════════════════════════════════════════════════════════════════
      h1("Appendix A: Installation and Configuration Guide"),

      h2("A.1  Prerequisites"),
      bullet("Node.js >= 18.x or Bun >= 1.x runtime"),
      bullet("Supabase PostgreSQL instance with the pgvector extension enabled"),
      bullet("Upstash Redis instance (free tier sufficient for development)"),
      bullet("API keys: Groq, Google Gemini, Finnhub, Alpha Vantage"),
      blank(),

      h2("A.2  Installation Steps"),
      ...codeBlock([
        "# 1. Install all dependencies",
        "npm install",
        "",
        "# 2. Copy and populate environment file",
        "cp .env.example .env",
        "",
        "# Required variables in .env:",
        "DATABASE_URL=postgresql://user:pass@host:5432/wealthflow",
        "DIRECT_URL=postgresql://user:pass@host:5432/wealthflow",
        "BETTER_AUTH_SECRET=<32-character random string>",
        "BETTER_AUTH_URL=http://localhost:3000",
        "NEXT_PUBLIC_API_URL=http://localhost:3000",
        "GROQ_API_KEY=<your_groq_api_key>",
        "GEMINI_API_KEY=<your_gemini_api_key>",
        "FINNHUB_API_KEY=<your_finnhub_api_key>",
        "ALPHA_VANTAGE_API_KEY=<your_alpha_vantage_key>",
        "UPSTASH_REDIS_REST_URL=<upstash_endpoint>",
        "UPSTASH_REDIS_REST_TOKEN=<upstash_token>",
        "",
        "# 3. Generate Prisma client and run migrations",
        "npm run prisma:generate",
        "npm run prisma:migrate",
        "",
        "# 4. Initialize pgvector in Supabase SQL Editor",
        "#    (see Appendix C for SQL)",
        "",
        "# 5. Start the development server",
        "npm run dev",
      ]),
      pageBreak(),

      h1("Appendix B: Complete API Endpoint Reference"),
      blank(80),
      tableCaption("Table XII:  Full API Endpoint Reference"),
      makeTable(
        ["Method", "Endpoint", "Description", "Auth"],
        [
          ["POST", "/api/advisor/chat/stream", "Stream AI advisor response via SSE", "Yes"],
          ["POST", "/api/advisor/chat", "Non-streaming advisor response", "Yes"],
          ["GET",  "/api/advisor/sessions", "List all chat sessions", "Yes"],
          ["POST", "/api/advisor/sessions", "Create new session", "Yes"],
          ["GET",  "/api/advisor/sessions/:id", "Get session with full message history", "Yes"],
          ["DELETE", "/api/advisor/sessions/:id", "Delete session and messages", "Yes"],
          ["GET",  "/api/advisor/investor-profile", "Retrieve investor profile", "Yes"],
          ["PUT",  "/api/advisor/investor-profile", "Create or update investor profile", "Yes"],
          ["POST", "/api/trading/simulator/initialize", "Create simulator (100k virtual balance)", "Yes"],
          ["GET",  "/api/trading/simulator/profile", "Get simulator profile + holdings", "Yes"],
          ["POST", "/api/trading/simulator/trade", "Execute or queue simulated trade", "Yes"],
          ["GET",  "/api/trading/simulator/holdings", "Holdings with live PnL", "Yes"],
          ["GET",  "/api/trading/simulator/history", "Transaction history with filters", "Yes"],
          ["POST", "/api/trading/simulator/snapshot", "Create daily snapshot", "Yes"],
          ["POST", "/api/trading/simulator/watchlist", "Add watchlist item + alert target", "Yes"],
          ["GET",  "/api/trading/simulator/watchlist", "Get watchlist items", "Yes"],
          ["GET",  "/api/trading/market/quote/:symbol", "Real-time market quote", "Yes"],
          ["GET",  "/api/trading/market/candles/:symbol", "OHLCV time-series candles", "Yes"],
          ["GET",  "/api/trading/market/search", "Symbol search (?q=query)", "Yes"],
          ["GET",  "/api/trading/market/profile/:symbol", "Company profile", "Yes"],
          ["GET",  "/api/portfolio/overview", "Portfolio summary with analytics", "Yes"],
          ["GET",  "/api/portfolio/performance", "Time-series performance (?days=30)", "Yes"],
          ["GET",  "/api/portfolio/insights", "Analyst recommendations + metrics", "Yes"],
          ["POST", "/api/portfolio/holdings", "Add holding to portfolio", "Yes"],
          ["PATCH", "/api/portfolio/holdings/:id", "Update holding quantity/price", "Yes"],
          ["DELETE", "/api/portfolio/holdings/:id", "Remove holding", "Yes"],
          ["GET",  "/api/news/market", "General market news by category", "Yes"],
          ["GET",  "/api/news/personalized", "Personalized news from holdings + watchlist", "Yes"],
          ["GET",  "/api/news/trending", "Trending stocks", "Yes"],
          ["GET",  "/api/news/earnings", "Earnings calendar for holdings", "Yes"],
          ["POST", "/api/rag/ingest/:ticker", "Ingest RAG data for a ticker", "Yes"],
          ["POST", "/api/rag/ingest", "Batch ingestion for multiple tickers", "Yes"],
          ["GET",  "/api/rag/ingest/status/:ticker", "Ingestion status per document type", "Yes"],
          ["POST", "/api/rag/search", "Vector similarity search with metadata filters", "Yes"],
        ],
        [900, 3200, 3200, 900]
      ),
      blank(),
      pageBreak(),

      h1("Appendix C: Database SQL Initialization"),
      ...codeBlock([
        "-- Enable pgvector extension (run once in Supabase SQL Editor)",
        "CREATE EXTENSION IF NOT EXISTS vector;",
        "",
        "-- RAG document store",
        "CREATE TABLE IF NOT EXISTS document_embeddings (",
        "  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),",
        "  content       TEXT NOT NULL,",
        "  embedding     VECTOR(768),",
        "  metadata      JSONB DEFAULT '{}'::jsonb,",
        "  document_type VARCHAR(50),",
        "  source_url    TEXT,",
        "  created_at    TIMESTAMP DEFAULT NOW(),",
        "  updated_at    TIMESTAMP DEFAULT NOW()",
        ");",
        "",
        "-- IVFFlat index for cosine similarity search",
        "-- (create after inserting at least ~1000 rows)",
        "CREATE INDEX ON document_embeddings",
        "  USING ivfflat (embedding vector_cosine_ops)",
        "  WITH (lists = 100);",
        "",
        "-- Similarity search helper function",
        "CREATE OR REPLACE FUNCTION match_documents(",
        "  query_embedding VECTOR(768),",
        "  match_count     INT DEFAULT 20",
        ")",
        "RETURNS TABLE (",
        "  id            UUID,",
        "  content       TEXT,",
        "  metadata      JSONB,",
        "  similarity    FLOAT",
        ")",
        "LANGUAGE SQL STABLE AS $$",
        "  SELECT",
        "    id,",
        "    content,",
        "    metadata,",
        "    1 - (embedding <=> query_embedding) AS similarity",
        "  FROM document_embeddings",
        "  ORDER BY embedding <=> query_embedding",
        "  LIMIT match_count;",
        "$$;",
      ]),
      blank(),
      pageBreak(),

      h1("Appendix D: Technology Stack Quick Reference"),
      blank(80),
      tableCaption("Table XIII:  Technology Stack Quick Reference"),
      makeTable(
        ["Technology", "Version", "Role", "License"],
        [
          ["Next.js", "15.x", "Frontend framework + serverless API runtime", "MIT"],
          ["React", "19.x", "UI component library", "MIT"],
          ["Hono", "4.x", "Backend API framework (edge-compatible)", "MIT"],
          ["Prisma ORM", "6.x", "Database schema management + type-safe queries", "Apache 2.0"],
          ["Supabase", "Cloud", "PostgreSQL hosting + pgvector extension", "Apache 2.0"],
          ["Better Auth", "1.x", "Session-based authentication + middleware", "MIT"],
          ["Groq SDK", "latest", "LLM inference — Llama 3.3 70B", "Apache 2.0"],
          ["Gemini API", "v1", "Text embedding generation (768 dimensions)", "Commercial"],
          ["Upstash Redis", "Cloud", "Serverless Redis cache with TTL policies", "Commercial"],
          ["SWR", "2.x", "Client-side data fetching, caching, revalidation", "MIT"],
          ["Recharts", "2.x", "Data visualization (portfolio + candlestick charts)", "MIT"],
          ["Tailwind CSS", "4.x", "Utility-first CSS framework", "MIT"],
          ["Zod", "3.x", "Runtime schema validation for API inputs", "MIT"],
          ["Framer Motion", "11.x", "UI animation library", "MIT"],
          ["Finnhub", "REST API", "Real-time market quotes, profiles, news", "Commercial"],
          ["Alpha Vantage", "REST API", "News sentiment data, earnings calendar", "Commercial"],
        ],
        [2000, 1000, 3500, 1500]
      ),
      blank(),
    ]
  }]
});

Packer.toBuffer(doc).then(buf => {
  fs.writeFileSync('WealthFlow_FYP_Report.docx', buf);
  console.log('Document written.');
}).catch(err => { console.error(err); process.exit(1); });