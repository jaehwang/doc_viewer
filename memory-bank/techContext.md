# Tech Context

## Technologies Used

*   **프론트엔드**:
    *   HTML5 (시맨틱 마크업, File API)
    *   CSS3 (Flexbox, Grid, 애니메이션)
    *   Vanilla JavaScript (ES6+ 모듈 시스템 사용 - `"type": "module"` in `package.json`)
*   **핵심 라이브러리 (CDN 로드)**:
    *   PDF.js: Mozilla의 JavaScript PDF 렌더러
    *   Marked.js: Markdown 파서
    *   Mermaid.js: 다이어그램 및 차트 렌더링
    *   Prism.js: 코드 구문 강조
    *   jsdiff: 텍스트 차이 분석 및 비교
    *   KaTeX: LaTeX 수식 렌더링
*   **테스팅**:
    *   Jest: JavaScript 테스팅 프레임워크
    *   JSDOM: Jest 테스트를 위한 DOM 환경
*   **빌드/개발 도구 (package.json 기반)**:
    *   Babel (`@babel/preset-env`, `@babel/preset-react`): JavaScript 트랜스파일러 (React 프리셋이 있지만 실제 사용 여부는 코드 확인 필요)
    *   Node.js/npm: 패키지 관리 및 스크립트 실행 환경

## Development Setup

*   **요구사항**:
    *   모던 웹 브라우저 (Chrome, Firefox, Safari, Edge)
    *   Node.js 및 npm (의존성 설치 및 테스트 스크립트 실행용)
    *   로컬 웹 서버 (선택사항, 파일 업로드 기능을 위해 권장, 예: Python `http.server`)
*   **로컬 실행 방법**:
    1.  저장소 클론: `git clone <repository-url>`
    2.  프로젝트 디렉토리로 이동: `cd doc_viewer` (또는 `pdf_bbs` - README와 실제 디렉토리명 일치 필요)
    3.  (필요시) 의존성 설치: `npm install`
    4.  웹 서버 실행 (Python 예시): `python -m http.server 8000`
    5.  브라우저에서 `http://localhost:8000` 접속
    6.  또는 `index.html` 파일을 브라우저에서 직접 열기
*   **테스트 실행**:
    *   전체 테스트: `npm test`
    *   감시 모드 테스트: `npm run test:watch`
    *   커버리지 리포트 생성: `npm run test:coverage`
*   **Babel 설정**: `.babelrc` 파일에 Babel 설정이 정의되어 있음 (ES6+ 및 React JSX 변환 가능성)

## Technical Constraints

*   **브라우저 호환성**: 모던 웹 브라우저에 의존적. 구형 브라우저 지원 제한적일 수 있음.
*   **클라이언트 사이드 처리 한계**: 매우 큰 파일(예: 50MB 이상 PDF) 처리 시 성능 저하 가능성.
*   **인터넷 연결**: `index.html`에서 확인된 바와 같이, 모든 핵심 외부 라이브러리는 CDN을 통해 로드되므로 인터넷 연결이 필수적입니다. `package.json`의 의존성은 주로 Node.js 기반의 테스트 환경(Jest)을 위한 것입니다.
*   **PDF 폼 지원**: 일부 복잡한 PDF 폼은 완벽하게 지원되지 않을 수 있음.
*   **보안**: 클라이언트 사이드에서 파일을 다루므로, 파일 접근 권한 및 XSS 등의 웹 보안 고려 필요.

## Dependencies

*   **프로덕션 의존성 (`dependencies` in `package.json`)**:
    *   `@babel/preset-env`: ES6+ 코드를 구형 브라우저와 호환되도록 변환
    *   `@babel/preset-react`: React JSX 구문을 변환 (실제 React 사용 여부 확인 필요)
    *   `canvas`: Node.js 환경에서 Canvas API를 사용하기 위한 라이브러리 (주로 서버 사이드 또는 빌드 시 사용되나, PDF.js의 Node.js 환경 테스트 등과 관련될 수 있음)
*   **개발 의존성 (`devDependencies` in `package.json`)**:
    *   `jest`: 테스팅 프레임워크
    *   `jest-environment-jsdom`: Jest를 위한 JSDOM 환경

## Tool Usage Patterns

*   **npm 스크립트**: `package.json`의 `scripts` 섹션을 통해 테스트 관련 명령어 실행 (`test`, `test:watch`, `test:coverage`).
*   **Jest**: 단위 테스트 및 통합 테스트 작성 및 실행. `setupTests.js` 파일을 통해 테스트 환경 설정. `testMatch`로 테스트 파일 경로 지정. `transformIgnorePatterns`로 특정 `node_modules` 패키지 변환 제외 설정.
*   **Babel**: `.babelrc` 설정을 기반으로 JavaScript 코드 트랜스파일링 (주로 Jest 테스트 실행 시 또는 빌드 프로세스(정의되어 있다면)에서 사용될 것으로 예상).
*   **Git**: 버전 관리 시스템으로 사용 (저장소 클론 명령어 존재).
*   **로컬 웹 서버**: 개발 및 테스트 목적으로 로컬에서 `index.html`을 호스팅하는 데 사용 (예: Python `http.server`).
