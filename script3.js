const chatBox = document.getElementById("chatBox");
const userInput = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");
const micBtn = document.getElementById("micBtn");
const themeBtn = document.getElementById("themeBtn");
const clearBtn = document.getElementById("clearBtn");
const clearAllBtn = document.getElementById("clearAllBtn");
const exportBtn = document.getElementById("exportBtn");
const newChatBtn = document.getElementById("newChatBtn");
const personalitySelect = document.getElementById("personality");

let totalMessages = 0;
let userMessages = 0;
let botMessages = 0;

let notes = JSON.parse(localStorage.getItem("notes")) || [];
let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let sessions = JSON.parse(localStorage.getItem("chatSessions")) || [];
let currentSessionId = localStorage.getItem("currentSessionId") || null;
let userName = localStorage.getItem("userName") || "";
let currentPersonality = localStorage.getItem("personality") || "friendly";
// Speech volume (0.0 - 1.0). Persisted in localStorage so user can increase/decrease.
let speechVolume = (() => {
    const v = parseFloat(localStorage.getItem("speechVolume"));
    return Number.isFinite(v) ? Math.max(0, Math.min(1, v)) : 1;
})();

personalitySelect.value = currentPersonality;

function updateStats() {
    document.getElementById("totalMessages").textContent = totalMessages;
    document.getElementById("userMessages").textContent = userMessages;
    document.getElementById("botMessages").textContent = botMessages;
}

function createNewSession() {
    const sessionId = `session-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    const session = {
        id: sessionId,
        title: `New chat ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        chatHtml: ""
    };

    sessions.push(session);
    currentSessionId = sessionId;
    localStorage.setItem("chatSessions", JSON.stringify(sessions));
    localStorage.setItem("currentSessionId", currentSessionId);
    renderSessions();
}

function saveCurrentSession() {
    if (!currentSessionId) return;

    const session = sessions.find(s => s.id === currentSessionId);
    if (!session) return;

    session.chatHtml = chatBox.innerHTML;
    session.updatedAt = new Date().toISOString();
    session.title = deriveSessionTitle();

    localStorage.setItem("chatSessions", JSON.stringify(sessions));
    renderSessions();
}

function saveChat() {
    saveCurrentSession();
}

