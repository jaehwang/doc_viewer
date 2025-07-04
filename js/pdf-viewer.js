import { currentFileName } from './app.js';

// PDF.js 뷰어 관련 기능

// 전역 변수
let pdfDoc = null;
let currentPage = 1;
let totalPages = 0;
let pdfViewer = null;
let pdfLinkService = null;

// 줌 관련 변수
let currentZoom = 'auto';
let currentScale = 1.0;
let zoomLevels = [0.25, 0.5, 0.75, 1.0, 1.25, 1.5, 2.0, 3.0, 4.0];

// UI 콜백 시스템
let uiCallbacks = {
    showLoading: () => {},
    hideLoading: () => {},
    showError: () => {},
    showPDFViewer: (fileName) => {}
};

// UI 콜백 설정 함수
export function setUICallbacks(callbacks) {
    uiCallbacks = { ...uiCallbacks, ...callbacks };
}

// 상태 접근 함수들 (테스트용)
export function getCurrentPage() { return currentPage; }
export function getTotalPages() { return totalPages; }
export function getPdfDoc() { return pdfDoc; }
export function getCurrentZoom() { return currentZoom; }
export function getCurrentScale() { return currentScale; }

// 안전한 DOM 요소 접근 함수
function safeGetElement(id) {
    const element = document.getElementById(id);
    if (!element) {
        console.warn(`Element with id '${id}' not found`);
    }
    return element;
}

// PDF.js 뷰어 초기화
export function initializePDFViewer() {
    // 브라우저 창 크기 변경 시 자동 리사이즈 (auto, page-width, page-fit 모드만)
    let resizeTimeout;
    window.addEventListener('resize', () => {
        // 디바운싱으로 성능 최적화
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            if (pdfDoc && (currentZoom === 'auto' || currentZoom === 'page-width' || currentZoom === 'page-fit')) {
                renderPage(currentPage);
            }
        }, 250);
    });
}

// PDF 로드
export async function loadPDF(data) {
    try {
        pdfDoc = await pdfjsLib.getDocument({
            data: data,
            cMapUrl: 'https://unpkg.com/pdfjs-dist@3.11.174/cmaps/',
            cMapPacked: true
        }).promise;
        totalPages = pdfDoc.numPages;
        currentPage = 1;
        
        // 100%를 기본값으로 설정
        currentZoom = '1.0';
        currentScale = 1.0;
        
        // UI 업데이트
        const totalPagesSpan = safeGetElement('totalPages');
        const pageInput = safeGetElement('pageInput');
        const zoomSelect = safeGetElement('zoomSelect');
        
        if (totalPagesSpan) totalPagesSpan.textContent = totalPages;
        if (pageInput) {
            pageInput.value = currentPage;
            pageInput.max = totalPages;
        }
        if (zoomSelect) zoomSelect.value = '1.0';
        
        // 첫 번째 페이지 렌더링 및 UI 표시
        await renderPage(currentPage);
        uiCallbacks.showPDFViewer(currentFileName); // 파일 이름을 전달하여 UI 업데이트
        
        // 네비게이션 버튼 상태 초기화
        updateNavigationButtons();
        updateZoomButtons();
        
    } catch (error) {
        console.error('PDF 로드 오류:', error);
        uiCallbacks.showError('PDF 파일을 로드할 수 없습니다. 파일이 손상되었거나 지원되지 않는 형식일 수 있습니다.');
    }
}

// 페이지 렌더링
export async function renderPage(pageNum) {
    try {
        uiCallbacks.showLoading();
        
        const page = await pdfDoc.getPage(pageNum);
        const elements = getViewerElements();
        
        if (!elements.viewer) {
            throw new Error('Viewer element not found');
        }
        
        setupContainerStyles(elements);
        elements.viewer.innerHTML = '';
        
        const viewport = page.getViewport({ scale: 1.0 });
        const scaleToUse = calculateScale(viewport, elements.viewerContainer);
        currentScale = scaleToUse;
        
        const scaledViewport = page.getViewport({ scale: scaleToUse });
        const { pageDiv, canvas, textLayerDiv } = createPageElements(scaledViewport);
        
        elements.viewer.appendChild(pageDiv);
        
        const renderContext = {
            canvasContext: canvas.getContext('2d'),
            viewport: scaledViewport
        };
        
        await page.render(renderContext).promise;
        await renderTextLayer(page, scaledViewport, textLayerDiv);
        
        uiCallbacks.hideLoading();
        
    } catch (error) {
        console.error('페이지 렌더링 오류:', error);
        uiCallbacks.hideLoading();
        uiCallbacks.showError('페이지를 렌더링할 수 없습니다.');
    }
}

