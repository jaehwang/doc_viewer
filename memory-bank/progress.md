# Progress

## What Works

* **Universal Viewer 구현 완료**: PDF.js 표준 뷰어를 기반으로 한 통합 문서 뷰어가 메인 인터페이스로 완전히 설정됨. PDF와 Markdown 파일을 하나의 인터페이스에서 지원하며, 모든 아이콘과 리소스가 정상 로드됨. (2025-07-19)
* **PDF 텍스트 선택 문제 근본 해결**: 커스텀 텍스트 레이어 대신 PDF.js 표준 뷰어의 완성된 텍스트 선택 기능을 채택하여 위치 불일치 문제 완전 해결. (2025-07-19)
* **에러 메시지 팝업 안정성 개선**: URL 미입력 시 나타나는 에러 팝업이 '확인' 버튼으로 안정적으로 닫히도록 수정됨. 이벤트 핸들러 등록 방식을 개선하여 Safari 등 다양한 브라우저와의 호환성을 확보. (2025-07-16)
* PDF/Markdown 뷰어, 문서 비교, 코드 하이라이팅, 자동 목차, Mermaid 다이어그램 등 README.md에 명시된 주요 기능이 정상 동작
* **KaTeX(LaTeX) 블록 수식 렌더링 개선**: js/markdown-viewer.js에서 다양한 HTML 변환 케이스(<p>$$<br>수식<br>$$</p>, $$\n수식\n$$ 등)에 대응하는 정규식 치환 로직을 추가하여, 인라인($...$) 및 블록($$...$$) 수식 모두 정상적으로 렌더링됨을 확인 (2025-06-22)
* **PDF 기본 줌 설정 개선**: 100%를 기본값으로 설정하여 예측 가능한 초기 크기 제공
* **PDF 페이지 간 크기 불일치 문제 해결**: 100% 고정 줌에서 모든 페이지 크기가 일관적으로 유지됨(`commit: 59bce91`)
* **URL 파일 로딩 기능 완성**: PDF 파일 URL 로딩 시 상세한 에러 처리 및 사용자 친화적 메시지 제공
  - handlePDFFile 함수 개선: URL과 File 객체 모두 적절히 처리
  - HEAD 요청을 통한 선제적 에러 감지 (CORS, 404, 403, 기타 HTTP 에러)
  - GitHub raw 파일 등 다양한 소스에서 URL 로딩 테스트 성공
* 원격 파일 로드 UI 및 fetchFileByUrl 함수 구현, CORS 허용 서버에서 정상 동작 확인
* fetchFileByUrl의 currentFileName 상태가 핸들러(setCurrentFileName)로 일관되게 갱신됨
* **`app.js` 리팩터링 및 모듈 분리 완료**: Markdown 관련 코드를 `js/markdown-viewer.js`로 분리하고, 이에 맞춰 `app.js`, `ui.js`, `pdf-viewer.js`를 수정.
* **테스트 스위트 확장 및 개선**: `tests/markdown-viewer.test.js`를 추가하고, 기존 테스트를 리팩터링된 코드에 맞게 수정하여 모든 테스트 통과 확인.
* memory bank, README, 설계 문서 등 주요 문서의 동기화 완료

## What's Left to Build

### Priority: High
* **다크모드 기능 추가** - CSS 변수 기반 테마 전환 시스템
* **전체화면 모드 추가** - 몰입 읽기를 위한 전체화면 뷰어

### Priority: Medium  
* **기존 커스텀 뷰어 기능 통합** - old.index.html의 문서 비교 기능을 새로운 Universal Viewer에 통합
* **진행률 표시 기능 추가** - 문서 읽기 진행 상황 시각화
* **PDF 목차 자동 생성 및 표시** - PDF 북마크 추출 및 네비게이션
* **향상된 Markdown 기능** - 새로운 뷰어에서 목차 사이드바, 스크롤 동기화 등 추가

### Priority: Low
* **단축키 확장 및 도움말 패널** - 키보드 단축키 추가 및 가이드
* **마우스 드래그 스크롤 기능** - 마우스로 문서 드래그하여 스크롤
* **자동 스크롤 기능** - 읽기 속도에 맞춘 자동 스크롤
* **문서 정보 표시** - 파일 크기, 페이지수, 생성일 등 메타데이터
* **읽기 시간 추정 기능** - 문서 길이 기반 예상 읽기 시간
* **인쇄 최적화 (CSS print 스타일)** - 브라우저 인쇄 최적화

### Completed Issues ✅
* **PDF 텍스트 선택 문제**: PDF.js 표준 뷰어 도입으로 근본 해결됨
* **Universal Viewer 아키텍처**: PDF와 Markdown 통합 인터페이스 완성
* **PDF.js Integration**: vendor/web/, vendor/build/ 경로 및 리소스 로딩 문제 해결

### Technical Debt
* URL 로딩 기능 추가 개선
  - 로딩 진행율 표시 기능
  - URL 입력 UI/UX 개선
  - 더 다양한 파일 소스 지원 테스트
