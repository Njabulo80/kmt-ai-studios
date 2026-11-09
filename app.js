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
let currentVideoAvatarURL = null;
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

      database.onversionchange = () => {
        database.close();
        database = null;
      };

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

async function saveAvatarToDatabase(avatar) {

  if (!database) {
    await openAvatarDatabase();
  }

  return new Promise((resolve, reject) => {

    const transaction = database.transaction(
      STORE_NAME,
      "readwrite"
    );

    const store = transaction.objectStore(STORE_NAME);

    const request = avatar.id
      ? store.put(avatar)
      : store.add(avatar);

    let savedId;

    request.onsuccess = () => {
      savedId = request.result;
    };

    request.onerror = () => {
      reject(request.error);
    };

    transaction.oncomplete = () => {
      resolve(savedId);
    };

    transaction.onerror = () => {
      reject(transaction.error || new Error("Avatar save failed."));
    };

    transaction.onabort = () => {
      reject(transaction.error || new Error("Avatar save was cancelled."));
    };

  });

}


async function getAllAvatars() {

  if (!database) {
    await openAvatarDatabase();
  }

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


async function deleteAvatarFromDatabase(id) {

  if (!database) {
    await openAvatarDatabase();
  }

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

  image.style.maxWidth = "100%";
  image.style.width = "180px";
  image.style.borderRadius = "12px";

  const filename = document.createElement("p");

  filename.textContent = file.name;

  preview.append(image, filename);

}


/* =========================================
   7B. KMT VOICE PREVIEW ENGINE
========================================= */

function previewKMTVoice(text, voiceStyle, statusElement) {

  if (!("speechSynthesis" in window) ||
      !("SpeechSynthesisUtterance" in window)) {

    statusElement.textContent =
      "Voice preview is not supported by this browser.";

    return;

  }

  const message = String(text || "").trim();

  if (!message) {

    statusElement.textContent =
      "Please enter some text to preview.";

    return;

  }

  const synth = window.speechSynthesis;

  synth.cancel();

  statusElement.textContent =
    "Preparing voice preview...";

  const speak = () => {

    const speech = new SpeechSynthesisUtterance(message);

    const voices = synth.getVoices();

    const englishVoices = voices.filter(voice =>
      voice.lang &&
      voice.lang.toLowerCase().startsWith("en")
    );

    const style = String(voiceStyle || "").toLowerCase();

    let selectedVoice = null;

    if (style.includes("male")) {

      selectedVoice = englishVoices.find(voice =>
        /male|david|mark|daniel|james|guy/i.test(voice.name)
      ) || englishVoices[0];

    } else if (style.includes("female")) {

      selectedVoice = englishVoices.find(voice =>
        /female|zira|samantha|victoria|karen|susan/i.test(voice.name)
      ) || englishVoices[0];

    } else {

      selectedVoice = englishVoices[0] || voices[0] || null;

    }

    if (selectedVoice) {

      speech.voice = selectedVoice;
      speech.lang = selectedVoice.lang;

    } else {

      speech.lang = "en-US";

    }

    speech.rate = style.includes("energetic") ? 1.12 : 0.92;

    speech.pitch = style.includes("female") ? 1.08 : 0.95;

    speech.onstart = () => {

      statusElement.textContent =
        "Playing voice preview...";

    };

    speech.onend = () => {

      statusElement.textContent =
        "Voice preview completed.";

    };

    speech.onerror = event => {

      statusElement.textContent =
        "Voice preview failed (" +
        event.error +
        "). Please try again.";

    };

    synth.speak(speech);

  };

  const availableVoices = synth.getVoices();

  if (availableVoices.length) {

    speak();

  } else {

    let finished = false;

    const onVoicesChanged = () => {

      if (finished) return;

      finished = true;

      synth.removeEventListener(
        "voiceschanged",
        onVoicesChanged
      );

      speak();

    };

    synth.addEventListener(
      "voiceschanged",
      onVoicesChanged
    );

    window.setTimeout(() => {

      if (finished) return;

      finished = true;

      synth.removeEventListener(
        "voiceschanged",
        onVoicesChanged
      );

      speak();

    }, 1000);

  }

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


  /* =====================================
     AVATAR STUDIO
  ===================================== */

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

          <option value="Professional">Professional</option>
          <option value="Casual">Casual</option>
          <option value="Educational">Educational</option>
          <option value="Energetic">Energetic</option>
          <option value="Corporate">Corporate</option>

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

        <label for="avatarVoiceSample">
          Voice preview text
        </label>

        <textarea
          id="avatarVoiceSample"
          rows="3"
        >Welcome to KMT AI Studios. Your ideas deserve a powerful voice.</textarea>

        <button
          type="button"
          id="previewAvatarVoiceBtn"
          style="display:block;width:100%;margin:12px 0;padding:14px;background:#d6ad55;color:#080808;border:0;border-radius:8px;font-weight:700;cursor:pointer;"
        >
          PREVIEW SELECTED VOICE
        </button>

        <p id="avatarVoicePreviewStatus" class="status">
          Select a voice and tap Preview Voice to listen.
        </p>

        <button
          type="submit"
          id="saveAvatarBtn"
          style="display:block !important;visibility:visible !important;opacity:1 !important;width:100%;margin:18px 0;padding:16px;background:#d6ad55;color:#080808;border:2px solid #d6ad55;border-radius:10px;font-size:16px;font-weight:700;cursor:pointer;"
        >
          SAVE AVATAR
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

    document
      .getElementById("previewAvatarVoiceBtn")
      .addEventListener("click", () => {

        previewKMTVoice(
          document.getElementById("avatarVoiceSample").value,
          document.getElementById("avatarVoice").value,
          document.getElementById("avatarVoicePreviewStatus")
        );

      });

    document
      .getElementById("avatarForm")
      .addEventListener("submit", saveAvatar);

    loadAvatarLibrary();

  }


  /* =====================================
     VIDEO STUDIO
  ===================================== */

  else if (type === "video") {

    if (currentVideoAvatarURL) {

      URL.revokeObjectURL(currentVideoAvatarURL);

      currentVideoAvatarURL = null;

    }

    workspace.innerHTML = `

      <h3>KMT VIDEO STUDIO</h3>

      <p>
        Bring your saved avatar, script and voice together.
      </p>

      <label for="videoAvatar">
        Select your saved avatar
      </label>

      <select id="videoAvatar">

        <option value="">
          Loading your avatars...
        </option>

      </select>

      <div
        id="videoAvatarPreview"
        style="margin:20px 0;text-align:center;"
      >
        Your selected avatar will appear here.
      </div>

      <label for="videoScript">
        Your video script
      </label>

      <textarea
        id="videoScript"
        placeholder="Write what you want your avatar to say..."
        rows="7"
        maxlength="10000"
      ></textarea>

      <label for="videoVoice">
        Select narration voice
      </label>

      <select id="videoVoice">

        <option value="Natural male voice">
          Original Male Voice
        </option>

        <option value="Natural female voice">
          Natural Female Voice
        </option>

        <option value="Professional narration">
          Professional Narration
        </option>

        <option value="Energetic presentation">
          Energetic Presentation
        </option>

      </select>

      <button
        type="button"
        id="previewVideoBtn"
        style="display:block;width:100%;margin:20px 0;padding:16px;background:#d6ad55;color:#080808;border:0;border-radius:10px;font-weight:700;cursor:pointer;"
      >
        PREVIEW MY VIDEO SCRIPT
      </button>

      <p id="videoStatus" class="status">
        Select an avatar and write your script.
      </p>

      <p class="status">
        Your saved photograph and selected voice
        will be used for this preview. Actual
        talking-avatar video generation requires
        a connected AI video service.
      </p>

    `;

    loadVideoAvatarOptions();

    document
      .getElementById("previewVideoBtn")
      .addEventListener("click", previewKMTVideo);

  }


  /* =====================================
     VOICE STUDIO
  ===================================== */

  else if (type === "voice") {

    workspace.innerHTML = `

      <h3>KMT VOICE STUDIO</h3>

      <p>
        Select a voice style and listen to a preview.
      </p>

      <label for="voiceType">
        Choose a voice style
      </label>

      <select id="voiceType">

        <option value="Natural male voice">
          Original Male Voice
        </option>

        <option value="Natural female voice">
          Natural Female Voice
        </option>

        <option value="Professional narration">
          Professional Narration
        </option>

        <option value="Energetic presentation">
          Energetic Presentation
        </option>

      </select>

      <label for="voiceSample">
        Your preview script
      </label>

      <textarea
        id="voiceSample"
        rows="5"
        placeholder="Type what you want the voice to say..."
      >Welcome to KMT AI Studios. We turn imagination into creation.</textarea>

      <button
        type="button"
        id="previewVoiceBtn"
        style="display:block;width:100%;margin:15px 0;padding:15px;background:#d6ad55;color:#080808;border:0;border-radius:8px;font-weight:700;cursor:pointer;"
      >
        PREVIEW VOICE
      </button>

      <p id="voicePreviewStatus" class="status">
        Your voice studio is ready.
      </p>

      <p class="status">
        Voice previews use voices available on your device.
        Premium AI voice generation requires a connected voice service.
      </p>

    `;

    document
      .getElementById("previewVoiceBtn")
      .addEventListener("click", () => {

        previewKMTVoice(
          document.getElementById("voiceSample").value,
          document.getElementById("voiceType").value,
          document.getElementById("voicePreviewStatus")
        );

      });

  } else {

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

    if (editingAvatarId && !existing) {

      throw new Error("The avatar being edited could not be found.");

    }

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

    status.textContent =
      "Your avatar profile has been saved.";

    showNotification("Avatar saved successfully!");

    editingAvatarId = null;

    document.getElementById("avatarForm").reset();

    clearAvatarPreview();

    document.getElementById("avatarPreview").replaceChildren();

    document.getElementById("saveAvatarBtn").textContent =
      "SAVE AVATAR";

    await loadAvatarLibrary();

  }

  catch (error) {

    console.error(error);

    status.textContent =
      "Could not save your avatar: " +
      (error.message || "Please refresh and try again.");

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

      empty.textContent =
        "You haven't saved any avatars yet.";

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

        image.addEventListener("error", () => {
          URL.revokeObjectURL(imageURL);
        }, { once: true });

      }

      const heading = document.createElement("h4");

      heading.textContent = avatar.name;

      const details = document.createElement("p");

      details.textContent =
        avatar.presentation + " | " + avatar.voice;

      const description = document.createElement("p");

      description.textContent =
        avatar.description || "No description provided.";

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

    if (!avatar) {

      showNotification("Avatar not found.");

      return;

    }

    editingAvatarId = avatar.id;

    document.getElementById("avatarName").value =
      avatar.name;

    document.getElementById("avatarDescription").value =
      avatar.description || "";

    document.getElementById("avatarPresentation").value =
      avatar.presentation;

    document.getElementById("avatarVoice").value =
      avatar.voice;

    clearAvatarPreview();

    const preview = document.getElementById("avatarPreview");

    preview.replaceChildren();

    if (avatar.image) {

      currentAvatarURL = URL.createObjectURL(avatar.image);

      const image = document.createElement("img");

      image.src = currentAvatarURL;
      image.alt = "Saved avatar photograph";

      image.style.width = "180px";
      image.style.maxWidth = "100%";
      image.style.borderRadius = "12px";

      preview.appendChild(image);

    }

    document.getElementById("avatarStatus").textContent =
      "Editing " + avatar.name +
      ". Select a new photograph only if you want to replace the existing one.";

    document.getElementById("saveAvatarBtn").textContent =
      "UPDATE AVATAR";

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
   12B. VIDEO AVATAR SELECTION
========================================= */

async function loadVideoAvatarOptions() {

  const selector = document.getElementById("videoAvatar");

  const preview = document.getElementById("videoAvatarPreview");

  if (!selector || !preview) return;

  try {

    const avatars = await getAllAvatars();

    selector.replaceChildren();

    if (avatars.length === 0) {

      const option = document.createElement("option");

      option.value = "";
      option.textContent = "No saved avatars found";

      selector.appendChild(option);

      preview.textContent =
        "Please create and save an avatar first.";

      return;

    }

    const defaultOption = document.createElement("option");

    defaultOption.value = "";
    defaultOption.textContent = "Choose your saved avatar";

    selector.appendChild(defaultOption);

    avatars.forEach(avatar => {

      const option = document.createElement("option");

      option.value = String(avatar.id);
      option.textContent = avatar.name;

      selector.appendChild(option);

    });

    selector.addEventListener("change", () => {

      const selectedAvatar = avatars.find(
        avatar => String(avatar.id) === selector.value
      );

      if (!selectedAvatar) return;

      if (currentVideoAvatarURL) {

        URL.revokeObjectURL(currentVideoAvatarURL);

        currentVideoAvatarURL = null;

      }

      preview.replaceChildren();

      if (selectedAvatar.image) {

        currentVideoAvatarURL = URL.createObjectURL(
          selectedAvatar.image
        );

        const image = document.createElement("img");

        image.src = currentVideoAvatarURL;
        image.alt = selectedAvatar.name;

        image.style.width = "180px";
        image.style.maxWidth = "100%";
        image.style.borderRadius = "12px";
        image.style.border = "2px solid #d6ad55";

        preview.appendChild(image);

      }

      const heading = document.createElement("h4");

      heading.textContent =
        "Selected avatar: " + selectedAvatar.name;

      preview.appendChild(heading);

      const voiceSelector =
        document.getElementById("videoVoice");

      if (voiceSelector) {

        const matchingVoice = Array.from(
          voiceSelector.options
        ).find(option =>
          option.value === selectedAvatar.voice
        );

        if (matchingVoice) {
          voiceSelector.value = selectedAvatar.voice;
        }

      }

    });

  }

  catch (error) {

    console.error("Video avatar loading error:", error);

    preview.textContent =
      "Unable to load your saved avatars.";

  }

}


/* =========================================
   12C. KMT VIDEO PREVIEW
========================================= */

function previewKMTVideo() {

  const avatar = document.getElementById("videoAvatar");

  const script = document.getElementById("videoScript");

  const voice = document.getElementById("videoVoice");

  const status = document.getElementById("videoStatus");

  if (!avatar || !script || !voice || !status) return;

  if (!avatar.value) {

    status.textContent =
      "Please select a saved avatar first.";

    return;

  }

  const content = script.value.trim();

  if (content.length < 10) {

    status.textContent =
      "Please enter a script containing at least 10 characters.";

    return;

  }

  if (content.length > 10000) {

    status.textContent =
      "Your script must not exceed 10,000 characters.";

    return;

  }

  status.textContent =
    "Preparing your avatar narration...";

  previewKMTVoice(
    content,
    voice.value,
    status
  );

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
