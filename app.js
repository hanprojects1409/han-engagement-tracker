import {
  db,
  ref,
  get,
  set,
  onValue
} from "./firebase.js";

const modal = document.getElementById("modal");
const modalTitle = document.getElementById("modal-title");
const openPostBtn = document.getElementById("open-post-btn");
const closeModal = document.getElementById("close-modal");

const commentModal = document.getElementById("comment-modal");
const closeCommentModal = document.getElementById("close-comment-modal");

const pickCommentBtn = document.getElementById("pick-comment-btn");
const copyCommentBtn = document.getElementById("copy-comment-btn");
const generatedComment = document.getElementById("generated-comment");
const languageSelect = document.getElementById("comment-language");
const openInstagramBtn = document.getElementById("open-instagram-btn");

const copyHashtagsBtn = document.getElementById("copy-hashtags-btn");
const hashtagsContainer = document.getElementById("hashtags");
const container = document.getElementById("posts-container");

let currentPost = null;

const fixedHashtags = [
  "#HAN",
  "#HANxTods",
  "@Tods"
];

if (hashtagsContainer) {
  hashtagsContainer.innerHTML = fixedHashtags
    .map(tag => `<span>${tag}</span>`)
    .join("");
}

function createPosts() {
  if (!container || !Array.isArray(window.posts)) return;

  container.innerHTML = "";

  window.posts.forEach(post => {
    const card = document.createElement("div");

    card.classList.add("post-card");

    card.innerHTML = `
      <div class="post-info">
        <h3>${post.id}</h3>
        <p>${post.platform}</p>

        <div class="post-stats">
          ❤️ <span id="like-${post.id}">0</span>
          💬 <span id="comment-${post.id}">0</span>
          📤 <span id="share-${post.id}">0</span>
          🔖 <span id="save-${post.id}">0</span>
          🔁 <span id="repost-${post.id}">0</span>

          <div
            class="engagement-badge"
            id="badge-${post.id}">
          </div>
        </div>

        <div class="rating">⭐</div>
      </div>
    `;

    card.addEventListener("click", () => {
      openModal(post);
    });

    container.appendChild(card);

    watchPostStats(post.id);
  });
}

function openModal(post) {
  currentPost = post;

  if (modalTitle) {
    modalTitle.textContent = post.id;
  }

  if (openPostBtn) {
    openPostBtn.onclick = () => {
      window.open(post.link, "_blank");
    };
  }

  document
    .querySelectorAll("#modal .action-btn")
    .forEach(btn => {
      const action = btn.dataset.action;
      const key = `post-${post.id}-${action}`;
      const completed =
        localStorage.getItem(key) === "true";

      btn.classList.toggle("completed", completed);
    });

  if (modal) {
    modal.classList.add("active");
  }
}

document
  .querySelectorAll("#modal .action-btn")
  .forEach(btn => {
    btn.addEventListener("click", async () => {
      if (!currentPost) return;

      const action = btn.dataset.action;

      if (action === "comment") {
        if (commentModal) {
          commentModal.classList.add("active");
        }
        return;
      }

      if (action === "share") {
        const wasCompleted =
          btn.classList.contains("completed");

        try {
          await navigator.clipboard.writeText(
            currentPost.link
          );
        } catch {}

        btn.classList.add("completed");

        localStorage.setItem(
          `post-${currentPost.id}-share`,
          "true"
        );

        if (!wasCompleted) {
          await addGlobalInteraction(
            currentPost.id,
            "share",
            1
          );
        }

        return;
      }

      if (
        action === "like" ||
        action === "save" ||
        action === "repost"
      ) {
        const wasCompleted =
          btn.classList.contains("completed");

        btn.classList.toggle("completed");

        const completed =
          btn.classList.contains("completed");

        localStorage.setItem(
          `post-${currentPost.id}-${action}`,
          completed ? "true" : "false"
        );

        if (!wasCompleted && completed) {
          await addGlobalInteraction(
            currentPost.id,
            action,
            1
          );
        }

        if (wasCompleted && !completed) {
          await addGlobalInteraction(
            currentPost.id,
            action,
            -1
          );
        }
      }
    });
  });

if (closeModal) {
  closeModal.addEventListener("click", () => {
    modal.classList.remove("active");
  });
}

if (closeCommentModal) {
  closeCommentModal.addEventListener("click", () => {
    commentModal.classList.remove("active");
  });
}

if (pickCommentBtn) {
  pickCommentBtn.addEventListener("click", () => {
    const language = languageSelect.value;
    const comments = window.comments?.[language];

    if (!comments || comments.length === 0) {
      generatedComment.textContent =
        "No comments available for this language.";
      return;
    }

    const randomIndex =
      Math.floor(Math.random() * comments.length);

    generatedComment.textContent =
      comments[randomIndex];
  });
}