// 뷰어 DOM 요소들 가져오기
function getViewerElements() {
    return {
        viewerContainer: safeGetElement('viewerContainer'),
        viewer: safeGetElement('viewer'),
        pdfContainer: safeGetElement('pdfContainer')
    };
}

// 컨테이너 스타일 설정
function setupContainerStyles(elements) {
    const { viewerContainer, pdfContainer } = elements;
    
    if (pdfContainer && pdfContainer.style.display === 'none') {
        pdfContainer.style.display = 'block';
    }
    
    if (viewerContainer) {
        viewerContainer.style.width = '100%';
        viewerContainer.style.height = '100vh';
        viewerContainer.style.minHeight = '600px';
        viewerContainer.style.display = 'block';
        viewerContainer.style.position = 'relative';
    }
    
    if (pdfContainer) {
        pdfContainer.style.width = '100%';
        pdfContainer.style.height = 'auto';
        pdfContainer.style.minHeight = '600px';
        pdfContainer.style.display = 'flex';
        pdfContainer.style.justifyContent = 'center';
        pdfContainer.style.alignItems = 'flex-start';
        pdfContainer.style.padding = '20px';
    }
}

// 스케일 계산
function calculateScale(viewport, viewerContainer) {
    if (currentZoom === 'auto') {
        return calculateOptimalScale(viewport, viewerContainer);
    } else if (currentZoom === 'page-width') {
        const containerWidth = viewerContainer ? viewerContainer.clientWidth : window.innerWidth * 0.95;
        return Math.max(1.0, (containerWidth - 40) / viewport.width);
    } else if (currentZoom === 'page-fit') {
        return calculateOptimalScale(viewport, viewerContainer);
    } else {
        const parsedZoom = parseFloat(currentZoom);
        return !isNaN(parsedZoom) ? parsedZoom : 1.0;
    }
}

// 페이지 요소들 생성
function createPageElements(scaledViewport) {
    const pageDiv = createPageDiv(scaledViewport);
    const canvas = createCanvas(scaledViewport);
    const textLayerDiv = createTextLayerDiv(scaledViewport);
    
    pageDiv.appendChild(canvas);
    pageDiv.appendChild(textLayerDiv);
    
    return { pageDiv, canvas, textLayerDiv };
}

// 페이지 컨테이너 생성
function createPageDiv(scaledViewport) {
    const pageDiv = document.createElement('div');
    pageDiv.className = 'page';
    pageDiv.style.position = 'relative';
    pageDiv.style.margin = '0 auto';
    pageDiv.style.display = 'flex';
    pageDiv.style.justifyContent = 'center';
    pageDiv.style.alignItems = 'center';
    pageDiv.style.width = scaledViewport.width + 'px';
    pageDiv.style.height = scaledViewport.height + 'px';
    return pageDiv;
}

// 캔버스 생성
function createCanvas(scaledViewport) {
    const canvas = document.createElement('canvas');
    canvas.width = scaledViewport.width;
    canvas.height = scaledViewport.height;
    canvas.style.display = 'block';
    canvas.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.1)';
    canvas.style.borderRadius = '4px';
    canvas.style.backgroundColor = 'white';
    return canvas;
}

