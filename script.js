const typingform = document.querySelector(".typing-form");
const chatList = document.querySelector(".chat-list");
const toggleThemeButton = document.querySelector("#toggle-theme-button");
const DeleteChatButton = document.querySelector("#delete-chat-button");
const Suggestion_list = document.querySelectorAll(".suggestion-list .suggestions");

let Usermessage = "";
let IsResponseGenerating = false;

const speakIcon = document.getElementById('speak'); 
let isSpeaking = false;
let message;

speakIcon.addEventListener('click', () => {
    if (isSpeaking) {
        window.speechSynthesis.cancel(); 
        isSpeaking = false;
    } else {
        const lastGeminiResponse = document.querySelector(".chat-list .incoming:last-child .text");
        if (lastGeminiResponse) {
            message = new SpeechSynthesisUtterance();
            message.text = lastGeminiResponse.textContent;
            window.speechSynthesis.speak(message);
            isSpeaking = true;

            message.onend = () => {
                isSpeaking = false;
            };
        }
    }
});

const micIcon = document.getElementById('mic');
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

if (SpeechRecognition) {
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    micIcon.addEventListener('click', () => {
        recognition.start();

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            Usermessage = transcript;
            console.log("handleoutgoinchats");
            handleOutgoingChat();
        };

        recognition.onerror = (event) => {
            console.error('Speech recognition error detected:', event.error);
        };
    });
} else {
    console.error('Web Speech API is not supported in this browser.');
}

Suggestion_list.forEach((suggestion) => {
    suggestion.addEventListener("click", () => {
        Usermessage = suggestion.querySelector(".text").textContent;
        handleOutgoingChat();
    });
});

DeleteChatButton.addEventListener("click", () => {
    chatList.innerHTML = "";
    localStorage.removeItem("saved_chats");
    LoadLocalStorageData();
});

const createMessageElement = (content, ...classes) => {
    const div = document.createElement("div");
    div.classList.add("message", ...classes);
    div.innerHTML = content;
    return div;
};

const API_KEY = "AIzaSyDFbxiYu_rq_o_UkkDHuhfcGJ_Rfrt09iI";
const API_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${API_KEY}`;

const showTypingEffect = (text, textElement, incomingMessageDiv) => {
    const words = text.split(" ");
    let currentWordIndex = 0;
    const loadingIndicator = incomingMessageDiv.querySelector(".loading-indicator");
    // console.log(text);
    if (loadingIndicator) {
        loadingIndicator.style.display = "none";
    }

    const typingInterval = setInterval(() => {
        textElement.innerText +=
            (currentWordIndex === 0 ? "" : " ") + words[currentWordIndex++];
        incomingMessageDiv.querySelector(".icon").classList.add("hide");

        chatList.scrollTop = chatList.scrollHeight;

        if (currentWordIndex === words.length) {
            clearInterval(typingInterval);
            IsResponseGenerating = false;
            incomingMessageDiv.querySelector(".icon").classList.remove("hide");
            localStorage.setItem("saved_chats", chatList.innerHTML);
            chatList.scrollTop = chatList.scrollHeight;
        }
    }, 75);
};
const generateApiResponse = async (Usermessage, incomingMessageDiv) => {
  const textElement = incomingMessageDiv.querySelector(".text");
  const loaderElement = incomingMessageDiv.querySelector(".ai-circuit-loader");
 
  try {
      const requestBody = {
          contents: [
              {
                  role: "user",
                  parts: [
                      {
                          text: Usermessage,
                      },
                  ],
              },
          ],
      };

      const response = await fetch(API_URL, {
          method: "POST",
          headers: {
              "Content-Type": "application/json",
              "x-goog-api-key": API_KEY,
          },
          body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
          const errorText = await response.text();
          console.error("Error Response:", response.status, errorText);
          return;
      }

      const data = await response.json();
      if (!response.ok) throw new Error(data.error.message);
      
      const apiResponse = data?.candidates[0]?.content?.parts[0]?.text.replace(/<[^>]*>/g, "").replace(/\*/g, "");

      // Hide the loader and show the text
      loaderElement.style.display = "none";
      textElement.style.display = "block";
      
      showTypingEffect(apiResponse, textElement, incomingMessageDiv);

  } catch (error) {
      IsResponseGenerating = false;
      loaderElement.style.display = "none";
      textElement.style.display = "block";
      textElement.innerText = error.message;
      textElement.classList.add("error");
  } finally {
      incomingMessageDiv.classList.remove("loading");
  }
};


const LoadLocalStorageData = () => {
    const savedChats = localStorage.getItem("saved_chats");
    const themeColour = localStorage.getItem("themeColour");
    const IsLightMode = themeColour === "light-mode";
    if (themeColour === "light-mode") {
        document.body.classList.toggle("light-mode", IsLightMode);
        toggleThemeButton.innerText = IsLightMode ? "dark_mode" : "light_mode";
    }
    chatList.innerHTML = savedChats || "";
    document.body.classList.toggle("hide-header", savedChats);
};
LoadLocalStorageData();

toggleThemeButton.addEventListener("click", () => {
    const IsLightMode = document.body.classList.toggle("light-mode");
    localStorage.setItem("themeColour", IsLightMode ? "light-mode" : "dark-mode");
    toggleThemeButton.innerText = document.body.classList.contains("light-mode")
        ? "dark_mode"
        : "light_mode";
});

const showLoadingAnimation = () => {
    const html = `<div class="message-content">
        <img src="images/jarvis.png" alt="jarvis-icon" class="avatar">
        <p class="text"></p>
        <div class="ai-circuit-loader">
            <div class="circuit-path"></div>
            <div class="circuit-path"></div>
            <div class="circuit-path"></div>
        </div>
    </div>
    <span onclick="copyMessage(this)" class="hide icon material-symbols-outlined">content_copy</span>`;
    const incomingMessageDiv = createMessageElement(html, "incoming", "loading");

    chatList.appendChild(incomingMessageDiv);
    chatList.scrollTop = chatList.scrollHeight; 
    return incomingMessageDiv;
};

const copyMessage = (copyicon) => {
    const messageText = copyicon.parentElement.querySelector(".text").innerText;
    navigator.clipboard.writeText(messageText);
    copyicon.innerText = "done";
    setTimeout(() => {
        copyicon.innerText = "content_copy";
    }, 1000);
};

const handleOutgoingChat = () => {
    Usermessage = document.querySelector(".typing-input").value.trim() || Usermessage;
    if (!Usermessage || IsResponseGenerating) return;

    console.log("handleoutgoin chats") 

    IsResponseGenerating = true;
    const userPromptHtml = `<div class="user-prompt">
        <p class="text">${Usermessage}</p>    
    </div>`;
    const userPromptDiv = createMessageElement(userPromptHtml, "outgoing");
    userPromptDiv.classList.add("fade-in"); // Add fade-in class
    chatList.appendChild(userPromptDiv); // Append the styled user prompt

    // Removed the redundant outgoing message display
    typingform.reset();
    document.body.classList.add("hide-header");

    const incomingMessageDiv = showLoadingAnimation();
    setTimeout(() => generateApiResponse(Usermessage, incomingMessageDiv), 500);
};

typingform.addEventListener("submit", function (e) {
    e.preventDefault();
    handleOutgoingChat();
});
