# 📋 Universal Coding Standards

## 🎯 **Core Principles**
1. **가독성 우선**: 코드는 컴퓨터보다 사람이 읽기 쉽게 작성
2. **단순성**: 복잡한 솔루션보다 단순하고 명확한 솔루션 선호
3. **일관성**: 프로젝트 전체에서 동일한 스타일과 패턴 유지
4. **자기문서화**: 코드 자체가 설명이 되도록 작성

## 📏 **Function & Method Rules**
- **단일 책임**: 하나의 함수는 하나의 일만 수행
- **길이 제한**: 함수는 40줄 이하로 제한
- **매개변수 제한**: 매개변수는 5개 이하로 제한
- **중첩 깊이**: if/for 등의 중첩은 3단계 이하로 제한
- **Early Return**: 조건 확인 후 빠른 리턴으로 중첩 줄이기

## 🏷️ **Naming Conventions**
- **의미 있는 이름**: 변수/함수명으로 목적과 기능을 알 수 있어야 함
- **동사-명사 구조**: 함수는 동사로 시작 (`getUserData`, `calculateTotal`)
- **불린 변수**: is/has/can/should로 시작 (`isValid`, `hasPermission`)
- **상수**: 대문자와 언더스코어 (`MAX_RETRY_COUNT`)
- **약어 금지**: 명확하지 않은 약어 사용 금지 (`usr` → `user`)

## 🧱 **Code Structure**
- **모듈 분리**: 관련 기능별로 파일/모듈 분리
- **계층 구조**: 상위 레벨에서 하위 레벨 순서로 함수 배치
- **의존성 최소화**: 모듈 간 결합도 최소화
- **설정 분리**: 하드코딩된 값들을 설정 파일로 분리

## 🔄 **Error Handling**
- **예외 처리**: 모든 예외 상황에 대한 적절한 처리
- **명확한 에러 메시지**: 사용자가 이해할 수 있는 에러 메시지
- **실패 시 안전**: 에러 발생 시 시스템이 안전한 상태 유지
- **로깅**: 중요한 작업과 에러에 대한 적절한 로깅

## 💬 **Comments & Documentation**
- **Why, not What**: 코드가 무엇을 하는지가 아닌 왜 하는지 설명
- **복잡한 로직**: 비즈니스 로직이 복잡한 경우에만 주석 추가
- **API 문서**: 공개 함수/메서드는 반드시 문서화
- **TODO/FIXME**: 임시 코드나 개선 필요 부분 명시

## 🧪 **Testing & Quality**
- **테스트 가능**: 테스트하기 쉬운 구조로 설계
- **단위 테스트**: 핵심 비즈니스 로직에 대한 테스트 작성
- **코드 리뷰**: 모든 코드 변경사항은 리뷰 후 머지
- **린터 사용**: 코딩 스타일 일관성을 위한 자동화 도구 활용

## 🔒 **Security & Performance**
- **입력 검증**: 모든 외부 입력에 대한 검증
- **민감 정보**: 비밀번호, API 키 등 하드코딩 금지
- **리소스 관리**: 메모리, 파일, 네트워크 연결 등 적절한 해제
- **성능 고려**: 불필요한 연산, 중복 호출 최소화

## 📂 **Version Control**
- **의미 있는 커밋**: 커밋 메시지로 변경 내용과 이유 설명
- **작은 단위**: 하나의 기능/수정사항 단위로 커밋
- **브랜치 전략**: 기능별 브랜치 생성 및 머지
- **커밋 히스토리**: 깨끗하고 이해하기 쉬운 히스토리 유지

---

## 🎯 **Language-Specific Examples**

### JavaScript/TypeScript
```javascript
// ✅ Good
function calculateUserAge(birthDate) {
  if (!birthDate) return null;
  
  const today = new Date();
  const birth = new Date(birthDate);
  return today.getFullYear() - birth.getFullYear();
}

// ❌ Bad
function calc(bd) {
  return new Date().getFullYear() - new Date(bd).getFullYear();
}
```

### Python
```python
# ✅ Good
def validate_email_format(email_address):
    """Check if email address has valid format."""
    if not email_address:
        return False
    
    return '@' in email_address and '.' in email_address

# ❌ Bad
def check(e):
    return '@' in e and '.' in e
```

### Java
```java
// ✅ Good
public boolean isUserEligibleForDiscount(User user) {
    if (user == null) {
        return false;
    }
    
    return user.getAge() >= 65 || user.isMember();
}

// ❌ Bad
public boolean check(User u) {
    return u.getAge() >= 65 || u.isMember();
}
```

## 🚨 **Code Review Checklist**
- [ ] 함수가 40줄 이하인가?
- [ ] 함수명이 기능을 명확히 설명하는가?
- [ ] 매개변수가 5개 이하인가?
- [ ] 중첩 깊이가 3단계 이하인가?
- [ ] 에러 처리가 적절히 되어 있는가?
- [ ] 하드코딩된 값이 없는가?
- [ ] 테스트 가능한 구조인가?
- [ ] 보안 취약점이 없는가?