# 버그 리포트

## PDF 텍스트 선택 위치 불일치 문제

### 문제 설명
PDF 뷰어에서 텍스트를 선택할 때, 마우스로 드래그한 선택 영역이 실제 텍스트 위치와 일치하지 않는 문제가 발생합니다. 현재 주요 증상은 **선택 영역의 오른쪽이 텍스트 끝까지 도달하지 않는 문제**입니다.

### 재현 방법
1. PDF 파일을 업로드
2. 텍스트를 마우스로 왼쪽에서 오른쪽으로 드래그하여 선택 시도
3. 선택 영역이 텍스트의 실제 끝 부분까지 도달하지 않음
4. 특히 긴 텍스트일수록 문제가 더 명확하게 드러남

### 영향도
- **심각도**: Critical
- **사용자 경험**: 텍스트 복사 기능 사용 불편
- **발생 빈도**: 모든 텍스트 선택 시도에서 발생

### 기술적 원인

#### 파일 위치
- `js/pdf-viewer.js:248-301` - `renderTextLayer` 함수 (CSS Transform 방식)
- `js/pdf-viewer.js:140-167` - 페이지 렌더링 로직

#### 최근 분석 결과 (2025-01-21)

**1. 컨테이너 크기 0 문제 확인**
- 모든 컨테이너(viewerContainer, pdfContainer, textLayerDiv, parentElement)의 크기가 0으로 측정됨
- DOM 레이아웃 미완료 또는 CSS 스타일 미적용이 원인으로 추정

**2. 텍스트 요소 너비 부정확성**
- 기존: 텍스트 요소의 너비가 자동으로 결정되어 실제 텍스트보다 짧게 렌더링
- 개선: PDF.js의 `textItem.width`를 활용한 명시적 너비 설정

#### 시도된 해결 방식들

**1. 텍스트 요소 명시적 너비 설정** (진행 중):
```javascript
// 3가지 방법으로 너비 계산
const scaledTextWidth = textWidth * (fontHeight / textItem.height);
const matrixScaledWidth = textWidth * Math.abs(tx[0] / textItem.transform[0]);
const directScaledWidth = textWidth * Math.abs(tx[0]) / textItem.transform[0];
const finalWidth = Math.max(matrixScaledWidth, scaledTextWidth, directScaledWidth);
span.style.width = finalWidth + 'px';
```

**2. 컨테이너 크기 강제 설정**:
```javascript
viewerContainer.style.width = '100%';
viewerContainer.style.height = '100vh';
pdfContainer.style.width = '100%';
pdfContainer.style.display = 'flex';
```

**3. DOM 레이아웃 완료 대기**:
```javascript
await new Promise(resolve => setTimeout(resolve, 50));
await new Promise(resolve => {
  if (textLayerDiv.offsetWidth > 0) resolve();
  else requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
});
```

