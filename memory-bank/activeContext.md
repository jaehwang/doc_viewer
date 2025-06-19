# Active Context

## Current Work Focus

*   마크다운 파일 로딩 오류(`currentFileName is not defined`, `showViewerSection is not defined`) 해결
*   setupTests.js를 tests/ 디렉토리로 이동 및 package.json 테스트 환경 경로 수정
*   브랜치 병합 및 원격 저장소 푸시
*   index.html, README.md 등 주요 파일의 구조 및 설명 최신화

## Recent Changes

*   memory bank 파일 전체 재검토 및 업데이트
*   커밋 및 푸시, 브랜치 병합 등 Git 워크플로우 표준화
*   전역 상태 변수 스코프 명확화, 함수 정의 및 호출 위치 일관성 유지
*   테스트 환경 파일 경로를 프로젝트 구조에 맞게 관리

## Next Steps

*   추가 기능 개발 또는 리팩토링
*   memory bank 파일의 지속적 최신화
*   테스트 케이스 보강 및 자동화
*   사용자 경험 개선

## Active Decisions and Considerations

*   memory bank 각 파일의 내용을 README.md와 프로젝트 정보에 최대한 일치시키도록 결정
*   프로젝트의 현재 상태를 정확히 반영하여 memory bank의 효용성 극대화 고려

## Important Patterns and Preferences

*   사용자 지침에 따라 memory bank 파일을 순차적으로 검토 및 업데이트하는 패턴 유지
*   파일 수정 시 replace_in_file 도구를 사용하여 정확한 변경 사항 적용
*   각 파일 업데이트 후 사용자에게 변경 내역 명확히 전달

## Learnings and Project Insights

*   README.md 파일은 프로젝트의 전반적인 맥락을 파악하는 데 매우 중요한 정보 소스임
*   memory bank는 프로젝트의 진행 상황과 주요 결정 사항을 체계적으로 기록하는 데 유용하며, 주기적인 검토와 업데이트가 중요함
*   초기화된 템플릿을 실제 프로젝트 내용으로 채우는 과정은 프로젝트 이해도를 높이는 데 도움이 됨
*   커밋을 통해 변경 사항을 관리하는 것은 프로젝트 이력 추적에 필수적임
*   .clineignore와 같은 설정 파일은 시스템 수준에서 관리될 수 있으며, 이를 인지하고 작업하는 것이 중요함