function deriveSessionTitle() {
    const firstUser = chatBox.querySelector(".message.user .text");
    if (firstUser) {
        const text = firstUser.innerText.trim().split("\n")[0];
        return text.length > 30 ? text.slice(0, 30) + "..." : text;
    }
    return `New chat ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
}

function renderSessions() {
    const list = document.getElementById("historyList");
    if (!list) return;

    if (sessions.length === 0) {
        list.innerHTML = "No conversations yet.";
        return;
    }

    list.innerHTML = sessions
        .slice()
        .reverse()
        .map(session => {
            const activeClass = session.id === currentSessionId ? "history-item active" : "history-item";
            const date = new Date(session.updatedAt).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
            return `
                <div class="history-item ${activeClass}" data-session-id="${session.id}">
                    <div class="history-title">${session.title}</div>
                    <div class="history-meta">${date}</div>
                </div>
            `;
        })
        .join("");

    list.querySelectorAll(".history-item").forEach(item => {
        item.addEventListener("click", () => {
            const sessionId = item.getAttribute("data-session-id");
            if (sessionId) {
                loadSession(sessionId);
            }
        });
    });
}

function loadSession(sessionId) {
    const session = sessions.find(s => s.id === sessionId);
    if (!session) return;

    currentSessionId = session.id;
    localStorage.setItem("currentSessionId", currentSessionId);

    chatBox.innerHTML = session.chatHtml || "";
    totalMessages = chatBox.querySelectorAll(".message").length;
    userMessages = chatBox.querySelectorAll(".message.user").length;
    botMessages = chatBox.querySelectorAll(".message.bot").length;

    updateStats();
    renderSessions();
    scrollBottom();
}

function loadCurrentSession() {
    if (!currentSessionId) {
        createNewSession();
        return;
    }

    const session = sessions.find(s => s.id === currentSessionId);
    if (!session) {
        createNewSession();
        return;
    }

    // Load the session's saved chat HTML into the chatbox
    if (session.chatHtml) {
        chatBox.innerHTML = session.chatHtml;
        totalMessages = chatBox.querySelectorAll(".message").length;
        userMessages = chatBox.querySelectorAll(".message.user").length;
        botMessages = chatBox.querySelectorAll(".message.bot").length;
        updateStats();
    }

    renderSessions();
    scrollBottom();
}

loadCurrentSession();

function scrollBottom() {
    chatBox.scrollTop = chatBox.scrollHeight;
}

function getTimeStamp() {
    return new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
    });
}

function createMessage(text, sender) {

    const message = document.createElement("div");
    message.className = `message ${sender}`;

    const icon =
        sender === "user"
            ? "fa-solid fa-user"
            : "fa-solid fa-robot";

    message.innerHTML = `
        <div class="avatar">
            <i class="${icon}"></i>
        </div>

        <div class="text">
            ${text}
            <div style="font-size:11px;margin-top:6px;opacity:.6">
                ${getTimeStamp()}
            </div>
        </div>
    `;

    chatBox.appendChild(message);

    totalMessages++;

    if (sender === "user") {
        userMessages++;
    } else {
        botMessages++;
    }

    updateStats();
    saveChat();
    scrollBottom();
}

function showTyping() {

    const typing = document.createElement("div");

    typing.className = "message bot";
    typing.id = "typingIndicator";

    typing.innerHTML = `
        <div class="avatar">
            <i class="fa-solid fa-robot"></i>
        </div>

        <div class="text">
            <div class="typing">
                <span></span>
                <span></span>
                <span></span>
            </div>
        </div>
    `;

    chatBox.appendChild(typing);

    scrollBottom();
}

function removeTyping() {

    const typing = document.getElementById("typingIndicator");

    if (typing) {
        typing.remove();
    }
}

function speak(text) {
    if (!window.speechSynthesis) return;

    // If the message contains HTML (e.g., <br>), strip tags so speech reads cleanly.
    const tmp = document.createElement("div");
    tmp.innerHTML = text;
    const plainText = tmp.innerText || tmp.textContent || text;

    const utterance = new SpeechSynthesisUtterance(plainText);

    utterance.rate = 1;
    utterance.pitch = 1;
    // Use the persisted speechVolume (0.0 - 1.0)
    utterance.volume = Math.max(0, Math.min(1, speechVolume));

    speechSynthesis.speak(utterance);
}

// Create on-screen volume controls so user can increase/decrease speech volume.
function createVolumeControls() {

    const container = document.createElement("div");

    container.style.position = "fixed";
    container.style.right = "12px";
    container.style.bottom = "12px";
    container.style.zIndex = 9999;
    container.style.display = "flex";
    container.style.alignItems = "center";
    container.style.gap = "6px";
    container.style.background = "rgba(0,0,0,0.6)";
    container.style.color = "#fff";
    container.style.padding = "6px 8px";
    container.style.borderRadius = "8px";
    container.style.fontSize = "13px";

    const down = document.createElement("button");
    down.textContent = "🔉";
    down.title = "Decrease voice volume";
    down.style.background = "transparent";
    down.style.border = "none";
    down.style.color = "inherit";
    down.style.cursor = "pointer";

    const label = document.createElement("span");
    label.textContent = Math.round(speechVolume * 100) + "%";

    const up = document.createElement("button");
    up.textContent = "🔊";
    up.title = "Increase voice volume";
    up.style.background = "transparent";
    up.style.border = "none";
    up.style.color = "inherit";
    up.style.cursor = "pointer";

    down.addEventListener("click", () => {
        speechVolume = Math.max(0, +(speechVolume - 0.1).toFixed(2));
        localStorage.setItem("speechVolume", speechVolume);
        label.textContent = Math.round(speechVolume * 100) + "%";
    });

    up.addEventListener("click", () => {
        speechVolume = Math.min(1, +(speechVolume + 0.1).toFixed(2));
        localStorage.setItem("speechVolume", speechVolume);
        label.textContent = Math.round(speechVolume * 100) + "%";
    });

    container.appendChild(down);
    container.appendChild(label);
    container.appendChild(up);

    document.body.appendChild(container);
}

function botReply(text) {

    showTyping();

    setTimeout(() => {

        removeTyping();

        createMessage(text, "bot");

        speak(text);

    }, 1000);
}

function sendMessage() {

    const text = userInput.value.trim();

    if (!text) return;

    createMessage(text, "user");

    userInput.value = "";

    processMessage(text);
}

sendBtn.addEventListener("click", sendMessage);

userInput.addEventListener("keydown", e => {

    if (e.key === "Enter" && !e.shiftKey) {

        e.preventDefault();

        sendMessage();
    }
});

themeBtn.addEventListener("click", () => {

    document.body.classList.toggle("light");

    localStorage.setItem(
        "theme",
        document.body.classList.contains("light")
            ? "light"
            : "dark"
    );
});

const savedTheme = localStorage.getItem("theme");

if (savedTheme === "light") {
    document.body.classList.add("light");
}

personalitySelect.addEventListener("change", () => {

    currentPersonality = personalitySelect.value;

    localStorage.setItem(
        "personality",
        currentPersonality
    );

    botReply(
        `Personality changed to ${currentPersonality}.`
    );
});

clearBtn.addEventListener("click", () => {
    if (!confirm("Clear current chat?")) return;

    if (currentSessionId) {
        sessions = sessions.filter(s => s.id !== currentSessionId);
        currentSessionId = null;
        localStorage.setItem("chatSessions", JSON.stringify(sessions));
        localStorage.removeItem("currentSessionId");
    }

    chatBox.innerHTML = "";
    totalMessages = 0;
    userMessages = 0;
    botMessages = 0;
    updateStats();
    renderSessions();
});

clearAllBtn.addEventListener("click", () => {
    if (!confirm("Clear all conversations? This will remove every saved chat permanently.")) return;

    sessions = [];
    currentSessionId = null;
    localStorage.removeItem("chatSessions");
    localStorage.removeItem("currentSessionId");

    chatBox.innerHTML = "";
    totalMessages = 0;
    userMessages = 0;
    botMessages = 0;
    updateStats();
    renderSessions();
    createNewSession();
});

newChatBtn.addEventListener("click", () => {
    createNewSession();
    chatBox.innerHTML = "";
    totalMessages = 0;
    userMessages = 0;
    botMessages = 0;
    updateStats();
    renderSessions();
    const welcomeText = userName
        ? `Welcome back ${userName}!`
        : "Welcome back!";
    createMessage(welcomeText, "bot");
});

scrollBottom();
const jokes = [
    "Why do programmers prefer dark mode? Because light attracts bugs.",
    "Why was JavaScript sad? Because it didn't know how to 'null' its feelings.",
    "Why do Java developers wear glasses? Because they can't C#.",
    "Debugging: Being the detective in a crime movie where you are also the criminal.",
    "A SQL query walks into a bar, walks up to two tables and asks: Can I join you?"
];

const facts = [
    "The human brain contains around 86 billion neurons.",
    "India is the world's largest democracy.",
    "The Sun contains more than 99% of the mass of our solar system.",
    "A day on Venus is longer than a year on Venus.",
    "The internet was originally called ARPANET."
];

const quotes = [
    "Success is the sum of small efforts repeated every day.",
    "Your future is created by what you do today.",
    "Dream big. Start small. Act now.",
    "Discipline beats motivation.",
    "The best way to predict the future is to create it."
];

function randomItem(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

// Map to remember last used index per category so we avoid repeating the same item twice in a row.
const _lastIndexMap = {};

function randomItemUnique(arr, key) {
    if (!key) return randomItem(arr);

    const last = _lastIndexMap[key];

    if (arr.length <= 1) {
        _lastIndexMap[key] = 0;
        return arr[0];
    }

    let idx;
    let attempts = 0;

    do {
        idx = Math.floor(Math.random() * arr.length);
        attempts++;
    } while (idx === last && attempts < 10);

    _lastIndexMap[key] = idx;

    return arr[idx];
}

function getPersonalityResponse(text) {

    switch(currentPersonality) {

        case "teacher":
            return "Let's learn together. " + text;

        case "professional":
            return "Certainly. " + text;

        case "motivator":
            return text + " Keep moving forward.";

        default:
            return text;
    }
}

function calculate(expression) {

    try {

        expression = expression.replace(/[^0-9+\-*/().]/g, "");

        const result = eval(expression);

        return `Result: ${result}`;

    } catch {

        return "Unable to calculate that expression.";
    }
}

function processMessage(message) {

    const msg = message.toLowerCase().trim();

    if (
        msg.startsWith("my name is ")
    ) {

        userName = message.substring(11);

        localStorage.setItem(
            "userName",
            userName
        );

        botReply(
            getPersonalityResponse(
                `Nice to meet you, ${userName}!`
            )
        );

        return;
    }

    if (
        msg === "who am i"
    ) {

        if(userName){

            botReply(
                getPersonalityResponse(
                    `You are ${userName}.`
                )
            );

        }else{

            botReply(
                "I don't know your name yet. Tell me using: My name is ..."
            );
        }

        return;
    }

    if (
        msg.includes("hello") ||
        msg.includes("hi") ||
        msg.includes("hey")
    ) {

        const nameText = userName
            ? ` ${userName}`
            : "";

        botReply(
            getPersonalityResponse(
                `Hello${nameText}! How can I help you today?`
            )
        );

        return;
    }

    if (
        msg.includes("how are you")
    ) {

        botReply(
            getPersonalityResponse(
                "I'm doing great and ready to help."
            )
        );

        return;
    }

    if (
        msg.includes("time")
    ) {

        botReply(
            `Current Time: ${new Date().toLocaleTimeString()}`
        );

        return;
    }

    if (
        msg.includes("date")
    ) {

        botReply(
            `Today's Date: ${new Date().toLocaleDateString()}`
        );

        return;
    }

    if (
        msg === "fact"
    ) {

        botReply(
            randomItemUnique(facts, 'facts')
        );

        return;
    }

    if (
        msg === "quote"
    ) {

        botReply(
            randomItemUnique(quotes, 'quotes')
        );

        return;
    }

    if (
        msg === "joke"
    ) {

        botReply(
            randomItemUnique(jokes, 'jokes')
        );

        return;
    }

    if (
        msg.startsWith("remember ")
    ) {

        const note = message.substring(9);

        notes.push(note);

        localStorage.setItem(
            "notes",
            JSON.stringify(notes)
        );

        botReply(
            "Note saved successfully."
        );

        return;
    }

    if (
        msg === "show notes"
    ) {

        if(notes.length === 0){

            botReply(
                "No notes found."
            );

        }else{

            botReply(
                notes
                .map((n,i)=>`${i+1}. ${n}`)
                .join("<br>")
            );
        }

        return;
    }

    if (
        msg.startsWith("add task ")
    ) {

        const task = message.substring(9);

        tasks.push(task);

        localStorage.setItem(
            "tasks",
            JSON.stringify(tasks)
        );

        botReply(
            "Task added successfully."
        );

        return;
    }

    if (
        msg === "show tasks"
    ) {

        if(tasks.length === 0){

            botReply(
                "No tasks available."
            );

        }else{

            botReply(
                tasks
                .map((t,i)=>`${i+1}. ${t}`)
                .join("<br>")
            );
        }

        return;
    }

    if (
        /^[0-9+\-*/(). ]+$/.test(msg)
    ) {

        botReply(
            calculate(msg)
        );

        return;
    }

    if (
        msg.includes("html")
    ) {

        botReply(
            "HTML is used to structure web pages."
        );

        return;
    }

    if (
        msg.includes("css")
    ) {

        botReply(
            "CSS is used to style web pages."
        );

        return;
    }

    if (
        msg.includes("javascript")
    ) {

        botReply(
            "JavaScript adds interactivity to websites."
        );

        return;
    }

    if (
        msg.includes("python")
    ) {

        botReply(
            "Python is a popular programming language used in AI, web development and automation."
        );

        return;
    }

    if (
        msg.includes("help")
    ) {

        botReply(`
Commands Available:<br><br>
Fact<br>
Quote<br>
Joke<br>
Time<br>
Date<br>
My name is ...<br>
Who am I<br>
Remember ...<br>
Show Notes<br>
Add Task ...<br>
Show Tasks<br>
2+2<br>
HTML<br>
CSS<br>
JavaScript<br>
Python
        `);

        return;
    }

    botReply(
        getPersonalityResponse(
            "Sorry, I don't understand that yet. Type Help to see available commands."
        )
    );
}
const quickButtons = document.querySelectorAll(".quick-btn");

