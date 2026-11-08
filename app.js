
/* =====================================
   KMT AI STUDIOS
   APPLICATION ENGINE
   Founder: Njabulo Mbhodziya Dlamini
===================================== */


/* =====================================
   1. APPLICATION SETTINGS
===================================== */

const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
const DATABASE_NAME = "KMT_AI_STUDIOS";
const DATABASE_VERSION = 1;
const STORE_NAME = "avatars";

let currentAvatarURL = null;
let selectedAvatarFile = null;


/* =====================================
   2. MOBILE NAVIGATION
===================================== */

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

      menuBtn.setAttribute("aria-label", "Open navigation menu");

    });

  });

}


/* =====================================
   3. COPYRIGHT YEAR
===================================== */

const yearElement = document.getElementById("currentYear");

if (yearElement) {
  yearElement.textContent = new Date().getFullYear();
}


/* =====================================
   4. DATABASE CONNECTION
===================================== */

function openAvatarDatabase() {

  return new Promise((resolve, reject) => {

    if (!("indexedDB" in window)) {
      reject(new Error("Browser storage is unavailable."));
      return;
    }

    const request = indexedDB.open(
      DATABASE_NAME,
      DATABASE_VERSION
    );

    request.onupgradeneeded = event => {

      const database = event.target.result;

      if (!database.objectStoreNames.contains(STORE_NAME)) {

        database.createObjectStore(STORE_NAME, {
          keyPath: "id"
        });

      }

    };

    request.onsuccess = () => resolve(request.result);

    request.onerror = () => reject(request.error);

  });

}


/* =====================================
   5. DATABASE OPERATIONS
===================================== */

async function saveAvatarRecord(avatar) {

  const database = await openAvatarDatabase();

  return new Promise((resolve, reject) => {

    const transaction = database.transaction(
      STORE_NAME,
      "readwrite"
    );

    transaction.objectStore(STORE_NAME).put(avatar);

    transaction.oncomplete = () => {
      database.close();
      resolve(true);
    };

    transaction.onerror = () => {
      database.close();
      reject(transaction.error);
    };

    transaction.onabort = () => {
      database.close();
      reject(transaction.error || new Error("Save cancelled."));
    };

  });

}


async function getAllAvatars() {

  const database = await openAvatarDatabase();

  return new Promise((resolve, reject) => {

    const transaction = database.transaction(
      STORE_NAME,
      "readonly"
    );

    const request = transaction.objectStore(STORE_NAME).getAll();

    request.onsuccess = () => resolve(request.result || []);

    request.onerror = () => reject(request.error);

    transaction.oncomplete = () => database.close();

    transaction.onerror = () => database.close();

  });

}


async function getAvatarById(id) {

  const database = await openAvatarDatabase();

  return new Promise((resolve, reject) => {

    const transaction = database.transaction(
      STORE_NAME,
      "readonly"
    );

    const request = transaction.objectStore(STORE_NAME).get(id);

    request.onsuccess = () => resolve(request.result || null);

    request.onerror = () => reject(request.error);

    transaction.oncomplete = () => database.close();

    transaction.onerror = () => database.close();

  });

}


async function deleteAvatarRecord(id) {

  const database = await openAvatarDatabase();

  return new Promise((resolve, reject) => {

    const transaction = database.transaction(
      STORE_NAME,
      "readwrite"
    );

    transaction.objectStore(STORE_NAME).delete(id);

    transaction.oncomplete = () => {
      database.close();
      resolve(true);
    };

    transaction.onerror = () => {
      database.close();
      reject(transaction.error);
    };

  });

}


/* =====================================
   6. IMAGE PREVIEW MANAGEMENT
===================================== */

function clearAvatarPreview() {

  if (currentAvatarURL) {

    URL.revokeObjectURL(currentAvatarURL);

    currentAvatarURL = null;

  }

}


function showAvatarPreview(file) {

  const preview = document.getElementById("avatarPreview");

  if (!preview) return;

  clearAvatarPreview();

  currentAvatarURL = URL.createObjectURL(file);

  const image = document.createElement("img");

  image.src = currentAvatarURL;

  image.alt = "Avatar photograph preview";

  const fileName = document.createElement("p");

  fileName.textContent = file.name;

  preview.replaceChildren(image, fileName);

}


/* =====================================
   7. AVATAR STUDIO
===================================== */