**4. 상세 디버깅 시스템 구축**:
- POST-SCALE VERIFICATION: 스케일 적용 후 실제 boundingRect 검증
- 3가지 너비 계산 방법의 결과값 비교 로깅
- 컨테이너 크기 측정 결과 상세 추적
   span.style.top = ((tx[5] - fontHeight) * scale) + 'px';
   span.style.fontSize = (fontHeight * scale) + 'px';
   ```
   - 문제: 이중 스케일링 발생 (scaledViewport + 추가 스케일)

2. **scaledViewport 직접 사용 방식** (실패):
   ```javascript
   // scaledViewport를 renderTextLayer에 전달
   await renderTextLayer(page, scaledViewport, textLayerDiv);
   ```
   - 문제: 여전히 100% 외에서 위치 불일치

3. **PDF.js TextLayer API 사용** (실패):
   ```javascript
   const textLayer = new pdfjsLib.TextLayer({
       textContentSource: textContent,
       viewport: viewport,
       container: textLayerDiv,
   });
   ```
   - 문제: PDF.js 3.11.174 버전에서 TextLayer 클래스 미지원 또는 API 변경

4. **CSS Transform 방식** (현재, 실패):
   ```javascript
   // 원본 스케일로 텍스트 생성 후 CSS transform으로 전체 스케일링
   const scaleRatio = viewport.scale / originalViewport.scale;
   textLayerDiv.style.transform = `scale(${scaleRatio})`;
   ```
   - 문제: 여전히 정확한 위치 매칭 실패

#### 근본 원인 분석
1. **PDF.js 버전 호환성 문제**:
   - 사용 중인 PDF.js 3.11.174 버전과 최신 TextLayer API 간 불일치
   - CDN 버전과 실제 API 문서 간의 차이

2. **좌표 변환 복잡성**:
   - PDF 좌표계 → 브라우저 좌표계 변환 과정에서 미묘한 오차 누적
   - 텍스트 레이어와 캔버스 레이어의 렌더링 순서 및 타이밍 차이

3. **스케일링 기준점 문제**:
   - transform-origin 설정과 실제 PDF 렌더링 기준점 불일치
   - 브라우저별 렌더링 차이

4. **텍스트 요소 위치 계산 정확도**:
   - PDF.js의 변환 행렬 계산과 실제 시각적 위치 간 미세한 차이
   - 폰트 크기 및 line-height 계산 오차

### 해결 방안

#### 시도된 해결책들 (모두 실패)
1. **수동 스케일 곱셈**: 이중 스케일링 문제
2. **scaledViewport 직접 사용**: 좌표계 불일치 지속
3. **PDF.js TextLayer API**: 버전 호환성 문제
4. **CSS Transform**: 정확한 매칭 실패

#### 다음 시도 방안
1. **PDF.js 버전 업그레이드**:
   - 최신 PDF.js 버전(4.x)으로 업데이트
   - 최신 TextLayer API 사용

2. **대안 라이브러리 검토**:
   - PDF-lib, PDFObject 등 다른 PDF 라이브러리 평가
   - 텍스트 선택 기능 지원 확인

3. **정밀한 좌표 디버깅**:
   ```javascript
   // 디버깅을 위한 정확한 좌표 출력
   console.log('Canvas scale:', scaledViewport.scale);
   console.log('Text item:', textItem);
   console.log('Transform matrix:', tx);
   console.log('Calculated position:', { left: tx[4], top: tx[5] - fontHeight });
   ```

4. **하이브리드 접근법**:
   - 텍스트 선택만을 위한 별도 오버레이 레이어 구현
   - PDF.js 표준 렌더링 + 커스텀 텍스트 선택 로직

#### 장기 해결책
1. **완전한 재구현**: PDF.js 예제 기반으로 텍스트 레이어 재작성
2. **서버사이드 처리**: 백엔드에서 PDF 텍스트 추출 후 좌표 매핑
3. **웹 워커 활용**: 백그라운드에서 정확한 좌표 계산

### 테스트 케이스
- [ ] 다양한 줌 레벨에서 텍스트 선택 정확도 확인 (50%, 100%, 150%, 200%)
- [ ] 페이지 크기가 다른 PDF에서 테스트
- [ ] 회전된 PDF에서 텍스트 선택 테스트
- [ ] 모바일 터치 환경에서 텍스트 선택 테스트

### 우선순위
**High** - 핵심 기능인 텍스트 선택이 작동하지 않아 사용자 경험에 심각한 영향

### 관련 이슈
- 줌 레벨 변경 시 성능 저하 (텍스트 레이어 재생성)
- 대용량 PDF에서 텍스트 레이어 로딩 지연

### 업데이트 로그
- **2025-06-20**: 초기 버그 리포트 작성
- **2025-06-20**: 4가지 해결 방식 시도 및 실패 원인 분석 추가
- **2025-06-20**: 근본 원인 분석 및 다음 시도 방안 업데이트

---

## PDF 페이지 간 크기 불일치 문제

### 문제 설명
PDF 뷰어에서 100% 고정 줌으로 설정했음에도 불구하고, 첫 번째 페이지는 정상 크기로 표시되지만 두 번째 페이지부터는 작게 표시되는 문제가 발생합니다.

### 재현 방법
1. PDF 파일을 업로드
2. 줌 설정이 100%인지 확인
3. 첫 번째 페이지 확인 (정상 크기)
4. 두 번째 페이지로 이동
5. 페이지가 첫 번째 페이지보다 작게 표시됨

### 영향도
- **심각도**: Medium
- **사용자 경험**: 페이지별로 일관되지 않은 크기로 가독성 저하
- **발생 빈도**: 멀티 페이지 PDF에서 항상 발생

### 기술적 원인

#### 파일 위치
- `js/pdf-viewer.js:121-137` - 스케일 결정 로직
- `js/pdf-viewer.js:142-151` - 디버깅 로그 (컨테이너 크기 변화 확인)

#### 관찰된 현상
- 첫 번째 페이지 렌더링 시: `containerWidth = 800`
- 두 번째 페이지 렌더링 시: `containerWidth = 961`
- 컨테이너 크기가 첫 번째 페이지 렌더링 후 동적으로 변경됨

#### 근본 원인 분석
1. **컨테이너 크기 동적 변화**:
   - 첫 번째 페이지 렌더링 후 `viewerContainer.clientWidth`가 변경됨
   - 페이지 컨텐츠에 따라 컨테이너가 확장되는 것으로 추정

2. **스케일 계산 로직 문제**:
   ```javascript
   // 고정 스케일이어야 하지만 여전히 컨테이너 크기에 영향을 받을 가능성
   const parsedZoom = parseFloat(currentZoom);
   if (!isNaN(parsedZoom)) {
       scaleToUse = parsedZoom; // 이론상 고정이지만 실제로는 변함
   }
   ```

3. **CSS 레이아웃 상호작용**:
   - 페이지 렌더링 후 CSS 레이아웃이 재계산되어 컨테이너 크기 변경
   - `#viewerContainer`의 크기가 첫 번째 페이지 크기에 맞춰 조정됨