quickButtons.forEach(button => {

    button.addEventListener("click", () => {

        const text = button.textContent.trim();

        createMessage(text, "user");

        processMessage(text);
    });
});

exportBtn.addEventListener("click", () => {

    const messages = document.querySelectorAll(".message");

    let content = "";

    messages.forEach(msg => {

        const sender = msg.classList.contains("user")
            ? "User"
            : "Bot";

        const textElement = msg.querySelector(".text");

        if(textElement){

            let text = textElement.innerText;

            content += `${sender}: ${text}\n\n`;
        }
    });

    const blob = new Blob(
        [content],
        { type: "text/plain" }
    );

    const link = document.createElement("a");

    link.href = URL.createObjectURL(blob);

    link.download = "SmartBot_Chat.txt";

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    botReply("Chat exported successfully.");
});

if (
    "webkitSpeechRecognition" in window ||
    "SpeechRecognition" in window
) {

    const SpeechRecognition =
        window.SpeechRecognition ||
        window.webkitSpeechRecognition;

    const recognition =
        new SpeechRecognition();

    recognition.continuous = false;

    recognition.lang = "en-US";

    recognition.interimResults = false;

    micBtn.addEventListener("click", () => {

        recognition.start();

        micBtn.innerHTML =
            '<i class="fa-solid fa-microphone-lines"></i>';
    });

    recognition.onresult = event => {

        const transcript =
            event.results[0][0].transcript;

        userInput.value = transcript;

        sendMessage();
    };

    recognition.onend = () => {

        micBtn.innerHTML =
            '<i class="fa-solid fa-microphone"></i>';
    };

} else {

    micBtn.style.display = "none";
}

window.addEventListener("load", () => {
    renderSessions();

    if(userName){
        setTimeout(() => {
            botReply(
                `Welcome back ${userName}!`
            );
        }, 1000);
    }
});

function autoResize() {

    userInput.style.height = "auto";

    userInput.style.height =
        userInput.scrollHeight + "px";
}

userInput.addEventListener(
    "input",
    autoResize
);

setInterval(() => {

    localStorage.setItem(
        "notes",
        JSON.stringify(notes)
    );

    localStorage.setItem(
        "tasks",
        JSON.stringify(tasks)
    );

}, 3000);

document.addEventListener(
    "keydown",
    e => {

        if (
            e.ctrlKey &&
            e.key.toLowerCase() === "l"
        ) {

            e.preventDefault();

            localStorage.removeItem(
                "chatSessions"
            );
            localStorage.removeItem(
                "currentSessionId"
            );

            location.reload();
        }
    }
);

updateStats();

scrollBottom();

console.log(
    "SmartBot Premium Loaded Successfully"
);
// initialize volume controls UI
createVolumeControls();