async function openAvatarStudio(workspace) {

  selectedAvatarFile = null;

  workspace.innerHTML = `

    <h3>KMT AI AVATAR CREATOR</h3>

    <p>
      Create an identity for your digital avatar.
    </p>

    <div class="avatar-form">

      <label for="avatarName">
        Avatar name
      </label>

      <input
        type="text"
        id="avatarName"
        placeholder="Example: Njabulo Professional"
        maxlength="60"
      >

      <label for="avatarDescription">
        Avatar description
      </label>

      <textarea
        id="avatarDescription"
        placeholder="Describe your avatar..."
        rows="3"
        maxlength="500"
      ></textarea>

      <label for="avatarUpload">
        Upload photograph
      </label>

      <input
        type="file"
        id="avatarUpload"
        accept="image/jpeg,image/png,image/webp"
      >

      <div id="avatarPreview"></div>

      <label for="avatarStyle">
        Presentation style
      </label>

      <select id="avatarStyle">

        <option value="Professional">Professional</option>

        <option value="Casual">Casual</option>

        <option value="Corporate">Corporate</option>

        <option value="Creative">Creative</option>

        <option value="Educational">Educational</option>

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

      <button type="button" id="saveAvatarBtn">
        Save avatar
      </button>

      <p id="avatarStatus" class="status">
        Your avatar creation workspace is ready.
      </p>

    </div>

    <div class="avatar-library">

      <h3>MY AVATAR LIBRARY</h3>

      <p>
        Your saved avatars will appear here.
      </p>

      <div id="avatarLibraryList"></div>

    </div>

  `;


  const upload = document.getElementById("avatarUpload");

  const saveButton = document.getElementById("saveAvatarBtn");

  upload.addEventListener("change", event => {

    const file = event.target.files[0];

    if (!file) return;

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp"
    ];

    if (!allowedTypes.includes(file.type)) {

      showNotification("Please upload a JPG, PNG or WebP image.");

      upload.value = "";

      selectedAvatarFile = null;

      return;

    }

    if (file.size > MAX_IMAGE_SIZE) {

      showNotification("Please choose an image smaller than 10MB.");

      upload.value = "";

      selectedAvatarFile = null;

      return;

    }

    selectedAvatarFile = file;

    showAvatarPreview(file);

    document.getElementById("avatarStatus").textContent =
      "Photograph uploaded. Complete your avatar profile.";

  });


  saveButton.addEventListener("click", saveCurrentAvatar);

  await renderAvatarLibrary();

}


/* =====================================
   8. SAVE AVATAR PROFILE
===================================== */

async function saveCurrentAvatar() {

  const name = document.getElementById("avatarName");

  const description = document.getElementById("avatarDescription");

  const style = document.getElementById("avatarStyle");

  const voice = document.getElementById("avatarVoice");

  const status = document.getElementById("avatarStatus");


  if (!name || !description || !style || !voice || !status) {
    return;
  }

  const avatarName = name.value.trim();

  if (!avatarName) {

    status.textContent = "Please give your avatar a name.";

    name.focus();

    return;

  }

  if (!selectedAvatarFile) {

    status.textContent = "Please upload a photograph first.";

    return;

  }

  const saveButton = document.getElementById("saveAvatarBtn");

  saveButton.disabled = true;

  saveButton.textContent = "Saving...";


  const avatar = {

    id: (
      window.crypto &&
      typeof window.crypto.randomUUID === "function"
    )
      ? window.crypto.randomUUID()
      : Date.now().toString() + Math.random().toString(16).slice(2),

    name: avatarName,

    description: description.value.trim(),

    style: style.value,

    voice: voice.value,

    image: selectedAvatarFile,

    createdAt: new Date().toISOString()

  };


  try {

    await saveAvatarRecord(avatar);

    status.textContent =
      "Avatar profile saved successfully!";

    showNotification("Your avatar has been saved.");

    selectedAvatarFile = null;

    document.getElementById("avatarUpload").value = "";

    await renderAvatarLibrary();

  }

  catch (error) {

    console.error("Avatar save error:", error);

    status.textContent =
      "Unable to save. Please check your browser storage.";

  }

  finally {

    saveButton.disabled = false;

    saveButton.textContent = "Save avatar";

  }

}


/* =====================================
   9. DISPLAY SAVED AVATARS
===================================== */

async function renderAvatarLibrary() {

  const library = document.getElementById("avatarLibraryList");

  if (!library) return;

  try {

    const avatars = await getAllAvatars();

    library.replaceChildren();

    if (avatars.length === 0) {

      const emptyMessage = document.createElement("p");

      emptyMessage.textContent =
        "No saved avatars yet. Create your first avatar above.";

      library.appendChild(emptyMessage);

      return;

    }

    avatars.sort((a, b) =>
      new Date(b.createdAt) - new Date(a.createdAt)
    );

    avatars.forEach(avatar => {

      const card = document.createElement("div");

      card.className = "avatar-library-card";


      const title = document.createElement("h4");

      title.textContent = avatar.name;


      const details = document.createElement("p");

      details.textContent =
        avatar.style + " · " + avatar.voice;


      const openButton = document.createElement("button");

      openButton.type = "button";

      openButton.textContent = "Open avatar";

      openButton.addEventListener("click", () => {
        loadSavedAvatar(avatar.id);
      });


      const deleteButton = document.createElement("button");

      deleteButton.type = "button";

      deleteButton.textContent = "Delete";

      deleteButton.className = "delete-avatar-button";

      deleteButton.addEventListener("click", () => {
        removeSavedAvatar(avatar.id);
      });


      card.append(title, details, openButton, deleteButton);

      library.appendChild(card);

    });

  }

  catch (error) {

    console.error("Avatar library error:", error);

    library.textContent =
      "Unable to load your avatar library.";

  }

}


