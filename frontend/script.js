const chatForm = document.getElementById("chat-form");
const userInput = document.getElementById("user-input");
const chatBox = document.getElementById("chat-box");
const chatWrapper = document.getElementById("chat-wrapper");
const chatIcon = document.getElementById("chat-icon");
const chatClose = document.getElementById("chat-close");

const RASA_URL = "http://127.0.0.1:5005/webhooks/rest/webhook";

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
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sender: "user", message })
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
            showHelpfulButtons();
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

function disableInputBar() {
  userInput.disabled = true;
  userInput.placeholder = "Conversation ended";
  chatForm.querySelector("button").disabled = true;
}

function enableInputBar() {
  userInput.disabled = false;
  userInput.placeholder = "Type your message...";
  chatForm.querySelector("button").disabled = false;
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
    disableInputBar();
    btnContainer.remove();
  };

  btnContainer.appendChild(yesBtn);
  btnContainer.appendChild(noBtn);
  chatBox.appendChild(btnContainer);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function showHelpfulButtons() {
  const btnContainer = document.createElement("div");
  btnContainer.classList.add("button-container");

  const helpfulBtn = document.createElement("button");
  helpfulBtn.innerText = "Helpful";
  helpfulBtn.classList.add("btn");
  helpfulBtn.onclick = () => {
    appendMessage("user", "That was helpful");
    btnContainer.remove();
    appendFollowUpOptions();
  };

  const notHelpfulBtn = document.createElement("button");
  notHelpfulBtn.innerText = "Not Helpful";
  notHelpfulBtn.classList.add("btn");
  notHelpfulBtn.onclick = () => {
    appendMessage("user", "That was not helpful");
    btnContainer.remove();
    appendFormattedMessage("show contact");
    appendFollowUpOptions();
  };

  btnContainer.appendChild(helpfulBtn);
  btnContainer.appendChild(notHelpfulBtn);
  chatBox.appendChild(btnContainer);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function appendFollowUpOptions() {
  appendMessage("bot", "Would you like to continue the conversation?");
  showContinueButtons();
}

document.getElementById("theme-toggle").addEventListener("click", () => {
  chatWrapper.classList.toggle("dark");
  const btn = document.getElementById("theme-toggle");
  btn.textContent = document.body.classList.contains("dark") ? "☀️" : "🌙";
});

chatIcon.onclick = () => {
  const isOpen = !chatWrapper.classList.contains("hidden");
  chatWrapper.classList.toggle("hidden");
  chatIcon.classList.toggle("hidden", isOpen);
};

chatClose.onclick = () => {
  chatWrapper.classList.add("hidden");
  chatIcon.classList.remove("hidden");
};
