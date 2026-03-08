import { TextEncoder, TextDecoder } from 'util';

// Node.js環境でTextEncoder/TextDecoderをグローバルに定義（Jest用）
if (typeof global.TextEncoder === 'undefined') {
  global.TextEncoder = TextEncoder;
}
if (typeof global.TextDecoder === 'undefined') {
  global.TextDecoder = TextDecoder;
}
