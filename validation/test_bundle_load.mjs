import fs from 'node:fs';
import vm from 'node:vm';

const bundle = fs.readFileSync(new URL('../dist/rhi-energy-ux.js', import.meta.url), 'utf8');
const pkg = JSON.parse(fs.readFileSync(new URL('../package.json', import.meta.url), 'utf8'));

class HTMLElement {}
const registry = new Map();
const customElements = {
  get: name => registry.get(name),
  define: (name, ctor) => registry.set(name, ctor)
};
const window = { customCards: [] };
const context = {
  console,
  HTMLElement,
  customElements,
  window,
  document: {},
  setTimeout,
  clearTimeout,
  globalThis: null
};
context.globalThis = context;
window.window = window;

vm.createContext(context);
vm.runInContext(bundle, context, { timeout: 10000 });

for (const name of ['homebrain-energy-card', 'homebrain-energy-domain-card']) {
  if (!registry.has(name)) throw new Error(`custom element not registered: ${name}`);
}
if (!bundle.includes(`const UX_VERSION = 'R${pkg.version}'`)) {
  throw new Error(`runtime version does not match package ${pkg.version}`);
}
console.log('PASS bundle load and custom-element registration smoke');
