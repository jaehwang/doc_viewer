# Progress

## What Works

* PDF/Markdown 뷰어, 문서 비교, 코드 하이라이팅, 자동 목차, Mermaid 다이어그램 등 README.md에 명시된 주요 기능이 정상 동작
* **PDF 기본 줌 설정 개선**: 100%를 기본값으로 설정하여 예측 가능한 초기 크기 제공
* **PDF 페이지 간 크기 불일치 문제 해결**: 100% 고정 줌에서 모든 페이지 크기가 일관적으로 유지됨(`commit: 59bce91`)
* 원격 파일 로드 UI 및 fetchFileByUrl 함수 구현, CORS 허용 서버에서 정상 동작 확인
* fetchFileByUrl의 currentFileName 상태가 핸들러(setCurrentFileName)로 일관되게 갱신됨
* Jest 기반 테스트 환경 구축 및 테스트 코드(app.test.js, pdf-viewer.test.js)에서 모든 시나리오(정상, 실패, CORS, HTTP 에러, 실제 네트워크) 100% 통과
* memory bank, README, 설계 문서 등 주요 문서의 동기화 완료

## What's Left to Build

* **CRITICAL: PDF 텍스트 선택 영역 오른쪽 끝 문제 해결** - 선택 영역이 텍스트 끝까지 도달하지 않는 문제 (진행 중)
* PDF.js 텍스트 레이어의 텍스트 요소 너비 정확성 완성 및 모든 줌 레벨에서 정확한 텍스트 선택 구현
* CORS 우회(프록시) 옵션 안내 및 테스트용 CORS 허용 파일 목록 제공
* fetchFileByUrl 함수의 예외 처리 및 사용자 경험 개선(로딩, 에러, 안내)
* js/markdown-viewer.js, js/diff-viewer.js 등 README에 언급된 모듈화된 JS 파일의 실제 구현 및 app.js와의 통합(현재 js/ 폴더에 없음)
* 테스트 커버리지 확대: app.test.js, pdf-viewer.test.js 외 다른 모듈(Markdown, Diff 등)에 대한 단위/통합 테스트 추가
* LICENSE 파일 생성 및 명시
* 커스터마이징 기능 강화(UI 테마, Mermaid 테마 등)
* 더 상세한 오류 처리 및 사용자 피드백 메커니즘

## Current Status

* 프로젝트의 기본 골격(index.html, css/style.css, js/app.js, js/pdf-viewer.js, js/ui.js) 존재
* 원격 파일 로드 기능이 UI/핸들러/예외 처리까지 구현됨
* fetchFileByUrl의 파일명 상태 동기화 및 테스트 신뢰성 확보
* **PDF 페이지 간 크기 불일치 문제 해결(`commit: 59bce91`)**
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

* **CRITICAL: PDF 텍스트 선택 영역 오른쪽 끝 문제** (진행 중) - 마우스 드래그 시 선택 영역이 텍스트 끝까지 도달하지 않는 문제 (specs/bugs.md 참조)
  - 현재 해결 시도: 텍스트 요소 너비 정확성 개선, 컨테이너 크기 문제 해결, 상세 디버깅 시스템 구축
* 매우 큰 PDF 파일(50MB 이상)은 성능 이슈가 있을 수 있음
* 일부 복잡한 PDF 폼은 완전히 지원되지 않을 수 있음
* 인터넷 연결이 필요함(CDN 라이브러리 사용 시)
* CORS 정책으로 인해 fetch로 원격 파일을 불러올 때 제한이 있음(코드로 해결 불가, 테스트는 조건부 통과)
* README.md의 프로젝트 구조와 실제 파일 구조 간 약간의 불일치 존재 가능성
* README.md에 언급된 일부 기능(Markdown 뷰어, 문서 비교 등)을 담당하는 js/markdown-viewer.js, js/diff-viewer.js 파일이 현재 js/ 폴더에 없음(app.js 내부 통합 또는 미구현 상태)

## Evolution of Project Decisions

* 초기 단계: 기본적인 PDF 및 Markdown 뷰어 기능 구현에 집중
* 기능 확장: 문서 비교, Mermaid 다이어그램, 자동 목차 등 고급 기능 추가
* 원격 파일 로드 기능 추가 및 CORS 이슈 안내
* fetchFileByUrl의 상태 동기화 및 테스트 신뢰성 확보(핸들러 패턴, 조건부 검증)
* 사용자 경험 개선: 드래그 앤 드롭, 반응형 디자인, 키보드 단축키 등 편의 기능 도입
* **PDF 뷰어 사용성 개선**: 사용자 피드백에 따라 자동 조정에서 100% 고정으로 기본 줌 변경
* **PDF 페이지 간 크기 불일치 문제 해결 및 문서화(`commit: 59bce91`)**
* **버그 추적 체계화**: specs/bugs.md를 통한 체계적인 버그 문서화 및 해결 과정 추적
* 기술 스택 선택: 경량성과 유연성을 위해 Vanilla JavaScript 기반, 외부 라이브러리는 검증된 것만 사용
* 테스트 도입: Jest를 활용한 코드 안정성 확보 노력
* 문서화: README.md를 통해 프로젝트 정보를 상세히 제공
* memory bank 도입 및 관리: 프로젝트의 지속적인 관리와 이해를 돕기 위해 memory bank 시스템을 초기화하고, 주기적으로 업데이트하는 프로세스 정립
