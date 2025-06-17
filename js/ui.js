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
    errorText.textContent = message;
    errorMessage.style.display = 'block';
}

// 에러 메시지 숨김
export function hideError() {
    const errorMessage = document.getElementById('errorMessage');
    errorMessage.style.display = 'none';
}

// PDF 뷰어 표시
export function showPDFViewer() {
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

// Markdown 뷰어 표시
export function showMarkdownViewer() {
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

// 뷰어 섹션 표시
export function showViewerSection() {
    uploadSection.style.display = 'none';
    viewerSection.style.display = 'block';
}
