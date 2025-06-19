# Requirements

이 문서는 요구 사항에 대한 명세를 담고 있다.

## Module 구조 개선

* 소스 코드를 기능 단위의 파일로 나누자.
* 하나의 함수는 하나의 기능만 하도록 나누자.

## f-remote-file 원격 파일 로드

URL 지정을 통해 markdown, pdf 문서를 로드하는 기능.

CORS 허용 서버에 대서만 정상 동작해야 함.

### 에러 처리

* 404 Not found 등 HTTP 오류에 대한 자세한 안내를 제공하자.
* Markdown, pdf 외의 문서는 지원하지 않는다는 메시지를 출력하자.

### 향후 확장 검토

- CORS 정책 우회 방안
- 향후 Google Drive, Dropbox 등 외부 스토리지 연동 확장 고려

## TBD