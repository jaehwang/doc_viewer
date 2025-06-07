// PDF.js 워커 설정
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

// 전역 변수
let pdfDoc = null;
let currentPage = 1;
let totalPages = 0;
let pdfViewer = null;
let pdfLinkService = null;
let currentFileType = null;
let currentFileName = null;

// 줌 관련 변수
let currentZoom = 'auto';
let currentScale = 1.0;
let zoomLevels = [0.25, 0.5, 0.75, 1.0, 1.25, 1.5, 2.0, 3.0, 4.0];

let comparisonMode = false;
let oldDocument = null;
let newDocument = null;
let oldDocumentText = '';
let newDocumentText = '';
let oldDocumentType = null;
let newDocumentType = null;

// DOM 요소들
const uploadSection = document.getElementById('uploadSection');
const viewerSection = document.getElementById('viewerSection');
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const pageInput = document.getElementById('pageInput');
const totalPagesSpan = document.getElementById('totalPages');
const newFileBtn = document.getElementById('newFileBtn');

const loading = document.getElementById('loading');
const errorMessage = document.getElementById('errorMessage');
const errorText = document.getElementById('errorText');

// 새로운 DOM 요소들
const fileName = document.getElementById('fileName');
const fileType = document.getElementById('fileType');
const pdfContainer = document.getElementById('pdfContainer');
const markdownContainer = document.getElementById('markdownContainer');
const markdownContent = document.getElementById('markdownContent');
const markdownSidebar = document.getElementById('markdownSidebar');
const tableOfContents = document.getElementById('tableOfContents');
const pdfNavControls = document.getElementById('pdfNavControls');

const viewModeTab = document.getElementById('viewModeTab');
const compareModeTab = document.getElementById('compareModeTab');
const viewModeContainer = document.getElementById('viewModeContainer');
const compareModeContainer = document.getElementById('compareModeContainer');
const oldFileArea = document.getElementById('oldFileArea');
const newFileArea = document.getElementById('newFileArea');
const oldFileInput = document.getElementById('oldFileInput');
const newFileInput = document.getElementById('newFileInput');
const oldFileStatus = document.getElementById('oldFileStatus');
const newFileStatus = document.getElementById('newFileStatus');
const compareBtn = document.getElementById('compareBtn');
const comparisonContainer = document.getElementById('comparisonContainer');
const comparisonContent = document.getElementById('comparisonContent');
const markdownNavControls = document.getElementById('markdownNavControls');
const tocToggle = document.getElementById('tocToggle');
const scrollTop = document.getElementById('scrollTop');
const closeToc = document.getElementById('closeToc');

// 초기화
document.addEventListener('DOMContentLoaded', function() {
    // PDF.js 뷰어 초기화
    initializePDFViewer();
    
    // Mermaid 초기화
    mermaid.initialize({
        startOnLoad: false,
        theme: 'default',
        securityLevel: 'loose'
    });
    
    setupEventListeners();
});

// PDF.js 뷰어 초기화
function initializePDFViewer() {
    // PDF.js 뷰어 구성 요소 초기화
    console.log('PDF.js 뷰어 초기화');
}

// 이벤트 리스너 설정
function setupEventListeners() {
    // 파일 입력 이벤트
    fileInput.addEventListener('change', handleFileSelect);
    
    // 드래그 앤 드롭 이벤트
    uploadArea.addEventListener('click', () => fileInput.click());
    uploadArea.addEventListener('dragover', handleDragOver);
    uploadArea.addEventListener('dragleave', handleDragLeave);
    uploadArea.addEventListener('drop', handleDrop);
    
    // 비교 모드 파일 입력 이벤트
    oldFileInput.addEventListener('change', (e) => handleComparisonFileSelect(e, 'old'));
    newFileInput.addEventListener('change', (e) => handleComparisonFileSelect(e, 'new'));
    
    // 비교 모드 드래그 앤 드롭 이벤트
    oldFileArea.addEventListener('click', () => oldFileInput.click());
    oldFileArea.addEventListener('dragover', handleDragOver);
    oldFileArea.addEventListener('dragleave', handleDragLeave);
    oldFileArea.addEventListener('drop', (e) => handleComparisonDrop(e, 'old'));
    
    newFileArea.addEventListener('click', () => newFileInput.click());
    newFileArea.addEventListener('dragover', handleDragOver);
    newFileArea.addEventListener('dragleave', handleDragLeave);
    newFileArea.addEventListener('drop', (e) => handleComparisonDrop(e, 'new'));
    
    // 네비게이션 버튼 이벤트
    prevBtn.addEventListener('click', showPrevPage);
    nextBtn.addEventListener('click', showNextPage);
    
    // 페이지 입력 이벤트
    pageInput.addEventListener('change', goToPage);
    pageInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            goToPage();
        }
    });
    
    // 새 파일 버튼 이벤트
    newFileBtn.addEventListener('click', showUploadSection);
    
    viewModeTab.addEventListener('click', () => switchMode('view'));
    compareModeTab.addEventListener('click', () => switchMode('compare'));
    
    compareBtn.addEventListener('click', compareDocuments);
    
    // Markdown 네비게이션 이벤트
    tocToggle.addEventListener('click', toggleTableOfContents);
    scrollTop.addEventListener('click', scrollToTop);
    closeToc.addEventListener('click', hideTableOfContents);
    
    // 키보드 이벤트
    document.addEventListener('keydown', handleKeyboard);
    
    // 줌 컨트롤 이벤트 리스너 설정
    setupZoomControls();
}

