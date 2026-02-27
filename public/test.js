const formEl = document.getElementById('testForm');
const titleEl = document.getElementById('testTitle');
const errorEl = document.getElementById('error');
const resultEl = document.getElementById('result');
const submitBtn = document.getElementById('submitBtn');

let testData = null;

function getTestId() {
  const parts = window.location.pathname.split('/').filter(Boolean);
  return parts[1];
}

function renderQuestions(questions) {
  formEl.innerHTML = '';
  questions.forEach((q, idx) => {
    const block = document.createElement('div');
    block.className = 'question-block';
    block.innerHTML = `
      <label><strong>Q${idx + 1}:</strong> ${q.prompt}</label>
      <textarea data-answer-index="${idx}" placeholder="Type your answer"></textarea>
    `;
    formEl.appendChild(block);
  });
}

async function loadTest() {
  const testId = getTestId();
  try {
    const response = await fetch(`/api/tests/${testId}`);
    const data = await response.json();

    if (!response.ok) {
      titleEl.textContent = 'Test not found';
      errorEl.textContent = data.error || 'Could not load test.';
      submitBtn.disabled = true;
      return;
    }

    testData = data;
    titleEl.textContent = data.title;
    renderQuestions(data.questions);
  } catch (error) {
    titleEl.textContent = 'Server error';
    errorEl.textContent = 'Failed to load test.';
  }
}

async function submitAnswers() {
  errorEl.textContent = '';
  resultEl.style.display = 'none';

  if (!testData) {
    errorEl.textContent = 'Test data unavailable.';
    return;
  }

  const candidateName = document.getElementById('candidateName').value.trim();
  const answerInputs = [...formEl.querySelectorAll('textarea')];
  const answers = answerInputs.map((el) => el.value.trim());

  try {
    const response = await fetch(`/api/tests/${testData.id}/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ candidateName, answers })
    });

    const data = await response.json();

    if (!response.ok) {
      errorEl.textContent = data.error || 'Failed to submit answers.';
      return;
    }

    resultEl.className = 'result ok';
    resultEl.innerHTML = `
      <strong>Score Generated</strong><br>
      Candidate: ${data.candidateName}<br>
      Correct: ${data.correct}/${data.total}<br>
      Percentage: ${data.percentage}%
    `;
    resultEl.style.display = 'block';
  } catch (error) {
    errorEl.textContent = 'Server error while submitting answers.';
  }
}

submitBtn.addEventListener('click', submitAnswers);
loadTest();
