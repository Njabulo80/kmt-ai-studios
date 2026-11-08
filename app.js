
/* =========================================
   KMT AI STUDIOS
   APPLICATION ENGINE
   Founder: Njabulo Mbhodziya Dlamini
========================================= */

"use strict";

/* =========================================
   1. APPLICATION SETTINGS
========================================= */

const DB_NAME = "KMTAvatarDatabase";
const DB_VERSION = 1;
const STORE_NAME = "avatars";

let database = null;
let currentAvatarURL = null;
let editingAvatarId = null;


/* =========================================
   2. DATABASE CONNECTION
========================================= */

function openAvatarDatabase() {

  return new Promise((resolve, reject) => {

    if (!("indexedDB" in window)) {
      reject(new Error("Browser storage is unavailable."));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = event => {

      const db = event.target.result;

      if (!db.objectStoreNames.contains(STORE_NAME)) {

        const store = db.createObjectStore(STORE_NAME, {
          keyPath: "id",
          autoIncrement: true
        });

        store.createIndex("name", "name", {
          unique: false
        });

      }

    };

    request.onsuccess = event => {
      database = event.target.result;
      resolve(database);
    };

    request.onerror = () => {
      reject(request.error);
    };

  });

}


/* =========================================
   3. DATABASE OPERATIONS
========================================= */

function saveAvatarToDatabase(avatar) {

  return new Promise((resolve, reject) => {

    const transaction = database.transaction(
      STORE_NAME,
      "readwrite"
    );

    const store = transaction.objectStore(STORE_NAME);

    const request = avatar.id
      ? store.put(avatar)
      : store.add(avatar);

    request.onsuccess = () => resolve(request.result);

    request.onerror = () => reject(request.error);

  });

}


function getAllAvatars() {

  return new Promise((resolve, reject) => {

    const transaction = database.transaction(
      STORE_NAME,
      "readonly"
    );

    const request = transaction
      .objectStore(STORE_NAME)
      .getAll();

    request.onsuccess = () => resolve(request.result);

    request.onerror = () => reject(request.error);

  });

}


function deleteAvatarFromDatabase(id) {

  return new Promise((resolve, reject) => {

    const transaction = database.transaction(
      STORE_NAME,
      "readwrite"
    );

    const request = transaction
      .objectStore(STORE_NAME)
      .delete(Number(id));

    request.onsuccess = () => resolve();

    request.onerror = () => reject(request.error);

  });

}


/* =========================================
   4. NOTIFICATIONS
========================================= */

let notificationTimeout;

function showNotification(message) {

  const notification = document.getElementById("notification");

  if (!notification) {
    alert(message);
    return;
  }

  notification.textContent = message;
  notification.classList.add("show");

  clearTimeout(notificationTimeout);

  notificationTimeout = setTimeout(() => {
    notification.classList.remove("show");
  }, 3500);

}


/* =========================================
   5. MOBILE NAVIGATION
========================================= */

const menuBtn = document.getElementById("menuBtn");
const navigation = document.getElementById("navigation");

if (menuBtn && navigation) {

  menuBtn.addEventListener("click", () => {

    const isOpen = navigation.classList.toggle("active");

    menuBtn.setAttribute("aria-expanded", String(isOpen));

    menuBtn.setAttribute(
      "aria-label",
      isOpen ? "Close navigation menu" : "Open navigation menu"
    );

  });

  navigation.querySelectorAll("a").forEach(link => {

    link.addEventListener("click", () => {

      navigation.classList.remove("active");

      menuBtn.setAttribute("aria-expanded", "false");

      menuBtn.setAttribute(
        "aria-label",
        "Open navigation menu"
      );

    });

  });

}


/* =========================================
   6. COPYRIGHT YEAR
========================================= */

const yearElement = document.getElementById("currentYear");

if (yearElement) {
  yearElement.textContent = new Date().getFullYear();
}


/* =========================================
   7. IMAGE PREVIEW
========================================= */

function clearAvatarPreview() {

  if (currentAvatarURL) {

    URL.revokeObjectURL(currentAvatarURL);

    currentAvatarURL = null;

  }

}


function displayAvatarPreview(file) {

  const preview = document.getElementById("avatarPreview");

  if (!preview || !file) return;

  clearAvatarPreview();

  currentAvatarURL = URL.createObjectURL(file);

  preview.replaceChildren();

  const image = document.createElement("img");

  image.src = currentAvatarURL;
  image.alt = "Avatar photograph preview";

  const filename = document.createElement("p");

  filename.textContent = file.name;

  preview.append(image, filename);

}


/* =========================================
   8. AVATAR CREATION WORKSPACE
========================================= */

function openStudio(type) {

  const workspace = document.getElementById("workspace");

  if (!workspace) return;

  clearAvatarPreview();

  editingAvatarId = null;

  workspace.scrollIntoView({
    behavior: "smooth",
    block: "center"
  });


  if (type === "avatar") {

    workspace.innerHTML = `

      <h3>CREATE YOUR AI AVATAR</h3>

      <p>
        Build your digital identity inside KMT Studios.
      </p>

      <form id="avatarForm" class="avatar-form">

        <label for="avatarName">
          Avatar name
        </label>

        <input
          id="avatarName"
          type="text"
          placeholder="e.g. My Professional Avatar"
          maxlength="60"
          required
        >

        <label for="avatarDescription">
          Description
        </label>

        <textarea
          id="avatarDescription"
          rows="3"
          maxlength="500"
          placeholder="Describe your digital identity..."
        ></textarea>

        <label for="avatarUpload">
          Upload photograph
        </label>

        <input
          id="avatarUpload"
          type="file"
          accept="image/jpeg,image/png,image/webp"
        >

        <div id="avatarPreview"></div>

        <label for="avatarPresentation">
          Presentation style
        </label>

        <select id="avatarPresentation">

          <option value="Professional">
            Professional
          </option>

          <option value="Casual">
            Casual
          </option>

          <option value="Educational">
            Educational
          </option>

          <option value="Energetic">
            Energetic
          </option>

          <option value="Corporate">
            Corporate
          </option>

        </select>

        <label for="avatarVoice">
          Preferred voice
        </label>

        <select id="avatarVoice">

          <option value="Natural male voice">
            Natural male voice
          </option>

          <option value="Natural female voice">
            Natural female voice
          </option>

          <option value="Professional narration">
            Professional narration
          </option>

          <option value="Energetic presentation">
            Energetic presentation
          </option>

        </select>

        <button type="submit" id="saveAvatarBtn">
          Save avatar
        </button>

        <p class="status" id="avatarStatus">
          Your avatar profile is ready to be configured.
        </p>

      </form>

      <div class="avatar-library">

        <h3>MY AVATAR LIBRARY</h3>

        <p>
          Your saved digital identities will appear here.
        </p>

        <div id="avatarLibraryList">
          Loading your avatars...
        </div>

      </div>

    `;


    const upload = document.getElementById("avatarUpload");

    upload.addEventListener("change", event => {

      const file = event.target.files[0];

      if (!file) return;

      const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/webp"
      ];

      if (!allowedTypes.includes(file.type)) {

        showNotification(
          "Please upload a JPG, PNG or WebP photograph."
        );

        upload.value = "";
        return;

      }

      if (file.size > 10 * 1024 * 1024) {

        showNotification(
          "Your photograph must be smaller than 10MB."
        );

        upload.value = "";
        return;

      }

      displayAvatarPreview(file);

    });


    const form = document.getElementById("avatarForm");

    form.addEventListener("submit", saveAvatar);

    loadAvatarLibrary();

  }


  /* =====================================
     VIDEO STUDIO
  ===================================== */

  else if (type === "video") {

    workspace.innerHTML = `

      <h3>KMT VIDEO STUDIO</h3>

      <p>
        Prepare the script for your AI-generated video.
      </p>

      <label for="videoScript">
        Your video script
      </label>

      <textarea
        id="videoScript"
        placeholder="Write what your AI avatar should say..."
        rows="6"
      ></textarea>

      <label for="videoLanguage">
        Select language
      </label>

      <select id="videoLanguage">

        <option>English</option>
        <option>isiZulu</option>
        <option>siSwati</option>
        <option>Portuguese</option>
        <option>French</option>

      </select>

      <button type="button" id="prepareVideoBtn">
        Prepare video
      </button>

      <p id="videoStatus" class="status">
        Your creative workspace is ready.
      </p>

    `;

    document
      .getElementById("prepareVideoBtn")
      .addEventListener("click", prepareVideo);

  }


  /* =====================================
     VOICE STUDIO
  ===================================== */

  else if (type === "voice") {

    workspace.innerHTML = `

      <h3>KMT VOICE STUDIO</h3>

      <p>
        Explore the voice selection workspace.
      </p>

      <label for="voiceType">
        Choose a voice style
      </label>

      <select id="voiceType">

        <option>Natural male voice</option>
        <option>Natural female voice</option>
        <option>Professional narration</option>
        <option>Energetic presentation</option>

      </select>

      <p class="status">
        Voice preferences can be selected here.
        Real AI speech generation will require a connected voice engine.
      </p>

    `;

  }

  else {

    workspace.textContent = "Studio section not found.";

  }

}


