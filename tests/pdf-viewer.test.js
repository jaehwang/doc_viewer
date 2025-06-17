// tests/pdf-viewer.test.js

import * as pdfViewer from '../js/pdf-viewer';

// Mock PDF 데이터 생성
const createMockPDFData = () => {
  // 최소한의 PDF 헤더를 포함한 mock 데이터
  return new Uint8Array([
    0x25, 0x50, 0x44, 0x46, // PDF 헤더 "%PDF"
    0x2D, 0x31, 0x2E, 0x34, // 버전 "-1.4"
    0x0A, 0x25, 0xE2, 0xE3, // 개행 및 바이너리 마커
    // 나머지는 mock에서 처리됨
  ]);
};

describe('PDF Viewer Module', () => {
  let mockUICallbacks;

  beforeEach(() => {
    // Mock 요소 초기화
    if (global.resetMockElements) {
      global.resetMockElements();
    }
    
    // UI 콜백 mock 설정
    mockUICallbacks = {
      showLoading: jest.fn(),
      hideLoading: jest.fn(),
      showError: jest.fn(),
      showPDFViewer: jest.fn()
    };
    
    // UI 콜백 설정
    pdfViewer.setUICallbacks(mockUICallbacks);
    
    // DOM 구조 설정 (setupTests.js의 mock과 함께 작동)
    document.body.innerHTML = `
      <div>
        <span id="totalPages"></span>
        <input id="pageInput" />
        <button id="prevBtn"></button>
        <button id="nextBtn"></button>
        <select id="zoomSelect">
          <option value="auto">Auto</option>
          <option value="page-width">Page Width</option>
          <option value="page-fit">Page Fit</option>
          <option value="0.5">50%</option>
          <option value="1.0">100%</option>
          <option value="1.5">150%</option>
          <option value="2.0">200%</option>
        </select>
        <button id="zoomOutBtn"></button>
        <button id="zoomInBtn"></button>
        <div id="viewerContainer">
          <div id="viewer"></div>
        </div>
        <div id="pdfContainer"></div>
      </div>
    `;
  });

  // PDF.js가 로드되었는지 확인
  it('PDF.js가 로드되었는지 확인', () => {
    expect(pdfjsLib).toBeDefined();
    expect(pdfjsLib.getDocument).toBeDefined();
  });

  // PDF 로드 테스트
  it('loadPDF 함수는 PDF 문서를 로드하고 상태를 업데이트해야 함', async () => {
    const mockData = createMockPDFData();
    await pdfViewer.loadPDF(mockData);
    
    // 상태 접근 함수를 통해 검증
    expect(pdfViewer.getTotalPages()).toBe(10);
    expect(pdfViewer.getCurrentPage()).toBe(1);
    expect(pdfViewer.getPdfDoc()).toBeTruthy();
  });

  // 페이지 렌더링 테스트
  it('renderPage 함수는 페이지를 렌더링해야 함', async () => {
    const mockData = createMockPDFData();
    await pdfViewer.loadPDF(mockData);
    await pdfViewer.renderPage(1);
    
    // UI 콜백이 호출되었는지 확인
    expect(mockUICallbacks.showLoading).toHaveBeenCalled();
    expect(mockUICallbacks.hideLoading).toHaveBeenCalled();
  });

  // 이전 페이지 테스트
  it('showPrevPage 함수는 이전 페이지를 표시해야 함', async () => {
    const mockData = createMockPDFData();
    await pdfViewer.loadPDF(mockData);
    
    // 먼저 다음 페이지로 이동
    pdfViewer.showNextPage();
    expect(pdfViewer.getCurrentPage()).toBe(2);
    
    // 이전 페이지로 이동
    pdfViewer.showPrevPage();
    expect(pdfViewer.getCurrentPage()).toBe(1);
  });

  // 다음 페이지 테스트
  it('showNextPage 함수는 다음 페이지를 표시해야 함', async () => {
    const mockData = createMockPDFData();
    await pdfViewer.loadPDF(mockData);
    
    pdfViewer.showNextPage();
    expect(pdfViewer.getCurrentPage()).toBe(2);
  });

  // 특정 페이지로 이동 테스트
  it('goToPage 함수는 특정 페이지로 이동해야 함', async () => {
    const mockData = createMockPDFData();
    await pdfViewer.loadPDF(mockData);
    
    // Mock DOM 요소의 value 속성을 설정
    const mockPageInput = document.getElementById('pageInput');
    mockPageInput.value = '3';
    
    pdfViewer.goToPage();
    expect(pdfViewer.getCurrentPage()).toBe(3);
  });

  // 줌 기능 테스트
  it('zoomIn 함수는 줌 레벨을 증가시켜야 함', async () => {
    const mockData = createMockPDFData();
    await pdfViewer.loadPDF(mockData);
    
    // 초기 스케일을 1.0으로 설정
    const zoomSelect = document.getElementById('zoomSelect');
    zoomSelect.value = '1.0';
    pdfViewer.handleZoomChange();
    
    expect(pdfViewer.getCurrentScale()).toBe(1.0);
    
    // 줌 인
    pdfViewer.zoomIn();
    expect(pdfViewer.getCurrentScale()).toBe(1.25);
    expect(pdfViewer.getCurrentZoom()).toBe('1.25');
  });

  it('zoomOut 함수는 줌 레벨을 감소시켜야 함', async () => {
    const mockData = createMockPDFData();
    await pdfViewer.loadPDF(mockData);
    
    // 초기 스케일을 1.5로 설정
    const zoomSelect = document.getElementById('zoomSelect');
    zoomSelect.value = '1.5';
    pdfViewer.handleZoomChange();
    
    expect(pdfViewer.getCurrentScale()).toBe(1.5);
    
    // 줌 아웃
    pdfViewer.zoomOut();
    expect(pdfViewer.getCurrentScale()).toBe(1.25);
    expect(pdfViewer.getCurrentZoom()).toBe('1.25');
  });

  // 상태 접근 함수 테스트
  it('상태 접근 함수들이 올바른 값을 반환해야 함', async () => {
    const mockData = createMockPDFData();
    await pdfViewer.loadPDF(mockData);
    
    expect(typeof pdfViewer.getCurrentPage()).toBe('number');
    expect(typeof pdfViewer.getTotalPages()).toBe('number');
    expect(typeof pdfViewer.getCurrentZoom()).toBe('string');
    expect(typeof pdfViewer.getCurrentScale()).toBe('number');
    expect(pdfViewer.getPdfDoc()).toBeTruthy();
  });

  // UI 콜백 설정 테스트
  it('UI 콜백이 올바르게 설정되고 호출되어야 함', async () => {
    const customCallbacks = {
      showLoading: jest.fn(),
      hideLoading: jest.fn(),
      showError: jest.fn(),
      showPDFViewer: jest.fn()
    };
    
    pdfViewer.setUICallbacks(customCallbacks);
    
    const mockData = createMockPDFData();
    await pdfViewer.loadPDF(mockData);
    
    expect(customCallbacks.showLoading).toHaveBeenCalled();
    expect(customCallbacks.hideLoading).toHaveBeenCalled();
  });
});