// 줌 컨트롤 이벤트 리스너 설정
function setupZoomControls() {
    const zoomOutBtn = document.getElementById('zoomOutBtn');
    const zoomInBtn = document.getElementById('zoomInBtn');
    const zoomSelect = document.getElementById('zoomSelect');
    
    if (zoomOutBtn) {
        zoomOutBtn.addEventListener('click', zoomOut);
    }
    
    if (zoomInBtn) {
        zoomInBtn.addEventListener('click', zoomIn);
    }
    
    if (zoomSelect) {
        zoomSelect.addEventListener('change', handleZoomChange);
    }
}

// 드래그 오버 처리
function handleDragOver(e) {
    e.preventDefault();
    e.currentTarget.classList.add('dragover');
}

// 드래그 리브 처리
function handleDragLeave(e) {
    e.preventDefault();
    e.currentTarget.classList.remove('dragover');
}

// 드롭 처리
function handleDrop(e) {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        handleFile(files[0]);
    }
}

function handleComparisonDrop(e, type) {
    e.preventDefault();
    const area = type === 'old' ? oldFileArea : newFileArea;
    area.classList.remove('dragover');
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        handleComparisonFile(files[0], type);
    }
}

// 파일 선택 처리
function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file) {
        handleFile(file);
    }
}

function handleComparisonFileSelect(e, type) {
    const file = e.target.files[0];
    if (file) {
        handleComparisonFile(file, type);
    }
}

// 파일 처리
function handleFile(file) {
    currentFileName = file.name;
    
    // 파일 타입 확인
    const fileExtension = file.name.toLowerCase().split('.').pop();
    
    if (file.type === 'application/pdf' || fileExtension === 'pdf') {
        currentFileType = 'pdf';
        handlePDFFile(file);
    } else if (fileExtension === 'md' || fileExtension === 'markdown') {
        currentFileType = 'markdown';
        handleMarkdownFile(file);
    } else {
        showError('지원되지 않는 파일 형식입니다. PDF 또는 Markdown 파일을 선택해주세요.');
        return;
    }
}

function handleComparisonFile(file, type) {
    const fileExtension = file.name.toLowerCase().split('.').pop();
    let fileType = null;
    
    if (file.type === 'application/pdf' || fileExtension === 'pdf') {
        fileType = 'pdf';
    } else if (fileExtension === 'md' || fileExtension === 'markdown') {
        fileType = 'markdown';
    } else {
        showComparisonFileStatus(type, 'error', '지원되지 않는 파일 형식입니다.');
        return;
    }
    
    if (type === 'old') {
        oldDocumentType = fileType;
        oldDocument = file;
        showComparisonFileStatus('old', 'success', `${file.name} 선택됨`);
    } else {
        newDocumentType = fileType;
        newDocument = file;
        showComparisonFileStatus('new', 'success', `${file.name} 선택됨`);
    }
    
    if (oldDocument && newDocument) {
        if (oldDocumentType === newDocumentType) {
            compareBtn.disabled = false;
        } else {
            compareBtn.disabled = true;
            showComparisonFileStatus('new', 'error', '두 문서의 형식이 다릅니다. 같은 형식의 문서를 선택해주세요.');
        }
    }
}