/* =========================================
   9. SAVE AVATAR
========================================= */

async function saveAvatar(event) {

  event.preventDefault();

  const name = document.getElementById("avatarName").value.trim();

  const description = document
    .getElementById("avatarDescription").value.trim();

  const upload = document.getElementById("avatarUpload");

  const presentation = document
    .getElementById("avatarPresentation").value;

  const voice = document
    .getElementById("avatarVoice").value;

  const status = document.getElementById("avatarStatus");

  const file = upload.files[0];

  if (!name) {

    status.textContent = "Please enter an avatar name.";
    return;

  }

  if (!editingAvatarId && !file) {

    status.textContent =
      "Please upload a photograph for your avatar.";

    return;

  }

  try {

    const existing = editingAvatarId
      ? (await getAllAvatars()).find(
          avatar => avatar.id === editingAvatarId
        )
      : null;

    const avatar = {

      name: name,

      description: description,

      presentation: presentation,

      voice: voice,

      image: file || existing?.image || null,

      updatedAt: new Date().toISOString(),

      createdAt: existing?.createdAt || new Date().toISOString()

    };

    if (editingAvatarId) {
      avatar.id = editingAvatarId;
    }

    await saveAvatarToDatabase(avatar);

    status.textContent = "Your avatar profile has been saved.";

    showNotification("Avatar saved successfully!");

    editingAvatarId = null;

    document.getElementById("avatarForm").reset();

    clearAvatarPreview();

    document.getElementById("avatarPreview").replaceChildren();

    await loadAvatarLibrary();

  }

  catch (error) {

    console.error(error);

    status.textContent =
      "Could not save your avatar. Check your browser storage.";

  }

}


