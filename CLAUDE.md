# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Memory Bank Instructions

**CRITICAL**: Claude must read and follow the memory bank instructions in `.github/instructions/memory-bank.instructions.md` at the start of every session. This defines how Claude should work with the memory bank system.

### Key Memory Bank Principles
- Memory resets completely between sessions - the Memory Bank is the ONLY link to previous work
- ALL memory bank files must be read at the start of EVERY task
- When user requests "update memory bank", review ALL files in memory-bank/ directory
- Focus particularly on `activeContext.md` and `progress.md` for current state tracking

## Common Development Commands

### Testing
```bash
npm test                # Run all tests
npm run test:watch      # Run tests in watch mode
npm run test:coverage   # Run tests with coverage report
```

### Local Development
```bash
# Using Python (recommended)
python -m http.server 8000

# Then open http://localhost:8000 in browser
```

### Node.js Requirements
- Node version 20.x (Iron) is required
- Use `nvm install Iron && nvm use Iron` to set up the correct version

## Architecture Overview

This is a client-side document viewer application that supports PDF and Markdown files with comparison capabilities.

### Core Architecture
- **Single Page Application**: All functionality runs in the browser with no backend dependencies
- **Modular JavaScript**: ES6 modules organize functionality by feature area
- **CDN-based Dependencies**: External libraries loaded via CDN for core functionality
- **File API Integration**: Uses HTML5 File API for local file handling

### Key Modules
- **`js/app.js`**: Main application controller, handles file upload, viewer initialization, and overall application state
- **`js/pdf-viewer.js`**: PDF rendering using PDF.js, page navigation, zoom controls
- **`js/ui.js`**: UI state management, loading/error states, viewer transitions

### External Dependencies (CDN)
- **PDF.js**: Mozilla's PDF renderer for browser-native PDF display
- **Marked.js**: Markdown parsing and HTML conversion
- **Mermaid.js**: Diagram rendering for flowcharts, sequence diagrams, etc.
- **Prism.js**: Syntax highlighting for code blocks
- **jsdiff**: Text comparison for document diff functionality

## Key Features

### Document Viewers
- **PDF Viewer**: Page navigation, keyboard shortcuts (arrows, Home/End), responsive scaling
- **Markdown Viewer**: GFM support, automatic table of contents, Mermaid diagram rendering, code highlighting

### Document Comparison
- **Side-by-side comparison**: Upload two documents of the same type
- **Visual diff**: Color-coded additions (green) and deletions (red) with precise word-level changes
- **Supported formats**: PDF-to-PDF and Markdown-to-Markdown comparison

### UI Patterns
- **Tab-based interface**: Switch between view mode and comparison mode
- **Drag & drop**: File upload via drag and drop or file picker
- **Responsive design**: Works on desktop, tablet, and mobile devices

## Testing

### Test Structure
- **Jest**: Testing framework with jsdom environment
- **Test files**: Located in `tests/` directory with `.test.js` extension
- **Test data**: Sample files in `tests/docs/` for testing different document types

### Running Tests
- Tests are configured to run in jsdom environment for DOM manipulation testing
- Coverage reports are generated in `coverage/` directory
- Use `npm run test:watch` during development for continuous testing

## Memory Bank Context

The `memory-bank/` directory contains project context and documentation:
- **systemPatterns.md**: Detailed architecture patterns and technical decisions
- **productContext.md**: Product requirements and feature specifications
- **techContext.md**: Technical implementation details
- **activeContext.md**: Current development context and progress

## File Organization

### Static Assets
- **`index.html`**: Main application entry point with UI structure
- **`css/style.css`**: Application styling with CSS custom properties for theming

### JavaScript Modules
- Import/export patterns used throughout for module organization
- UI callbacks system for decoupled module communication
- State management centralized in `app.js` with module-specific state in respective files

## Coding Standards

**IMPORTANT**: All code must follow the coding standards defined in `specs/coding-rules.md`. This includes:
- Function length limit (40 lines)
- Parameter limit (5 parameters)
- Nesting depth limit (3 levels)
- Meaningful naming conventions
- Proper error handling
- Single responsibility principle

Before writing any code, review `specs/coding-rules.md` and ensure compliance with all rules.

## Development Notes

### Styling
- Uses CSS custom properties (CSS variables) for consistent theming
- Flexbox and Grid layouts for responsive design
- Separate concerns: layout in HTML, styling in CSS, behavior in JS

### Event Handling
- Event-driven architecture with extensive use of event listeners
- File upload handling supports both drag & drop and file picker interfaces
- Keyboard shortcuts implemented for PDF navigation

### Error Handling
- Graceful degradation for unsupported file types or loading failures
- User-friendly error messages with specific guidance
- Loading states and progress indicators for better user experience