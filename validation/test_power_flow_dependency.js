const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const src=fs.readFileSync('src/app/energy-card.js','utf8');
const method=(name,next)=>{
  const begin=src.indexOf('\n    '+name+'(');
  const end=src.indexOf('\n    '+next+'(',begin+1);
  assert.ok(begin>=0&&end>begin,name+' boundary');
  return src.slice(begin,end);
};
const methods=[method('powerFlowDependencyStatus','powerFlowDependencyNotice'),method('powerFlowDependencyNotice','flow')].join(',');
const context={customElements:{get:()=>undefined}};
vm.createContext(context);
const callbacks=vm.runInContext('({'+methods+'})',context);
const missing=callbacks.powerFlowDependencyNotice.call({
  powerFlowDependencyStatus:()=> 'missing'
});
assert.match(missing,/Power Flow Card Plus/);
assert.match(missing,/Not loaded/);
assert.match(missing,/HACS/);
assert.match(missing,/github.com\/flixlix\/power-flow-card-plus/);
assert.match(missing,/role="status"/);
assert.equal(callbacks.powerFlowDependencyNotice.call({powerFlowDependencyStatus:()=> 'ready'}),'');
const checking=callbacks.powerFlowDependencyNotice.call({powerFlowDependencyStatus:()=> 'checking'});
assert.match(checking,/Checking/);
assert.ok(src.includes("customElements.whenDefined('power-flow-card-plus')"),'must recover if HACS card loads after Energy UX');
assert.ok(src.includes("this.powerFlowDependencyNotice()"),'Flow must surface missing resource');
assert.ok(!src.includes("await import('power-flow"),'cannot silently bundle or fetch dependency');
assert.ok(src.includes("this._powerFlowProbeSettled"),'must allow a grace period after load');
console.log('PASS optional Power Flow Card Plus readiness: installed, delayed, missing and recovery');
