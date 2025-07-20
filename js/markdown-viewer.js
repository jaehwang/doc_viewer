import { showLoading, hideLoading, showError, showMarkdownViewer } from './ui.js';

// 초기화 (Safari 호환성 개선)
export function initializeMarkdownViewer() {
    // 라이브러리 로딩 완료 대기
    waitForLibraries().then(() => {
        // Mermaid 초기화
        if (typeof mermaid !== 'undefined') {
            mermaid.initialize({
                startOnLoad: false,
                theme: 'default',
                securityLevel: 'loose'
            });
        }
    });
}

// 마크다운 이벤트 리스너 설정 (마크다운 로드 후 호출)
function setupMarkdownEventListeners() {
    const tocToggle = document.getElementById('tocToggle');
    const closeToc = document.getElementById('closeToc');

    if (tocToggle) {
        // 기존 이벤트 리스너 제거 후 새로 추가
        tocToggle.removeEventListener('click', toggleTableOfContents);
        tocToggle.addEventListener('click', toggleTableOfContents);
        console.log('목차 토글 버튼 이벤트 리스너 설정됨');
    }
    
    if (closeToc) {
        closeToc.removeEventListener('click', hideTableOfContents);
        closeToc.addEventListener('click', hideTableOfContents);
        console.log('목차 닫기 버튼 이벤트 리스너 설정됨');
    }
}

// 필수 라이브러리 로딩 대기 함수
function waitForLibraries() {
    return new Promise((resolve) => {
        const checkLibraries = () => {
            const markedLoaded = typeof marked !== 'undefined';
            const mermaidLoaded = typeof mermaid !== 'undefined';
            const prismLoaded = typeof Prism !== 'undefined';
            const katexLoaded = typeof katex !== 'undefined' && typeof renderMathInElement !== 'undefined';
            
            if (markedLoaded && mermaidLoaded && prismLoaded && katexLoaded) {
                resolve();
            } else {
                setTimeout(checkLibraries, 100);
            }
        };
        
        checkLibraries();
    });
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

// 텍스트로부터 Markdown 로드 (Safari 호환성 개선)
export async function loadMarkdownFromText(markdownText, fileName) {
    const markdownContent = document.getElementById('markdownContent');
    if (!markdownContent) return;

    showLoading();
    
    try {
        // 라이브러리 로딩 완료 대기
        await waitForLibraries();
        
        // Marked가 로드되지 않은 경우 폴백
        if (typeof marked === 'undefined') {
            throw new Error('Marked 라이브러리가 로드되지 않았습니다.');
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

        // $$ ... $$ 블록 수식이 <p>, <br>, 줄바꿈 등 다양한 조합으로 감싸지는 경우 모두 치환
        html = html
            .replace(/<p>\s*(\${2}[\s\S]*?\${2})\s*<\/p>/g, '$1')
            .replace(/<p>\s*(\${2}[\s\S]*?\${2})\s*<br\s*\/?>\s*<\/p>/g, '$1')
            .replace(/<br\s*\/?>\s*(\${2}[\s\S]*?\${2})\s*<br\s*\/?>/g, '$1')
            .replace(/\${2}\s*<br\s*\/?>/g, '$$\n')
            .replace(/<br\s*\/?>\s*\${2}/g, '\n$$')
            .replace(/\${2}\s*\n/g, '$$\n')
            .replace(/\n\s*\${2}/g, '\n$$')
            .replace(/(^|\n)\s*(\${2}[\s\S]*?\${2})\s*(?=\n|$)/g, function(match, p1, p2) { return '\n' + p2 + '\n'; });

        // Mermaid 다이어그램 처리
        html = await processMermaidDiagrams(html);

        // HTML 렌더링
        markdownContent.innerHTML = html;

        // KaTeX 수식 렌더링 (자동)
        if (window.renderMathInElement) {
            renderMathInElement(markdownContent, {
                delimiters: [
                    {left: '$$', right: '$$', display: true},
                    {left: '$', right: '$', display: false},
                    {left: '\\(', right: '\\)', display: false},
                    {left: '\\[', right: '\\]', display: true}
                ],
                throwOnError: false
            });
        }

        // 코드 하이라이팅 적용
        if (typeof Prism !== 'undefined') {
            Prism.highlightAllUnder(markdownContent);
        }

        // 목차 생성
        generateTableOfContents();
        
        // 목차 관련 이벤트 리스너 설정 (마크다운 로드 후에 설정)
        setupMarkdownEventListeners();
        
        showMarkdownViewer(fileName);
    } catch (error) {
        console.error('Markdown 로드 중 오류 발생:', error);
        showError(`Markdown 파일을 로드할 수 없습니다: ${error.message}`);
    } finally {
        hideLoading();
    }
}

// Mermaid 다이어그램 처리 (Safari 호환성 개선)
async function processMermaidDiagrams(html) {
    const mermaidRegex = /<pre><code class="language-mermaid">([\s\S]*?)<\/code><\/pre>/g;
    
    // Safari 호환성을 위해 matchAll 대신 exec 사용
    const matches = [];
    let match;
    while ((match = mermaidRegex.exec(html)) !== null) {
        matches.push(match);
        // 무한 루프 방지
        if (mermaidRegex.lastIndex === match.index) {
            mermaidRegex.lastIndex++;
        }
    }

    for (let i = 0; i < matches.length; i++) {
        const currentMatch = matches[i];
        
        // HTML 엔티티를 디코딩하고, <br> 태그를 개행 문자로 변환
        const textarea = document.createElement('textarea');
        textarea.innerHTML = currentMatch[1];
        const mermaidCode = textarea.value.replace(/<br\s*\/?>/g, '\n');
        
        const diagramId = `mermaid-diagram-${i}`;

        try {
            // Mermaid가 사용 가능한지 확인
            if (typeof mermaid !== 'undefined' && mermaid.render) {
                const { svg } = await mermaid.render(diagramId, mermaidCode);
                const diagramHtml = `<div class="mermaid">${svg}</div>`;
                html = html.replace(currentMatch[0], diagramHtml);
            } else {
                console.warn('Mermaid가 로드되지 않았습니다.');
                // 폴백: 원본 코드 블록 유지
                const fallbackHtml = `<pre><code class="language-mermaid">${mermaidCode}</code></pre>`;
                html = html.replace(currentMatch[0], fallbackHtml);
            }
        } catch (error) {
            console.error('Mermaid 렌더링 오류:', error);
            // 오류 시 원본 코드 블록 유지
            const fallbackHtml = `<pre><code class="language-mermaid">${mermaidCode}</code></pre>`;
            html = html.replace(currentMatch[0], fallbackHtml);
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
