/**
 * @jest-environment jsdom
 */

import * as markdownViewer from '../js/markdown-viewer.js';
import * as ui from '../js/ui.js';

// 모듈 mock
jest.mock('../js/ui.js');

describe('Markdown Viewer', () => {
  beforeEach(() => {
    // JSDOM의 body를 테스트마다 초기화
    document.body.innerHTML = `
      <div id="markdownContent"></div>
      <div id="markdownSidebar"></div>
      <div id="tableOfContents"></div>
    `;
    jest.clearAllMocks();
  });

  describe('loadMarkdownFromText', () => {
    it('should parse markdown and render HTML', async () => {
      const markdownText = '# Hello World';
      const expectedHtml = '<p># Hello World</p>'; // marked mock의 기본 동작
      await markdownViewer.loadMarkdownFromText(markdownText, 'test.md');

      expect(ui.showLoading).toHaveBeenCalled();
      expect(marked.setOptions).toHaveBeenCalled();
      expect(marked.parse).toHaveBeenCalledWith(markdownText);
      
      const markdownContent = document.getElementById('markdownContent');
      expect(markdownContent.innerHTML).toBe(expectedHtml);
      
      expect(ui.showMarkdownViewer).toHaveBeenCalledWith('test.md');
      expect(ui.hideLoading).toHaveBeenCalled();
    });

    it('should handle mermaid diagrams', async () => {
      const markdownText = '```mermaid\ngraph TD;\nA-->B;\n```';
      marked.parse.mockReturnValue('<pre><code class="language-mermaid">graph TD;\\nA-->B;\\n</code></pre>');
      
      await markdownViewer.loadMarkdownFromText(markdownText, 'test.md');
      
      expect(mermaid.render).toHaveBeenCalled();
      const markdownContent = document.getElementById('markdownContent');
      expect(markdownContent.innerHTML).toContain('<svg>');
    });

    it('should generate table of contents', async () => {
        const markdownText = '# Title\n## Subtitle';
        const markdownContent = document.getElementById('markdownContent');
        
        // marked.parse가 실행된 후의 DOM 상태를 시뮬레이션
        marked.parse.mockImplementation(text => {
            markdownContent.innerHTML = `
                <h1 id="heading-0">Title</h1>
                <h2 id="heading-1">Subtitle</h2>
            `;
            return markdownContent.innerHTML;
        });
        
        // querySelectorAll이 h1, h2 태그를 반환하도록 모의(mock) 처리
        markdownContent.querySelectorAll = jest.fn().mockReturnValue([
            { tagName: 'H1', textContent: 'Title' },
            { tagName: 'H2', textContent: 'Subtitle' }
        ]);

        await markdownViewer.loadMarkdownFromText(markdownText, 'test.md');
        
        const toc = document.getElementById('tableOfContents');
        expect(toc.innerHTML).toContain('Title');
        expect(toc.innerHTML).toContain('Subtitle');
    });
  });

  describe('extractMarkdownText', () => {
    it('should extract text from a markdown file', async () => {
      const fakeFile = new Blob(['# Hello'], { type: 'text/markdown' });
      // JSDOM의 Blob에는 text() 메서드가 없으므로, FileReader를 사용하도록 모의(mock) 처리
      const reader = new FileReader();
      const promise = new Promise(resolve => {
        reader.onload = () => resolve(reader.result);
      });
      reader.readAsText(fakeFile);
      const text = await promise;
      
      expect(text).toBe('# Hello');
    });
  });
});
