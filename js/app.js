import * as pdfViewer from './pdf-viewer.js';
import { showLoading, hideLoading, showError, showPDFViewer, showMarkdownViewer } from './ui.js';

// PDF.js 워커 설정
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

// 전역 변수
let currentFileType = null;
let currentFileName = null;

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
    pdfViewer.initializePDFViewer();
    
    // UI 콜백 설정
    pdfViewer.setUICallbacks({
        showLoading,
        hideLoading,
        showError,
        showPDFViewer
    });
    
    // Mermaid 초기화
    mermaid.initialize({
        startOnLoad: false,
        theme: 'default',
        securityLevel: 'loose'
    });
    
    setupEventListeners();
    
    // 테스트용: 자동으로 테스트 PDF 로드
    setTimeout(() => {
        handlePDFFile('test-new.pdf');
    }, 1000);
});

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
    
    // 네비게이션 버튼 이벤트 - 모듈 함수 사용
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const pageInput = document.getElementById('pageInput');
    
    if (prevBtn) prevBtn.addEventListener('click', pdfViewer.showPrevPage);
    if (nextBtn) nextBtn.addEventListener('click', pdfViewer.showNextPage);
    
    // 페이지 입력 이벤트
    if (pageInput) {
        pageInput.addEventListener('change', pdfViewer.goToPage);
        pageInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                pdfViewer.goToPage();
            }
        });
    }
    
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
        zoomOutBtn.addEventListener('click', pdfViewer.zoomOut);
    }
    
    if (zoomInBtn) {
        zoomInBtn.addEventListener('click', pdfViewer.zoomIn);
    }
    
    if (zoomSelect) {
        zoomSelect.addEventListener('change', pdfViewer.handleZoomChange);
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
async function handlePDFFile(fileOrPath) {
    let data;
    let fileNameToDisplay;

    if (typeof fileOrPath === 'string') { // 경로가 주어진 경우 (자동 로드용)
        fileNameToDisplay = fileOrPath.split('/').pop();
        try {
            const response = await fetch(fileOrPath);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const arrayBuffer = await response.arrayBuffer();
            data = new Uint8Array(arrayBuffer);
        } catch (error) {
            hideLoading();
            showError(`파일을 로드하는 중 오류가 발생했습니다: ${error.message}`);
            console.error('Fetch 오류:', error);
            return;
        }
    } else { // File 객체가 주어진 경우 (사용자 업로드용)
        fileNameToDisplay = fileOrPath.name;
        // 파일 크기 검증 (50MB 제한)
        if (fileOrPath.size > 50 * 1024 * 1024) {
            showError('파일 크기가 너무 큽니다. 50MB 이하의 파일을 선택해주세요.');
            return;
        }
        
        data = await new Promise((resolve, reject) => {
            const fileReader = new FileReader();
            fileReader.onload = (e) => resolve(new Uint8Array(e.target.result));
            fileReader.onerror = (e) => reject(new Error('파일을 읽는 중 오류가 발생했습니다.'));
            fileReader.readAsArrayBuffer(fileOrPath);
        });
    }
    
    currentFileName = fileNameToDisplay; // 파일 이름 설정
    showLoading();
    
    // 모듈 함수 사용
    await pdfViewer.loadPDF(data);
    showPDFViewer();
    hideLoading();
}

// Markdown 파일 처리
function handleMarkdownFile(file) {
    
    // 파일 크기 검증 (10MB 제한)
    if (file.size > 10 * 1024 * 1024) {
        showError('파일 크기가 너무 큽니다. 10MB 이하의 파일을 선택해주세요.');
        return;
    }
    
    showLoading();
    currentFileName = file.name; // 전역 변수에 파일 이름 설정
    
    const fileReader = new FileReader();
    fileReader.onload = function(e) {
        const markdownText = e.target.result;
        loadMarkdown(markdownText, file.name); // 파일 이름 전달
    };
    
    fileReader.onerror = function() {
        hideLoading();
        showError('파일을 읽는 중 오류가 발생했습니다.');
    };
    
    fileReader.readAsText(file, 'UTF-8');
}

// Markdown 로드
async function loadMarkdown(markdownText, fileName) {
    try {
        // 파일 이름이 전달되지 않은 경우 기본값 설정
        if (!fileName && (typeof currentFileName === 'undefined' || currentFileName === null)) {
            window.currentFileName = 'untitled.md';
        } else if (fileName) {
            window.currentFileName = fileName;
        }
        
        // UI 업데이트
        if (fileName) {
            document.getElementById('fileName').textContent = fileName;
        }
        
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
        showMarkdownViewer();
        hideLoading();
        
    } catch (error) {
        console.error('Markdown 로드 중 오류 발생:', error);
        hideLoading();
        showError(`Markdown 파일을 로드할 수 없습니다: ${error.message}`);
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

function handleKeyboard(e) {
    if (!pdfViewer.getPdfDoc() || currentFileType !== 'pdf') {
        return;
    }
    
    switch(e.key) {
        case 'ArrowLeft':
            e.preventDefault();
            pdfViewer.showPrevPage();
            break;
        case 'ArrowRight':
            e.preventDefault();
            pdfViewer.showNextPage();
            break;
        case 'Home':
            e.preventDefault();
            const pageInput = document.getElementById('pageInput');
            if (pageInput) {
                pageInput.value = 1;
                pdfViewer.goToPage();
            }
            break;
        case 'End':
            e.preventDefault();
            const pageInputEnd = document.getElementById('pageInput');
            if (pageInputEnd) {
                pageInputEnd.value = pdfViewer.getTotalPages();
                pdfViewer.goToPage();
            }
            break;
    }
}

// 윈도우 리사이즈 이벤트
window.addEventListener('resize', function() {
    if (pdfViewer.getPdfDoc() && pdfViewer.getCurrentPage()) {
        // 리사이즈 시 현재 페이지 다시 렌더링
        setTimeout(() => {
            pdfViewer.renderPage(pdfViewer.getCurrentPage());
        }, 100);
    }
});

// 페이지 언로드 시 정리
window.addEventListener('beforeunload', function() {
    const pdfDoc = pdfViewer.getPdfDoc();
    if (pdfDoc) {
        pdfDoc.destroy();
    }
});
