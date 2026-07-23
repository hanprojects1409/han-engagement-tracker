const modal = document.getElementById("modal");
const modalTitle = document.getElementById("modal-title");
const openPostBtn = document.getElementById("open-post-btn");
const closeModal = document.getElementById("close-modal");

const commentModal =
document.getElementById("comment-modal");

const closeCommentModal =
document.getElementById("close-comment-modal");

const pickCommentBtn =
document.getElementById("pick-comment-btn");

const copyCommentBtn =
document.getElementById("copy-comment-btn");

const generatedComment =
document.getElementById("generated-comment");

const languageSelect =
document.getElementById("comment-language");

const openInstagramBtn =
document.getElementById("open-instagram-btn");

let currentPost = null;

const container = document.getElementById("posts-container");

window.posts.forEach(post => {
  const card = document.createElement("div");

  card.classList.add("post-card");

  card.innerHTML = `
    <div class="post-info">
      <h3>${post.title}</h3>
      <p>${post.platform}</p>
    </div>

    <div class="rating">⭐</div>
  `;

  card.addEventListener("click", () => {
    openModal(post);
  });

  container.appendChild(card);
});

function openModal(post) {
  currentPost = post;

  modalTitle.textContent = post.title;

  openPostBtn.onclick = () => {
    window.open(post.link, "_blank");
  };

  modal.classList.add("active");
}

document.querySelectorAll(".action-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    const action = btn.dataset.action;

    if (!currentPost) return;

    if (action === "comment") {
      commentModal.classList.add("active");
      return;
    }

    if (action === "share") {
  navigator.clipboard.writeText(currentPost.link);

  btn.classList.add("completed");

  return;
}

  if (
  action === "like" ||
  action === "save" ||
  action === "repost"
) {
  btn.classList.toggle("completed");
  return;
}
  });
});

closeModal.addEventListener("click", () => {
  modal.classList.remove("active");
});

closeCommentModal.addEventListener("click", () => {
  commentModal.classList.remove("active");
});

pickCommentBtn.addEventListener("click", () => {
  const language = languageSelect.value;

  const comments = window.comments[language];

  if (!comments || comments.length === 0) {
    generatedComment.textContent =
      "No comments available for this language.";
    return;
  }

  const random =
    Math.floor(Math.random() * comments.length);

  generatedComment.textContent =
    comments[random];
});

copyCommentBtn.addEventListener("click", () => {
  navigator.clipboard.writeText(
    generatedComment.textContent
  );

  document
    .querySelector('[data-action="comment"]')
    .classList.add("completed");
});

openInstagramBtn.addEventListener("click", () => {
  if (!currentPost) return;

  window.open(currentPost.link, "_blank");
});