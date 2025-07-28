// Quiz functionality
function checkAnswer(answer) {
  const result = document.getElementById('quiz-result');
  if (answer === 'b') {
    result.textContent = "✅ Correct! Delhi is the capital of India.";
    result.style.color = "green";
  } else {
    result.textContent = "❌ Wrong! Try again.";
    result.style.color = "red";
  }
}

// API functionality
async function getJoke() {
  const jokeEl = document.getElementById('joke');
  jokeEl.textContent = "Loading...";
  try {
    const res = await fetch('https://icanhazdadjoke.com/', {
      headers: { Accept: 'application/json' }
    });
    const data = await res.json();
    jokeEl.textContent = data.joke;
  } catch (error) {
    jokeEl.textContent = "Failed to fetch joke.";
  }
}
