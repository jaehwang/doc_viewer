// Jest 테스트 환경 설정
// TextEncoder, TextDecoder polyfill 설정
const { TextEncoder, TextDecoder } = require('util');

// Node.js 환경에서 누락된 전역 객체들 설정
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// UI 모듈 mock
jest.mock('./js/ui.js', () => ({
  showLoading: jest.fn(),
  hideLoading: jest.fn(),
  showError: jest.fn(),
  showPDFViewer: jest.fn(),
  showMarkdownViewer: jest.fn(),
  hideError: jest.fn()
}), { virtual: true });

// JSDOM 환경에서 필요한 추가 설정
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// URL 객체 polyfill (필요시)
if (typeof global.URL === 'undefined') {
  global.URL = require('url').URL;
}

// 기타 브라우저 API mock (필요시)
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
  },
  writable: true,
});

// 더 정확한 DOM 요소 mock 생성 함수
function createMockElement(overrides = {}) {
  const element = {
    style: {},
    textContent: '',
    innerHTML: '',
    value: '',
    max: '',
    disabled: false,
    clientWidth: 800,
    clientHeight: 600,
    appendChild: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    querySelector: jest.fn(),
    classList: {
      add: jest.fn(),
      remove: jest.fn(),
      toggle: jest.fn(),
    },
    ...overrides
  };
  
  // value 속성을 getter/setter로 정의하여 동적으로 변경 가능하게 함
  let _value = overrides.value || '';
  Object.defineProperty(element, 'value', {
    get: () => _value,
    set: (newValue) => { _value = newValue; },
    configurable: true,
    enumerable: true
  });
  
  return element;
}

// 전역 요소 저장소
const globalMockElements = {};

Object.defineProperty(window.document, 'getElementById', {
  value: (id) => {
    // 이미 생성된 요소가 있으면 재사용
    if (globalMockElements[id]) {
      return globalMockElements[id];
    }
    
    const mockElements = {
      'errorText': createMockElement({ textContent: '' }),
      'errorMessage': createMockElement({ 
        style: { display: 'none' },
        textContent: ''
      }),
      'pageInput': createMockElement({ 
        value: '1',
        max: '10'
      }),
      'totalPages': createMockElement({ 
        textContent: '10'
      }),
      'zoomSelect': createMockElement({ 
        value: '1.0'
      }),
      'viewer': createMockElement({ 
        innerHTML: '',
        querySelector: jest.fn().mockReturnValue(document.createElement('canvas'))
      }),
      'viewerContainer': createMockElement({
        clientWidth: 800,
        clientHeight: 600
      }),
      'pdfContainer': createMockElement({
        clientWidth: 800,
        clientHeight: 600
      }),
      'prevBtn': createMockElement({ 
        disabled: false
      }),
      'nextBtn': createMockElement({ 
        disabled: false
      }),
      'zoomOutBtn': createMockElement({ 
        disabled: false
      }),
      'zoomInBtn': createMockElement({ 
        disabled: false
      }),
      'loading': createMockElement({
        style: { display: 'none' }
      })
    };
    
    const element = mockElements[id] || createMockElement();
    globalMockElements[id] = element;
    return element;
  },
});

// 테스트 간 요소 초기화를 위한 함수
global.resetMockElements = () => {
  Object.keys(globalMockElements).forEach(key => {
    delete globalMockElements[key];
  });
};

// PDF.js mock
global.pdfjsLib = {
  getDocument: jest.fn().mockReturnValue({ // mockResolvedValue 대신 mockReturnValue 사용
    promise: Promise.resolve({
      numPages: 10,
      getPage: jest.fn().mockResolvedValue({
        getViewport: jest.fn().mockReturnValue({
          width: 100,
          height: 100,
          transform: [1, 0, 0, 1, 0, 0],
        }),
        render: jest.fn().mockReturnValue({
          promise: Promise.resolve(),
        }),
        getTextContent: jest.fn().mockResolvedValue({
          items: [],
        }),
      }),
    }),
  }),
  GlobalWorkerOptions: {
    workerSrc: '',
  },
  Util: {
    transform: jest.fn().mockReturnValue([1, 0, 0, 1, 0, 0]),
  },
};
