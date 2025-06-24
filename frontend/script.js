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

  showTypingIndicator();
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

// Show typing animation
function showTypingIndicator() {
  const typingDiv = document.createElement("div");
  typingDiv.classList.add("message", "bot");
  typingDiv.id = "typing-indicator";
  typingDiv.innerHTML = `<span class="typing-dots">
    <span>.</span><span>.</span><span>.</span>
  </span>`;
  chatBox.appendChild(typingDiv);
  chatBox.scrollTop = chatBox.scrollHeight;
}

// Remove typing animation
function removeTypingIndicator() {
  const typing = document.getElementById("typing-indicator");
  if (typing) typing.remove();
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

    removeTypingIndicator();

    const data = await response.json();
    if (data.length === 0) {
      appendMessage("bot", "[No response from bot]");
    } else {
      data.forEach((entry) => {
        if (entry.text) {
          if (entry.text.includes("helpdesk") || entry.text.includes("http")) {
            appendFormattedMessage(entry.text);
          } else if (entry.text.toLowerCase().includes("would you like to continue")) {
            appendMessage("bot", entry.text);
            showContinueButtons();
          } else if (entry.text.includes("conversation ended")) {
            appendMessage("bot", entry.text);
            disableInputBar();
          } else {
            appendMessage("bot", entry.text);
          }
        }
      });
    }
  } catch (err) {
    removeTypingIndicator();
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

function disableInputBar() {
  userInput.disabled = true;
  userInput.placeholder = "Conversation ended";
  document.querySelector("button[type='submit']").disabled = true;
}

function enableInputBar() {
  userInput.disabled = false;
  userInput.placeholder = "Type your message...";
  document.querySelector("button[type='submit']").disabled = false;
}

function showContinueButtons() {
  const btnContainer = document.createElement("div");
  btnContainer.classList.add("button-container");

  const yesBtn = document.createElement("button");
  yesBtn.innerText = "Yes";
  yesBtn.classList.add("btn");
  yesBtn.onclick = () => {
    appendMessage("user", "yes");
    enableInputBar();  
    showTypingIndicator();
    sendMessageToBot("yes");
    btnContainer.remove();
  };

  const noBtn = document.createElement("button");
  noBtn.innerText = "No, End Chat";
  noBtn.classList.add("btn");
  noBtn.onclick = () => {
    appendMessage("user", "no");
    showTypingIndicator();
    sendMessageToBot("done");
    disableInputBar();  // ✅ close input
    btnContainer.remove();
  };

  btnContainer.appendChild(yesBtn);
  btnContainer.appendChild(noBtn);
  chatBox.appendChild(btnContainer);
  chatBox.scrollTop = chatBox.scrollHeight;
}
