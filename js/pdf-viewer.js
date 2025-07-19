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

// 텍스트 레이어 컨테이너 생성 (PDF.js 표준 호환)
function createTextLayerDiv(scaledViewport) {
    const textLayerDiv = document.createElement('div');
    
    // PDF.js 표준 클래스명 사용
    textLayerDiv.className = 'textLayer';
    
    // PDF.js 표준 스타일 적용
    Object.assign(textLayerDiv.style, {
        position: 'absolute',
        left: '0',
        top: '0',
        right: '0',
        bottom: '0',
        width: scaledViewport.width + 'px',
        height: scaledViewport.height + 'px',
        overflow: 'hidden',
        opacity: '0.2', // 디버깅용, 나중에 0으로 변경
        lineHeight: '1.0',
        userSelect: 'text',
        pointerEvents: 'auto',
        // PDF.js TextLayerBuilder 필수 속성들
        transformOrigin: '0% 0%'
    });
    
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

// 텍스트 레이어 렌더링 (PDF.js 표준 API 방식)
export async function renderTextLayer(page, viewport, textLayerDiv) {
    try {
        textLayerDiv.innerHTML = '';
        
        // 사용 가능한 API 체크
        console.log('PDF.js API 체크:', {
            pdfjsViewer: !!window.pdfjsViewer,
            TextLayerBuilder: !!(window.pdfjsViewer && window.pdfjsViewer.TextLayerBuilder),
            renderTextLayer: !!pdfjsLib.renderTextLayer
        });
        
        // PDF.js 표준 방식 시도
        await renderWithStandardAPI(page, viewport, textLayerDiv);
        
    } catch (error) {
        console.error('텍스트 레이어 렌더링 오류:', error);
        // 에러 시 폴백 방식 시도
        try {
            console.log('폴백 방식으로 전환');
            await renderWithImprovedManual(page, viewport, textLayerDiv);
        } catch (fallbackError) {
            console.error('폴백 렌더링도 실패:', fallbackError);
        }
    }
}

// PDF.js Viewer Layer API를 사용한 텍스트 레이어 렌더링
async function renderWithStandardAPI(page, viewport, textLayerDiv) {
    try {
        const textContent = await page.getTextContent();
        
        // PDF.js Viewer Layer의 TextLayerBuilder 사용 시도
        if (window.pdfjsViewer && window.pdfjsViewer.TextLayerBuilder) {
            console.log('TextLayerBuilder 사용 시도');
            
            try {
                console.log('TextLayerBuilder 메서드 확인:', Object.getOwnPropertyNames(window.pdfjsViewer.TextLayerBuilder.prototype));
                
                // TextLayerBuilder 설정
                const textLayerBuilder = new window.pdfjsViewer.TextLayerBuilder({
                    textLayerDiv: textLayerDiv,
                    pageIndex: currentPage - 1,
                    viewport: viewport,
                    textContentSource: textContent // 생성자에서 직접 설정
                });
                
                console.log('TextLayerBuilder 생성 완료');
                console.log('사용 가능한 메서드들:', Object.getOwnPropertyNames(textLayerBuilder));
                
                // 다양한 API 시도
                if (typeof textLayerBuilder.setTextContent === 'function') {
                    textLayerBuilder.setTextContent(textContent);
                    console.log('setTextContent 사용');
                } else if (typeof textLayerBuilder.setTextContentSource === 'function') {
                    textLayerBuilder.setTextContentSource(textContent);
                    console.log('setTextContentSource 사용');
                } else {
                    console.log('텍스트 설정 메서드 없음, 생성자에서 설정됨');
                }
                
                // 렌더링 수행
                const renderResult = textLayerBuilder.render();
                console.log('Render 호출 완료, 결과:', renderResult);
                
                // Promise 처리
                if (renderResult && typeof renderResult.then === 'function') {
                    await renderResult;
                } else if (renderResult && renderResult.promise) {
                    await renderResult.promise;
                }
                
                console.log('TextLayerBuilder 렌더링 완료');
                
            } catch (builderError) {
                console.error('TextLayerBuilder 에러:', builderError);
                console.error('에러 상세:', builderError.message);
                throw builderError;
            }
            
        } else if (pdfjsLib.renderTextLayer) {
            // 폴백: Display Layer API 사용 (개선된 버전)
            console.log('pdfjsLib.renderTextLayer 사용');
            
            const renderTask = pdfjsLib.renderTextLayer({
                textContentSource: textContent,
                container: textLayerDiv,
                viewport: viewport,
                textDivs: [],
                textContentItemsStr: [] // 추가 옵션
            });
            
            await renderTask.promise;
            console.log('renderTextLayer 완료');
        } else {
            throw new Error('PDF.js 텍스트 레이어 API를 찾을 수 없습니다');
        }
        
        // 텍스트 선택 최적화
        optimizeTextSelection(textLayerDiv);
        
    } catch (error) {
        console.error('표준 API 텍스트 렌더링 실패:', error);
        console.error('에러 상세:', error.message);
        console.error('스택 트레이스:', error.stack);
        throw error;
    }
}

// 개선된 수동 텍스트 레이어 렌더링
async function renderWithImprovedManual(page, viewport, textLayerDiv) {
    const textContent = await page.getTextContent();
    
    // 각 텍스트 아이템을 정확한 위치에 배치
    textContent.items.forEach((textItem, index) => {
        if (!textItem.str || textItem.str.trim() === '') return;
        
        const span = createAccurateTextSpan(textItem, viewport, index);
        textLayerDiv.appendChild(span);
    });
    
    // 텍스트 선택 최적화
    optimizeTextSelection(textLayerDiv);
}

// 정확한 텍스트 span 생성 (디버깅 강화)
function createAccurateTextSpan(textItem, viewport, index) {
    const span = document.createElement('span');
    span.textContent = textItem.str;
    span.setAttribute('data-text-index', index);
    
    // 1. PDF 좌표계에서 브라우저 좌표계로 변환
    const transform = pdfjsLib.Util.transform(viewport.transform, textItem.transform);
    
    // 2. Y축 뒤집기 (PDF는 하단 기준, 브라우저는 상단 기준)
    const flippedTransform = pdfjsLib.Util.transform(transform, [1, 0, 0, -1, 0, viewport.height]);
    
    // 3. 위치와 크기 계산
    const fontSize = Math.sqrt(flippedTransform[2] * flippedTransform[2] + flippedTransform[3] * flippedTransform[3]);
    const left = flippedTransform[4];
    const top = flippedTransform[5] - fontSize; // 폰트 베이스라인 보정
    
    // 4. 텍스트 너비 정확 계산
    const scaleX = Math.sqrt(flippedTransform[0] * flippedTransform[0] + flippedTransform[1] * flippedTransform[1]);
    const width = textItem.width * scaleX;
    
    // 5. 회전 각도 계산
    const angle = Math.atan2(flippedTransform[1], flippedTransform[0]);
    
    Object.assign(span.style, {
        position: 'absolute',
        left: `${left}px`,
        top: `${top}px`,
        fontSize: `${fontSize}px`,
        width: `${width}px`,
        transform: angle !== 0 ? `rotate(${angle}rad)` : 'none',
        transformOrigin: '0% 0%',
        fontFamily: 'serif',
        color: 'transparent',
        userSelect: 'text',
        cursor: 'text',
        whiteSpace: 'pre',
        pointerEvents: 'auto',
        overflow: 'visible',
        boxSizing: 'border-box',
        lineHeight: '1.0'
    });
    
    // 디버깅 정보 로그 (개발 중에만)
    if (window.location.hostname === 'localhost' && index < 5) {
        console.log(`Text ${index}: "${textItem.str.substring(0, 10)}..."`, {
            originalTransform: textItem.transform,
            viewportTransform: viewport.transform,
            finalTransform: flippedTransform,
            position: { left, top, fontSize, width },
            textItemWidth: textItem.width,
            scaleX
        });
    }
    
    return span;
}

// 텍스트 선택 최적화
function optimizeTextSelection(textLayerDiv) {
    // 텍스트 레이어 전체 설정 최적화
    Object.assign(textLayerDiv.style, {
        pointerEvents: 'auto',
        userSelect: 'text',
        cursor: 'text'
    });
    
    // 모든 텍스트 span에 대해 선택 최적화
    const textSpans = textLayerDiv.querySelectorAll('span');
    textSpans.forEach(span => {
        span.style.userSelect = 'text';
        span.style.pointerEvents = 'auto';
        
        // 디버깅용: 선택 영역 시각화 (개발 중에만)
        if (window.location.hostname === 'localhost') {
            span.addEventListener('mouseenter', () => {
                span.style.backgroundColor = 'rgba(255, 255, 0, 0.3)';
            });
            span.addEventListener('mouseleave', () => {
                span.style.backgroundColor = 'transparent';
            });
        }
    });
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

// 레거시 함수들 (하위 호환성을 위해 유지하되 사용하지 않음)
// TODO: 충분한 테스트 후 제거 예정

// 수동 텍스트 레이어 구현 (폴백용)
// 레거시 수동 텍스트 레이어 구현 제거됨 (새로운 방식으로 대체)

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
