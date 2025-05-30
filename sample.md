# 문서 뷰어 테스트

이 문서는 **문서 뷰어**의 Markdown 렌더링 기능을 테스트하기 위한 샘플 파일입니다.

## 기본 Markdown 기능

### 텍스트 스타일링

- **굵은 글씨**
- *기울임 글씨*
- `인라인 코드`
- ~~취소선~~

### 목록

#### 순서 없는 목록
- 첫 번째 항목
- 두 번째 항목
  - 중첩된 항목
  - 또 다른 중첩 항목
- 세 번째 항목

#### 순서 있는 목록
1. 첫 번째 단계
2. 두 번째 단계
3. 세 번째 단계

### 인용문

> 이것은 인용문입니다.
> 
> 여러 줄에 걸쳐 작성할 수 있습니다.

### 코드 블록

```javascript
function greet(name) {
    console.log(`안녕하세요, ${name}님!`);
}

greet('사용자');
```

```python
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

print(fibonacci(10))
```

## 표 (Table)

| 기능 | 지원 여부 | 설명 |
|------|-----------|------|
| PDF 뷰어 | ✅ | PDF.js를 사용한 고품질 렌더링 |
| Markdown 뷰어 | ✅ | Marked.js를 사용한 HTML 변환 |
| Mermaid 다이어그램 | ✅ | 다양한 다이어그램 지원 |
| 코드 하이라이팅 | ✅ | Prism.js를 사용한 구문 강조 |

## Mermaid 다이어그램

### 플로우차트

```mermaid
graph TD
    A[파일 업로드] --> B{파일 타입 확인}
    B -->|PDF| C[PDF 뷰어]
    B -->|Markdown| D[Markdown 파서]
    D --> E[HTML 변환]
    E --> F[Mermaid 렌더링]
    F --> G[최종 표시]
    C --> H[페이지 네비게이션]
    G --> I[목차 네비게이션]
```

### 시퀀스 다이어그램

```mermaid
sequenceDiagram
    participant U as 사용자
    participant A as 앱
    participant P as PDF.js
    participant M as Marked.js
    
    U->>A: 파일 업로드
    A->>A: 파일 타입 확인
    
    alt PDF 파일
        A->>P: PDF 로드 요청
        P->>A: PDF 문서 반환
        A->>U: PDF 뷰어 표시
    else Markdown 파일
        A->>M: Markdown 파싱 요청
        M->>A: HTML 반환
        A->>A: Mermaid 다이어그램 렌더링
        A->>U: Markdown 뷰어 표시
    end
```

### 간트 차트

```mermaid
gantt
    title 프로젝트 개발 일정
    dateFormat  YYYY-MM-DD
    section 기획
    요구사항 분석    :done,    des1, 2024-01-01,2024-01-07
    UI/UX 설계      :done,    des2, 2024-01-08,2024-01-14
    section 개발
    PDF 뷰어 구현   :done,    dev1, 2024-01-15,2024-01-21
    Markdown 뷰어   :active,  dev2, 2024-01-22,2024-01-28
    Mermaid 통합    :         dev3, 2024-01-29,2024-02-04
    section 테스트
    기능 테스트      :         test1, 2024-02-05,2024-02-11
    사용자 테스트    :         test2, 2024-02-12,2024-02-18
```

## 링크와 이미지

### 링크
- [GitHub](https://github.com)
- [Markdown 가이드](https://www.markdownguide.org/)
- [Mermaid 문서](https://mermaid.js.org/)

### 수평선

---

## 추가 기능

### 체크리스트

- [x] PDF 뷰어 구현
- [x] Markdown 뷰어 구현
- [x] Mermaid 다이어그램 지원
- [x] 목차 자동 생성
- [ ] 다크 모드 지원
- [ ] 파일 다운로드 기능

### 수학 공식 (LaTeX)

인라인 수식: $E = mc^2$

블록 수식:
$$
\int_{-\infty}^{\infty} e^{-x^2} dx = \sqrt{\pi}
$$

## 결론

이 문서 뷰어는 다음과 같은 주요 기능을 제공합니다:

1. **다중 파일 형식 지원**: PDF와 Markdown 파일을 모두 지원
2. **풍부한 렌더링**: 코드 하이라이팅, 표, 다이어그램 등
3. **사용자 친화적 인터페이스**: 직관적인 네비게이션과 목차
4. **반응형 디자인**: 다양한 화면 크기에 최적화

앞으로도 더 많은 기능을 추가하여 더욱 완성도 높은 문서 뷰어로 발전시킬 예정입니다.