// PDF 파일 처리
function handlePDFFile(file) {
    // 파일 크기 검증 (50MB 제한)
    if (file.size > 50 * 1024 * 1024) {
        showError('파일 크기가 너무 큽니다. 50MB 이하의 파일을 선택해주세요.');
        return;
    }
    
    showLoading();
    
    const fileReader = new FileReader();
    fileReader.onload = function(e) {
        const typedarray = new Uint8Array(e.target.result);
        loadPDF(typedarray);
    };
    
    fileReader.onerror = function() {
        hideLoading();
        showError('파일을 읽는 중 오류가 발생했습니다.');
    };
    
    fileReader.readAsArrayBuffer(file);
}

// Markdown 파일 처리
function handleMarkdownFile(file) {
    // 파일 크기 검증 (10MB 제한)
    if (file.size > 10 * 1024 * 1024) {
        showError('파일 크기가 너무 큽니다. 10MB 이하의 파일을 선택해주세요.');
        return;
    }
    
    showLoading();
    
    const fileReader = new FileReader();
    fileReader.onload = function(e) {
        const markdownText = e.target.result;
        loadMarkdown(markdownText);
    };
    
    fileReader.onerror = function() {
        hideLoading();
        showError('파일을 읽는 중 오류가 발생했습니다.');
    };
    
    fileReader.readAsText(file, 'UTF-8');
}

// PDF 로드
async function loadPDF(data) {
    try {
        pdfDoc = await pdfjsLib.getDocument(data).promise;
        totalPages = pdfDoc.numPages;
        currentPage = 1;
        
        // UI 업데이트
        totalPagesSpan.textContent = totalPages;
        pageInput.value = currentPage;
        pageInput.max = totalPages;
        
        // PDF 뷰어를 먼저 표시하여 컨테이너 준비
        showPDFViewer();
        updateNavigationButtons();
        
        // 컨테이너가 준비될 때까지 잠시 대기
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // 첫 번째 페이지 렌더링
        await renderPage(currentPage);
        
        hideLoading();
        
    } catch (error) {
        console.error('PDF 로드 오류:', error);
        hideLoading();
        showError('PDF 파일을 로드할 수 없습니다. 파일이 손상되었거나 지원되지 않는 형식일 수 있습니다.');
    }
}

// 페이지 렌더링
async function renderPage(pageNum) {
    try {
        showLoading();
        
        const page = await pdfDoc.getPage(pageNum);
        const viewerContainer = document.getElementById('viewerContainer');
        const viewer = document.getElementById('viewer');
        
        // 기존 내용 제거
        viewer.innerHTML = '';
        
        let scaleToUse = 1.0;
        let viewport = page.getViewport({ scale: 1.0 });
        
        // 현재 줌 설정에 따라 스케일 결정
        if (currentZoom === 'auto') {
            scaleToUse = calculateOptimalScale(viewport, viewerContainer);
        } else if (currentZoom === 'page-width') {
            scaleToUse = (viewerContainer.clientWidth - 80) / viewport.width;
        } else if (currentZoom === 'page-fit') {
            scaleToUse = calculateOptimalScale(viewport, viewerContainer); // 'auto'와 동일하게 처리
        } else {
            scaleToUse = currentScale; // 고정 스케일 사용
        }
        
        const scaledViewport = page.getViewport({ scale: scaleToUse });
        
        // 뷰어 컨테이너 크기 동적 조정 (자동/페이지 너비/페이지 맞춤 모드에서만)
        if (currentZoom === 'auto' || currentZoom === 'page-width' || currentZoom === 'page-fit') {
            const isLandscape = viewport.width > viewport.height;
            adjustViewerContainer(viewport, isLandscape);
        } else {
            // 고정 스케일 모드에서는 컨테이너 크기 조정하지 않음
            const pdfContainer = document.getElementById('pdfContainer');
            pdfContainer.style.width = 'auto';
            pdfContainer.style.height = 'auto';
            pdfContainer.style.padding = '20px';
            viewerContainer.style.width = 'auto';
            viewerContainer.style.height = 'auto';
        }
        
        // 페이지 컨테이너 생성
        const pageDiv = document.createElement('div');
        pageDiv.className = 'page';
        pageDiv.style.position = 'relative';
        pageDiv.style.margin = '0 auto';
        pageDiv.style.display = 'flex';
        pageDiv.style.justifyContent = 'center';
        pageDiv.style.alignItems = 'center';
        
        // 캔버스 생성
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        canvas.width = scaledViewport.width;
        canvas.height = scaledViewport.height;
        canvas.style.display = 'block';
        canvas.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.1)';
        canvas.style.borderRadius = '4px';
        canvas.style.backgroundColor = 'white';
        
        // 페이지 컨테이너 크기를 캔버스에 맞게 조정
        pageDiv.style.width = scaledViewport.width + 'px';
        pageDiv.style.height = scaledViewport.height + 'px';
        
        pageDiv.appendChild(canvas);
        
        // 텍스트 레이어 컨테이너 생성
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
        
        pageDiv.appendChild(textLayerDiv);
        viewer.appendChild(pageDiv);
        
        // 캔버스 렌더링
        const renderContext = {
            canvasContext: ctx,
            viewport: scaledViewport
        };
        
        await page.render(renderContext).promise;
        
        // 텍스트 레이어 렌더링
        await renderTextLayer(page, scaledViewport, textLayerDiv);
        
        hideLoading();
        
        console.log(`페이지 ${pageNum} 렌더링 완료 (스케일: ${scaleToUse}, 줌 모드: ${currentZoom})`);
        
    } catch (error) {
        console.error('페이지 렌더링 오류:', error);
        hideLoading();
        showError('페이지를 렌더링할 수 없습니다.');
    }
}

