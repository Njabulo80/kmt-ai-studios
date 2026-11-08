
/* =====================================
   KMT AI STUDIOS
   APPLICATION ENGINE
   Founder: Njabulo Mbhodziya Dlamini
===================================== */


/* =====================================
   1. MOBILE NAVIGATION
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
   2. COPYRIGHT YEAR
===================================== */

const yearElement = document.getElementById("currentYear");

if (yearElement) {
  yearElement.textContent = new Date().getFullYear();
}


/* =====================================
   3. IMAGE PREVIEW MANAGEMENT
===================================== */

let currentAvatarURL = null;


/* =====================================
   4. STUDIO WORKSPACE
===================================== */

function openStudio(type) {

  const workspace = document.getElementById("workspace");

  if (!workspace) return;

  // Clean up an earlier image preview.

  if (currentAvatarURL) {

    URL.revokeObjectURL(currentAvatarURL);

    currentAvatarURL = null;

  }


  /* ---------------------------------
     AI AVATAR STUDIO
  --------------------------------- */

  if (type === "avatar") {

    workspace.innerHTML = `

      <h3>CREATE YOUR AI AVATAR</h3>

      <p>
        Upload a photograph to begin creating
        your digital identity.
      </p>

      <input
        type="file"
        id="avatarUpload"
        accept="image/*"
      >

      <div id="avatarPreview"></div>

      <p class="status">

        Avatar workspace ready.

        AI avatar generation will be connected
        through a secure AI engine.

      </p>

    `;

    const upload = document.getElementById("avatarUpload");

    upload.addEventListener("change", function(event) {

      const file = event.target.files[0];

      if (!file) return;


      // Check image format.

      if (!file.type.startsWith("image/")) {

        alert("Please select a valid image.");

        upload.value = "";

        return;

      }


      // Check image size.

      if (file.size > 10 * 1024 * 1024) {

        alert("Please select an image smaller than 10MB.");

        upload.value = "";

        return;

      }


      const preview = document.getElementById("avatarPreview");

      if (!preview) return;


      // Remove previous preview URL.

      if (currentAvatarURL) {

        URL.revokeObjectURL(currentAvatarURL);

      }


      currentAvatarURL = URL.createObjectURL(file);


      // Create image safely.

      const image = document.createElement("img");

      image.src = currentAvatarURL;

      image.alt = "Uploaded avatar preview";

      image.style.width = "160px";

      image.style.height = "160px";

      image.style.objectFit = "cover";

      image.style.borderRadius = "12px";

      image.style.marginTop = "20px";

      image.style.border = "2px solid #d6ad55";


      const fileName = document.createElement("p");

      fileName.textContent = file.name;


      preview.replaceChildren(image, fileName);

    });

  }


  /* ---------------------------------
     VIDEO STUDIO
  --------------------------------- */

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

    const prepareButton = document.getElementById("prepareVideoBtn");

    if (prepareButton) {

      prepareButton.addEventListener("click", prepareVideo);

    }

  }


  /* ---------------------------------
     VOICE STUDIO
  --------------------------------- */

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
   5. PREPARE VIDEO SCRIPT
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
   6. SAFE HTML TEXT ESCAPING
===================================== */

function escapeHTML(value) {

  return String(value).replace(/[&<>"']/g, character => ({

    "&": "&amp;",

    "<": "&lt;",

    ">": "&gt;",

    '"': "&quot;",

    "'": "&#039;"

  })[character]);

}


/* =====================================
   7. PROGRESS NOTIFICATION
===================================== */

function showNotification(message) {

  const notification = document.getElementById("notification");

  if (!notification) return;

  notification.textContent = message;

  notification.classList.add("show");

}


/* =====================================
   8. PROGRESSIVE WEB APP
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
   9. APPLICATION INITIALIZATION
===================================== */

console.log("KMT AI Studios application engine loaded.");

console.log("Founder: Njabulo Mbhodziya Dlamini");

