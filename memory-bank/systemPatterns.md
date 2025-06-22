# System Patterns

## System Architecture

*   **클라이언트 사이드 애플리케이션**: 모든 로직은 사용자의 웹 브라우저에서 실행됩니다. 서버는 정적 파일 제공 역할만 합니다 (로컬 실행 시).
*   **모듈형 JavaScript**: 기능별로 JavaScript 파일을 분리하여 관리합니다 (예: `app.js`, `pdf-viewer.js`, `ui.js`).
*   **단일 페이지 애플리케이션 (SPA) 형태**: `index.html`을 중심으로 동적으로 콘텐츠를 변경하고 표시합니다.
*   **라이브러리 의존적 기능 구현**: PDF 렌더링(PDF.js), Markdown 파싱(Marked.js), 다이어그램(Mermaid.js), 코드 하이라이팅(Prism.js), 텍스트 비교(jsdiff) 등 핵심 기능은 외부 라이브러리를 활용합니다.

## Key Technical Decisions

*   **Vanilla JavaScript 사용**: 외부 프레임워크 없이 순수 JavaScript로 개발하여 경량성과 학습 용이성을 추구합니다.
*   **CDN을 통한 라이브러리 사용**: 설치 복잡성을 줄이고 빠르게 기능을 통합하기 위해 주요 라이브러리는 CDN을 통해 로드합니다. (단, `README.md`에는 명시되어 있으나, 실제 프로젝트 파일 구조에서는 로컬 라이브러리 사용 가능성도 있음 - 확인 필요)
*   **File API 활용**: 로컬 파일 접근 및 처리를 위해 HTML5 File API를 사용합니다.
*   **CSS3 스타일링**: Flexbox, Grid 등을 활용하여 반응형 레이아웃 및 현대적인 UI를 구현합니다.

## Design Patterns in Use

*   **모듈 패턴 (JavaScript)**: 각 `.js` 파일이 특정 기능 그룹을 담당하며, 전역 스코프 오염을 최소화합니다. (예: `pdfViewer` 모듈, `markdownViewer` 모듈 등 - `app.js` 내에서 관리될 가능성)
*   **이벤트 기반 아키텍처**: 사용자 인터랙션(클릭, 드래그앤드롭 등)에 따라 특정 함수가 실행되는 이벤트 리스너 패턴을 광범위하게 사용합니다.
*   **싱글톤 유사 패턴**: `app.js`가 전체 애플리케이션의 상태와 로직을 중앙에서 관리하는 역할을 할 수 있습니다.
*   **전략 패턴 (Strategy Pattern) 유사**: 파일 타입(PDF, Markdown)에 따라 다른 뷰어 로직을 선택적으로 실행합니다.

## Component Relationships

*   `index.html`: 애플리케이션의 기본 골격과 UI 요소들을 정의합니다. 모든 JavaScript 파일과 CSS 파일의 진입점입니다.
*   `css/style.css`: 애플리케이션의 전반적인 시각적 스타일과 레이아웃을 담당합니다.
*   `js/app.js`: 메인 애플리케이션 로직을 포함하며, 파일 처리, 모드 전환, UI 이벤트 핸들링 등 전체적인 흐름을 제어합니다. 다른 JS 모듈들을 통합하고 조정하는 역할을 합니다.
*   `js/pdf-viewer.js`: PDF.js 라이브러리를 사용하여 PDF 파일 렌더링, 페이지 네비게이션, 확대/축소 등의 PDF 관련 기능을 담당합니다. `app.js`에 의해 호출되어 사용됩니다.
*   `js/markdown-viewer.js`: Marked.js, Mermaid.js, Prism.js 등의 라이브러리를 사용하여 Markdown 파싱, 다이어그램 렌더링, 코드 하이라이팅, 목차 생성 등 Markdown 관련 기능을 담당합니다. `app.js`에 의해 호출되어 사용됩니다.
*   `js/ui.js`: 사용자 인터페이스 요소(로딩, 에러 메시지, 뷰어 표시 등)의 동적인 제어 및 상호작용 로직을 담당합니다. `app.js` 및 다른 뷰어 모듈들과 연동됩니다.
*   (가상) `js/diff-viewer.js`: jsdiff 라이브러리를 사용하여 문서 비교 기능을 담당합니다. (현재 `app.js`에 로직이 포함되어 있으며, 향후 분리 가능)
*   외부 라이브러리 (PDF.js, Marked.js, Mermaid.js, Prism.js, jsdiff): 각 전문 기능을 제공하며, 해당 기능 모듈(`pdf-viewer.js` 등) 또는 `app.js`에서 직접 호출되어 사용됩니다.

## Critical Implementation Paths

*   **파일 업로드 및 타입 감지**: 사용자가 파일을 업로드했을 때, 파일 형식을 정확히 감지하고 적절한 뷰어 모듈로 전달하는 경로.
*   **PDF 렌더링 및 인터랙션**: PDF 파일을 받아 PDF.js를 통해 캔버스에 렌더링하고, 페이지 이동 및 확대/축소 기능을 구현하는 경로.
*   **Markdown 파싱 및 동적 콘텐츠 렌더링**: Markdown 텍스트를 HTML로 변환하고, Mermaid 다이어그램 및 코드 블록을 올바르게 렌더링하며, 목차를 생성하고 상호작용하도록 하는 경로.
*   **문서 비교 로직**: 두 개의 문서를 받아 텍스트를 추출하고, jsdiff를 사용하여 차이점을 분석한 뒤, 시각적으로 강조하여 표시하는 경로.
*   **UI 상태 관리 및 반응형 업데이트**: 사용자 인터랙션 및 창 크기 변경에 따라 UI 요소들을 동적으로 업데이트하고 일관된 상태를 유지하는 경로.
