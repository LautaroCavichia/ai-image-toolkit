// src/App.tsx
import React, { useState } from 'react';
import './App.css';
import ImageUploader from './components/imageUploader';
import JobStatusDisplay from './components/jobStatusDisplay';
import { JobResponseDTO } from './types';

function App() {
  const [currentJob, setCurrentJob] = useState<JobResponseDTO | null>(null);

  const handleNewJob = (job: JobResponseDTO) => {
    setCurrentJob(job);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>AI Image Editor</h1>
      </header>
      <main>
        <ImageUploader onJobCreated={handleNewJob} />
        {currentJob && (
          <div style={{ marginTop: '20px', borderTop: '1px solid #eee', paddingTop: '20px' }}>
            <JobStatusDisplay initialJob={currentJob} />
          </div>
        )}
      </main>
    </div>
  );
}

export default App;