// Jest 테스트 환경 설정
// TextEncoder, TextDecoder polyfill 설정
const { TextEncoder, TextDecoder } = require('util');

// Node.js 환경에서 누락된 전역 객체들 설정
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

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