// 뷰어 컨테이너 크기 동적 조정
function adjustViewerContainer(viewport, isLandscape) {
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
function calculateOptimalScale(viewport, container) {
    // 컨테이너 크기 확인 및 fallback
    let containerWidth = container.clientWidth || 800; // fallback 크기
    let containerHeight = container.clientHeight || 600; // fallback 크기
    
    // 컨테이너가 숨겨져 있거나 크기가 0인 경우 기본값 사용
    if (containerWidth <= 0) {
        containerWidth = Math.min(window.innerWidth * 0.8, 800);
    }
    if (containerHeight <= 0) {
        containerHeight = Math.min(window.innerHeight * 0.7, 600);
    }
    
    // 패딩 고려
    const availableWidth = containerWidth - 80;
    const availableHeight = containerHeight - 80;
    
    // 가로/세로 스케일 계산
    const scaleX = availableWidth / viewport.width;
    const scaleY = availableHeight / viewport.height;
    
    // 더 작은 스케일을 선택하여 전체 페이지가 보이도록 함
    let optimalScale = Math.min(scaleX, scaleY);
    
    // 스케일 범위 제한 (최소 0.5, 최대 2.0)
    optimalScale = Math.max(0.5, Math.min(optimalScale, 2.0));
    
    // 디버그 로그
    console.log('스케일 계산:', {
        containerWidth,
        containerHeight,
        viewportWidth: viewport.width,
        viewportHeight: viewport.height,
        scaleX,
        scaleY,
        optimalScale
    });
    
    return optimalScale;
}

// 텍스트 레이어 렌더링
async function renderTextLayer(page, viewport, textLayerDiv) {
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
        
        console.log('텍스트 레이어 생성 완료. 텍스트 요소 수:', textLayerDiv.children.length);
        
    } catch (error) {
        console.error('텍스트 레이어 렌더링 오류:', error);
    }
}


// 이전 페이지
function showPrevPage() {
    if (currentPage > 1) {
        currentPage--;
        pageInput.value = currentPage;
        renderPage(currentPage);
        updateNavigationButtons();
    }
}

// 다음 페이지
function showNextPage() {
    if (currentPage < totalPages) {
        currentPage++;
        pageInput.value = currentPage;
        renderPage(currentPage);
        updateNavigationButtons();
    }
}

// 특정 페이지로 이동
function goToPage() {
    const pageNum = parseInt(pageInput.value);
    
    if (pageNum >= 1 && pageNum <= totalPages && pageNum !== currentPage) {
        currentPage = pageNum;
        renderPage(currentPage);
        updateNavigationButtons();
    } else {
        // 잘못된 입력 시 현재 페이지로 복원
        pageInput.value = currentPage;
    }
}

// 네비게이션 버튼 상태 업데이트
function updateNavigationButtons() {
    prevBtn.disabled = currentPage <= 1;
    nextBtn.disabled = currentPage >= totalPages;
}

