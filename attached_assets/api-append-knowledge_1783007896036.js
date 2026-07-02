// This function will be triggered by your 'Append' button
async function handleAppendKnowledge(text) {
  const agent = 'Mia';
  const category = 'knowledge_base';
  const key = 'user_upload_' + Date.now(); // Unique key for this upload
  
  // Call the memory service we created
  await saveMemory(sql, agent, category, key, text);
  
  // Update the UI
  alert("Knowledge successfully saved to Mia's long-term memory!");
}