import * as pdfViewer from './pdf-viewer.js';
import * as markdownViewer from './markdown-viewer.js';
import { showLoading, hideLoading, showError, hideError, showPDFViewer, showMarkdownViewer } from './ui.js';

// PDF.js 워커 설정
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

// 전역 변수
let currentFileType = null;
export let currentFileName = null;

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

// 초기화
document.addEventListener('DOMContentLoaded', function() {
    // 뷰어 모듈 초기화
    pdfViewer.initializePDFViewer();
    markdownViewer.initializeMarkdownViewer();
    
    // UI 콜백 설정
    pdfViewer.setUICallbacks({
        showLoading,
        hideLoading,
        showError,
        showPDFViewer
    });
    
    setupEventListeners();
});

// 이벤트 리스너 설정
function setupEventListeners() {
    setupFileEventListeners();
    setupComparisonEventListeners();
    setupNavigationEventListeners();
    setupRemoteFileEventListeners();
    
    // 기타 이벤트
    newFileBtn.addEventListener('click', showUploadSection);
    viewModeTab.addEventListener('click', () => switchMode('view'));
    compareModeTab.addEventListener('click', () => switchMode('compare'));
    compareBtn.addEventListener('click', compareDocuments);
    document.addEventListener('keydown', handleKeyboard);
    setupZoomControls();
}

// 파일 업로드 관련 이벤트 설정
function setupFileEventListeners() {
    fileInput.addEventListener('change', handleFileSelect);
    uploadArea.addEventListener('click', () => fileInput.click());
    uploadArea.addEventListener('dragover', handleDragOver);
    uploadArea.addEventListener('dragleave', handleDragLeave);
    uploadArea.addEventListener('drop', handleDrop);
}

// 비교 모드 관련 이벤트 설정
function setupComparisonEventListeners() {
    oldFileInput.addEventListener('change', (e) => handleComparisonFileSelect(e, 'old'));
    newFileInput.addEventListener('change', (e) => handleComparisonFileSelect(e, 'new'));
    
    oldFileArea.addEventListener('click', () => oldFileInput.click());
    oldFileArea.addEventListener('dragover', handleDragOver);
    oldFileArea.addEventListener('dragleave', handleDragLeave);
    oldFileArea.addEventListener('drop', (e) => handleComparisonDrop(e, 'old'));
    
    newFileArea.addEventListener('click', () => newFileInput.click());
    newFileArea.addEventListener('dragover', handleDragOver);
    newFileArea.addEventListener('dragleave', handleDragLeave);
    newFileArea.addEventListener('drop', (e) => handleComparisonDrop(e, 'new'));
}

// PDF 네비게이션 관련 이벤트 설정
function setupNavigationEventListeners() {
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const pageInput = document.getElementById('pageInput');
    
    if (prevBtn) prevBtn.addEventListener('click', pdfViewer.showPrevPage);
    if (nextBtn) nextBtn.addEventListener('click', pdfViewer.showNextPage);
    
    if (pageInput) {
        pageInput.addEventListener('change', pdfViewer.goToPage);
        pageInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                pdfViewer.goToPage();
            }
        });
    }
}

// 원격 파일 로드 관련 이벤트 설정
function setupRemoteFileEventListeners() {
    const remoteFileUrlInput = document.getElementById('remoteFileUrl');
    const loadRemoteFileBtn = document.getElementById('loadRemoteFileBtn');
    
    if (loadRemoteFileBtn && remoteFileUrlInput) {
        loadRemoteFileBtn.addEventListener('click', () => {
            // 기존 에러 메시지 숨김
            hideError();
            
            const url = remoteFileUrlInput.value.trim();
            if (!url) {
                showError('URL을 입력하세요.');
                return;
            }
            fetchFileByUrl(url);
        });
        
        remoteFileUrlInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                // 기존 에러 메시지 숨김
                hideError();
                loadRemoteFileBtn.click();
            }
        });
        
        // URL 입력 시작 시에도 에러 메시지 숨김
        remoteFileUrlInput.addEventListener('input', () => {
            const errorMessage = document.getElementById('errorMessage');
            if (errorMessage && errorMessage.style.display === 'block') {
                hideError();
            }
        });
    }
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
        markdownViewer.loadMarkdownFromFile(file);
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
async function handlePDFFile(fileOrPathOrData) {
    const { data, fileName } = await preparePDFData(fileOrPathOrData);
    if (!data) return;
    
    currentFileName = fileName;
    currentFileType = 'pdf';
    showLoading();
    
    await pdfViewer.loadPDF(data);
    hideLoading();
}

// PDF 데이터 준비 함수
async function preparePDFData(fileOrPathOrData) {
    if (typeof fileOrPathOrData === 'string') {
        return await loadPDFFromURL(fileOrPathOrData);
    } else if (fileOrPathOrData instanceof Uint8Array) {
        return { data: fileOrPathOrData, fileName: currentFileName || 'remote-file.pdf' };
    } else {
        return await loadPDFFromFile(fileOrPathOrData);
    }
}

// URL에서 PDF 로드
async function loadPDFFromURL(url) {
    const fileName = url.split('/').pop();
    try {
        await validateURLAccess(url);
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const arrayBuffer = await response.arrayBuffer();
        return { data: new Uint8Array(arrayBuffer), fileName };
    } catch (error) {
        hideLoading();
        showError(`파일을 로드하는 중 오류가 발생했습니다: ${error.message}`);
        logError('Fetch 오류', error, url);
        return { data: null, fileName: null };
    }
}

