// Jest DOM extensions
import '@testing-library/jest-dom';

// Mock window.URL.createObjectURL
global.URL.createObjectURL = jest.fn(() => 'blob:mock-url');
global.URL.revokeObjectURL = jest.fn();

// Mock XMLSerializer
global.XMLSerializer = jest.fn().mockImplementation(() => ({
  serializeToString: jest.fn().mockReturnValue('<svg>mock</svg>')
}));

// Setup for D3
Object.defineProperty(window, 'SVGElement', {
  writable: true,
  value: jest.fn().mockImplementation(() => ({}))
});