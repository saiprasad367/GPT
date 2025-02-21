document.addEventListener("DOMContentLoaded", () => {
    const chatBox = document.getElementById("chat-box");
    const userInput = document.getElementById("user-input");
    const sendBtn = document.getElementById("send-btn");
    const cursor = document.querySelector(".cursor");
    const cursorBall = document.querySelector(".cursor-ball");

    if (!chatBox || !userInput || !sendBtn || !cursor || !cursorBall) {
        console.error("One or more DOM elements not found:");
        console.error("chatBox:", chatBox);
        console.error("userInput:", userInput);
        console.error("sendBtn:", sendBtn);
        console.error("cursor:", cursor);
        console.error("cursorBall:", cursorBall);
        return;
    }

    const cursorSizeRaw = getComputedStyle(document.documentElement).getPropertyValue('--cursor-size').trim();
    const cursorSize = parseInt(cursorSizeRaw, 10) || 30;

    // Cursor movement and color change
    document.addEventListener("mousemove", (e) => {
        try {
            cursor.style.transform = `translate(${e.clientX - cursorSize / 2}px, ${e.clientY - cursorSize / 2}px)`;
            const elementUnderCursor = document.elementFromPoint(e.clientX, e.clientY);
            if (elementUnderCursor) {
                const bgColor = window.getComputedStyle(elementUnderCursor).backgroundColor;
                const rgb = bgColor.match(/\d+/g);
                if (rgb) {
                    const brightness = (parseInt(rgb[0]) * 299 + parseInt(rgb[1]) * 587 + parseInt(rgb[2]) * 114) / 1000;
                    if (brightness > 128) {
                        cursorBall.classList.remove("black-bg");
                        cursorBall.classList.add("white-bg");
                    } else {
                        cursorBall.classList.remove("white-bg");
                        cursorBall.classList.add("black-bg");
                    }
                }
            }
        } catch (err) {
            console.error("Cursor transform or color error:", err);
        }
    });

    try {
        sendBtn.addEventListener("click", sendMessage);
        userInput.addEventListener("keypress", (e) => {
            if (e.key === "Enter") {
                sendMessage();
            }
        });
    } catch (err) {
        console.error("Event listener error:", err);
    }

    async function sendMessage() {
        const message = userInput.value.trim();
        if (!message) return;

        try {
            addMessage("user-message", message, false);
            userInput.value = "";
            userInput.focus();
            sendBtn.disabled = true;

            const response = await fetch("/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            let data;
            try {
                data = await response.json();
            } catch (jsonErr) {
                throw new Error("Invalid JSON response");
            }

            setTimeout(() => {
                const reply = data.reply || "No response from server";
                addMessage("bot-message", reply, true);
            }, 500);
        } catch (error) {
            addMessage("bot-message", "⚠️ Error: Unable to process your request.", false);
            console.error("Chatbot Error:", error);
        } finally {
            sendBtn.disabled = false;
        }
    }

    function addMessage(className, text, withTyping = false) {
        try {
            const messageDiv = document.createElement("div");
            messageDiv.className = `${className} animate__animated animate__slideInUp`;
            chatBox.appendChild(messageDiv);

            if (withTyping) {
                messageDiv.innerText = "";
                let index = 0;
                const typingSpeed = 30;
                function type() {
                    if (index < text.length) {
                        messageDiv.innerText += text.charAt(index);
                        index++;
                        scrollToBottom();
                        setTimeout(type, typingSpeed);
                    } else {
                        scrollToBottom();
                    }
                }
                type();
            } else {
                messageDiv.innerText = text;
                scrollToBottom();
            }

            if (window.anime) {
                window.anime({
                    targets: messageDiv,
                    translateY: [20, 0],
                    opacity: [0, 1],
                    easing: "easeOutExpo",
                    duration: 600,
                    complete: scrollToBottom
                });
            } else {
                console.warn("Anime.js not loaded; skipping animation.");
                scrollToBottom();
            }
        } catch (err) {
            console.error("addMessage error:", err);
        }
    }

    function scrollToBottom() {
        requestAnimationFrame(() => {
            chatBox.scrollTop = chatBox.scrollHeight;
            setTimeout(() => {
                if (chatBox.scrollTop + chatBox.clientHeight < chatBox.scrollHeight) {
                    chatBox.scrollTop = chatBox.scrollHeight;
                }
            }, 100);
        });
    }
});