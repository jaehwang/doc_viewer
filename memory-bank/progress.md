# Progress

## What Works

* PDF/Markdown 뷰어, 문서 비교, 코드 하이라이팅, 자동 목차, Mermaid 다이어그램 등 README.md에 명시된 주요 기능이 정상 동작
* Jest 기반 테스트 환경 구축 및 일부 테스트 코드 구현(app.test.js, pdf-viewer.test.js)
* 커밋, 브랜치 병합, 푸시 등 Git 워크플로우 정상 작동
* memory bank 파일과 README.md, package.json 등 주요 문서의 동기화 완료

## What's Left to Build

* js/markdown-viewer.js, js/diff-viewer.js 등 README에 언급된 모듈화된 JS 파일의 실제 구현 및 app.js와의 통합(현재 js/ 폴더에 없음)
* 테스트 커버리지 확대: app.test.js, pdf-viewer.test.js 외 다른 모듈(Markdown, Diff 등)에 대한 단위/통합 테스트 추가
* README.md에 언급된 "로컬 웹 서버" 실행 스크립트(npm start 등) 추가 고려
* LICENSE 파일 생성 및 명시
* 커스터마이징 기능 강화(UI 테마, Mermaid 테마 등)
* 더 상세한 오류 처리 및 사용자 피드백 메커니즘

## Current Status

* 프로젝트의 기본 골격(index.html, css/style.css, js/app.js, js/pdf-viewer.js, js/ui.js) 존재
* package.json을 통한 Jest 기반 테스트 환경 설정
* Babel 설정(.babelrc) 존재
* README.md에 프로젝트의 기능, 기술 스택, 사용법 등이 상세히 문서화됨
* memory bank 파일들이 README.md 및 프로젝트 현황에 맞게 업데이트됨
* 최근 memory bank 초기화 및 1차 업데이트는 커밋(ID: 92bbdc5)으로 관리됨

## Known Issues

* 매우 큰 PDF 파일(50MB 이상)은 성능 이슈가 있을 수 있음
* 일부 복잡한 PDF 폼은 완전히 지원되지 않을 수 있음
* 인터넷 연결이 필요함(CDN 라이브러리 사용 시)
* README.md의 프로젝트 구조와 실제 파일 구조 간 약간의 불일치 존재 가능성
* README.md에 언급된 일부 기능(Markdown 뷰어, 문서 비교 등)을 담당하는 js/markdown-viewer.js, js/diff-viewer.js 파일이 현재 js/ 폴더에 없음(app.js 내부 통합 또는 미구현 상태)

## Evolution of Project Decisions

* 초기 단계: 기본적인 PDF 및 Markdown 뷰어 기능 구현에 집중
* 기능 확장: 문서 비교, Mermaid 다이어그램, 자동 목차 등 고급 기능 추가
* 사용자 경험 개선: 드래그 앤 드롭, 반응형 디자인, 키보드 단축키 등 편의 기능 도입
* 기술 스택 선택: 경량성과 유연성을 위해 Vanilla JavaScript 기반, 외부 라이브러리는 검증된 것만 사용
* 테스트 도입: Jest를 활용한 코드 안정성 확보 노력
* 문서화: README.md를 통해 프로젝트 정보를 상세히 제공
* memory bank 도입 및 관리: 프로젝트의 지속적인 관리와 이해를 돕기 위해 memory bank 시스템을 초기화하고, 주기적으로 업데이트하는 프로세스 정립