/* =========================================
   10. LOAD AVATAR LIBRARY
========================================= */

async function loadAvatarLibrary() {

  const container = document.getElementById("avatarLibraryList");

  if (!container) return;

  try {

    const avatars = await getAllAvatars();

    container.replaceChildren();

    if (avatars.length === 0) {

      const empty = document.createElement("p");

      empty.textContent = "You haven't saved any avatars yet.";

      container.appendChild(empty);

      return;

    }

    avatars.forEach(avatar => {

      const card = document.createElement("article");

      card.className = "avatar-library-card";

      const image = document.createElement("img");

      image.alt = avatar.name;

      image.style.width = "100px";
      image.style.height = "100px";
      image.style.objectFit = "cover";
      image.style.borderRadius = "10px";
      image.style.border = "1px solid #d6ad55";

      if (avatar.image) {

        const imageURL = URL.createObjectURL(avatar.image);

        image.src = imageURL;

        image.addEventListener("load", () => {
          URL.revokeObjectURL(imageURL);
        }, { once: true });

      }

      const heading = document.createElement("h4");

      heading.textContent = avatar.name;

      const details = document.createElement("p");

      details.textContent =
        avatar.presentation + " | " + avatar.voice;

      const description = document.createElement("p");

      description.textContent = avatar.description || "No description provided.";

      const editButton = document.createElement("button");

      editButton.type = "button";
      editButton.textContent = "Edit";
      editButton.addEventListener("click", () => {
        editAvatar(avatar.id);
      });

      const deleteButton = document.createElement("button");

      deleteButton.type = "button";
      deleteButton.textContent = "Delete";
      deleteButton.className = "delete-avatar-button";

      deleteButton.addEventListener("click", () => {
        deleteAvatar(avatar.id);
      });

      card.append(
        image,
        heading,
        details,
        description,
        editButton,
        deleteButton
      );

      container.appendChild(card);

    });

  }

  catch (error) {

    console.error(error);

    container.textContent =
      "Unable to load your avatar library.";

  }

}


