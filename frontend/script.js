const chatForm = document.getElementById("chat-form");
const userInput = document.getElementById("user-input");
const chatBox = document.getElementById("chat-box");

const RASA_URL = "http://127.0.0.1:5005/webhooks/rest/webhook";

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
        if (entry.text) {
          // If message contains contact or link, apply formatting
          if (entry.text.includes("helpdesk") || entry.text.includes("http")) {
            appendFormattedMessage(entry.text);
          } else {
            appendMessage("bot", entry.text);
          }
        }
      });
    }
  } catch (err) {
    appendMessage("bot", "[Error connecting to bot]");
    console.error("Fetch error:", err);
  }
}

function appendFormattedMessage(text) {
  const msgDiv = document.createElement("div");
  msgDiv.classList.add("message", "bot");

  if (text.includes("http")) {
    msgDiv.innerHTML = `Here’s the <a href="https://bharatkosh.gov.in/faq" target="_blank">FAQ page</a> — hope that helps!`;
  } else {
    msgDiv.innerHTML = `<strong>Contact Support:</strong><br>
      📞 <b>011 24665534</b><br>
      📧 <b>ntrp-helpdesk[at]gov[dot]in</b>`;
  }

  chatBox.appendChild(msgDiv);
  chatBox.scrollTop = chatBox.scrollHeight;
}
