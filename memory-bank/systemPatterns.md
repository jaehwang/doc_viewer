# System Patterns

## System Architecture

*   **Universal Viewer Architecture**: PDF.js 표준 뷰어를 기반으로 한 통합 문서 뷰어로 PDF와 Markdown 파일을 하나의 인터페이스에서 지원합니다.
*   **클라이언트 사이드 애플리케이션**: 모든 로직은 사용자의 웹 브라우저에서 실행됩니다. 서버는 정적 파일 제공 역할만 합니다 (로컬 실행 시).
*   **PDF.js 표준 뷰어 기반**: Mozilla의 검증된 PDF.js viewer.html을 기반으로 확장하여 안정성과 완성도를 확보합니다.
*   **Dual Interface Support**: 표준 PDF.js 뷰어와 기존 커스텀 뷰어(old.index.html)를 병행 지원하여 점진적 마이그레이션을 가능하게 합니다.
*   **라이브러리 의존적 기능 구현**: PDF 렌더링(PDF.js), Markdown 파싱(Marked.js), 다이어그램(Mermaid.js), 코드 하이라이팅(Prism.js), 텍스트 비교(jsdiff) 등 핵심 기능은 외부 라이브러리를 활용합니다.

## Key Technical Decisions

*   **PDF.js 표준 뷰어 채택**: 커스텀 구현 대신 검증된 공식 뷰어를 기반으로 하여 텍스트 선택, 검색, 인쇄 등 핵심 기능의 안정성을 확보합니다.
*   **Progressive Enhancement**: 기존 커스텀 뷰어의 장점(문서 비교, 드래그앤드롭)을 새로운 Universal Viewer에 점진적으로 통합합니다.
*   **Hybrid Architecture**: vendor/web/viewer.html 기반 표준 뷰어와 커스텀 JavaScript 모듈을 결합하여 최적의 사용자 경험을 제공합니다.
*   **Vendor Directory Structure**: PDF.js 리소스를 vendor/web/, vendor/build/ 구조로 체계적으로 관리합니다.
*   **CDN과 Local Resource 병행**: 기존 라이브러리는 CDN을 유지하되, PDF.js는 로컬 설치하여 커스터마이징 가능성을 확보합니다.
*   **File API 활용**: 로컬 파일 접근 및 처리를 위해 HTML5 File API를 사용합니다.

## Design Patterns in Use

*   **모듈 패턴 (JavaScript)**: 각 `.js` 파일이 특정 기능 그룹을 담당하며, 전역 스코프 오염을 최소화합니다. (예: `pdfViewer` 모듈, `markdownViewer` 모듈 등 - `app.js` 내에서 관리될 가능성)
*   **이벤트 기반 아키텍처**: 사용자 인터랙션(클릭, 드래그앤드롭 등)에 따라 특정 함수가 실행되는 이벤트 리스너 패턴을 광범위하게 사용합니다.
*   **싱글톤 유사 패턴**: `app.js`가 전체 애플리케이션의 상태와 로직을 중앙에서 관리하는 역할을 할 수 있습니다.
*   **전략 패턴 (Strategy Pattern) 유사**: 파일 타입(PDF, Markdown)에 따라 다른 뷰어 로직을 선택적으로 실행합니다.

## Component Relationships

### Universal Viewer (Current Main Interface)
*   `index.html`: PDF.js 표준 뷰어 기반 Universal Viewer로 PDF와 Markdown 파일을 통합 지원합니다.
*   `vendor/web/viewer.html`: PDF.js 공식 뷰어의 기반이 되며, Markdown 지원을 위한 커스터마이징이 추가되었습니다.
*   `vendor/web/`, `vendor/build/`: PDF.js 뷰어의 리소스, 스타일, 스크립트 파일들이 체계적으로 구성되어 있습니다.
*   Markdown 지원: marked.js, Mermaid.js, Prism.js, KaTeX 등의 라이브러리가 PDF.js 뷰어에 통합되어 작동합니다.

### Legacy Custom Viewer (Backup & Reference)
*   `old.index.html`: 기존 커스텀 뷰어로 문서 비교, 드래그앤드롭 등 특수 기능 구현의 참조용으로 보존됩니다.
*   `css/style.css`: 커스텀 뷰어의 스타일링을 담당하며, Universal Viewer에 부분적으로 참조됩니다.
*   `js/app.js`: 메인 애플리케이션 로직 및 파일 처리, 모드 전환 등을 담당합니다.
*   `js/pdf-viewer.js`: 커스텀 PDF 뷰어 구현체로 텍스트 선택 문제 해결 과정의 기록을 포함합니다.
*   `js/markdown-viewer.js`: Markdown 파싱, 렌더링 로직의 참조 구현체입니다.
*   `js/ui.js`: UI 상태 관리 및 사용자 인터랙션 처리 로직입니다.

## Critical Implementation Paths

### Universal Viewer (Current)
*   **PDF.js 표준 뷰어 통합**: vendor/web/viewer.html을 기반으로 하여 안정적인 PDF 렌더링, 텍스트 선택, 검색 등의 핵심 기능을 제공하는 경로.
*   **Markdown 확장 통합**: PDF.js 뷰어에 Markdown 파일 처리 기능을 추가하여 툴바에서 Markdown 파일을 선택하고 렌더링하는 경로.
*   **리소스 경로 관리**: vendor/web/, vendor/build/ 디렉토리 구조에서 PDF.js 리소스를 정확히 로드하는 경로.

### Legacy Paths (Reference)
*   **파일 업로드 및 타입 감지**: 사용자가 파일을 업로드했을 때, 파일 형식을 정확히 감지하고 적절한 뷰어 모듈로 전달하는 경로.
*   **문서 비교 로직**: 두 개의 문서를 받아 텍스트를 추출하고, jsdiff를 사용하여 차이점을 분석한 뒤, 시각적으로 강조하여 표시하는 경로.
*   **커스텀 Markdown 렌더링**: Markdown 텍스트를 HTML로 변환하고, Mermaid 다이어그램 및 코드 블록을 올바르게 렌더링하며, 목차를 생성하고 상호작용하도록 하는 경로.
