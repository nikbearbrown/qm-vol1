const fs = require('fs');
const path = require('path');

const booksDir = path.join(__dirname, '../public/books');

const modernStyle = `  <style>
    :root {
      /* Base Modern Variables */
      --bg: #F9FAFB;
      --text: #111827;
      --text-muted: #4B5563;
      --border: #E5E7EB;
      --primary: #C0392B;
      --secondary: #8B7536;
      --accent: #D4500A;
      --surface: #FFFFFF;
      --surface-hover: #F3F4F6;
      --table-stripe: rgba(0, 0, 0, 0.02);
      
      /* Maintain legacy variables for inline styles */
      --bb-1: var(--text);
      --bb-2: var(--text);
      --bb-3: var(--primary);
      --bb-4: var(--secondary);
      --bb-5: var(--accent);
      --bb-6: var(--text-muted);
      --bb-7: var(--border);
      --bb-8: var(--bg);
      
      --callout-warn-bg: rgba(192,57,43,0.05);
      --callout-note-bg: rgba(232,160,32,0.05);
      --callout-info-bg: #FFFFFF;
      --callout-critical-bg: rgba(192,57,43,0.08);
      
      --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
      --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
      --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
    }

    @media (prefers-color-scheme: dark) {
      :root {
        --bg: #030712;
        --text: #F9FAFB;
        --text-muted: #9CA3AF;
        --border: #1F2937;
        --primary: #E74C3C;
        --secondary: #F1C40F;
        --accent: #E67E22;
        --surface: #111827;
        --surface-hover: #1F2937;
        --table-stripe: rgba(255, 255, 255, 0.02);
        
        --callout-warn-bg: rgba(192,57,43,0.15);
        --callout-note-bg: rgba(232,160,32,0.15);
        --callout-info-bg: #1F2937;
        --callout-critical-bg: rgba(192,57,43,0.2);
        
        --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.5);
        --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.5);
        --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.5);
      }
    }

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      background-color: var(--bg);
      color: var(--text);
      line-height: 1.7;
      font-size: 16px;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      transition: background-color 0.3s, color 0.3s;
    }

    .page-wrapper {
      max-width: 960px;
      margin: 0 auto;
      padding: 64px 32px 96px;
    }

    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(24px); }
      to { opacity: 1; transform: translateY(0); }
    }

    /* ── COVER ── */
    .cover {
      background: var(--surface);
      border-radius: 16px;
      padding: 48px;
      margin-bottom: 64px;
      box-shadow: var(--shadow-lg);
      border: 1px solid var(--border);
      position: relative;
      overflow: hidden;
      animation: fadeUp 0.8s ease-out forwards;
    }

    .cover::before {
      content: '';
      position: absolute;
      top: 0; left: 0; right: 0; height: 6px;
      background: linear-gradient(90deg, var(--primary), var(--accent));
    }

    .cover-series {
      font-size: 12px;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      font-weight: 700;
      color: var(--text-muted);
      margin-bottom: 12px;
    }

    .cover h1 {
      font-size: 36px;
      font-weight: 800;
      letter-spacing: -0.02em;
      color: var(--text);
      line-height: 1.2;
      margin-bottom: 8px;
    }

    .cover h2 {
      font-size: 20px;
      font-weight: 400;
      color: var(--text-muted);
      margin-bottom: 24px;
    }

    .cover-meta { font-size: 14px; color: var(--text-muted); font-weight: 500; }

    .version-meta {
      display: inline-block;
      margin-top: 24px;
      font-size: 12px;
      font-weight: 600;
      color: var(--text-muted);
      background: var(--surface-hover);
      border: 1px solid var(--border);
      border-radius: 6px;
      padding: 6px 12px;
      letter-spacing: 0.05em;
    }

    /* ── TOC ── */
    .toc {
      background: var(--surface);
      border: 1px solid var(--border);
      border-left: 6px solid var(--primary);
      padding: 32px 40px;
      margin-bottom: 64px;
      border-radius: 8px 12px 12px 8px;
      box-shadow: var(--shadow-md);
      animation: fadeUp 0.8s ease-out 0.2s forwards;
      opacity: 0;
    }

    .toc h3 {
      font-size: 12px;
      letter-spacing: 0.15em;
      text-transform: uppercase;
      font-weight: 700;
      color: var(--text-muted);
      margin-bottom: 20px;
    }

    .toc-cols {
      display: grid;
      grid-template-columns: 1fr;
      gap: 16px 48px;
    }
    @media (min-width: 768px) {
      .toc-cols { grid-template-columns: 1fr 1fr; }
    }

    .toc ol { padding-left: 24px; }
    .toc li { margin-bottom: 8px; font-size: 15px; font-weight: 500; }
    .toc a { color: var(--text); text-decoration: none; transition: all 0.2s ease; display: inline-block; }
    .toc a:hover { color: var(--primary); transform: translateX(4px); }

    /* ── SECTIONS ── */
    .section { 
      margin-bottom: 80px; 
      opacity: 0;
      animation: fadeUp 0.8s ease-out forwards;
    }
    
    .section:nth-of-type(1) { animation-delay: 0.3s; }
    .section:nth-of-type(2) { animation-delay: 0.4s; }
    .section:nth-of-type(3) { animation-delay: 0.5s; }
    .section:nth-of-type(4) { animation-delay: 0.6s; }
    .section:nth-of-type(n+5) { animation-delay: 0.7s; }

    .section-number {
      display: inline-block;
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0.15em;
      text-transform: uppercase;
      color: white;
      background: var(--primary);
      padding: 4px 10px;
      border-radius: 4px;
      margin-bottom: 12px;
    }

    h2.section-title {
      font-size: 28px;
      font-weight: 800;
      letter-spacing: -0.02em;
      color: var(--text);
      border-bottom: 2px solid var(--border);
      padding-bottom: 12px;
      margin-bottom: 32px;
    }

    h3 { font-size: 20px; font-weight: 700; color: var(--text); margin: 40px 0 16px; letter-spacing: -0.01em; }

    h4 {
      font-size: 16px;
      color: var(--text);
      font-weight: 600;
      margin: 24px 0 12px;
    }

    p { margin-bottom: 16px; color: var(--text); }
    ul, ol { padding-left: 24px; margin-bottom: 16px; }
    ul li, ol li { margin-bottom: 8px; font-size: 16px; color: var(--text); }
    
    a { color: var(--primary); text-decoration: none; border-bottom: 1px solid transparent; transition: border-color 0.2s; }
    a:hover { border-bottom-color: var(--primary); }
    strong { font-weight: 700; color: var(--text); }

    /* ── TABLES ── */
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 15px;
      margin: 32px 0;
      background: var(--surface);
      border-radius: 8px;
      overflow: hidden;
      box-shadow: var(--shadow-sm);
      border: 1px solid var(--border);
    }

    th {
      background: var(--surface-hover);
      color: var(--text);
      padding: 14px 16px;
      text-align: left;
      font-size: 13px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      border-bottom: 2px solid var(--border);
    }

    td {
      padding: 14px 16px;
      border-bottom: 1px solid var(--border);
      vertical-align: top;
      color: var(--text);
    }

    tr:last-child td { border-bottom: none; }
    tr:nth-child(even) td { background: var(--table-stripe); }
    tr:hover td { background: var(--surface-hover); }

    /* ── CALLOUTS ── */
    .callout {
      padding: 20px 24px;
      border-radius: 8px;
      margin: 24px 0;
      font-size: 15px;
      box-shadow: var(--shadow-sm);
      border: 1px solid var(--border);
    }

    .callout-warn { background: var(--callout-warn-bg); border-left: 4px solid var(--primary); }
    .callout-note { background: var(--callout-note-bg); border-left: 4px solid var(--secondary); }
    .callout-info { background: var(--callout-info-bg); border-left: 4px solid var(--text-muted); }
    .callout-critical { background: var(--callout-critical-bg); border-left: 4px solid var(--primary); border-top: 2px solid var(--primary); }

    .callout strong { font-weight: 700; }
    .callout-critical strong { color: var(--primary); }

    /* ── THESIS BLOCK ── */
    .thesis-block {
      background: var(--text);
      color: var(--bg);
      padding: 36px 40px;
      border-radius: 12px;
      margin: 40px 0;
      box-shadow: var(--shadow-lg);
    }

    /* ── CHUNKS & PARTS ── */
    .chunk {
      background: var(--surface);
      border: 1px solid var(--border);
      padding: 24px;
      border-radius: 8px;
      margin-bottom: 24px;
      box-shadow: var(--shadow-sm);
      transition: all 0.3s;
    }
    
    .chunk:hover {
      box-shadow: var(--shadow-md);
      transform: translateY(-2px);
    }
    
    .part-title {
      font-size: 24px;
      font-weight: 800;
      color: var(--text);
      margin: 48px 0 24px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    
    .chapter-block {
      margin-bottom: 40px;
      padding: 24px;
      background: var(--surface);
      border-radius: 8px;
      border: 1px solid var(--border);
      box-shadow: var(--shadow-sm);
    }
  </style>`;

function updateFilesRecursively(dir) {
  const items = fs.readdirSync(dir);
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      updateFilesRecursively(fullPath);
    } else if (fullPath.endsWith('.html')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      // Match the <style>...</style> block
      // Use [\\s\\S] to match anything including newlines
      const styleRegex = /<style>[\s\S]*?<\/style>/i;
      
      if (styleRegex.test(content)) {
        content = content.replace(styleRegex, modernStyle);
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log("Updated " + fullPath);
      } else {
        console.log("No <style> block found in " + fullPath);
      }
    }
  }
}

updateFilesRecursively(booksDir);
console.log("All HTML files modernized!");
