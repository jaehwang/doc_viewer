# PDF 텍스트 선택 문제 해결 작업 기록

## 문제 상황
- PDF 뷰어에서 텍스트 선택이 작동하지 않음
- 사용자가 PDF 텍스트를 드래그하거나 복사할 수 없음

## 시도한 해결 방법들

### 1차 시도: CSS 스타일 개선
**파일**: `css/style.css`
- `.pdf-text-item` 클래스에 `user-select: text` 속성 강화
- 브라우저별 vendor prefix 추가 (`-webkit-user-select`, `-moz-user-select` 등)
- z-index 조정으로 텍스트 레이어를 캔버스 위에 배치
- 투명도 조정 (`color: rgba(0, 0, 0, 0.001)`)

### 2차 시도: JavaScript 텍스트 레이어 개선
**파일**: `js/app.js`
- `renderPDFAsHTML` 함수 완전 재작성
- PDF.js의 정확한 좌표 변환 로직 적용
- 텍스트 위치 계산 정밀도 향상
- 커스텀 텍스트 선택 이벤트 추가

### 3차 시도: PDF.js 공식 TextLayerBuilder 사용
**파일**: `js/app.js`
- PDF.js 공식 `TextLayerBuilder` API 사용
- 폴백 시스템 구현 (공식 API 실패 시 커스텀 레이어)
- `enhanceTextSelection: true` 옵션 적용

**파일**: `css/style.css`
- PDF.js 공식 `.textLayer` 스타일 추가
- 텍스트 하이라이트 스타일 구현

## 현재 코드 상태

### JavaScript 주요 함수
```javascript
async function renderPDFAsHTML(page, viewport) {
    try {
        // PDF.js 공식 텍스트 레이어 렌더링 사용
        const textContent = await page.getTextContent();
        
        // PDF.js TextLayerBuilder 사용
        const textLayer = new pdfjsLib.TextLayerBuilder({
            textLayerDiv: textLayerDiv,
            pageIndex: currentPage - 1,
            viewport: viewport,
            findController: null,
            enhanceTextSelection: true
        });
        
        textLayer.setTextContent(textContent);
        textLayer.render();
        
    } catch (error) {
        // 폴백: 간단한 텍스트 레이어 생성
        await renderSimpleTextLayer(page, viewport);
    }
}
```

### CSS 주요 스타일
```css
.textLayer {
    position: absolute;
    left: 0;
    top: 0;
    right: 0;
    bottom: 0;
    overflow: hidden;
    opacity: 0.2;
    line-height: 1.0;
    user-select: text !important;
    pointer-events: auto;
}

.textLayer > span {
    color: transparent;
    position: absolute;
    white-space: pre;
    cursor: text;
    user-select: text !important;
}
```

## 테스트 파일
- `test-pdf-selection.html`: 독립적인 텍스트 선택 테스트 페이지 생성
- 모의 PDF 텍스트 요소로 기능 검증

## 여전히 해결되지 않은 문제
1. **PDF.js TextLayerBuilder 호환성**: 사용 중인 PDF.js 버전에서 TextLayerBuilder가 제대로 작동하지 않을 수 있음
2. **브라우저 보안 정책**: 일부 브라우저에서 파일 업로드 후 텍스트 선택이 제한될 수 있음
3. **PDF 파일 형식**: 특정 PDF 파일의 텍스트 인코딩이나 구조 문제
4. **이벤트 충돌**: 다른 JavaScript 이벤트와의 충돌 가능성

## 다음 시도해볼 방법들

### 1. PDF.js 버전 업데이트
현재 사용 중인 PDF.js 3.11.174를 최신 버전으로 업데이트

### 2. 완전히 다른 접근법
- PDF를 이미지로 렌더링하고 OCR 사용
- 서버 사이드에서 PDF 텍스트 추출 후 별도 레이어 생성

### 3. 기존 PDF 뷰어 라이브러리 사용
- PDF-lib 또는 다른 PDF 라이브러리 검토
- 상용 PDF 뷰어 솔루션 고려

### 4. 디버깅 강화
- 브라우저 개발자 도구에서 텍스트 레이어 DOM 구조 확인
- 실제 PDF 파일로 단계별 디버깅
- 다양한 브라우저에서 테스트

## 파일 변경 이력
- `css/style.css`: 텍스트 선택 관련 스타일 대폭 개선
- `js/app.js`: PDF 텍스트 레이어 렌더링 로직 완전 재작성
- `test-pdf-selection.html`: 테스트 페이지 신규 생성

## 현재 상태 (2025.06.07 업데이트)
- ✅ **PDF.js 기본 렌더링 방식으로 텍스트 선택 기능 구현 완료**
- ✅ 캔버스 렌더링과 텍스트 레이어를 분리하여 구현
- ✅ PDF.js 표준 좌표 변환을 사용한 정확한 텍스트 위치 계산
- ✅ 브라우저 기본 텍스트 선택 기능 활용
- ✅ 오류 없이 정상 작동 확인

## 최종 해결 방법

### 4차 시도: PDF.js 기본 렌더링 + 개선된 텍스트 레이어
**접근법**: PDF.js 완전 버전 대신 기본 PDF.js + 커스텀 텍스트 레이어 조합

**핵심 변경사항**:
1. **DOM 구조 개선**:
   ```html
   <div id="viewerContainer">
     <div id="viewer">
       <div class="page">
         <canvas></canvas>
         <div class="textLayer"></div>
       </div>
     </div>
   </div>
   ```

2. **텍스트 레이어 렌더링**:
   ```javascript
   async function renderTextLayer(page, viewport, textLayerDiv) {
     const textContent = await page.getTextContent();
     textContent.items.forEach(function(textItem) {
       const tx = pdfjsLib.Util.transform(
         pdfjsLib.Util.transform(viewport.transform, textItem.transform),
         [1, 0, 0, -1, 0, 0]
       );
       const span = document.createElement('span');
       span.textContent = textItem.str;
       span.style.position = 'absolute';
       span.style.left = tx[4] + 'px';
       span.style.top = (tx[5] - fontHeight) + 'px';
       span.style.fontSize = fontHeight + 'px';
       span.style.color = 'transparent';
       span.style.userSelect = 'text';
       span.style.cursor = 'text';
       span.style.pointerEvents = 'auto';
       textLayerDiv.appendChild(span);
     });
   }
   ```

3. **CSS 스타일 최적화**:
   ```css
   .textLayer {
     position: absolute;
     left: 0; top: 0; right: 0; bottom: 0;
     overflow: hidden;
     opacity: 0.2;
     user-select: text !important;
     pointer-events: auto;
   }
   ```

### 성공 요인
1. **PDF.js 표준 좌표 변환 사용**: `pdfjsLib.Util.transform()` 정확한 계산
2. **브라우저 기본 선택 기능 활용**: 커스텀 선택 로직 대신 브라우저 네이티브 기능 사용
3. **적절한 투명도 설정**: `opacity: 0.2`로 텍스트 위치 확인 가능
4. **포인터 이벤트 활성화**: `pointer-events: auto`로 마우스 상호작용 허용

## 참고 자료
- [PDF.js 공식 문서](https://mozilla.github.io/pdf.js/)
- [PDF.js TextLayer 예제](https://github.com/mozilla/pdf.js/tree/master/examples)
- [PDF.js API 문서](https://mozilla.github.io/pdf.js/api/)