/* =========================================
   11. EDIT AVATAR
========================================= */

async function editAvatar(id) {

  try {

    const avatars = await getAllAvatars();

    const avatar = avatars.find(item => item.id === id);

    if (!avatar) return;

    editingAvatarId = avatar.id;

    document.getElementById("avatarName").value = avatar.name;

    document.getElementById("avatarDescription").value =
      avatar.description || "";

    document.getElementById("avatarPresentation").value =
      avatar.presentation;

    document.getElementById("avatarVoice").value = avatar.voice;

    clearAvatarPreview();

    const preview = document.getElementById("avatarPreview");

    preview.replaceChildren();

    if (avatar.image) {

      currentAvatarURL = URL.createObjectURL(avatar.image);

      const image = document.createElement("img");

      image.src = currentAvatarURL;
      image.alt = "Saved avatar photograph";

      preview.appendChild(image);

    }

    document.getElementById("avatarStatus").textContent =
      "Editing " + avatar.name + ". Select a new photograph only if you want to replace the existing one.";

    document.getElementById("saveAvatarBtn").textContent =
      "Update avatar";

    document.getElementById("avatarForm").scrollIntoView({
      behavior: "smooth",
      block: "center"
    });

  }

  catch (error) {

    console.error(error);

    showNotification("Unable to open this avatar.");

  }

}


/* =========================================
   12. DELETE AVATAR
========================================= */

async function deleteAvatar(id) {

  const confirmed = confirm(
    "Are you sure you want to delete this avatar?"
  );

  if (!confirmed) return;

  try {

    await deleteAvatarFromDatabase(id);

    showNotification("Avatar deleted successfully.");

    await loadAvatarLibrary();

  }

  catch (error) {

    console.error(error);

    showNotification("Unable to delete this avatar.");

  }

}


/* =========================================
   13. PREPARE VIDEO SCRIPT
========================================= */

function prepareVideo() {

  const script = document.getElementById("videoScript");

  const language = document.getElementById("videoLanguage");

  const status = document.getElementById("videoStatus");

  if (!script || !language || !status) return;

  const content = script.value.trim();

  if (!content) {

    status.textContent =
      "Please enter your video script first.";

    return;

  }

  if (content.length < 10) {

    status.textContent =
      "Your script is too short. Please add more content.";

    return;

  }

  if (content.length > 10000) {

    status.textContent =
      "Your script must be below 10,000 characters.";

    return;

  }

  status.textContent =
    "Script prepared successfully. Language: " +
    language.value +
    ". An AI video engine must be connected to generate the actual video.";

}


/* =========================================
   14. APPLICATION INITIALIZATION
========================================= */

async function initializeKMT() {

  try {

    await openAvatarDatabase();

    console.log("KMT avatar database connected.");

  }

  catch (error) {

    console.error("KMT database error:", error);

    showNotification(
      "Avatar storage could not be initialized on this browser."
    );

  }

}

initializeKMT();


/* =========================================
   15. PROGRESSIVE WEB APP
========================================= */

if ("serviceWorker" in navigator) {

  window.addEventListener("load", () => {

    navigator.serviceWorker.register("./service-worker.js")

      .then(() => {

        console.log("KMT PWA registered successfully.");

      })

      .catch(error => {

        console.error("PWA registration failed:", error);

      });

  });

}


/* =========================================
   16. APPLICATION READY
========================================= */

console.log("KMT AI Studios application engine loaded.");

console.log("Founder: Njabulo Mbhodziya Dlamini");
