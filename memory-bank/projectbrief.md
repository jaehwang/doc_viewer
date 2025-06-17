# Project Brief

## Core Requirements

*   PDF 및 Markdown 파일 지원
*   Mermaid 다이어그램 렌더링 기능
*   자동 목차 생성 기능
*   문서 비교 기능 (버전 비교, 실시간 차이점 표시)
*   고품질 PDF 렌더링 (PDF.js 활용)
*   PDF 페이지 네비게이션 (이전/다음 페이지, 특정 페이지 이동)
*   PDF 반응형 스케일링 및 키보드 단축키 지원
*   GitHub Flavored Markdown (GFM) 호환 Markdown 뷰어
*   Markdown 내 코드 하이라이팅 (Prism.js 활용)
*   Markdown 뷰어 내 스마트 링크 및 목차 기반 스크롤
*   드래그 앤 드롭 방식의 파일 업로드
*   반응형 사용자 인터페이스 디자인

## Goals

*   다양한 문서 형식을 지원하는 포괄적인 웹 기반 문서 뷰어 솔루션 제공
*   사용자에게 직관적이고 효율적인 문서 보기, 탐색 및 비교 경험 제공
*   안정적이고 빠른 문서 로딩, 렌더링 및 분석 성능 보장

## Scope

*   웹 브라우저에서 실행되는 클라이언트 사이드 문서 뷰어 애플리케이션
*   지원 파일 형식: PDF (.pdf), Markdown (.md, .markdown)
*   주요 기능 모듈:
    *   PDF 뷰어 (페이지 넘김, 확대/축소, 직접 이동)
    *   Markdown 뷰어 (GFM, Mermaid 다이어그램, 코드 하이라이팅, 자동 목차)
    *   문서 비교 (텍스트 기반, 버전 간 차이 시각화)
*   사용자 인터페이스:
    *   드래그 앤 드롭 파일 업로드
    *   데스크톱, 태블릿, 모바일 반응형 레이아웃
    *   파일 타입별 최적화된 컨트롤 제공
*   주요 기술 스택:
    *   프론트엔드: HTML5, CSS3, Vanilla JavaScript
    *   라이브러리: PDF.js, Marked.js, Mermaid.js, Prism.js, jsdiff
*   배포: 로컬 웹 서버 또는 `index.html` 직접 열기를 통한 실행 지원