* CORS 우회(프록시) 옵션 안내 및 테스트용 CORS 허용 파일 목록 제공
* `js/diff-viewer.js` 모듈화: 현재 `app.js`에 포함된 문서 비교 로직을 별도 파일로 분리하는 작업 검토.
* 테스트 커버리지 확대: `js/diff-viewer.js` 등 추가 모듈에 대한 단위/통합 테스트 추가
* LICENSE 파일 생성 및 명시
* 커스터마이징 기능 강화(UI 테마, Mermaid 테마 등)
* 더 상세한 오류 처리 및 사용자 피드백 메커니즘

## Current Status

* **Universal Viewer 구축 완료**: PDF.js 표준 뷰어 기반 통합 인터페이스가 새로운 index.html로 설정됨 (2025-07-19)
* 기존 커스텀 뷰어는 old.index.html로 백업하여 기능 참조 및 마이그레이션에 활용
* 프로젝트의 기본 골격(index.html, css/style.css, js/app.js, js/pdf-viewer.js, js/ui.js) 존재
* **URL 파일 로딩 기능 완성** (2025-01-22): handlePDFFile 함수 개선 및 상세 에러 처리 구현 완료
* 원격 파일 로드 기능이 UI/핸들러/예외 처리까지 구현됨
* fetchFileByUrl의 파일명 상태 동기화 및 테스트 신뢰성 확보
* **PDF 페이지 간 크기 불일치 문제 해결(`commit: 59bce91`)**
* **`app.js` 리팩터링 완료** (2025-06-22):
  - `js/markdown-viewer.js` 모듈을 생성하여 Markdown 관련 기능 분리.
  - `app.js`, `ui.js`, `pdf-viewer.js`의 의존성 구조 개선.
  - `tests/markdown-viewer.test.js` 추가 및 기존 테스트 코드 수정 완료.
* **PDF 텍스트 선택 문제 적극적 해결 중** (2025-01-21):
  - 텍스트 요소 너비 정확성 개선: 3가지 방법으로 너비 계산 및 최대값 사용
  - 컨테이너 크기 0 문제 해결: CSS 스타일 강제 적용 및 DOM 레이아웃 완료 대기
  - 상세 디버깅 로그 시스템 구축: POST-SCALE VERIFICATION으로 실제 렌더링 상태 추적
* package.json을 통한 Jest 기반 테스트 환경 설정
* Babel 설정(.babelrc) 존재
* README.md에 프로젝트의 기능, 기술 스택, 사용법 등이 상세히 문서화됨
* memory bank 파일들이 README.md 및 프로젝트 현황에 맞게 업데이트됨
* 최근 memory bank 초기화 및 1차 업데이트는 커밋(ID: 92bbdc5)으로 관리됨

## Known Issues

* **PDF 텍스트 선택 문제 해결됨 ✅** (2025-07-19): PDF.js 표준 뷰어 도입으로 완전 해결
* **URL 에러 팝업 닫기 문제 해결됨** (2025-07-16)
* 매우 큰 PDF 파일(50MB 이상)은 성능 이슈가 있을 수 있음
* 일부 복잡한 PDF 폼은 완전히 지원되지 않을 수 있음
* 인터넷 연결이 필요함(CDN 라이브러리 사용 시)
* **CORS 정책 제한**: 일부 외부 서버에서는 CORS 정책으로 인해 URL 로딩이 제한될 수 있음 (에러 메시지로 안내됨)
* README.md의 프로젝트 구조와 실제 파일 구조 간 약간의 불일치 존재 가능성
* **`js/markdown-viewer.js` 구현 완료**: README.md에 언급되었던 가상 파일이 실제 코드로 구현됨.

## Evolution of Project Decisions

* **Architecture Pivot (2025-07-19)**: 커스텀 PDF 뷰어에서 PDF.js 표준 뷰어 기반 Universal Viewer로 완전 전환하여 텍스트 선택 등 핵심 기능의 안정성 확보
* 초기 단계: 기본적인 PDF 및 Markdown 뷰어 기능 구현에 집중
* 기능 확장: 문서 비교, Mermaid 다이어그램, 자동 목차 등 고급 기능 추가
* 원격 파일 로드 기능 추가 및 CORS 이슈 안내
* fetchFileByUrl의 상태 동기화 및 테스트 신뢰성 확보(핸들러 패턴, 조건부 검증)
* **URL 파일 로딩 기능 완성**: handlePDFFile 함수 개선 및 HEAD 요청 기반 에러 처리 구현
* 사용자 경험 개선: 드래그 앤 드롭, 반응형 디자인, 키보드 단축키 등 편의 기능 도입
* **PDF 뷰어 사용성 개선**: 사용자 피드백에 따라 자동 조정에서 100% 고정으로 기본 줌 변경
* **PDF 페이지 간 크기 불일치 문제 해결 및 문서화(`commit: 59bce91`)**
* **버그 추적 체계화**: specs/bugs.md를 통한 체계적인 버그 문서화 및 해결 과정 추적
* 기술 스택 선택: 경량성과 유연성을 위해 Vanilla JavaScript 기반, 외부 라이브러리는 검증된 것만 사용
* 테스트 도입: Jest를 활용한 코드 안정성 확보 노력
* 문서화: README.md를 통해 프로젝트 정보를 상세히 제공
* memory bank 도입 및 관리: 프로젝트의 지속적인 관리와 이해를 돕기 위해 memory bank 시스템을 초기화하고, 주기적으로 업데이트하는 프로세스 정립