// 텍스트 레이어 컨테이너 생성
function createTextLayerDiv(scaledViewport) {
    const textLayerDiv = document.createElement('div');
    textLayerDiv.className = 'textLayer';
    textLayerDiv.style.position = 'absolute';
    textLayerDiv.style.left = '0';
    textLayerDiv.style.top = '0';
    textLayerDiv.style.width = scaledViewport.width + 'px';
    textLayerDiv.style.height = scaledViewport.height + 'px';
    textLayerDiv.style.overflow = 'hidden';
    textLayerDiv.style.opacity = '0.2';
    textLayerDiv.style.lineHeight = '1.0';
    textLayerDiv.style.userSelect = 'text';
    textLayerDiv.style.pointerEvents = 'auto';
    return textLayerDiv;
}

// 뷰어 컨테이너 크기 동적 조정
export function adjustViewerContainer(viewport, isLandscape) {
    const viewerContainer = document.getElementById('viewerContainer');
    const pdfContainer = document.getElementById('pdfContainer');
    
    // 컨테이너 스타일 초기화
    viewerContainer.style.width = '100%';
    viewerContainer.style.height = '100%';
    viewerContainer.style.display = 'flex';
    viewerContainer.style.justifyContent = 'center';
    viewerContainer.style.alignItems = 'center';
    viewerContainer.style.padding = '20px';
    
    // PDF 컨테이너 스타일 조정
    pdfContainer.style.display = 'flex';
    pdfContainer.style.justifyContent = 'center';
    pdfContainer.style.alignItems = 'center';
    pdfContainer.style.minHeight = '600px';
    pdfContainer.style.height = 'auto';
    
    // 방향에 따른 추가 조정
    if (isLandscape) {
        pdfContainer.style.padding = '20px 10px';
    } else {
        pdfContainer.style.padding = '30px 20px';
    }
}

// 최적 스케일 계산
export function calculateOptimalScale(viewport, container) {
    // 컨테이너 크기 확인 및 fallback
    let containerWidth = container ? container.clientWidth : 0;
    let containerHeight = container ? container.clientHeight : 0;
    
    // 컨테이너가 없거나 크기가 0인 경우 뷰포트 크기 사용
    if (containerWidth <= 0) {
        containerWidth = window.innerWidth * 0.95; // 브라우저 창의 95% 사용 (증가)
    }
    if (containerHeight <= 0) {
        containerHeight = window.innerHeight * 0.85; // 브라우저 창의 85% 사용 (증가)
    }
    
    // 패딩 및 여백 고려 (더 적은 패딩으로 더 큰 크기 확보)
    const availableWidth = containerWidth - 20; // 패딩 줄임
    const availableHeight = containerHeight - 40; // 패딩 줄임
    
    // 가로/세로 스케일 계산
    const scaleX = availableWidth / viewport.width;
    const scaleY = availableHeight / viewport.height;
    
    // 더 작은 스케일을 선택하여 전체 페이지가 보이도록 함
    let optimalScale = Math.min(scaleX, scaleY);
    
    // 100%보다 작게 나오는 경우 최소 1.0으로 보장
    if (optimalScale < 1.0) {
        optimalScale = Math.max(1.0, optimalScale * 1.2); // 20% 증가 또는 최소 100%
    }
    
    // 스케일 범위 제한 (최소 1.0, 최대 3.0)
    optimalScale = Math.max(1.0, Math.min(optimalScale, 3.0));
    
    return optimalScale;
}

// 텍스트 레이어 렌더링 (CSS Transform 방식)
export async function renderTextLayer(page, viewport, textLayerDiv) {
    try {
        textLayerDiv.innerHTML = '';
        
        const originalViewport = page.getViewport({ scale: 1.0 });
        const textContent = await page.getTextContent();
        const scaleRatio = viewport.scale / originalViewport.scale;
        
        await waitForLayoutReady(textLayerDiv);
        
        processTextItems(textContent, originalViewport, textLayerDiv);
        
        const actualScaleRatio = calculateActualScaleRatio(textLayerDiv, viewport, scaleRatio);
        applyTextTransform(textLayerDiv, actualScaleRatio);
        
    } catch (error) {
        console.error('텍스트 레이어 렌더링 오류:', error);
    }
}

// DOM 레이아웃 준비 대기
async function waitForLayoutReady(textLayerDiv) {
    return new Promise(resolve => {
        if (textLayerDiv.offsetWidth > 0 && textLayerDiv.offsetHeight > 0) {
            resolve();
        } else {
            requestAnimationFrame(() => {
                requestAnimationFrame(() => resolve());
            });
        }
    });
}

