async function runTest() {
  console.log('--- STARTING PATHFINDER API TEST ---');
  
  // 1. Trigger Curriculum Generation
  console.log('Sending POST to /api/curriculum/generate...');
  const res = await fetch('http://localhost:4000/api/curriculum/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ careerGoal: 'Frontend Developer', currentLevel: 'Beginner' })
  });
  
  if (!res.ok) {
    console.error('Failed to generate:', await res.text());
    return;
  }
  
  const data = await res.json();
  console.log('Generate Response:', data);
  const jobId = data.jobId;
  
  // 2. Poll the status endpoint until completed
  console.log(`\nPolling status for job ${jobId}...`);
  let status = 'PENDING';
  while (status !== 'COMPLETED' && status !== 'FAILED') {
    const statusRes = await fetch(`http://localhost:4000/api/curriculum/status/${jobId}`);
    const statusData = await statusRes.json();
    console.log(`[Status Update] ${statusData.status}`);
    status = statusData.status;
    
    if (status === 'COMPLETED') {
      console.log('\n--- JOB COMPLETED ---');
      console.log(JSON.stringify(statusData.result, null, 2));
      break;
    }
    
    // Wait 1 second before polling again
    await new Promise(r => setTimeout(r, 1000));
  }
}

runTest().catch(console.error);