// 키보드 이벤트 처리
function handleKeyboard(e) {
    if (!pdfDoc) return;
    
    switch(e.key) {
        case 'ArrowLeft':
            e.preventDefault();
            showPrevPage();
            break;
        case 'ArrowRight':
            e.preventDefault();
            showNextPage();
            break;
        case 'Home':
            e.preventDefault();
            currentPage = 1;
            pageInput.value = currentPage;
            renderPage(currentPage);
            updateNavigationButtons();
            break;
        case 'End':
            e.preventDefault();
            currentPage = totalPages;
            pageInput.value = currentPage;
            renderPage(currentPage);
            updateNavigationButtons();
            break;
    }
}

// Markdown 로드
async function loadMarkdown(markdownText) {
    try {
        // Marked 설정
        marked.setOptions({
            breaks: true,
            gfm: true,
            headerIds: true,
            headerPrefix: 'heading-'
        });
        
        // Markdown을 HTML로 변환
        let html = marked.parse(markdownText);
        
        // Mermaid 다이어그램 처리
        html = await processMermaidDiagrams(html);
        
        // HTML 렌더링
        markdownContent.innerHTML = html;
        
        // 코드 하이라이팅 적용
        if (typeof Prism !== 'undefined') {
            Prism.highlightAllUnder(markdownContent);
        }
        
        // 목차 생성
        generateTableOfContents();
        
        // 뷰어 섹션 표시
        showMarkdownViewer();
        
        hideLoading();
        
    } catch (error) {
        console.error('Markdown 로드 오류:', error);
        hideLoading();
        showError('Markdown 파일을 로드할 수 없습니다.');
    }
}

// Mermaid 다이어그램 처리
async function processMermaidDiagrams(html) {
    // Mermaid 코드 블록 찾기
    const mermaidRegex = /<pre><code class="language-mermaid">(.*?)<\/code><\/pre>/gs;
    const matches = [...html.matchAll(mermaidRegex)];
    
    for (let i = 0; i < matches.length; i++) {
        const match = matches[i];
        const mermaidCode = match[1].replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
        const diagramId = `mermaid-diagram-${i}`;
        
        try {
            // Mermaid 다이어그램 렌더링
            const { svg } = await mermaid.render(diagramId, mermaidCode);
            const diagramHtml = `<div class="mermaid">${svg}</div>`;
            html = html.replace(match[0], diagramHtml);
        } catch (error) {
            console.error('Mermaid 렌더링 오류:', error);
            // 오류 시 원본 코드 블록 유지
        }
    }
    
    return html;
}

// 목차 생성
function generateTableOfContents() {
    const headings = markdownContent.querySelectorAll('h1, h2, h3, h4, h5, h6');
    const tocHtml = [];
    
    headings.forEach((heading, index) => {
        const level = heading.tagName.toLowerCase();
        const text = heading.textContent;
        const id = `heading-${index}`;
        
        // 헤딩에 ID 추가
        heading.id = id;
        
        // 목차 항목 생성
        tocHtml.push(`<li><a href="#${id}" class="toc-${level}">${text}</a></li>`);
    });
    
    if (tocHtml.length > 0) {
        tableOfContents.innerHTML = `<ul>${tocHtml.join('')}</ul>`;
        
        // 목차 링크 클릭 이벤트
        tableOfContents.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const targetId = this.getAttribute('href').substring(1);
                const targetElement = document.getElementById(targetId);
                if (targetElement) {
                    targetElement.scrollIntoView({ behavior: 'smooth' });
                }
            });
        });
    } else {
        tableOfContents.innerHTML = '<p>목차가 없습니다.</p>';
    }
}

// Markdown 뷰어 표시
function showMarkdownViewer() {
    // 파일 정보 업데이트
    fileName.textContent = currentFileName;
    fileType.textContent = 'Markdown';
    
    // 컨테이너 전환
    pdfContainer.style.display = 'none';
    markdownContainer.style.display = 'flex';
    
    // 네비게이션 컨트롤 전환
    pdfNavControls.style.display = 'none';
    markdownNavControls.style.display = 'flex';
    
    // 뷰어 섹션 표시
    showViewerSection();
}

// PDF 뷰어 표시
function showPDFViewer() {
    // 파일 정보 업데이트
    fileName.textContent = currentFileName;
    fileType.textContent = 'PDF';
    
    // 컨테이너 전환
    markdownContainer.style.display = 'none';
    pdfContainer.style.display = 'flex';
    
    // 네비게이션 컨트롤 전환
    markdownNavControls.style.display = 'none';
    pdfNavControls.style.display = 'flex';
    
    // 뷰어 섹션 표시
    showViewerSection();
}

