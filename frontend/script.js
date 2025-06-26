const chatForm = document.getElementById("chat-form");
const userInput = document.getElementById("user-input");
const chatBox = document.getElementById("chat-box");
const chatWrapper = document.getElementById("chat-wrapper");
const chatIcon = document.getElementById("chat-icon");
const chatClose = document.getElementById("chat-close");
const themeToggle = document.getElementById("theme-toggle");

const RASA_URL = "http://127.0.0.1:5005/webhooks/rest/webhook";

let conversationEnded = false;

// ⬇️ Get static buttons from DOM
const endButton = document.getElementById("end-button");
const helpfulBtn = document.getElementById("helpful-btn");
const notHelpfulBtn = document.getElementById("not-helpful-btn");

endButton.addEventListener("click", () => {
  conversationEnded = !conversationEnded;

  if (conversationEnded) {
    userInput.disabled = true;
    chatForm.querySelector("button").disabled = true;
    userInput.placeholder = "Conversation ended";
    endButton.textContent = "Continue";
    endButton.style.backgroundColor = "#007bff";
  } else {
    userInput.disabled = false;
    chatForm.querySelector("button").disabled = false;
    userInput.placeholder = "Ask me anything...";
    endButton.textContent = "End";
    endButton.style.backgroundColor = "#dc3545";
  }
});

helpfulBtn.onclick = () => {
  if (!conversationEnded) {
    appendMessage("user", "helpful");
    showTypingIndicator();
    sendMessageToBot("helpful");
  }
};

notHelpfulBtn.onclick = () => {
  if (!conversationEnded) {
    appendMessage("user", "not helpful");
    showTypingIndicator();
    sendMessageToBot("not helpful");
  }
};

// 🗑️ Trash button
const trashBtn = document.createElement("button");
trashBtn.id = "trash-btn";
trashBtn.innerText = "🗑️";
trashBtn.title = "Clear chat";
trashBtn.style.border = "none";
trashBtn.style.background = "transparent";
trashBtn.style.cursor = "pointer";
trashBtn.style.fontSize = "16px";
trashBtn.style.marginRight = "8px";
themeToggle.parentNode.insertBefore(trashBtn, themeToggle);

trashBtn.onclick = () => {
  chatBox.innerHTML = "";
  userInput.value = "";
  if (conversationEnded) {
    userInput.disabled = false;
    chatForm.querySelector("button").disabled = false;
    userInput.placeholder = "Ask me anything...";
    endButton.textContent = "End";
    endButton.style.backgroundColor = "#dc3545";
    conversationEnded = false;
  }
};

chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const message = userInput.value.trim();
  if (!message) return;

  appendMessage("user", message);
  userInput.value = "";

  showTypingIndicator();
  await sendMessageToBot(message);
});

function appendMessage(sender, message) {
  const msgDiv = document.createElement("div");
  msgDiv.classList.add("message", sender === "user" ? "user" : "bot");

  const bubble = document.createElement("div");
  bubble.classList.add("bubble");
  bubble.innerText = message;

  msgDiv.appendChild(bubble);
  chatBox.appendChild(msgDiv);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function showTypingIndicator() {
  const typingDiv = document.createElement("div");
  typingDiv.classList.add("message", "bot");
  typingDiv.id = "typing-indicator";

  typingDiv.innerHTML = `
    <div class="bubble"><span class="typing-dots"><span>.</span><span>.</span><span>.</span></span></div>
  `;

  chatBox.appendChild(typingDiv);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function removeTypingIndicator() {
  const typing = document.getElementById("typing-indicator");
  if (typing) typing.remove();
}

async function sendMessageToBot(message) {
  try {
    const response = await fetch(RASA_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        sender: "user",
        message
      })
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
          } else {
            appendMessage("bot", entry.text);
          }
        }

        if (entry.hasOwnProperty("custom") && entry.custom.end_chat === true) {
          userInput.disabled = true;
          chatForm.querySelector("button").disabled = true;
          userInput.placeholder = "Conversation ended";
          endButton.textContent = "Continue";
          endButton.style.backgroundColor = "#007bff";
          conversationEnded = true;
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

  const bubble = document.createElement("div");
  bubble.classList.add("bubble");

  if (text.includes("http")) {
    bubble.innerHTML = `Here’s the <a href="https://bharatkosh.gov.in/faq" target="_blank">FAQ page</a> — hope that helps!`;
  } else {
    bubble.innerHTML = `
      <div class="contact-info">
        <p><strong>Contact Support:</strong></p>
        <p>📞 <a href="tel:01124665534">011 24665534</a></p>
        <p>📧 <a href="mailto:ntrp-helpdesk@gov.in">ntrp-helpdesk@gov.in</a></p>
      </div>
    `;
  }

  msgDiv.appendChild(bubble);
  chatBox.appendChild(msgDiv);
  chatBox.scrollTop = chatBox.scrollHeight;
}

// Toggle dark mode
themeToggle.addEventListener("click", () => {
  chatWrapper.classList.toggle("dark");
  themeToggle.textContent = document.body.classList.contains("dark") ? "☀️" : "🌙";
});

// Toggle chat window
chatIcon.onclick = () => {
  const isOpen = !chatWrapper.classList.contains("hidden");
  chatWrapper.classList.toggle("hidden");
  chatIcon.classList.toggle("hidden", isOpen);
};

chatClose.onclick = () => {
  chatWrapper.classList.add("hidden");
  chatIcon.classList.remove("hidden");
};
