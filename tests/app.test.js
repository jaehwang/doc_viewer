/**
 * @jest-environment jsdom
 */

const { JSDOM } = require('jsdom');

// escapeHtml 함수 복사 (테스트 목적)
function escapeHtml(text) {
  const div = global.document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

describe('escapeHtml', () => {
  beforeAll(() => {
    // JSDOM 환경 준비
    const dom = new JSDOM('<!DOCTYPE html><body></body>');
    global.document = dom.window.document;
  });

  it('should escape special HTML characters', () => {
    expect(escapeHtml('<script>alert("x")</script>')).toBe('&lt;script&gt;alert("x")&lt;/script&gt;');
    expect(escapeHtml('& < > " \'')).toBe('&amp; &lt; &gt; " \'');
  });

  it('should return empty string for empty input', () => {
    expect(escapeHtml('')).toBe('');
  });
});

// 목차 생성 로직 테스트 (간단 예시)
describe('generateTableOfContents', () => {
  beforeAll(() => {
    const dom = new JSDOM('<!DOCTYPE html><body><div id="markdownContent"></div><div id="tableOfContents"></div></body>');
    global.document = dom.window.document;
    global.markdownContent = dom.window.document.getElementById('markdownContent');
    global.tableOfContents = dom.window.document.getElementById('tableOfContents');
  });

  function generateTableOfContents() {
    const headings = markdownContent.querySelectorAll('h1, h2, h3, h4, h5, h6');
    const tocHtml = [];
    headings.forEach((heading, index) => {
      const level = heading.tagName.toLowerCase();
      const text = heading.textContent;
      const id = `heading-${index}`;
      heading.id = id;
      tocHtml.push(`<li><a href="#${id}" class="toc-${level}">${text}</a></li>`);
    });
    if (tocHtml.length > 0) {
      tableOfContents.innerHTML = `<ul>${tocHtml.join('')}</ul>`;
    } else {
      tableOfContents.innerHTML = '<p>목차가 없습니다.</p>';
    }
  }

  it('should generate TOC for headings', () => {
    markdownContent.innerHTML = `
      <h1>Title</h1>
      <h2>Section 1</h2>
      <h3>Subsection</h3>
    `;
    generateTableOfContents();
    expect(tableOfContents.innerHTML).toContain('Title');
    expect(tableOfContents.innerHTML).toContain('Section 1');
    expect(tableOfContents.innerHTML).toContain('Subsection');
    expect(tableOfContents.querySelectorAll('a').length).toBe(3);
  });

  it('should show "목차가 없습니다." if no headings', () => {
    markdownContent.innerHTML = `<p>본문</p>`;
    generateTableOfContents();
    expect(tableOfContents.textContent).toBe('목차가 없습니다.');
  });
});
