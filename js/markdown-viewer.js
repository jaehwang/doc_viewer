import { showLoading, hideLoading, showError, showMarkdownViewer } from './ui.js';

// 초기화
export function initializeMarkdownViewer() {
    // Mermaid 초기화
    mermaid.initialize({
        startOnLoad: false,
        theme: 'default',
        securityLevel: 'loose'
    });

    // 이벤트 리스너 설정
    const tocToggle = document.getElementById('tocToggle');
    const scrollTop = document.getElementById('scrollTop');
    const closeToc = document.getElementById('closeToc');

    if (tocToggle) tocToggle.addEventListener('click', toggleTableOfContents);
    if (scrollTop) scrollTop.addEventListener('click', scrollToTop);
    if (closeToc) closeToc.addEventListener('click', hideTableOfContents);
}

// 파일로부터 Markdown 로드
export function loadMarkdownFromFile(file) {
    // 파일 크기 검증 (10MB 제한)
    if (file.size > 10 * 1024 * 1024) {
        showError('파일 크기가 너무 큽니다. 10MB 이하의 파일을 선택해주세요.');
        return;
    }

    showLoading();

    const fileReader = new FileReader();
    fileReader.onload = function(e) {
        const markdownText = e.target.result;
        loadMarkdownFromText(markdownText, file.name);
    };

    fileReader.onerror = function() {
        hideLoading();
        showError('파일을 읽는 중 오류가 발생했습니다.');
    };

    fileReader.readAsText(file, 'UTF-8');
}

// 텍스트로부터 Markdown 로드
export async function loadMarkdownFromText(markdownText, fileName) {
    const markdownContent = document.getElementById('markdownContent');
    if (!markdownContent) return;

    showLoading();
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
        showMarkdownViewer(fileName);
    } catch (error) {
        console.error('Markdown 로드 중 오류 발생:', error);
        showError(`Markdown 파일을 로드할 수 없습니다: ${error.message}`);
    } finally {
        hideLoading();
    }
}

// Mermaid 다이어그램 처리
async function processMermaidDiagrams(html) {
    const mermaidRegex = /<pre><code class="language-mermaid">([\s\S]*?)<\/code><\/pre>/g;
    const matches = [...html.matchAll(mermaidRegex)];

    for (let i = 0; i < matches.length; i++) {
        const match = matches[i];
        
        // HTML 엔티티를 디코딩하고, <br> 태그를 개행 문자로 변환
        const textarea = document.createElement('textarea');
        textarea.innerHTML = match[1];
        const mermaidCode = textarea.value.replace(/<br\s*\/?>/g, '\n');
        
        const diagramId = `mermaid-diagram-${i}`;

        try {
            const { svg } = await mermaid.render(diagramId, mermaidCode);
            const diagramHtml = `<div class="mermaid">${svg}</div>`;
            html = html.replace(match[0], diagramHtml);
        } catch (error) {
            console.error('Mermaid 렌더링 오류:', error);
        }
    }
    return html;
}

// 목차 생성
function generateTableOfContents() {
    const markdownContent = document.getElementById('markdownContent');
    const tableOfContents = document.getElementById('tableOfContents');
    if (!markdownContent || !tableOfContents) return;

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
    const markdownSidebar = document.getElementById('markdownSidebar');
    if (markdownSidebar) markdownSidebar.classList.toggle('active');
}

// 목차 숨김
function hideTableOfContents() {
    const markdownSidebar = document.getElementById('markdownSidebar');
    if (markdownSidebar) markdownSidebar.classList.remove('active');
}

// 맨 위로 스크롤
function scrollToTop() {
    const markdownContent = document.getElementById('markdownContent');
    if (markdownContent) markdownContent.scrollTo({ top: 0, behavior: 'smooth' });
}

// Markdown 텍스트 추출 (비교 기능용)
export async function extractMarkdownText(file) {
    try {
        const text = await file.text();
        return text;
    } catch (error) {
        console.error('Markdown 텍스트 추출 오류:', error);
        throw new Error('Markdown 텍스트를 추출할 수 없습니다.');
    }
}
