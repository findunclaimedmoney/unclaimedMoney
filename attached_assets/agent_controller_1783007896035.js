// 1. Import your helper function from your prompts file
// Ensure this path matches your folder structure
import { getSystemPrompt } from './prompts.js'; 

// 2. Example usage of your agents
const miaPrompt = getSystemPrompt('Mia');
const zacPrompt = getSystemPrompt('Zac');

console.log("Starting Agent Controller...");
console.log("Mia Agent Configured:", miaPrompt);
console.log("Zac Agent Configured:", zacPrompt);

// 3. Keep the process alive indefinitely 
// This prevents the Background Worker from exiting and restarting
setInterval(() => {
  console.log("Agent is still running...");
}, 60000); // Runs every minute