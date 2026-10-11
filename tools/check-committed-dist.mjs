#!/usr/bin/env node
// Fail if the generated release package differs from the version committed to Git.
// Used after the normal build, not as a second packaging authority.
import { spawnSync } from 'node:child_process';
const result=spawnSync('git',['diff','--exit-code','--','dist'],{stdio:'inherit'});
if(result.error) {
  console.error('Cannot verify committed dist:',result.error.message);
  process.exit(2);
}
if(result.status!==0){
  console.error('\nFAIL: committed dist differs from a clean build. Run npm run build, review and commit dist/ with your source change.');
  process.exit(result.status ?? 2);
}
console.log('PASS committed dist matches generated package');