/* =====================================
   10. OPEN SAVED AVATAR
===================================== */

async function loadSavedAvatar(id) {

  try {

    const avatar = await getAvatarById(id);

    if (!avatar) {

      showNotification("Avatar could not be found.");

      return;

    }

    selectedAvatarFile = null;

    clearAvatarPreview();

    const workspace = document.getElementById("workspace");

    if (!workspace) return;

    workspace.innerHTML = `

      <h3>AVATAR PROFILE</h3>

      <div id="savedAvatarPreview"></div>

      <label>Avatar name</label>

      <p id="savedAvatarName"></p>

      <label>Description</label>

      <p id="savedAvatarDescription"></p>

      <label>Presentation style</label>

      <p id="savedAvatarStyle"></p>

      <label>Preferred voice</label>

      <p id="savedAvatarVoice"></p>

      <button type="button" id="backToAvatarStudio">
        Back to avatar creator
      </button>

      <p class="status">
        This avatar profile is saved on this device.
        AI animation and voice generation are not yet connected.
      </p>

    `;


    const preview = document.getElementById("savedAvatarPreview");

    const imageURL = URL.createObjectURL(avatar.image);

    currentAvatarURL = imageURL;

    const image = document.createElement("img");

    image.src = imageURL;

    image.alt = avatar.name;

    preview.appendChild(image);


    document.getElementById("savedAvatarName").textContent =
      avatar.name;

    document.getElementById("savedAvatarDescription").textContent =
      avatar.description || "No description provided.";

    document.getElementById("savedAvatarStyle").textContent =
      avatar.style;

    document.getElementById("savedAvatarVoice").textContent =
      avatar.voice;


    document.getElementById("backToAvatarStudio").addEventListener(
      "click",
      () => openStudio("avatar")
    );


    workspace.scrollIntoView({
      behavior: "smooth",
      block: "nearest"
    });

  }

  catch (error) {

    console.error("Unable to open avatar:", error);

    showNotification("Unable to open this avatar.");

  }

}


/* =====================================
   11. DELETE SAVED AVATAR
===================================== */

async function removeSavedAvatar(id) {

  const confirmed = window.confirm(
    "Are you sure you want to delete this avatar?"
  );

  if (!confirmed) return;

  try {

    await deleteAvatarRecord(id);

    showNotification("Avatar deleted.");

    await renderAvatarLibrary();

  }

  catch (error) {

    console.error("Avatar deletion error:", error);

    showNotification("Unable to delete this avatar.");

  }

}


/* =====================================
   12. STUDIO WORKSPACE
===================================== */

function openStudio(type) {

  const workspace = document.getElementById("workspace");

  if (!workspace) return;

  clearAvatarPreview();

  selectedAvatarFile = null;


  if (type === "avatar") {

    openAvatarStudio(workspace);

  }


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
        maxlength="10000"
      ></textarea>

      <label for="videoLanguage">
        Select language
      </label>

      <select id="videoLanguage">

        <option value="English">English</option>

        <option value="isiZulu">isiZulu</option>

        <option value="siSwati">siSwati</option>

        <option value="Portuguese">Portuguese</option>

        <option value="French">French</option>

      </select>

      <button type="button" id="prepareVideoBtn">
        Prepare video
      </button>

      <p id="videoStatus" class="status">
        Your creative workspace is ready.
      </p>

    `;

    document.getElementById("prepareVideoBtn")
      .addEventListener("click", prepareVideo);

  }


  else if (type === "voice") {

    workspace.innerHTML = `

      <h3>KMT VOICE STUDIO</h3>

      <p>
        Explore the AI voice selection workspace.
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

        Voice selection interface ready.

        AI speech generation will be integrated
        through a secure voice engine.

      </p>

    `;

  }

  else {

    workspace.textContent = "Studio section not found.";

  }

}


/* =====================================
   13. PREPARE VIDEO SCRIPT
===================================== */

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
      "Your script is too long. Please keep it below 10,000 characters.";

    return;

  }


  status.textContent =
    "Script prepared successfully. Language: " +
    language.value +
    ". Your script is ready for AI video engine integration.";

}


/* =====================================
   14. NOTIFICATIONS
===================================== */

let notificationTimeout = null;

function showNotification(message) {

  const notification = document.getElementById("notification");

  if (!notification) return;

  notification.textContent = message;

  notification.classList.add("show");

  clearTimeout(notificationTimeout);

  notificationTimeout = setTimeout(() => {

    notification.classList.remove("show");

  }, 3500);

}


/* =====================================
   15. PROGRESSIVE WEB APP
===================================== */

if ("serviceWorker" in navigator) {

  window.addEventListener("load", () => {

    navigator.serviceWorker.register("./service-worker.js")

      .then(() => {

        console.log("KMT AI Studios PWA registered successfully.");

      })

      .catch(error => {

        console.error("PWA registration failed:", error);

      });

  });

}


/* =====================================
   16. APPLICATION INITIALIZATION
===================================== */

console.log("KMT AI Studios application engine loaded.");

console.log("Founder: Njabulo Mbhodziya Dlamini");
