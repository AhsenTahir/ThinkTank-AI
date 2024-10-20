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

const showTypingEffect = (text, textElement, incomingMessageDiv) => {
    const lines = text.split("\n");
    let currentLineIndex = 0;
    let currentWordIndex = 0;
    const loadingIndicator = incomingMessageDiv.querySelector(".loading-indicator");
    if (loadingIndicator) {
        loadingIndicator.style.display = "none";
    }

    // Function to process text and convert asterisks to bold
    const processText = (text) => {
        return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                   .replace(/\*(.*?)\*/g, '<strong>$1</strong>');
    };

    const typingInterval = setInterval(() => {
        if (currentLineIndex < lines.length) {
            const words = lines[currentLineIndex].split(" ");
            
            if (currentWordIndex < words.length) {
                const currentWord = words[currentWordIndex];
                const processedWord = processText(currentWord);
                
                if (textElement.innerHTML.endsWith(' ') || textElement.innerHTML === '' || textElement.innerHTML.endsWith('<br>')) {
                    textElement.innerHTML += processedWord;
                } else {
                    textElement.innerHTML += ' ' + processedWord;
                }
                
                currentWordIndex++;
            } else {
                textElement.innerHTML += '<br>';
                currentLineIndex++;
                currentWordIndex = 0;
            }
            
            incomingMessageDiv.querySelector(".icon").classList.add("hide");
            chatList.scrollTop = chatList.scrollHeight;
        } else {
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
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message: Usermessage }),
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const data = await response.json();
    const apiResponse = data.response;

    // Hide the loader and show the text
    loaderElement.style.display = "none";
    textElement.style.display = "block";
    
    showTypingEffect(apiResponse, textElement, incomingMessageDiv);

  } catch (error) {
    IsResponseGenerating = false;
    loaderElement.style.display = "none";
    textElement.style.display = "block";
    textElement.innerText = "An error occurred while generating the response.";
    textElement.classList.add("error");
    console.error('Error:', error);
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
        <img src="images/stem1.png" alt="stem-icon" class="avatar"> <!-- Updated image source -->
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