// 목차 토글
function toggleTableOfContents() {
    markdownSidebar.classList.toggle('active');
}

// 목차 숨김
function hideTableOfContents() {
    markdownSidebar.classList.remove('active');
}

// 맨 위로 스크롤
function scrollToTop() {
    markdownContent.scrollTo({ top: 0, behavior: 'smooth' });
}

// 업로드 섹션 표시
function showUploadSection() {
    uploadSection.style.display = 'block';
    viewerSection.style.display = 'none';
    
    // 상태 초기화
    pdfDoc = null;
    currentPage = 1;
    totalPages = 0;
    currentFileType = null;
    currentFileName = null;
    fileInput.value = '';
    
    resetComparisonMode();
    
    // 사이드바 숨김
    hideTableOfContents();
}

// 뷰어 섹션 표시
function showViewerSection() {
    uploadSection.style.display = 'none';
    viewerSection.style.display = 'block';
}

// 로딩 표시
function showLoading() {
    loading.style.display = 'flex';
}

// 로딩 숨김
function hideLoading() {
    loading.style.display = 'none';
}

// 에러 메시지 표시
function showError(message) {
    errorText.textContent = message;
    errorMessage.style.display = 'block';
}

// 에러 메시지 숨김
function hideError() {
    errorMessage.style.display = 'none';
}

function switchMode(mode) {
    comparisonMode = mode === 'compare';
    
    if (comparisonMode) {
        viewModeTab.classList.remove('active');
        compareModeTab.classList.add('active');
        viewModeContainer.style.display = 'none';
        compareModeContainer.style.display = 'block';
    } else {
        compareModeTab.classList.remove('active');
        viewModeTab.classList.add('active');
        compareModeContainer.style.display = 'none';
        viewModeContainer.style.display = 'flex';
    }
    
    viewerSection.style.display = 'none';
    uploadSection.style.display = 'block';
    
    // 상태 초기화
    resetComparisonMode();
}

function resetComparisonMode() {
    oldDocument = null;
    newDocument = null;
    oldDocumentText = '';
    newDocumentText = '';
    oldDocumentType = null;
    newDocumentType = null;
    
    oldFileInput.value = '';
    newFileInput.value = '';
    oldFileStatus.style.display = 'none';
    newFileStatus.style.display = 'none';
    compareBtn.disabled = true;
    
    comparisonContainer.style.display = 'none';
}

function showComparisonFileStatus(type, status, message) {
    const statusElement = type === 'old' ? oldFileStatus : newFileStatus;
    statusElement.textContent = message;
    statusElement.className = `file-status ${status}`;
    statusElement.style.display = 'block';
}

async function extractPDFText(file) {
    try {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
        let fullText = '';
        
        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map(item => item.str).join(' ');
            fullText += pageText + '\n';
        }
        
        return fullText;
    } catch (error) {
        console.error('PDF 텍스트 추출 오류:', error);
        throw new Error('PDF 텍스트를 추출할 수 없습니다.');
    }
}

// Markdown 텍스트 추출
async function extractMarkdownText(file) {
    try {
        const text = await file.text();
        return text;
    } catch (error) {
        console.error('Markdown 텍스트 추출 오류:', error);
        throw new Error('Markdown 텍스트를 추출할 수 없습니다.');
    }
}

async function compareDocuments() {
    if (!oldDocument || !newDocument) {
        showError('두 문서를 모두 선택해주세요.');
        return;
    }
    
    try {
        showLoading();
        
        if (oldDocumentType === 'pdf') {
            oldDocumentText = await extractPDFText(oldDocument);
            newDocumentText = await extractPDFText(newDocument);
        } else {
            oldDocumentText = await extractMarkdownText(oldDocument);
            newDocumentText = await extractMarkdownText(newDocument);
        }
        
        const diff = Diff.diffWords(oldDocumentText, newDocumentText);
        
        renderComparisonResult(diff);
        
        // 뷰어 섹션 표시
        uploadSection.style.display = 'none';
        viewerSection.style.display = 'block';
        
        pdfContainer.style.display = 'none';
        markdownContainer.style.display = 'none';
        comparisonContainer.style.display = 'block';
        
        // 파일 정보 업데이트
        fileName.textContent = `${oldDocument.name} vs ${newDocument.name}`;
        fileType.textContent = '문서 비교';
        
        hideLoading();
        
    } catch (error) {
        console.error('문서 비교 오류:', error);
        hideLoading();
        showError('문서 비교 중 오류가 발생했습니다: ' + error.message);
    }
}