// URL 접근 유효성 검증
async function validateURLAccess(url) {
    try {
        const headResponse = await fetch(url, { method: 'HEAD' });
        if (!headResponse.ok) {
            if (headResponse.status === 404) {
                throw new Error('파일을 찾을 수 없습니다 (404 Not Found). URL을 확인해주세요.');
            } else if (headResponse.status === 403) {
                throw new Error('파일에 대한 접근 권한이 없습니다 (403 Forbidden).');
            } else {
                throw new Error(`서버 오류가 발생했습니다 (HTTP ${headResponse.status}).`);
            }
        }
    } catch (headError) {
        if (headError.name === 'TypeError' && headError.message.includes('Failed to fetch')) {
            throw new Error('CORS 정책으로 인해 파일에 접근할 수 없습니다. 이 서버는 크로스 오리진 요청을 허용하지 않습니다.');
        }
        throw headError;
    }
}

// 파일에서 PDF 로드
async function loadPDFFromFile(file) {
    if (file.size > 50 * 1024 * 1024) {
        showError('파일 크기가 너무 큽니다. 50MB 이하의 파일을 선택해주세요.');
        return { data: null, fileName: null };
    }
    
    const data = await new Promise((resolve, reject) => {
        const fileReader = new FileReader();
        fileReader.onload = (e) => resolve(new Uint8Array(e.target.result));
        fileReader.onerror = (e) => reject(new Error('파일을 읽는 중 오류가 발생했습니다.'));
        fileReader.readAsArrayBuffer(file);
    });
    
    return { data, fileName: file.name };
}

// 에러 로깅 함수
function logError(title, error, url = null) {
    if (typeof process === 'undefined' || process.env.NODE_ENV !== 'test') {
        console.error(title + ':', error);
        console.error('Error details:', {
            name: error.name,
            message: error.message,
            stack: error.stack,
            ...(url && { url })
        });
    }
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
            oldDocumentText = await markdownViewer.extractMarkdownText(oldDocument);
            newDocumentText = await markdownViewer.extractMarkdownText(newDocument);
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

// 원격 파일 로드 함수
export async function fetchFileByUrl(url, handlers = {}) {
    const resolvedHandlers = resolveHandlers(handlers);
    resolvedHandlers.hideLoading();
    resolvedHandlers.showLoading();
    
    try {
        const { fileType, fileName } = getFileInfoFromUrl(url);
        await loadRemoteFile(url, fileType, fileName, resolvedHandlers);
    } catch (err) {
        handleRemoteFileError(err, url, resolvedHandlers);
    } finally {
        resolvedHandlers.hideLoading();
    }
}

// 핸들러 기본값 설정
function resolveHandlers(handlers) {
    return {
        handlePDFFile: handlers.handlePDFFile || handlePDFFile,
        loadMarkdownFromText: handlers.loadMarkdownFromText || markdownViewer.loadMarkdownFromText,
        showError: handlers.showError || showError,
        showLoading: handlers.showLoading || showLoading,
        hideLoading: handlers.hideLoading || hideLoading,
        setCurrentFileName: handlers.setCurrentFileName || ((name) => { currentFileName = name; })
    };
}

// URL에서 파일 정보 추출
function getFileInfoFromUrl(url) {
    const urlObj = new URL(url);
    const fileName = urlObj.pathname.split('/').pop() || 'remote-file';
    const ext = fileName.split('.').pop().toLowerCase();
    let fileType = null;
    
    if (ext === 'pdf') fileType = 'pdf';
    else if (ext === 'md' || ext === 'markdown') fileType = 'markdown';
    else throw new Error('지원하지 않는 파일 형식입니다. PDF 또는 Markdown 파일만 가능합니다.');
    
    return { fileType, fileName };
}

// 원격 파일 로드 실행
async function loadRemoteFile(url, fileType, fileName, handlers) {
    if (fileType === 'pdf') {
        handlers.setCurrentFileName(fileName);
        await handlers.handlePDFFile(url);
    } else if (fileType === 'markdown') {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`파일을 불러올 수 없습니다. (HTTP ${response.status})`);
        const text = await response.text();
        handlers.setCurrentFileName(fileName);
        await handlers.loadMarkdownFromText(text, fileName);
    }
}

// 원격 파일 로드 에러 처리
function handleRemoteFileError(err, url, handlers) {
    handlers.hideLoading();
    let errorMsg = `원격 파일을 로드할 수 없습니다: ${err.message}`;
    
    if (err.name === 'TypeError' && err.message.includes('Failed to fetch')) {
        errorMsg += '\n\n가능한 원인:\n- CORS 정책으로 인한 접근 제한 (가장 일반적인 원인)\n- 네트워크 연결 문제\n- 잘못된 URL\n- 서버에서 파일을 찾을 수 없음';
    } else if (err.message.includes('HTTP')) {
        errorMsg += '\n\nHTTP 응답 오류입니다. 파일이 존재하지 않거나 서버에 문제가 있을 수 있습니다.';
    }
    
    handlers.showError(errorMsg);
    logError('URL 로드 오류', err, url);
}
