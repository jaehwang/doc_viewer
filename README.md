# 문서 뷰어 (Document Viewer)

PDF와 Markdown 파일을 지원하는 웹 기반 문서 뷰어입니다. Mermaid 다이어그램 렌더링과 자동 목차 생성 기능을 포함한 완전한 문서 뷰어 솔루션입니다.

## ✨ 주요 기능

### 📄 PDF 뷰어
- **고품질 렌더링**: PDF.js를 사용한 브라우저 네이티브 PDF 렌더링
- **페이지 네비게이션**: 이전/다음 페이지, 특정 페이지로 직접 이동
- **반응형 스케일링**: 화면 크기에 맞는 자동 크기 조정
- **키보드 단축키**: 화살표 키, Home, End 키 지원

### 📝 Markdown 뷰어
- **완전한 Markdown 지원**: GitHub Flavored Markdown (GFM) 호환
- **Mermaid 다이어그램**: 플로우차트, 시퀀스 다이어그램, 간트 차트 등 자동 렌더링
- **코드 하이라이팅**: Prism.js를 사용한 다양한 언어 구문 강조
- **자동 목차 생성**: 헤딩 기반 네비게이션 사이드바
- **스마트 링크**: 목차 클릭으로 해당 섹션으로 부드러운 스크롤

### 📊 문서 비교
- **버전 비교**: 동일한 형식의 문서 간 텍스트 비교 분석
- **실시간 차이점 표시**: 추가/삭제된 내용을 색상으로 구분하여 시각화
- **정밀 비교**: 단어 단위로 정확한 변경사항 추적
- **탭 기반 모드**: 보기 모드와 비교 모드 간 직관적 전환
- **이중 파일 업로드**: 이전 문서와 새 문서를 각각 선택하여 비교

### 🎨 사용자 인터페이스
- **드래그 앤 드롭**: 파일을 끌어다 놓기만 하면 자동 업로드
- **반응형 디자인**: 데스크톱, 태블릿, 모바일 모든 기기 지원
- **직관적 네비게이션**: 파일 타입별 최적화된 컨트롤
- **깔끔한 디자인**: 현대적이고 사용자 친화적인 인터페이스

## 🛠 기술 스택

### 프론트엔드
- **HTML5**: 시맨틱 마크업과 File API
- **CSS3**: Flexbox, Grid, 애니메이션
- **Vanilla JavaScript**: 의존성 없는 순수 JavaScript

