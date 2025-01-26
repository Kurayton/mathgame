/**************************************
 * Global Variables
 **************************************/
let playerName = "";
let difficulty = "easy";
let questionCount = 5;

let questions = []; // array of objects { question, correctAnswer, options[] }
let currentQuestionIndex = 0;
let score = 0;

/**************************************
 * Event Listeners (DOMContentLoaded)
 **************************************/
window.addEventListener("DOMContentLoaded", () => {
  setupEventHandlers();
});

/**************************************
 * Setup Event Handlers
 **************************************/
function setupEventHandlers() {
  const startQuizBtn = document.getElementById("start-quiz-btn");
  const nextButton = document.getElementById("next-button");
  const playAgainBtn = document.getElementById("play-again-btn");

  startQuizBtn.addEventListener("click", startQuiz);
  nextButton.addEventListener("click", nextQuestion);
  playAgainBtn.addEventListener("click", restartQuiz);
}

/**************************************
 * Start Quiz
 **************************************/
function startQuiz() {
  const nameInput = document.getElementById("player-name");
  const difficultySelect = document.getElementById("difficulty-select");
  const questionCountInput = document.getElementById("question-count");
  const startErrorMsg = document.getElementById("start-error-msg");

  // Validation
  if (!nameInput.value.trim()) {
    startErrorMsg.textContent = "Please enter your name.";
    return;
  }
  if (!questionCountInput.value || questionCountInput.value <= 0) {
    startErrorMsg.textContent = "Please enter a valid number of questions (1-50).";
    return;
  }

  startErrorMsg.textContent = "";

  // Save user inputs
  playerName = nameInput.value.trim();
  difficulty = difficultySelect.value;
  questionCount = parseInt(questionCountInput.value);

  // Store name in localStorage
  localStorage.setItem("playerName", playerName);

  // Reset quiz state
  currentQuestionIndex = 0;
  score = 0;

  // Generate random questions
  questions = generateRandomQuestions(difficulty, questionCount);

  // Show first question
  showScreen("quiz-screen");
  renderQuestion();
}

/**************************************
 * Generate Random Questions
 * Returns an array of question objects:
 * { question, correctAnswer, options[] }
 **************************************/
function generateRandomQuestions(difficulty, count) {
  const generated = [];
  for (let i = 0; i < count; i++) {
    generated.push(createRandomQuestion(difficulty));
  }
  return generated;
}

/**************************************
 * Create One Random Question
 **************************************/
function createRandomQuestion(difficulty) {
  // define numeric ranges based on difficulty
  let maxNum;
  switch (difficulty) {
    case "easy":
      maxNum = 10;  // 0..10
      break;
    case "medium":
      maxNum = 50;  // 0..50
      break;
    case "hard":
      maxNum = 100; // 0..100
      break;
    default:
      maxNum = 10;
  }

  // random operands
  const num1 = getRandomInt(0, maxNum);
  const num2 = getRandomInt(0, maxNum);

  // randomly pick an operation
  const operations = ["+", "-", "×", "÷"];
  const op = operations[getRandomInt(0, operations.length - 1)];

  let correctAnswer;
  switch (op) {
    case "+":
      correctAnswer = num1 + num2;
      break;
    case "-":
      correctAnswer = num1 - num2;
      break;
    case "×":
      correctAnswer = num1 * num2;
      break;
    case "÷":
      // avoid dividing by zero
      if (num2 === 0) {
        correctAnswer = 0;
      } else {
        // for easy integer math, let's do floor division in Hard mode
        correctAnswer = Math.floor(num1 / num2);
      }
      break;
  }

  const questionText = `What is ${num1} ${op} ${num2}?`;

  // generate random options
  const options = generateOptions(correctAnswer);

  return {
    question: questionText,
    correctAnswer,
    options
  };
}

/**************************************
 * Generate 4 Options (1 correct + 3 distractors)
 * We'll create distractors within a range around the correct answer.
 **************************************/
function generateOptions(correct) {
  // put correct answer in array
  const opts = [correct];

  // generate 3 random distractors
  while (opts.length < 4) {
    const distractor = correct + getRandomInt(-10, 10);
    // ensure distractor isn't already in array
    // also let's not allow negative distractors for easy or medium
    if (!opts.includes(distractor)) {
      opts.push(distractor);
    }
  }

  // shuffle them
  shuffleArray(opts);
  return opts;
}

/**************************************
 * Render the Current Question
 **************************************/
function renderQuestion() {
  const questionHeading = document.getElementById("question-heading");
  const questionText = document.getElementById("question-text");
  const answersContainer = document.getElementById("answers-container");
  const nextButton = document.getElementById("next-button");

  // Reset UI
  answersContainer.innerHTML = "";
  nextButton.classList.add("hidden");

  if (currentQuestionIndex >= questions.length) {
    showResults();
    return;
  }

  // Update heading (e.g., "Question 1 of 5")
  questionHeading.textContent = `Question ${currentQuestionIndex + 1} of ${questions.length}`;

  // Get current question object
  const q = questions[currentQuestionIndex];

  // Show question text
  questionText.textContent = q.question;

  // Create answer buttons
  q.options.forEach((option) => {
    const btn = document.createElement("button");
    btn.textContent = option;
    btn.addEventListener("click", () => checkAnswer(option));
    answersContainer.appendChild(btn);
  });
}

/**************************************
 * Check the Answer
 **************************************/
function checkAnswer(selected) {
  const q = questions[currentQuestionIndex];
  if (selected === q.correctAnswer) {
    score++;
    alert("Correct!");
  } else {
    alert(`Incorrect! The correct answer is: ${q.correctAnswer}`);
  }

  // Show "Next" button
  document.getElementById("next-button").classList.remove("hidden");
}

/**************************************
 * Go to Next Question
 **************************************/
function nextQuestion() {
  currentQuestionIndex++;
  if (currentQuestionIndex < questions.length) {
    renderQuestion();
  } else {
    showResults();
  }
}

/**************************************
 * Show Results
 **************************************/
function showResults() {
  showScreen("result-screen");

  const scoreText = document.getElementById("score-text");
  scoreText.textContent = `You scored ${score} out of ${questions.length}, ${playerName}.`;

  // bestScore key depends on name + difficulty
  const bestScoreKey = `bestScore_${playerName}_${difficulty}`;
  const prevBestScore = parseInt(localStorage.getItem(bestScoreKey)) || 0;

  if (score > prevBestScore) {
    localStorage.setItem(bestScoreKey, score);
  }
  const bestScore = Math.max(score, prevBestScore);

  const bestScoreText = document.getElementById("best-score-text");
  bestScoreText.textContent = `Best score (${difficulty}): ${bestScore}`;
}

/**************************************
 * Restart Quiz
 **************************************/
function restartQuiz() {
  // show start screen again
  showScreen("start-screen");
}

/**************************************
 * Utility: Show Screen by ID
 **************************************/
function showScreen(screenId) {
  const screens = document.querySelectorAll(".screen");
  screens.forEach((screen) => {
    screen.classList.remove("active");
  });
  document.getElementById(screenId).classList.add("active");
}

/**************************************
 * Utility: Get Random Int between min & max (inclusive)
 **************************************/
function getRandomInt(min, max) {
  // ensure min < max properly
  if (min > max) {
    [min, max] = [max, min];
  }
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**************************************
 * Utility: Shuffle Array In-Place
 **************************************/
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}
