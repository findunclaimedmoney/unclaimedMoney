import { simpleGit } from 'simple-git';
const git = simpleGit();

async function pushChanges(message) {
  try {
    await git.add('.');
    await git.commit(message || 'Update: Agent Ecosystem');
    await git.push('origin', 'main');
    console.log('Successfully pushed to GitHub!');
  } catch (err) {
    console.error('Push failed:', err);
  }
}

const msg = process.argv[2];
pushChanges(msg);