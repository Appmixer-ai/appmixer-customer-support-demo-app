#!/usr/bin/env node

const { execSync } = require('child_process');
const { version } = require('../package.json');

const releaseVersion = process.argv[2] || version;

function run(cmd) {
  console.log(`> ${cmd}`);
  execSync(cmd, { stdio: 'inherit' });
}

function getCurrentBranch() {
  return execSync('git branch --show-current', { encoding: 'utf8' }).trim();
}

function isWorkingDirectoryClean() {
  const status = execSync('git status --porcelain', { encoding: 'utf8' });
  return status.trim() === '';
}

async function release() {
  console.log(`\nReleasing version ${releaseVersion} to public repository...\n`);

  // Check for clean working directory
  if (!isWorkingDirectoryClean()) {
    console.error('Error: Working directory is not clean. Please commit or stash changes first.');
    process.exit(1);
  }

  const currentBranch = getCurrentBranch();

  try {
    // Create orphan branch (no history)
    run('git checkout --orphan release-temp');

    // Stage all files
    run('git add -A');

    // Remove Claude-related files from staging
    const claudeFiles = [
      'CLAUDE.md',
      '.claude',
    ];

    for (const file of claudeFiles) {
      try {
        run(`git rm -rf --cached "${file}"`);
        console.log(`Excluded: ${file}`);
      } catch (e) {
        // File might not exist, ignore
      }
    }

    // Create a single commit
    run(`git commit -m "Release v${releaseVersion}"`);

    // Push to public repo
    run('git push public release-temp:main --force');

    console.log('\nSuccessfully pushed to public repository!');

  } finally {
    // Always switch back and clean up (force to handle untracked Claude files)
    run(`git checkout -f ${currentBranch}`);

    try {
      run('git branch -D release-temp');
    } catch (e) {
      // Branch might not exist if earlier steps failed
    }
  }

  console.log(`\nRelease v${releaseVersion} complete!`);
}

release().catch(err => {
  console.error('Release failed:', err.message);
  process.exit(1);
});
