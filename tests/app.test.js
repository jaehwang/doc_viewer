/**
 * @jest-environment jsdom
 */

import { fetchFileByUrl } from '../js/app.js';
import * as pdfViewer from '../js/pdf-viewer.js';
import * as markdownViewer from '../js/markdown-viewer.js';
import * as ui from '../js/ui.js';

// 모듈 mock
jest.mock('../js/pdf-viewer.js');
jest.mock('../js/markdown-viewer.js');
jest.mock('../js/ui.js');

describe('fetchFileByUrl', () => {
  beforeEach(() => {
    // 각 테스트 전에 모든 mock을 초기화
    jest.clearAllMocks();
    global.fetch.mockClear();
  });

  test('should load a remote PDF file successfully', async () => {
    const url = 'https://example.com/test.pdf';
    const mockResponse = { ok: true, arrayBuffer: () => Promise.resolve(new ArrayBuffer(8)) };
    global.fetch.mockResolvedValue(mockResponse);

    // handlePDFFile이 문자열 URL을 받도록 수정되었으므로, 그에 맞게 테스트
    pdfViewer.loadPDF.mockResolvedValue(); // loadPDF는 이제 app.js의 handlePDFFile 내부에서 호출됨

    await fetchFileByUrl(url);

    expect(ui.showLoading).toHaveBeenCalled();
    // fetchFileByUrl -> handlePDFFile -> pdfViewer.loadPDF 순으로 호출됨
    // handlePDFFile은 직접 테스트하기 어려우므로, 최종 결과인 loadPDF 호출을 확인
    expect(pdfViewer.loadPDF).toHaveBeenCalled();
    expect(ui.hideLoading).toHaveBeenCalled();
    expect(ui.showError).not.toHaveBeenCalled();
  });

  test('should load a remote Markdown file successfully', async () => {
    const url = 'https://example.com/test.md';
    const fakeMd = '# Hello';
    const mockResponse = { ok: true, text: () => Promise.resolve(fakeMd) };
    global.fetch.mockResolvedValue(mockResponse);

    await fetchFileByUrl(url);

    expect(ui.showLoading).toHaveBeenCalled();
    expect(markdownViewer.loadMarkdownFromText).toHaveBeenCalledWith(fakeMd, 'test.md');
    expect(ui.hideLoading).toHaveBeenCalled();
    expect(ui.showError).not.toHaveBeenCalled();
  });

  test('should show error for unsupported file type', async () => {
    const url = 'https://example.com/test.txt';
    await fetchFileByUrl(url);

    expect(ui.showError).toHaveBeenCalledWith(expect.stringContaining('지원하지 않는 파일 형식'));
    expect(pdfViewer.loadPDF).not.toHaveBeenCalled();
    expect(markdownViewer.loadMarkdownFromText).not.toHaveBeenCalled();
  });

  test('should show error for fetch failure (CORS/network)', async () => {
    const url = 'https://example.com/test.pdf';
    global.fetch.mockRejectedValue(new TypeError('Failed to fetch'));

    await fetchFileByUrl(url);

    expect(ui.showError).toHaveBeenCalledWith(expect.stringContaining('CORS 정책'));
  });

  test('should show error for HTTP error', async () => {
    const url = 'https://example.com/test.pdf';
    // handlePDFFile 내부의 HEAD 요청과 GET 요청 모두 mock 처리
    global.fetch
      .mockResolvedValueOnce({ ok: false, status: 404 }) // HEAD
      .mockResolvedValueOnce({ ok: false, status: 404 }); // GET

    await fetchFileByUrl(url);
    
    // handlePDFFile 내부에서 에러를 처리하므로, 최종적으로 showError가 호출되는지 확인
    expect(ui.showError).toHaveBeenCalledWith(expect.stringContaining('파일을 로드하는 중 오류가 발생했습니다'));
  });
});