// 텍스트 아이템들 처리
function processTextItems(textContent, originalViewport, textLayerDiv) {
    textContent.items.forEach(function(textItem) {
        if (!textItem.str || textItem.str.trim() === '') {
            return;
        }
        
        const position = calculateTextPosition(textItem, originalViewport);
        const span = createTextSpan(textItem, position);
        textLayerDiv.appendChild(span);
    });
}

// 텍스트 위치 계산
function calculateTextPosition(textItem, originalViewport) {
    const tx = pdfjsLib.Util.transform(
        pdfjsLib.Util.transform(originalViewport.transform, textItem.transform),
        [1, 0, 0, -1, 0, 0]
    );
    
    const fontHeight = Math.sqrt(tx[2] * tx[2] + tx[3] * tx[3]);
    const textWidth = textItem.width;
    const scaledTextWidth = textWidth * (fontHeight / textItem.height);
    const matrixScaledWidth = textWidth * Math.abs(tx[0] / textItem.transform[0]);
    const directScaledWidth = textWidth * Math.abs(tx[0]) / textItem.transform[0];
    const finalWidth = Math.max(matrixScaledWidth, scaledTextWidth, directScaledWidth);
    
    return {
        left: tx[4],
        top: tx[5] - fontHeight,
        fontSize: fontHeight,
        width: finalWidth
    };
}

// 텍스트 span 요소 생성
function createTextSpan(textItem, position) {
    const span = document.createElement('span');
    span.textContent = textItem.str;
    
    Object.assign(span.style, {
        position: 'absolute',
        left: position.left + 'px',
        top: position.top + 'px',
        fontSize: position.fontSize + 'px',
        width: position.width + 'px',
        fontFamily: 'sans-serif',
        color: 'transparent',
        userSelect: 'text',
        cursor: 'text',
        whiteSpace: 'pre',
        pointerEvents: 'auto',
        transformOrigin: '0% 0%',
        overflow: 'visible',
        boxSizing: 'border-box'
    });
    
    return span;
}

// 실제 스케일 비율 계산
function calculateActualScaleRatio(textLayerDiv, viewport, scaleRatio) {
    const canvas = textLayerDiv.parentElement.querySelector('canvas');
    let actualScaleRatio = scaleRatio;
    
    if (canvas) {
        const canvasRect = canvas.getBoundingClientRect();
        const actualScaleX = canvasRect.width / viewport.width;
        const actualScaleY = canvasRect.height / viewport.height;
        actualScaleRatio = Math.min(actualScaleX, actualScaleY);
    }
    
    return actualScaleRatio;
}

// 텍스트 변환 적용
function applyTextTransform(textLayerDiv, actualScaleRatio) {
    textLayerDiv.style.transform = `scale(${actualScaleRatio})`;
    textLayerDiv.style.transformOrigin = '0 0';
}

// 수동 텍스트 레이어 구현 (폴백용)
async function renderTextLayerManual(page, viewport, textLayerDiv) {
    try {
        const textContent = await page.getTextContent();
        
        textContent.items.forEach(function(textItem) {
            if (!textItem.str || textItem.str.trim() === '') {
                return;
            }
            
            // PDF.js 표준 변환 사용
            const tx = pdfjsLib.Util.transform(
                pdfjsLib.Util.transform(viewport.transform, textItem.transform),
                [1, 0, 0, -1, 0, 0]
            );
            
            const fontHeight = Math.sqrt(tx[2] * tx[2] + tx[3] * tx[3]);
            
            // 텍스트 요소 생성
            const span = document.createElement('span');
            span.textContent = textItem.str;
            span.style.position = 'absolute';
            span.style.left = tx[4] + 'px';
            span.style.top = (tx[5] - fontHeight) + 'px';
            span.style.fontSize = fontHeight + 'px';
            span.style.fontFamily = 'sans-serif';
            span.style.color = 'transparent';
            span.style.userSelect = 'text';
            span.style.cursor = 'text';
            span.style.whiteSpace = 'pre';
            span.style.pointerEvents = 'auto';
            span.style.transformOrigin = '0% 0%';
            
            textLayerDiv.appendChild(span);
        });
        
    } catch (error) {
        console.error('수동 텍스트 레이어 렌더링 오류:', error);
    }
}

