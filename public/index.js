const questionsContainer = document.getElementById('questions');
const addQuestionBtn = document.getElementById('addQuestion');
const createTestBtn = document.getElementById('createTest');
const errorEl = document.getElementById('error');
const shareEl = document.getElementById('share');

let questionCount = 0;

function renderQuestion() {
  questionCount += 1;
  const wrapper = document.createElement('div');
  wrapper.className = 'question-block';
  wrapper.innerHTML = `
    <h3>Question ${questionCount}</h3>
    <label>Question</label>
    <textarea class="prompt" placeholder="What is closure in JavaScript?"></textarea>
    <label>Correct Answer</label>
    <input class="answer" placeholder="A closure is..." />
  `;
  questionsContainer.appendChild(wrapper);
}

async function createTest() {
  errorEl.textContent = '';
  shareEl.style.display = 'none';

  const title = document.getElementById('title').value.trim();
  const prompts = [...document.querySelectorAll('.prompt')];
  const answers = [...document.querySelectorAll('.answer')];

  const questions = prompts.map((promptEl, idx) => ({
    prompt: promptEl.value.trim(),
    correctAnswer: answers[idx].value.trim()
  })).filter((q) => q.prompt && q.correctAnswer);

  try {
    const response = await fetch('/api/tests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, questions })
    });

    const data = await response.json();

    if (!response.ok) {
      errorEl.textContent = data.error || 'Unable to create test.';
      return;
    }

    const fullUrl = `${window.location.origin}${data.shareUrl}`;
    shareEl.innerHTML = `<strong>Share this link:</strong><br>${fullUrl}`;
    shareEl.style.display = 'block';
  } catch (error) {
    errorEl.textContent = 'Server error while creating test.';
  }
}

addQuestionBtn.addEventListener('click', renderQuestion);
createTestBtn.addEventListener('click', createTest);

renderQuestion();
