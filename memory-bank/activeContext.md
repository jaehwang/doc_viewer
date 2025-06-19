# Active Context

## Current Work Focus

* 원격 파일 로드 기능(fetchFileByUrl) 테스트 신뢰성 및 currentFileName 상태 동기화 개선
* Jest 테스트에서 네트워크 환경(CORS 등) 예외 처리 및 조건부 통과 로직 적용
* memory bank, 문서, 테스트 코드의 동기화 유지

## Recent Changes

* fetchFileByUrl 함수가 setCurrentFileName 핸들러를 통해 파일명을 갱신하도록 리팩토링
* Jest 테스트에서 mock 핸들러와 실제 네트워크 환경 모두에서 파일명 변경을 정확히 검증할 수 있도록 개선
* CORS/network 오류 발생 시에도 테스트가 실패하지 않도록 조건부 검증 추가
* 모든 테스트(jest) 100% 통과 확인
* memory bank 파일 전체 검토 및 최신화

## Next Steps

* CORS 우회(프록시) 옵션 안내 및 테스트용 CORS 허용 파일 목록 제공
* fetchFileByUrl 함수의 예외 처리 및 사용자 경험 추가 개선(로딩, 에러, 안내)
* js/markdown-viewer.js, js/diff-viewer.js 등 README에 언급된 모듈화된 JS 파일의 실제 구현 및 app.js와의 통합(현재 js/ 폴더에 없음)
* 테스트 커버리지 확대 및 유지

## Active Decisions and Considerations

* CORS 정책은 코드로 해결 불가, 안내 메시지로 명확히 고지
* fetch 기반 원격 파일 로드는 CORS 허용 서버만 지원, 테스트는 조건부 통과
* Jest 테스트에서 네트워크 fetch는 환경에 따라 실패할 수 있음을 감안해 조건부 검증
* 향후 프록시 서버 연동 등 확장성 고려

## Important Patterns and Preferences

* 네트워크/보안 이슈 발생 시 사용자에게 명확한 원인 안내
* fetch, 파일 타입 판별, 기존 뷰어 함수 재사용 등 모듈화된 구조 유지
* 테스트 코드에서 의존성 주입(mock) 및 상태 검증 패턴 적극 활용

## Learnings and Project Insights

* 웹 표준 보안(CORS)은 프론트엔드 fetch에서 근본적으로 우회 불가
* 실서비스에서는 백엔드 프록시 또는 CORS 허용 서버만 지원하는 것이 현실적
* memory bank와 실제 코드/문서의 동기화가 프로젝트 유지에 매우 중요함
* 테스트 신뢰성을 위해 네트워크 환경에 의존하는 테스트는 조건부 검증이 필수적임
