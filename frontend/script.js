const chatForm = document.getElementById("chat-form");
const userInput = document.getElementById("user-input");
const chatBox = document.getElementById("chat-box");

const RASA_URL = "http://localhost:5005/webhooks/rest/webhook";

// Handle form submit
chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const message = userInput.value.trim();
  if (!message) return;

  appendMessage("user", message);
  userInput.value = "";
  await sendMessageToBot(message);
});

// Add message to UI
function appendMessage(sender, message) {
  const msgDiv = document.createElement("div");
  msgDiv.classList.add("message", sender === "user" ? "user" : "bot");
  msgDiv.innerText = message;
  chatBox.appendChild(msgDiv);
  chatBox.scrollTop = chatBox.scrollHeight;
}

// Send message to Rasa server
async function sendMessageToBot(message) {
  try {
    const response = await fetch(RASA_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ sender: "user", message: message })
    });

    const data = await response.json();
    if (data.length === 0) {
      appendMessage("bot", "[No response from bot]");
    } else {
      data.forEach((entry) => {
        if (entry.text) appendMessage("bot", entry.text);
      });
    }
  } catch (err) {
    appendMessage("bot", "[Error connecting to bot]");
    console.error("Fetch error:", err);
  }
}