// 이전 페이지
export function showPrevPage() {
    if (currentPage > 1) {
        currentPage--;
        const pageInput = safeGetElement('pageInput');
        if (pageInput) pageInput.value = currentPage;
        renderPage(currentPage);
        updateNavigationButtons();
    }
}

// 다음 페이지
export function showNextPage() {
    if (currentPage < totalPages) {
        currentPage++;
        const pageInput = safeGetElement('pageInput');
        if (pageInput) pageInput.value = currentPage;
        renderPage(currentPage);
        updateNavigationButtons();
    }
}

// 특정 페이지로 이동
export function goToPage() {
    const pageInput = safeGetElement('pageInput');
    if (!pageInput) return;
    
    const pageNum = parseInt(pageInput.value);
    
    if (pageNum >= 1 && pageNum <= totalPages && pageNum !== currentPage) {
        currentPage = pageNum;
        pageInput.value = currentPage;
        renderPage(currentPage);
        updateNavigationButtons();
    } else {
        // 잘못된 입력 시 현재 페이지로 복원
        pageInput.value = currentPage;
    }
}

// 네비게이션 버튼 상태 업데이트
export function updateNavigationButtons() {
    const prevBtn = safeGetElement('prevBtn');
    const nextBtn = safeGetElement('nextBtn');
    
    if (prevBtn) prevBtn.disabled = currentPage <= 1;
    if (nextBtn) nextBtn.disabled = currentPage >= totalPages;
}

// 줌 기능 구현
export function zoomIn() {
    if (!pdfDoc) return;
    
    const currentIndex = zoomLevels.indexOf(currentScale);
    if (currentIndex < zoomLevels.length - 1) {
        currentScale = zoomLevels[currentIndex + 1];
        currentZoom = currentScale.toString();
        updateZoomUI();
        renderPage(currentPage);
    }
}

export function zoomOut() {
    if (!pdfDoc) return;
    
    const currentIndex = zoomLevels.indexOf(currentScale);
    if (currentIndex > 0) {
        currentScale = zoomLevels[currentIndex - 1];
        currentZoom = currentScale.toString();
        updateZoomUI();
        renderPage(currentPage);
    }
}

export function handleZoomChange() {
    if (!pdfDoc) return;
    
    const zoomSelect = safeGetElement('zoomSelect');
    if (!zoomSelect) return;
    
    const selectedValue = zoomSelect.value;
    
    currentZoom = selectedValue;
    
    if (selectedValue === 'auto' || selectedValue === 'page-fit' || selectedValue === 'page-width') {
        // 자동 모드는 기존 로직 사용
    } else {
        // 고정 스케일 모드
        currentScale = parseFloat(selectedValue);
    }
    updateZoomUI(); // renderPage 전에 UI 업데이트
    renderPage(currentPage); // currentZoom 또는 currentScale 변경 후 항상 renderPage 호출
    updateZoomButtons();
}

export function updateZoomUI() {
    const zoomSelect = safeGetElement('zoomSelect');
    if (zoomSelect) {
        zoomSelect.value = currentZoom;
    }
    updateZoomButtons();
}

function updateZoomButtons() {
    const zoomOutBtn = safeGetElement('zoomOutBtn');
    const zoomInBtn = safeGetElement('zoomInBtn');
    
    if (zoomOutBtn && zoomInBtn) {
        const currentIndex = zoomLevels.indexOf(currentScale);
        zoomOutBtn.disabled = currentIndex <= 0 || currentZoom === 'auto' || currentZoom === 'page-fit' || currentZoom === 'page-width';
        zoomInBtn.disabled = currentIndex >= zoomLevels.length - 1 || currentZoom === 'auto' || currentZoom === 'page-fit' || currentZoom === 'page-width';
    }
}