### 라이브러리
- **[PDF.js](https://mozilla.github.io/pdf.js/)**: Mozilla의 JavaScript PDF 렌더러
- **[Marked.js](https://marked.js.org/)**: 빠르고 가벼운 Markdown 파서
- **[Mermaid.js](https://mermaid.js.org/)**: 다이어그램 및 차트 렌더링
- **[Prism.js](https://prismjs.com/)**: 코드 구문 강조
- **[jsdiff](https://github.com/kpdecker/jsdiff)**: 텍스트 차이 분석 및 비교

## 🚀 설치 및 실행

### 요구사항
- 모던 웹 브라우저 (Chrome, Firefox, Safari, Edge)
- 로컬 웹 서버 (선택사항, 파일 업로드 기능을 위해 권장)

### 로컬 실행
1. 저장소 클론
```bash
git clone <repository-url>
cd pdf_bbs
```

2. 웹 서버 실행 (Python 예시)
```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
```

3. 브라우저에서 접속
```
http://localhost:8000
```

### 직접 파일 열기
웹 서버 없이도 `index.html` 파일을 브라우저에서 직접 열 수 있습니다.

## 📁 프로젝트 구조

```
doc_viewer/
├── index.html         # 메인 웹 페이지 진입점
├── css/               # 스타일시트(CSS) 디렉토리
├── js/                # 자바스크립트(JS) 소스 디렉토리
├── memory-bank/       # 프로젝트 맥락 및 참고 문서 디렉토리
├── tests/             # 테스트 코드 및 테스트 데이터 디렉토리
├── .babelrc           # Babel 트랜스파일러 설정 파일
├── .gitignore         # Git에서 제외할 파일/폴더 목록
├── package.json       # 프로젝트 메타정보 및 의존성 관리 파일
├── README.md          # 프로젝트 설명서
```

## 📖 사용 방법

### 1. 파일 업로드
- **드래그 앤 드롭**: 파일을 업로드 영역에 끌어다 놓기
- **파일 선택**: "파일 선택" 버튼 클릭하여 파일 브라우저 열기
- **URL로 파일 로드**: "URL로 파일 불러오기" 입력란에 URL 입력 후 "로드" 버튼 클릭

### 2. 지원 파일 형식
- **PDF**: `.pdf`
- **Markdown**: `.md`, `.markdown`

### 3. PDF 뷰어 사용법
- **페이지 이동**: 이전/다음 버튼 또는 화살표 키
- **특정 페이지**: 페이지 번호 입력 후 Enter
- **키보드 단축키**:
  - `←` / `→`: 이전/다음 페이지
  - `Home`: 첫 페이지
  - `End`: 마지막 페이지

### 4. Markdown 뷰어 사용법
- **목차 토글**: 📋 목차 버튼 클릭
- **맨 위로**: ⬆ 맨 위로 버튼 클릭
- **목차 네비게이션**: 목차 항목 클릭으로 해당 섹션 이동

### 5. 문서 비교 사용법
- **모드 전환**: 상단의 "비교 모드" 탭 클릭
- **파일 선택**: 
  - 왼쪽 영역에 이전 문서(원본) 업로드
  - 오른쪽 영역에 새 문서(비교 대상) 업로드
- **비교 실행**: "문서 비교하기" 버튼 클릭
- **결과 해석**:
  - 🟢 **초록색 배경**: 새로 추가된 내용
  - 🔴 **빨간색 배경**: 삭제된 내용 (취소선 표시)
  - ⚪ **일반 텍스트**: 변경되지 않은 내용
- **지원 형식**: 동일한 형식의 문서만 비교 가능 (PDF ↔ PDF, Markdown ↔ Markdown)

## 🎯 지원 기능

### Markdown 문법 지원
- [x] 헤딩 (H1-H6)
- [x] 텍스트 스타일링 (굵게, 기울임, 취소선)
- [x] 목록 (순서 있음/없음, 중첩)
- [x] 링크 및 이미지
- [x] 코드 블록 및 인라인 코드
- [x] 표 (Table)
- [x] 인용문 (Blockquote)
- [x] 수평선
- [x] 체크리스트

### Mermaid 다이어그램 지원
- [x] 플로우차트 (Flowchart)
- [x] 시퀀스 다이어그램 (Sequence Diagram)
- [x] 간트 차트 (Gantt Chart)
- [x] 클래스 다이어그램 (Class Diagram)
- [x] 상태 다이어그램 (State Diagram)
- [x] 파이 차트 (Pie Chart)

### 문서 비교 기능
- [x] PDF 문서 간 텍스트 비교
- [x] Markdown 문서 간 텍스트 비교
- [x] 단어 단위 정밀 차이 분석
- [x] 추가/삭제 내용 시각적 구분
- [x] 실시간 비교 결과 표시
- [x] 드래그 앤 드롭 파일 업로드
- [x] 동일 형식 문서 검증
- [x] 비교 결과 범례 표시

### 코드 하이라이팅 지원 언어
- JavaScript, Python, Java, C++, HTML, CSS
- JSON, XML, YAML, Markdown
- Shell, SQL, PHP, Ruby, Go
- 그 외 Prism.js가 지원하는 모든 언어

## 🔧 커스터마이징

### 테마 변경
`css/style.css` 파일에서 색상 변수를 수정하여 테마를 변경할 수 있습니다:

```css
:root {
  --primary-color: #3498db;
  --secondary-color: #2c3e50;
  --background-color: #f5f5f5;
  --text-color: #333;
}
```

### Mermaid 테마 설정
`js/app.js` 파일에서 Mermaid 테마를 변경할 수 있습니다:

```javascript
mermaid.initialize({
    startOnLoad: false,
    theme: 'default', // 'default', 'dark', 'forest', 'neutral'
    securityLevel: 'loose'
});
```

## 🐛 알려진 제한사항

- 매우 큰 PDF 파일 (50MB 이상)은 성능 이슈가 있을 수 있습니다
- 일부 복잡한 PDF 폼은 완전히 지원되지 않을 수 있습니다
- 인터넷 연결이 필요합니다 (CDN 라이브러리 사용)
- CORS 정책으로 인해 fetch로 원격 파일을 불러올 때 제한이 있을 수 있습니다

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 `LICENSE` 파일을 참조하세요.

## 🙏 감사의 말

- [PDF.js](https://mozilla.github.io/pdf.js/) - Mozilla Foundation
- [Marked.js](https://marked.js.org/) - Christopher Jeffrey
- [Mermaid.js](https://mermaid.js.org/) - Knut Sveidqvist
- [Prism.js](https://prismjs.com/) - Lea Verou
- [jsdiff](https://github.com/kpdecker/jsdiff) - Kevin Decker