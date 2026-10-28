const chatInput = document.getElementById("userInput");
const chatButton = document.getElementById("sendButton");
const chatMessages = document.getElementById("chatMessages");
const chatStatus = document.getElementById("chatStatus");

// Temperature for our experiment
let chatTemperature = 0.7;

function showChatMessage(role, text) {
  if (!chatMessages) return;
  const message = document.createElement("div");

  message.className =
    "chat-message " +
    (role === "user" ? "chat-user" : "chat-assistant");

  message.textContent = text;
  chatMessages.appendChild(message);

  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Initial prompt message
if (chatMessages && chatMessages.children.length === 0) {
  showChatMessage("assistant", "Hello! I am Mayank's AI assistant. Ask me questions about Mayank's studies at JECRC University, web development skills, or projects!");
}

// Check if local configuration is present
const hasApiKey = typeof CONFIG !== "undefined" && CONFIG.apiKey && CONFIG.apiKey !== "YOUR_PRIVATE_GROQ_KEY";

if (!hasApiKey && chatButton && chatStatus) {
  chatButton.disabled = true;
  chatStatus.textContent = "AI chat requires a Groq API key in config.js (classroom demonstration mode).";
}

async function sendChatMessage() {
  if (!chatButton || chatButton.disabled) return;

  const question = chatInput.value.trim();

  if (!question) return;

  showChatMessage("user", question);
  chatInput.value = "";

  chatButton.disabled = true;
  chatStatus.textContent = "AI is thinking...";

  try {
    const response = await fetch(
      CONFIG.baseUrl.replace(/\/$/, "") +
      "/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + CONFIG.apiKey
        },
        body: JSON.stringify({
          model: CONFIG.model || "openai/gpt-oss-20b",
          temperature: chatTemperature,
          messages: [
            {
              role: "system",
              content:
                "You are an AI assistant for Mayank Singhal's portfolio website. " +
                "Mayank is a B.Tech student at JECRC University. " +
                "Answer questions about Mayank's background, HTML, CSS, JavaScript, " +
                "APIs, and web development projects. " +
                "Do not invent false information. " +
                "Keep replies concise and under 60 words."
            },
            {
              role: "user",
              content: question
            }
          ]
        })
      }
    );

    if (response.status === 429) {
      throw new Error("RATE_LIMIT");
    }

    if (!response.ok) {
      throw new Error("API_ERROR");
    }

    const data = await response.json();

    const answer = data.choices?.[0]?.message?.content;

    if (typeof answer !== "string" || !answer.trim()) {
      throw new Error("INVALID_RESPONSE");
    }

    showChatMessage("assistant", answer);

  } catch (error) {
    console.error("Chat error:", error.message);

    if (error.message === "RATE_LIMIT") {
      showChatMessage(
        "assistant",
        "Too many requests. Please wait and try again."
      );
    } else if (!navigator.onLine) {
      showChatMessage(
        "assistant",
        "No internet connection. Please reconnect."
      );
    } else {
      showChatMessage(
        "assistant",
        "AI service unavailable. Please check your Groq API key in config.js and try again."
      );
    }
  } finally {
    if (hasApiKey) {
      chatButton.disabled = false;
      chatStatus.textContent = "";
    }
  }
}

if (chatButton && chatInput) {
  chatButton.addEventListener("click", sendChatMessage);

  chatInput.addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
      sendChatMessage();
    }
  });
}
