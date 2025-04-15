// Notes Management
let notes = [];
let profiles = {};
let currentProfileId = null;
const glitchUrl = 'https://zenith-winter-fibula.glitch.me'; // Ensure this is the correct URL


// Add this function to generate unique URLs for each profile
function generateProfileUrl(profileId) {
    // Get the base URL of your application
    const baseUrl = window.location.origin + window.location.pathname;
    // Create a URL with the profile ID
    return `${baseUrl}?profileId=${profileId}`;
}

function getProfileIdFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get('profileId') || 'default';
}

function getNotesKey() {
    return `notes-${getProfileIdFromURL()}`;
}

function toggleNotes() {
    const notesContent = document.getElementById('notes-content');
    const toggleButton = document.getElementById('toggle-notes');
    if (notesContent.style.display === 'none') {
        notesContent.style.display = 'block';
        toggleButton.textContent = 'Hide Notes';
    } else {
        notesContent.style.display = 'none';
        toggleButton.textContent = '📝 Notes';
    }
}

function loadNotes() {
    const savedNotes = localStorage.getItem(getNotesKey());
    if (savedNotes) {
        notes = JSON.parse(savedNotes);
        renderNotes();
    } else {
        notes = [];
    }
}

function saveNote() {
    const noteText = document.getElementById('new-note').value.trim();
    if (noteText) {
        const note = {
            id: Date.now(),
            text: noteText,
            timestamp: new Date().toLocaleString()
        };
        notes.push(note);
        localStorage.setItem(getNotesKey(), JSON.stringify(notes));
        document.getElementById('new-note').value = '';
        renderNotes();
    }
}

function deleteNote(id) {
    showModal("Delete this note?", {
        onConfirm: () => {
            notes = notes.filter(note => note.id !== id);
            localStorage.setItem(getNotesKey(), JSON.stringify(notes));
            renderNotes();
        }
    });    
}

function editNote(id) {
    const note = notes.find(n => n.id === id);
    if (note) {
        showModal("Edit note:", {
            prompt: true,
            defaultValue: note.text,
            onConfirm: (newText) => {
                if (newText && newText.trim()) {
                    note.text = newText.trim();
                    note.timestamp = new Date().toLocaleString() + ' (edited)';
                    localStorage.setItem(getNotesKey(), JSON.stringify(notes));
                    renderNotes();
                }
            }
        });        
    }
}

function renderNotes() {
    const notesList = document.getElementById('notes-list');
    if (!notesList) return;
    notesList.innerHTML = notes.map(note => `
        <div class="note-item">
            <p>${note.text}</p>
            <small>${note.timestamp}</small>
            <div class="note-actions">
                <button onclick="editNote(${note.id})" class="edit-btn">Edit</button>
                <button onclick="deleteNote(${note.id})" class="delete-person-btn">Delete</button>
            </div>
        </div>
    `).join('');
}



// Data management
class PersonProfile {
    constructor(id, name, relationship, imageUrl) {
        this.id = id;
        this.name = name;
        this.relationship = relationship;
        this.imageUrl = 'profileimg.png';
    }
}

// Update this function to load only the requested profile
function loadProfiles() {
    const savedProfiles = localStorage.getItem('profiles');
    const profileId = getProfileIdFromURL();
    
    if (savedProfiles) {
        const allProfiles = JSON.parse(savedProfiles);
        
        // If we have a specific profileId in the URL and it exists
        if (profileId !== 'default' && allProfiles[profileId]) {
            // Only load the requested profile
            profiles = {};
            profiles[profileId] = allProfiles[profileId];
            currentProfileId = profileId;
        } else {
            // Load all profiles (only for admin/setup mode)
            profiles = allProfiles;
        }
        
        // Only update navigation if we're in admin mode
        if (profileId === 'default') {
            updateNavigation();
        } else {
            // Hide navigation elements for single-profile mode
            hideNavigationElements();
        }
    }
}

// Add this function to hide navigation elements
function hideNavigationElements() {
    // Hide the breadcrumb navigation
    const breadcrumb = document.querySelector('.breadcrumb');
    if (breadcrumb) breadcrumb.style.display = 'none';
    
    // Hide the "Add Person" button if it exists
    const addPersonBtn = document.querySelector('.add-person-btn');
    if (addPersonBtn) addPersonBtn.style.display = 'none';
    
    // Hide the delete person button
    const deletePersonBtn = document.querySelector('.delete-person-btn');
    if (deletePersonBtn) deletePersonBtn.style.display = 'none';
}


