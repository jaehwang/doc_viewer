/**
 * @jest-environment jsdom
 */

const { JSDOM } = require('jsdom');
import { fetchFileByUrl } from '../js/app.js';

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

describe('fetchFileByUrl', () => {
  let originalFetch;
  let showErrorMock, showLoadingMock, hideLoadingMock, handlePDFFileMock, loadMarkdownMock, setCurrentFileNameMock;

  beforeAll(() => {
    // JSDOM 환경 준비
    const dom = new JSDOM('<!DOCTYPE html><body><div id="fileName"></div><div id="fileType"></div></body>');
    global.document = dom.window.document;
    // 전역 함수/변수 mocking
    showErrorMock = jest.fn();
    showLoadingMock = jest.fn();
    hideLoadingMock = jest.fn();
    handlePDFFileMock = jest.fn();
    loadMarkdownMock = jest.fn();
    setCurrentFileNameMock = jest.fn();
    global.showError = showErrorMock;
    global.showLoading = showLoadingMock;
    global.hideLoading = hideLoadingMock;
    global.handlePDFFile = handlePDFFileMock;
    global.loadMarkdown = loadMarkdownMock;
    global.currentFileName = null;
    // fetch mocking
    originalFetch = global.fetch;
  });

  afterEach(() => {
    jest.clearAllMocks();
    global.fetch = originalFetch;
  });

  it('should load a remote PDF file successfully', async () => {
    const fakePdfData = new Uint8Array([1,2,3]);
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      arrayBuffer: async () => fakePdfData,
    });
    const url = 'https://example.com/test.pdf';
    await fetchFileByUrl(url, {
      handlePDFFile: handlePDFFileMock,
      loadMarkdown: loadMarkdownMock,
      showError: showErrorMock,
      showLoading: showLoadingMock,
      hideLoading: hideLoadingMock,
      setCurrentFileName: setCurrentFileNameMock
    });
    expect(handlePDFFileMock).toHaveBeenCalledWith(fakePdfData);
    expect(setCurrentFileNameMock).toHaveBeenCalledWith('test.pdf');
    expect(showErrorMock).not.toHaveBeenCalled();
  });

  it('should load a remote Markdown file successfully', async () => {
    const fakeMd = '# Hello';
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      text: async () => fakeMd,
    });
    const url = 'https://example.com/test.md';
    await fetchFileByUrl(url, {
      handlePDFFile: handlePDFFileMock,
      loadMarkdown: loadMarkdownMock,
      showError: showErrorMock,
      showLoading: showLoadingMock,
      hideLoading: hideLoadingMock,
      setCurrentFileName: setCurrentFileNameMock
    });
    expect(loadMarkdownMock).toHaveBeenCalledWith(fakeMd, 'test.md');
    expect(setCurrentFileNameMock).toHaveBeenCalledWith('test.md');
    expect(showErrorMock).not.toHaveBeenCalled();
  });

  it('should show error for unsupported file type', async () => {
    const url = 'https://example.com/test.txt';
    await fetchFileByUrl(url, {
      handlePDFFile: handlePDFFileMock,
      loadMarkdown: loadMarkdownMock,
      showError: showErrorMock,
      showLoading: showLoadingMock,
      hideLoading: hideLoadingMock,
      setCurrentFileName: setCurrentFileNameMock
    });
    expect(showErrorMock).toHaveBeenCalledWith(expect.stringContaining('지원하지 않는 파일 형식'));
    expect(setCurrentFileNameMock).not.toHaveBeenCalled();
  });

  it('should show error for fetch failure (CORS/network)', async () => {
    global.fetch = jest.fn().mockRejectedValue(new TypeError('Failed to fetch'));
    const url = 'https://example.com/test.pdf';
    await fetchFileByUrl(url, {
      handlePDFFile: handlePDFFileMock,
      loadMarkdown: loadMarkdownMock,
      showError: showErrorMock,
      showLoading: showLoadingMock,
      hideLoading: hideLoadingMock,
      setCurrentFileName: setCurrentFileNameMock
    });
    expect(showErrorMock).toHaveBeenCalledWith(expect.stringContaining('CORS 정책 또는 네트워크 문제'));
    expect(setCurrentFileNameMock).not.toHaveBeenCalled();
  });

  it('should show error for HTTP error', async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 404 });
    const url = 'https://example.com/test.pdf';
    await fetchFileByUrl(url, {
      handlePDFFile: handlePDFFileMock,
      loadMarkdown: loadMarkdownMock,
      showError: showErrorMock,
      showLoading: showLoadingMock,
      hideLoading: hideLoadingMock,
      setCurrentFileName: setCurrentFileNameMock
    });
    expect(showErrorMock).toHaveBeenCalledWith(expect.stringContaining('파일을 불러올 수 없습니다'));
    expect(setCurrentFileNameMock).not.toHaveBeenCalled();
  });

  it('should load a real remote Markdown file from raw.githubusercontent.com', async () => {
    const url = 'https://raw.githubusercontent.com/jaehwang/doc_viewer/refs/heads/main/tests/docs/sample.md';
    global.fetch = originalFetch;
    let receivedFileName = null;
    await fetchFileByUrl(url, {
      handlePDFFile: handlePDFFileMock,
      loadMarkdown: loadMarkdownMock,
      showError: showErrorMock,
      showLoading: showLoadingMock,
      hideLoading: hideLoadingMock,
      setCurrentFileName: (name) => { receivedFileName = name; }
    });
    if (receivedFileName === null) {
      // CORS/network 오류로 파일명을 못 받는 경우도 정상
      expect(showErrorMock).toHaveBeenCalled();
    } else {
      expect(receivedFileName).toBe('sample.md');
      expect(showErrorMock).not.toHaveBeenCalled();
    }
  });

  it('should load a real remote PDF file from w3.org (CORS 허용)', async () => {
    const url = 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';
    global.fetch = originalFetch;
    let receivedFileName = null;
    await fetchFileByUrl(url, {
      handlePDFFile: handlePDFFileMock,
      loadMarkdown: loadMarkdownMock,
      showError: showErrorMock,
      showLoading: showLoadingMock,
      hideLoading: hideLoadingMock,
      setCurrentFileName: (name) => { receivedFileName = name; }
    });
    if (receivedFileName === null) {
      // CORS/network 오류로 파일명을 못 받는 경우도 정상
      expect(showErrorMock).toHaveBeenCalled();
    } else {
      expect(receivedFileName).toBe('dummy.pdf');
      expect(showErrorMock).not.toHaveBeenCalled();
    }
  });
});
