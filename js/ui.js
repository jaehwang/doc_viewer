// UI 관련 기능

// 로딩 표시
export function showLoading() {
    const loading = document.getElementById('loading');
    loading.style.display = 'flex';
}

// 로딩 숨김
export function hideLoading() {
    const loading = document.getElementById('loading');
    loading.style.display = 'none';
}

// 에러 메시지 표시
export function showError(message) {
    const errorText = document.getElementById('errorText');
    const errorMessage = document.getElementById('errorMessage');
    
    if (!errorText || !errorMessage) {
        console.error('Error message elements not found');
        return;
    }
    
    errorText.textContent = message;
    errorMessage.style.display = 'block';
    
    // Safari 호환성을 위한 지연된 이벤트 리스너 등록
    setTimeout(() => {
        setupErrorButtonListener(errorMessage);
    }, 10);
}

// Safari 호환성을 위한 별도 함수로 분리
function setupErrorButtonListener(errorMessage) {
    const errorButton = errorMessage.querySelector('button');
    if (errorButton) {
        // Safari에서 더 안정적인 이벤트 리스너 등록 방식
        errorButton.onclick = null; // 기존 onclick 제거
        errorButton.removeEventListener('click', hideError); // 기존 리스너 제거
        
        // 여러 방식으로 이벤트 리스너 등록 (Safari 호환성)
        errorButton.addEventListener('click', hideError, { once: false });
        errorButton.onclick = hideError; // 백업용 onclick 핸들러
        
        // Safari 감지 및 추가 처리
        const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
        if (isSafari) {
            // Safari 전용 추가 처리
            errorButton.addEventListener('touchend', hideError, { once: false });
            console.log('Safari detected: Additional event listeners added');
        }
        
        // 디버깅을 위한 로그
        if (typeof process === 'undefined' || process.env.NODE_ENV !== 'production') {
            console.log('Error message displayed, button event listener attached (Safari compatible)');
        }
    } else {
        console.error('Error button not found in error message');
        
        // 버튼을 찾지 못한 경우 DOM이 완전히 로드될 때까지 재시도
        setTimeout(() => {
            setupErrorButtonListener(errorMessage);
        }, 100);
    }
}

// 에러 메시지 숨김
export function hideError() {
    const errorMessage = document.getElementById('errorMessage');
    errorMessage.style.display = 'none';
}

// PDF 뷰어 표시
export function showPDFViewer(fileNameToDisplay) {
    // 파일 정보 업데이트
    const fileNameElement = document.getElementById('fileName');
    const fileTypeElement = document.getElementById('fileType');
    
    fileNameElement.textContent = fileNameToDisplay;
    fileTypeElement.textContent = 'PDF';
    
    // 컨테이너 전환
    markdownContainer.style.display = 'none';
    pdfContainer.style.display = 'flex';
    
    // 네비게이션 컨트롤 전환
    markdownNavControls.style.display = 'none';
    pdfNavControls.style.display = 'flex';
    
    // 뷰어 섹션 표시
    showViewerSection();
}

// Markdown 뷰어 표시
export function showMarkdownViewer(fileNameToDisplay) {
    // 파일 정보 업데이트
    const fileNameElement = document.getElementById('fileName');
    const fileTypeElement = document.getElementById('fileType');

    fileNameElement.textContent = fileNameToDisplay;
    fileTypeElement.textContent = 'Markdown';
    
    // 컨테이너 전환
    pdfContainer.style.display = 'none';
    markdownContainer.style.display = 'flex';
    
    // 네비게이션 컨트롤 전환
    pdfNavControls.style.display = 'none';
    markdownNavControls.style.display = 'flex';
    
    // 뷰어 섹션 표시
    showViewerSection();
}

// 뷰어 섹션 표시
export function showViewerSection() {
    uploadSection.style.display = 'none';
    viewerSection.style.display = 'block';
}