// Save profiles to localStorage
function saveProfiles() {
    localStorage.setItem('profiles', JSON.stringify(profiles));
}

// Add new person
function addNewPerson() {
    showModal("Add a new memory?", {
        onConfirm: () => {
            const id = Date.now().toString();
            const newProfile = new PersonProfile(id, 'New Memory', 'Brief description of the image, person, or memory', 'profileimg.png');
            profiles[id] = newProfile;
            saveProfiles();
            updateNavigation();
            switchProfile(id);
        }
    });    
}

// Delete profile
function deletePerson() {
    showModal("Are you sure you want to remove this memory?", {
        onConfirm: () => {
            delete profiles[currentProfileId];
            saveProfiles();
            updateNavigation();
            switchProfile(Object.keys(profiles)[0]);
        }
    });    
}

// Switch profile
function switchProfile(id) {
    if (profiles[id]) {
        currentProfileId = id;
        updateUI(profiles[id]);
    }
    history.replaceState(null, '', `?imageId=${id}`);
}

// Update profile data
function updateUI(profile) {
    document.querySelector('.profile-image').src = profile.imageUrl || 'profileimg.png';
    document.querySelector('h2').textContent = profile.name;
    document.querySelector('h4').textContent = profile.relationship;
    document.querySelector('.nav-text').textContent = profile.name;
}

// Update navigation menu
function updateNavigation() {
    const breadcrumb = document.querySelector('.breadcrumb');
    breadcrumb.innerHTML = '';

    Object.values(profiles).forEach(profile => {
        const listItem = document.createElement('li');
        const anchor = document.createElement('a');
        anchor.href = `?imageId=${profile.id}`;
        anchor.textContent = profile.name;
        anchor.classList.add('nav-text');
        anchor.onclick = (event) => {
            event.preventDefault();
            switchProfile(profile.id);
            highlightActiveProfile(profile.id);
        };
        listItem.appendChild(anchor);
        breadcrumb.appendChild(listItem);
    });

    highlightActiveProfile(currentProfileId);
}

function highlightActiveProfile(id) {
    const navLinks = document.querySelectorAll('.breadcrumb a');
    navLinks.forEach(link => {
        if (link.href.includes(id)) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

// Navigation
function toggleMenu() {
    const menuItems = document.querySelector('.menu-items');
    menuItems.classList.toggle('active');
}

function initializeNavigation() {
    const navLinks = document.querySelectorAll('.breadcrumb a');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(event) {
            event.preventDefault();
            
            navLinks.forEach(l => l.classList.remove('active'));
            
            this.classList.add('active');
            
            const content = document.querySelector('.content-wrapper');
            content.style.opacity = '0';
            
            setTimeout(() => {
                content.style.opacity = '1';
            }, 300);
        });
    });
    
    document.querySelector('.menu-items').classList.remove('active');
}

// Edit stuff
function toggleEditImage() {
    const input = document.getElementById('imageInput');
    const saveButton = document.querySelector('button.save-btn');
    input.style.display = input.style.display === 'none' ? 'block' : 'none';
    saveButton.style.display = input.style.display === 'block' ? 'block' : 'none';;
    input.addEventListener('change', handleImageChange);
}

function handleImageChange(event) {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = function(event) {
            const profileImage = document.querySelector('.profile-image');
            profileImage.src = event.target.result;
            if (currentProfileId && profiles[currentProfileId]) {
                profiles[currentProfileId].imageUrl = event.target.result;
            }
        };
        reader.readAsDataURL(file);
        document.getElementById("imageSaveBtn").style.display = "block";
    } else {
        showModal("Please select a valid image file.");
    }
}

function saveImageChanges() {
    const input = document.getElementById('imageInput');
    saveProfiles();
    input.style.display = 'none';
    document.querySelector('button.save-btn').style.display = 'none';
}

function toggleEditName() {
    const input = document.getElementById('nameInput');
    const saveButton = document.querySelector('.name-section .save-btn');
    const currentName = document.querySelector('h2').textContent;
    input.style.display = input.style.display === 'none' ? 'block' : 'none';
    saveButton.style.display = input.style.display;
    if (input.style.display === 'block') {
        input.value = currentName;
    }
}

function saveNameChanges() {
    const input = document.getElementById('nameInput');
    const newName = input.value;
    if (currentProfileId && profiles[currentProfileId]) {
        profiles[currentProfileId].name = newName;
        document.querySelector('h2').textContent = newName;
        document.querySelector('.nav-text').textContent = newName;
        saveProfiles();
        updateNavigation();
        input.style.display = 'none';
        document.querySelector('.name-section .save-btn').style.display = 'none';
    }
}