if (copyCommentBtn) {
  copyCommentBtn.addEventListener(
    "click",
    async () => {
      if (!currentPost) return;

      const text =
        generatedComment.textContent.trim();

      if (
        !text ||
        text === "Generate a comment" ||
        text === "No comments available for this language."
      ) {
        return;
      }

      try {
        await navigator.clipboard.writeText(text);
      } catch {}

      const commentBtn =
        document.querySelector(
          '#modal .action-btn[data-action="comment"]'
        );

      if (!commentBtn) return;

      const wasCompleted =
        commentBtn.classList.contains("completed");

      commentBtn.classList.add("completed");

      localStorage.setItem(
        `post-${currentPost.id}-comment`,
        "true"
      );

      if (!wasCompleted) {
        await addGlobalInteraction(
          currentPost.id,
          "comment",
          1
        );
      }
    }
  );
}

if (openInstagramBtn) {
  openInstagramBtn.addEventListener(
    "click",
    () => {
      if (!currentPost) return;

      window.open(
        currentPost.link,
        "_blank"
      );
    }
  );
}

if (copyHashtagsBtn) {
  copyHashtagsBtn.addEventListener(
    "click",
    async () => {
      const text =
        fixedHashtags.join(" ");

      try {
        await navigator.clipboard.writeText(text);

        copyHashtagsBtn.textContent =
          "🌟 Hashtags copied";

        setTimeout(() => {
          copyHashtagsBtn.textContent =
            "📋 Copy hashtags";
        }, 1500);
      } catch {}
    }
  );
}

async function addGlobalInteraction(postId, action) {

  const postRef = ref(
    db,
    `posts/${postId}/${action}`
  );

  try {

    const snapshot = await get(postRef);

    let count = 0;

    if (snapshot.exists()) {

      count = Number(snapshot.val());

    }

    await set(
      postRef,
      count + 1
    );

  } catch (error) {

    console.error(
      "Error loading interaction:",
      error
    );

  }

}

function watchPostStats(postId) {

  const postRef = ref(
    db,
    `posts/${postId}`
  );

  onValue(
    postRef,
    snapshot => {

      const data =
        snapshot.val() || {};

      const likes =
        Number(data.like || 0);

      const comments =
        Number(data.comment || 0);

      const shares =
        Number(data.share || 0);

      const saves =
        Number(data.save || 0);

      const reposts =
        Number(data.repost || 0);


      const likeElement =
        document.getElementById(
          `like-${postId}`
        );

      const commentElement =
        document.getElementById(
          `comment-${postId}`
        );

      const shareElement =
        document.getElementById(
          `share-${postId}`
        );

      const saveElement =
        document.getElementById(
          `save-${postId}`
        );

      const repostElement =
        document.getElementById(
          `repost-${postId}`
        );


      if (likeElement) {

        likeElement.textContent =
          likes;

      }

      if (commentElement) {

        commentElement.textContent =
          comments;

      }

      if (shareElement) {

        shareElement.textContent =
          shares;

      }

      if (saveElement) {

        saveElement.textContent =
          saves;

      }

      if (repostElement) {

        repostElement.textContent =
          reposts;

      }


      const total =
        likes +
        comments +
        shares +
        saves +
        reposts;


      const badge =
        document.getElementById(
          `badge-${postId}`
        );


      if (!badge) return;


      if (total < 25) {

        badge.textContent =
          "🔥 Needs engagement";

      } else {

        badge.textContent =
          "✨ Active";

      }

    }
  );

}

function watchGlobalCounters() {

  const postsRef = ref(db, "posts");

  onValue(postsRef, snapshot => {

    const allPosts = snapshot.val() || {};

    let likes = 0;
    let comments = 0;
    let shares = 0;
    let saves = 0;

    for (const postId in allPosts) {

      const post = allPosts[postId] || {};

      likes += Number(post.like || 0);
      comments += Number(post.comment || 0);
      shares += Number(post.share || 0);
      saves += Number(post.save || 0);

    }

    const totalPosts = window.posts.length;

    const likeCounter =
      document.getElementById("total-like");

    const commentCounter =
      document.getElementById("total-comment");

    const shareCounter =
      document.getElementById("total-share");

    const saveCounter =
      document.getElementById("total-save");


    if (likeCounter) {

      likeCounter.textContent =
        `${likes}/${totalPosts}`;

    }


    if (commentCounter) {

      commentCounter.textContent =
        `${comments}/${totalPosts}`;

    }


    if (shareCounter) {

      shareCounter.textContent =
        `${shares}/${totalPosts}`;

    }


    if (saveCounter) {

      saveCounter.textContent =
        `${saves}/${totalPosts}`;

    }

  });

}


watchGlobalCounters();