4. **PDF.js 내부 동작**:
   - PDF.js의 뷰포트 계산이 컨테이너 상태에 의존할 가능성
   - 페이지별로 다른 뷰포트 계산 결과

### 시도된 해결책들

1. **컨테이너 크기 독립적 스케일 설정** (실패):
   ```javascript
   // 고정 스케일 사용 - 컨테이너 크기와 무관하게 고정값 사용
   scaleToUse = parsedZoom; // 여전히 문제 발생
   ```

2. **currentScale 동기화** (실패):
   ```javascript
   currentScale = scaleToUse; // 매 렌더링마다 동기화해도 문제 지속
   ```

### 해결 방안

#### 즉시 시도 가능한 방안
1. **컨테이너 크기 고정**:
   ```javascript
   // 초기 컨테이너 크기를 저장하고 고정
   let initialContainerWidth = null;
   if (!initialContainerWidth && viewerContainer) {
       initialContainerWidth = viewerContainer.clientWidth;
   }
   ```

2. **스케일 완전 독립화**:
   ```javascript
   // 모든 동적 계산을 무시하고 완전히 고정된 스케일 사용
   if (currentZoom !== 'auto' && currentZoom !== 'page-width' && currentZoom !== 'page-fit') {
       scaleToUse = parseFloat(currentZoom);
       // 어떤 컨테이너 정보도 참조하지 않음
   }
   ```

3. **CSS 강제 고정**:
   ```css
   #viewerContainer {
       width: 100% !important;
       min-width: initial !important;
       max-width: initial !important;
   }
   ```

#### 근본적 해결 방안
1. **뷰포트 계산 로직 재구현**:
   - PDF.js 표준 방식에서 벗어나 독립적인 스케일 관리
   - 컨테이너 크기와 완전 분리된 렌더링 로직

2. **레이아웃 시스템 개선**:
   - 페이지 렌더링이 컨테이너 크기에 영향을 주지 않도록 CSS 구조 변경
   - 고정 크기 컨테이너 사용

### 테스트 케이스
- [ ] 첫 번째 페이지와 두 번째 페이지 크기 일치 확인
- [ ] 100% 고정 줌에서 모든 페이지 동일 크기 확인
- [ ] 컨테이너 크기 변화가 렌더링에 미치는 영향 최소화 확인
- [ ] 다양한 PDF 파일에서 페이지 간 크기 일관성 테스트

### 우선순위
**Medium** - 기능상 심각한 문제는 아니지만 사용자 경험 일관성에 영향

### 관련 이슈
- PDF 텍스트 선택 위치 불일치 문제와 연관 가능성 (스케일링 관련)

### 업데이트 로그
- **2025-06-20**: 버그 발견 및 초기 분석 완료
- **2025-06-21**: 문제 해결(`commit: 59bce91`)