function toggleEditRelationship() {
    const input = document.getElementById('relationshipInput');
    const saveButton = document.getElementById('relationshipSaveBtn');
    const currentRelation = document.querySelector('h4').textContent;
    input.style.display = input.style.display === 'none' ? 'block' : 'none';
    saveButton.style.display = input.style.display;
    if (input.style.display === 'block') {
        input.value = currentRelation;
    }
}

async function fetchIdeasFromAI(description) {
    console.log("Sending description to AI:", description);

    // Show loading indicator
    const section = document.querySelector('.conversation-section');
    section.innerHTML = "<h3>Getting conversation ideas...</h3><div class='loading-indicator'>Loading AI responses...</div>";

    try {
        const response = await fetch(`${glitchUrl}/api/generate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ description })
        });

        if (!response.ok) {
            console.error(`Error: ${response.status} - ${response.statusText}`); // Log detailed error
            throw new Error(`Server responded with ${response.status}`);
        }

        const data = await response.json();
        console.log("AI response:", data);

        if (!data || !data.content) {
            useFallbackIdeas(section, description);
            return;
        }
  // Try to parse the JSON content from the AI
  try {
    let ideas;
    if (typeof data.content === 'string') {
        ideas = JSON.parse(data.content);
    } else {
        ideas = data.content; // If it's already an object
    }
    populateIdeaButtons(ideas);
} catch (e) {
    console.error("Failed to parse AI output:", e);
    useFallbackIdeas(section, description);
}
} catch (error) {
console.error("Fetch error:", error);

// Use fallback ideas instead of showing an error
useFallbackIdeas(section, description);
}
}

// Add a fallback function to generate ideas when the API fails
function useFallbackIdeas(section, description) {
// Create some basic conversation starters based on the description
const fallbackIdeas = [
{
    title: "General Conversation",
    questions: [
        "What do you remember about this?",
        "How does this make you feel?",
        "Would you like to share any stories related to this?"
    ],
    activities: [
        "Look at the image together and describe what you see",
        "Share your own memories related to this topic"
    ]
},
{
    title: "Memory Exploration",
    questions: [
        "What was your favorite part about this?",
        "Who else was involved in this memory?",
        "What sounds or smells do you associate with this?"
    ],
    activities: [
        "Draw or write about this memory together",
        "Find related items or photos to enhance the discussion"
    ]
},
{
    title: "Emotional Connection",
    questions: [
        "How did this experience change you?",
        "What would you tell others about this?",
        "What similar experiences have you had?"
    ],
    activities: [
        "Create a simple timeline of related events",
        "Record a brief story about this memory"
    ]
}
];

// Use the fallback ideas instead
populateIdeaButtons(fallbackIdeas);
}

function saveRelationshipChanges() {
    const input = document.getElementById('relationshipInput');
    const description = input.value.trim();

    if (currentProfileId && profiles[currentProfileId]) {
        profiles[currentProfileId].relationship = description;
        document.querySelector('h4').textContent = description;
        saveProfiles();

        input.style.display = 'none';
        document.getElementById('relationshipSaveBtn').style.display = 'none';

       // Call AI for suggestions right after saving
       if (description && description.length > 5) {
        const loadingMsg = document.createElement('div');
        loadingMsg.id = 'ai-loading';
        loadingMsg.className = 'loading-indicator';
        loadingMsg.textContent = 'Getting AI suggestions...';
        document.querySelector('.conversation-section').appendChild(loadingMsg);
        
        fetchIdeasFromAI(description);
        }
    }
}

function populateIdeaButtons(ideas) {
    const section = document.querySelector('.conversation-section');
    section.innerHTML = "<h3>Conversation Ideas</h3><div class='ideas-container'></div>";

    const container = section.querySelector('.ideas-container');
    
    // Check if we have the expected data structure
    if (!ideas || !Array.isArray(ideas) || ideas.length === 0) {
        container.innerHTML = "<div class='error-message'>No conversation ideas available</div>";
        return;
    }

    ideas.forEach((idea) => {
        const button = document.createElement('button');
        button.className = 'topic-button';
        button.textContent = idea.title || "Conversation Topic";

        button.onclick = () => {
            let content = `<strong>${idea.title || "Conversation Topic"}</strong><br><br>`;
            
            if (idea.questions && idea.questions.length > 0) {
                content += "<strong>Conversation Starters:</strong><br>";
                idea.questions.forEach(q => {
                    content += `• ${q}<br>`;
                });
            }
            
            if (idea.activities && idea.activities.length > 0) {
                content += "<br><strong>Activities:</strong><br>";
                idea.activities.forEach(a => {
                    content += `• ${a}<br>`;
                });
            }
            
            showModal(content, { htmlContent: true });
        };

        container.appendChild(button);
    });
}

function displayIdeas(text) {
    const section = document.querySelector('.conversation-section');
    section.innerHTML = "<h3>Ideas</h3><div class='ideas-container'></div>";

    const ideasContainer = section.querySelector('.ideas-container');
    const lines = text.split('\n').filter(l => l.trim());

    lines.forEach((line, i) => {
        const button = document.createElement('button');
        button.className = 'idea-button';
        button.textContent = line.replace(/^[-*•\d.]+/, '').trim();
        button.onclick = () => showModal(line);
        ideasContainer.appendChild(button);
    });
}

function showTopic(topic) {
    const topics = {
        family: [
            "Who's your favorite family member?",
            "Tell me about your children.",
            "What did you do with your family on holidays?"
        ],
        food: [
            "What's your favorite dessert?",
            "Did you cook when you were younger?",
            "What foods remind you of home?"
        ],
        hobbies: [
            "Have you traveled to any exciting places?",
            "What was your favorite vacation?",
            "Where would you like to visit again?"
        ]
    };

    const questions = topics[topic];
    if (!questions) return;

    showModal(`Conversation Topic: ${topic.charAt(0).toUpperCase() + topic.slice(1)}\n\nQuestions:\n${questions.join('\n')}`);
}

function showModal(message, options = {}) {
    const modal = document.getElementById("customModal");
    const modalMessage = document.getElementById("modalMessage");
    const modalInput = document.getElementById("modalInput");
    const confirmBtn = document.getElementById("modalConfirm");
    const cancelBtn = document.getElementById("modalCancel");
    const closeModal = document.getElementById("closeModal");

    if (options.htmlContent) {
        modalMessage.innerHTML = message;
    } else {
        modalMessage.textContent = message;
    }
    
    modalInput.style.display = options.prompt ? 'block' : 'none';
    modalInput.value = options.defaultValue || '';

    modal.style.display = "flex";

    confirmBtn.onclick = () => {
        modal.style.display = "none";
        if (options.onConfirm) {
            const val = options.prompt ? modalInput.value : true;
            options.onConfirm(val);
        }
    };

    cancelBtn.onclick = closeModal.onclick = () => {
        modal.style.display = "none";
        if (options.onCancel) options.onCancel();
    };
}

// Initialize application when DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
    loadProfiles();
    initializeNavigation();
    loadNotes();
    
    if (Object.keys(profiles).length === 0) {
        addNewPerson();
    }
    
    // Get the current imageId from URL
    const urlParams = new URLSearchParams(window.location.search);
    const imageId = urlParams.get('imageId');
    
    // If imageId exists, switch to that profile
    if (imageId && profiles[imageId]) {
        switchProfile(imageId);
    } else if (Object.keys(profiles).length > 0) {
        // Otherwise switch to the first profile
        switchProfile(Object.keys(profiles)[0]);
    }
});

async function testGlitchConnection() {
    try {
        // First try a simple GET request to the base URL
        const response = await fetch(glitchUrl, { 
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            console.log("Connected to Glitch successfully!");
            return true;
        } else {
            console.error("Failed to connect to Glitch:", response.status);
            return false;
        }
    } catch (error) {
        console.error("Error connecting to Glitch:", error);
        return false;
    }
}

// Call this when your app initializes
document.addEventListener('DOMContentLoaded', function() {
    // Your existing initialization code

    // Test the Glitch connection
    testGlitchConnection().then(connected => {
        if (connected) {
            console.log("Glitch server is available");
        } else {
            console.log("Glitch server is not available");
        }
    });
});

function generateConversationIdeas() {
    const description = document.querySelector('h4').textContent.trim();
    
    if (description && description.length > 5) {
        const section = document.querySelector('.conversation-section');
        section.innerHTML = "<h3>Getting conversation ideas...</h3><div class='loading-indicator'>Loading AI responses...</div>";
        
        fetchIdeasFromAI(description);
    } else {
        showModal("Please add a more detailed description first (at least 5 characters).");
    }
}