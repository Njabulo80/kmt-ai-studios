
/* =====================================
   KMT AI STUDIOS
   Application Engine
   Founder: Njabulo Mbhodziya Dlamini
===================================== */

// MOBILE NAVIGATION

const menuBtn = document.getElementById("menuBtn");
const navigation = document.getElementById("navigation");

if (menuBtn && navigation) {
  menuBtn.addEventListener("click", () => {
    navigation.classList.toggle("active");
  });
}

// CLOSE MOBILE MENU AFTER NAVIGATION

if (navigation) {
  navigation.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => {
      navigation.classList.remove("active");
    });
  });
}

// STUDIO WORKSPACE

function openStudio(type) {

  const workspace = document.getElementById("workspace");

  if (!workspace) return;

  if (type === "avatar") {

    workspace.innerHTML = `
      <h3>CREATE YOUR AI AVATAR</h3>
      <p>Upload a photograph to begin creating your digital identity.</p>

      <input
        type="file"
        id="avatarUpload"
        accept="image/*"
      >

      <div id="avatarPreview"></div>

      <p class="status">
        Avatar creation interface ready.
        AI generation will be connected in a future update.
      </p>
    `;

    const upload = document.getElementById("avatarUpload");

    upload.addEventListener("change", function(event) {

      const file = event.target.files[0];

      if (!file) return;

      if (!file.type.startsWith("image/")) {
        alert("Please select an image.");
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        alert("Please select an image smaller than 10MB.");
        upload.value = "";
        return;
      }

      const preview = document.getElementById("avatarPreview");

      const imageURL = URL.createObjectURL(file);

      preview.innerHTML = `
        <img
          src="${imageURL}"
          alt="Avatar preview"
          style="
            width:160px;
            height:160px;
            object-fit:cover;
            border-radius:12px;
            margin-top:20px;
            border:2px solid #d6ad55;
          "
        >
        <p>${escapeHTML(file.name)}</p>
      `;

    });

  }

  else if (type === "video") {

    workspace.innerHTML = `
      <h3>KMT VIDEO STUDIO</h3>

      <label for="videoScript">Your video script</label>

      <textarea
        id="videoScript"
        placeholder="Write what your AI avatar should say..."
        rows="6"
        style="
          width:100%;
          padding:15px;
          margin:15px 0;
          background:#080808;
          color:white;
          border:1px solid #d6ad55;
          border-radius:6px;
        "
      ></textarea>

      <label for="videoLanguage">Language</label>

      <select id="videoLanguage">
        <option>English</option>
        <option>isiZulu</option>
        <option>siSwati</option>
        <option>Portuguese</option>
        <option>French</option>
      </select>

      <button onclick="prepareVideo()">
        Prepare video
      </button>

      <p id="videoStatus" class="status">
        Your creative workspace is ready.
      </p>
    `;

  }

  else if (type === "voice") {

    workspace.innerHTML = `
      <h3>KMT VOICE STUDIO</h3>

      <p>Explore the voice generation workspace.</p>

      <select id="voiceType">
        <option>Natural male voice</option>
        <option>Natural female voice</option>
        <option>Professional narration</option>
        <option>Energetic presentation</option>
      </select>

      <p class="status">
        Voice selection interface ready.
        AI speech generation will be integrated later.
      </p>
    `;

  }

}

// PREPARE VIDEO SCRIPT

function prepareVideo() {

  const script = document.getElementById("videoScript");
  const language = document.getElementById("videoLanguage");
  const status = document.getElementById("videoStatus");

  if (!script || !language || !status) return;

  const content = script.value.trim();

  if (!content) {
    status.textContent = "Please enter your video script first.";
    return;
  }

  status.textContent =
    "Script prepared successfully. Language: " +
    language.value +
    ". Connect an AI video engine to generate your video.";
}

// BASIC HTML ESCAPING

function escapeHTML(value) {

  return value.replace(/[&<>"']/g, character => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  })[character]);

}

console.log("KMT AI Studios application engine loaded.");
