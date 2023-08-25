const users = [
    { username: "admin", password: "bakery23" },
    { username: "user1", password: "password1" },
    { username: "user2", password: "password2" },
    { username: "user3", password: "password3" },
    { username: "user4", password: "password4" },
    { username: "user5", password: "password5" },
    // Add more users here
];

let currentUser = null;
let storedMessages = JSON.parse(localStorage.getItem('storedMessages')) || [];
let selectedMessages = [];

function authenticate() {
    const usernameInput = document.getElementById("username").value;
    const passwordInput = document.getElementById("password").value;

    const user = users.find(u => u.username === usernameInput && u.password === passwordInput);

    if (user) {
        currentUser = user;
        displayChatroom();
    } else {
        alert("Invalid credentials. Please try again.");
    }
}

function displayChatroom() {
    document.getElementById("loginSection").style.display = "none";
    document.getElementById("chatroomSection").style.display = "block";

    const chatMessages = document.getElementById("chatMessages");
    chatMessages.innerHTML = ""; // Clear existing messages

    storedMessages.forEach((message, index) => {
        const messageElement = document.createElement("div");
        messageElement.className = `message ${currentUser.username === 'admin' ? 'admin-message' : 'user-message'} ${selectedMessages.includes(message) ? 'selected-message' : ''}`;
        messageElement.onclick = () => toggleMessageSelection(index);

        if (currentUser.username === 'admin') {
            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.checked = selectedMessages.includes(message);
            checkbox.addEventListener("change", () => toggleMessageSelection(index));
            messageElement.appendChild(checkbox);
        }

        const messageText = document.createElement("p");
        messageText.textContent = `${message.username}: ${message.message}`;
        messageElement.appendChild(messageText);

        chatMessages.appendChild(messageElement);
    });
}

function sendMessage() {
    const messageInput = document.getElementById("messageInput");
    const message = messageInput.value;
    const profilePictureInput = document.getElementById("profilePictureInput");
    const profilePicture = profilePictureInput.files[0];

    if (message.trim() !== "") {
        const newMessage = { username: currentUser.username, message, profilePicture };
        storedMessages.push(newMessage);

        document.getElementById("chatMessages").innerHTML += `
            <div class="${currentUser.username === 'admin' ? 'admin-message' : 'user-message'}">
                <img src="${getUserProfilePicture(currentUser)}" alt="${currentUser.username}" class="profile-picture">
                <p><strong>${currentUser.username}:</strong> ${message}</p>
            </div>
        `;

        saveMessageToServer(currentUser.username, message);
        saveMessagesToLocal();

        messageInput.value = "";
        profilePictureInput.value = null; // Clear the file input
    }
}

function getUserProfilePicture(user) {
    if (user.profilePicture) {
        return URL.createObjectURL(user.profilePicture);
    } else {
        return 'default-profile-picture.jpg'; // Replace with the path to the default profile picture
    }
}

function logOut() {
    currentUser = null;
    document.getElementById("chatroomSection").style.display = "none";
    document.getElementById("loginSection").style.display = "block";
}

const messagesEndpoint = 'http://localhost:3000/messages';

async function fetchStoredMessages() {
    try {
        const response = await fetch(messagesEndpoint);
        const messages = await response.json();
        return messages.concat(storedMessages);
    } catch (error) {
        console.error(error);
        return storedMessages;
    }
}

async function saveMessageToServer(username, message) {
    try {
        const response = await fetch(messagesEndpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, message })
        });

        if (!response.ok) {
            console.error('Error saving message to server');
        }
    } catch (error) {
        console.error(error);
    }
}

function toggleMessageSelection(messageIndex) {
    const message = storedMessages[messageIndex];
    const selectedIndex = selectedMessages.indexOf(message);

    if (selectedIndex === -1) {
        selectedMessages.push(message);
    } else {
        selectedMessages.splice(selectedIndex, 1);
    }

    displayChatroom(); // Refresh the chat display after selection
}

function deleteSelectedMessages() {
    if (currentUser.username === 'admin' && selectedMessages.length > 0) {
        storedMessages = storedMessages.filter(message => !selectedMessages.includes(message));
        saveMessagesToLocal();
        displayChatroom(); // Refresh the chat display after deletion
        selectedMessages = []; // Clear selected messages
    } else {
        alert("You do not have permission to delete messages or no messages selected.");
    }
}

function saveMessagesToLocal() {
    localStorage.setItem('storedMessages', JSON.stringify(storedMessages));
}

window.onload = function() {
    if (currentUser) {
        displayChatroom();
    }
};