function renderComparisonResult(diff) {
    let html = '';
    
    diff.forEach(part => {
        if (part.added) {
            html += `<span class="diff-added">${escapeHtml(part.value)}</span>`;
        } else if (part.removed) {
            html += `<span class="diff-removed">${escapeHtml(part.value)}</span>`;
        } else {
            html += `<span class="diff-unchanged">${escapeHtml(part.value)}</span>`;
        }
    });
    
    comparisonContent.innerHTML = html;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// 윈도우 리사이즈 이벤트
window.addEventListener('resize', function() {
    if (pdfDoc && currentPage) {
        // 리사이즈 시 현재 페이지 다시 렌더링
        setTimeout(() => {
            renderPage(currentPage);
        }, 100);
    }
});

// 줌 기능 구현
function zoomIn() {
    if (!pdfDoc) return;
    
    const currentIndex = zoomLevels.indexOf(currentScale);
    if (currentIndex < zoomLevels.length - 1) {
        currentScale = zoomLevels[currentIndex + 1];
        currentZoom = currentScale.toString();
        updateZoomUI();
        renderPage(currentPage);
    }
}

function zoomOut() {
    if (!pdfDoc) return;
    
    const currentIndex = zoomLevels.indexOf(currentScale);
    if (currentIndex > 0) {
        currentScale = zoomLevels[currentIndex - 1];
        currentZoom = currentScale.toString();
        updateZoomUI();
        renderPage(currentPage);
    }
}

function handleZoomChange() {
    if (!pdfDoc) return;
    
    const zoomSelect = document.getElementById('zoomSelect');
    const selectedValue = zoomSelect.value;
    
    currentZoom = selectedValue;
    
    if (selectedValue === 'auto' || selectedValue === 'page-fit' || selectedValue === 'page-width') {
        // 자동 모드는 기존 로직 사용
        renderPage(currentPage);
    } else {
        // 고정 스케일 모드
        currentScale = parseFloat(selectedValue);
        renderPage(currentPage); // renderPageWithScale 대신 renderPage 호출
    }
    
    updateZoomButtons();
}

function updateZoomUI() {
    const zoomSelect = document.getElementById('zoomSelect');
    if (zoomSelect) {
        zoomSelect.value = currentZoom;
    }
    updateZoomButtons();
}

function updateZoomButtons() {
    const zoomOutBtn = document.getElementById('zoomOutBtn');
    const zoomInBtn = document.getElementById('zoomInBtn');
    
    if (zoomOutBtn && zoomInBtn) {
        const currentIndex = zoomLevels.indexOf(currentScale);
        zoomOutBtn.disabled = currentIndex <= 0 || currentZoom === 'auto' || currentZoom === 'page-fit' || currentZoom === 'page-width';
        zoomInBtn.disabled = currentIndex >= zoomLevels.length - 1 || currentZoom === 'auto' || currentZoom === 'page-fit' || currentZoom === 'page-width';
    }
}


// 키보드 줌 단축키 추가
function handleKeyboard(e) {
    if (!pdfDoc) return;
    
    // Ctrl/Cmd + Plus/Minus로 줌 조정
    if ((e.ctrlKey || e.metaKey) && (e.key === '+' || e.key === '=')) {
        e.preventDefault();
        zoomIn();
        return;
    }
    
    if ((e.ctrlKey || e.metaKey) && e.key === '-') {
        e.preventDefault();
        zoomOut();
        return;
    }
    
    switch(e.key) {
        case 'ArrowLeft':
            e.preventDefault();
            showPrevPage();
            break;
        case 'ArrowRight':
            e.preventDefault();
            showNextPage();
            break;
        case 'Home':
            e.preventDefault();
            currentPage = 1;
            pageInput.value = currentPage;
            renderPage(currentPage);
            updateNavigationButtons();
            break;
        case 'End':
            e.preventDefault();
            currentPage = totalPages;
            pageInput.value = currentPage;
            renderPage(currentPage);
            updateNavigationButtons();
            break;
    }
}

// 페이지 언로드 시 정리
window.addEventListener('beforeunload', function() {
    if (pdfDoc) {
        pdfDoc.destroy();
    }
});
