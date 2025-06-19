# 원격 파일 로드 기능 설계

## 1. 개요

사용자가 PDF 또는 Markdown 파일의 URL을 입력하면, 해당 파일을 원격에서 불러와 뷰어에 표시하는 기능을 구현한다. 이 기능은 기존의 로컬 파일 업로드와 동일한 사용자 경험을 제공해야 하며, 네트워크 오류, 파일 형식 오류 등 다양한 예외 상황에 대한 처리가 필요하다.

---

## 2. UI/UX 설계

- 업로드 영역 또는 별도 입력창에 "URL로 파일 불러오기" 입력란과 버튼 추가
- URL 입력 후 "로드" 버튼 클릭 시 파일 로드 시도
- 로딩 인디케이터, 에러 메시지, 성공 시 기존 뷰어와 동일하게 렌더링
- (선택) 최근 사용한 URL 기록, 엔터키 지원 등 UX 개선

---

## 3. 기능 흐름

1. 사용자가 URL 입력 → "로드" 클릭
2. 확장자(.pdf, .md, .markdown)로 파일 타입 판별
3. fetch API로 파일 데이터 요청
   - PDF: arrayBuffer로 읽기
   - Markdown: text로 읽기
4. CORS 정책 등 네트워크 예외 처리
5. 성공 시 기존 뷰어 함수(handlePDFFile, loadMarkdown) 호출
6. 실패 시 에러 메시지 표시

---

## 4. 주요 함수 및 로직

- **UI 이벤트 핸들러**
  - URL 입력란과 버튼에 이벤트 리스너 등록
  - 입력값 검증 및 파일 타입 판별

- **fetchFileByUrl(url)**
  - fetch API로 파일 데이터 요청
  - 파일 타입에 따라 arrayBuffer/text로 분기
  - 에러 발생 시 사용자에게 안내

- **handleRemotePDF/handleRemoteMarkdown**
  - 기존 handlePDFFile, loadMarkdown 함수 재사용
  - 파일 이름은 URL에서 추출하여 currentFileName에 할당

- **에러 처리**
  - 잘못된 URL, 지원하지 않는 파일, 네트워크 오류, CORS 등 상황별 안내 메시지

---

## 5. 예외 및 보안 고려사항

- CORS 정책으로 인해 일부 외부 파일은 로드가 불가할 수 있음(프록시 서버 등 대안 안내)
- URL 입력값 검증(https://, http:// 등)
- 악성 파일, XSS 등 보안 이슈에 대한 안내 및 방어 코드

---

## 6. 확장성 및 테스트

- 향후 Google Drive, Dropbox 등 외부 스토리지 연동 확장 고려
- 단위 테스트: fetchFileByUrl, 파일 타입 판별, 에러 처리 등
- 통합 테스트: 전체 플로우 및 UI 반응 검증

---

## 7. 예상 UI 예시

```html
<div class="remote-file-loader">
  <input type="text" id="remoteFileUrl" placeholder="파일 URL 입력 (예: https://.../sample.pdf)" />
  <button id="loadRemoteFileBtn">로드</button>
</div>
```

---

## 8. 구현 순서

1. UI 요소 추가 및 이벤트 리스너 연결
2. fetchFileByUrl 함수 구현 및 파일 타입 분기
3. 기존 뷰어 함수와 통합
4. 에러 및 예외 처리 강화
5. 테스트 코드 작성 및 문서화
