const display = document.getElementById("display");
const historyList = document.getElementById("history-list");
let currentExpression = "";
let history = [];

/**
 * Appends a value to the current expression displayed on the calculator.
 * @param {string} value - The value to append (number or operator).
 */
function appendToDisplay(value) {
  // Prevent multiple decimal points in a single number
  if (value === "." && currentExpression.includes(".")) {
    return;
  }
  // Handle initial '0' display
  if (display.value === "0" && value !== ".") {
    display.value = value;
    currentExpression = value;
  } else {
    display.value += value;
    currentExpression += value;
  }
}

/**
 * Clears the calculator display and resets the current expression.
 */
function clearDisplay() {
  display.value = "0";
  currentExpression = "";
}

/**
 * Removes the last character from the current expression and updates the display.
 */
function backspace() {
  currentExpression = currentExpression.slice(0, -1);
  if (currentExpression === "") {
    display.value = "0";
  } else {
    display.value = currentExpression;
  }
}

/**
 * Adds a new calculation to the history list.
 * @param {string} expression - The calculation expression.
 * @param {string} result - The result of the calculation.
 */
function addToHistory(expression, result) {
  const historyItem = document.createElement("li");
  historyItem.textContent = `${expression} = ${result}`;
  historyList.prepend(historyItem); // Add to the top
  history.push({ expression, result });
  // Optional: Limit history length
  if (history.length > 10) {
    history.shift(); // Remove the oldest item
    historyList.removeChild(historyList.lastChild);
  }
}

/**
 * Evaluates the current expression and displays the result.
 * Handles basic arithmetic operations and potential errors.
 */
function calculateResult() {
  try {
    // Replace ^ with ** for exponentiation in JavaScript's eval
    let expressionToEvaluate = currentExpression.replace(/\^/g, "**");

    // Handle percentage: treat X% as X/100
    expressionToEvaluate = expressionToEvaluate.replace(
      /(\d+(\.\d+)?)%/g,
      "($1 / 100)"
    );

    const result = eval(expressionToEvaluate); // Using eval for simplicity, for complex apps a custom parser would be safer
    if (isNaN(result) || !isFinite(result)) {
      throw new Error("Invalid expression");
    }
    addToHistory(currentExpression, result);
    display.value = result;
    currentExpression = result.toString(); // Set current expression to the result for further calculations
  } catch (error) {
    display.value = "Error";
    currentExpression = ""; // Clear expression on error
    console.error("Calculation error:", error);
  }
}

// Event Listeners for button clicks
document.querySelectorAll(".num-btn").forEach((button) => {
  button.addEventListener("click", () => appendToDisplay(button.textContent));
});

document.querySelectorAll(".operator-button").forEach((button) => {
  button.addEventListener("click", () =>
    appendToDisplay(button.dataset.operator)
  );
});

document.getElementById("clear").addEventListener("click", clearDisplay);
document.getElementById("backspace").addEventListener("click", backspace);
document.getElementById("equals").addEventListener("click", calculateResult);

// Keyboard Input
document.addEventListener("keydown", (event) => {
  const key = event.key;

  if (/[0-9]/.test(key)) {
    // Numbers
    appendToDisplay(key);
  } else if (key === ".") {
    // Decimal
    appendToDisplay(key);
  } else if (["+", "-", "*", "/", "%"].includes(key)) {
    // Operators
    appendToDisplay(key);
  } else if (key === "^") {
    // Exponentiation
    appendToDisplay(key);
  } else if (key === "Enter") {
    // Equals
    calculateResult();
    event.preventDefault(); // Prevent default Enter key behavior (e.g., form submission)
  } else if (key === "Backspace") {
    // Backspace
    backspace();
  } else if (key === "c" || key === "C") {
    // Clear
    clearDisplay();
  }
});
