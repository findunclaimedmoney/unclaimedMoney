export async function saveMemory(sql, agent, category, key, value) {
  return await sql`
    INSERT INTO agent_memory (agent_name, category, fact_key, fact_value)
    VALUES (${agent}, ${category}, ${key}, ${value})
  `;
}

export async function recallMemory(sql, agent, category) {
  return await sql`
    SELECT fact_key, fact_value FROM agent_memory 
    WHERE agent_name = ${agent} AND category = ${category}
    ORDER BY last_accessed DESC LIMIT 10
  `;
}