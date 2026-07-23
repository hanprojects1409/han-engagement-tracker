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
        <h3>${post.id}</h3>
            <p>${post.platform}</p>
            
                <div class="post-stats">
                    ❤️ <span id="like-${post.id}">0</span>
💬 <span id="comment-${post.id}">0</span>
📤 <span id="share-${post.id}">0</span>
🔖 <span id="save-${post.id}">0</span>
🔁 <span id="repost-${post.id}">0</span>

<div class="engagement-badge"
     id="badge-${post.id}">
</div>
                                                          
                                                                      
                                                                        </div>
                                                                        
                                                                          <div class="rating">⭐</div>
                                                                          `;

  card.addEventListener("click", () => {
    openModal(post);
  });

  container.appendChild(card);

  watchPostStats(post.id);
});

function openModal(post) {
  currentPost = post;

  modalTitle.textContent = post.id;

  openPostBtn.onclick = () => {
    window.open(post.link, "_blank");
  };

  document
  .querySelectorAll(".action-btn")
  .forEach(btn => {

    const action = btn.dataset.action;

    const completed =
      localStorage.getItem(
        `post-${post.title}-${action}`
      );

    btn.classList.toggle(
      "completed",
      completed === "true"
    );
  });
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
        const wasCompleted =
            btn.classList.contains("completed");

              navigator.clipboard.writeText(
                  currentPost.link
                    );

                      btn.classList.add("completed");

                        localStorage.setItem(
                            `post-${currentPost.id}-share`,
                                true
                                  );

                                    if (!wasCompleted) {
                                        addGlobalInteraction(
                                              currentPost.id,
                                                    "share"
                                                        );
                                                          }

                                                            return;
                                                            }
    });

  if (
      action === "like" ||
        action === "save" ||
          action === "repost"
          ) {
            const wasCompleted =
                btn.classList.contains("completed");

                  btn.classList.toggle("completed");

                    const key =
                        `post-${currentPost.id}-${action}`;

                          localStorage.setItem(
                              key,
                                  btn.classList.contains("completed")
                                    );
                                        if (!wasCompleted) {
                                            addGlobalInteraction(
                                                  currentPost.id,
                                                        action
                                                            );
                                                              }

                                                                return;
                                                                }
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

            const commentBtn =
                document.querySelector(
                      '[data-action="comment"]'
                          );

                            const wasCompleted =
                                commentBtn.classList.contains(
                                      "completed"
                                          );

                                            commentBtn.classList.add(
                                                "completed"
                                                  );

                                                    localStorage.setItem(
                                                        `post-${currentPost.id}-comment`,
                                                            true
                                                              );

                                                                if (!wasCompleted) {
                                                                    addGlobalInteraction(
                                                                          currentPost.id,
                                                                                "comment"
                                                                                    );
                                                                                      }

                                                                                      });

openInstagramBtn.addEventListener("click", () => {
  if (!currentPost) return;

  window.open(currentPost.link, "_blank");
});

async function addGlobalInteraction(
  postId,
    action
    ) {
      const postRef = ref(
          db,
              `posts/${postId}/${action}`
                );

                  const snapshot =
                      await get(postRef);

                        let count = 0;

                          if (snapshot.exists()) {
                              count = snapshot.val();
                                }

                                  await set(postRef, count + 1);
                                  }

function watchPostStats(postId) {
    const postRef =
        ref(db, `posts/${postId}`);

          onValue(postRef, snapshot => {
              const data =
                    snapshot.val() || {};

                        const likes =
                              data.like || 0;

                                  const comments =
                                        data.comment || 0;

                                            const shares =
                                                  data.share || 0;

                                                      const saves =
                                                            data.save || 0;

                                                                const reposts =
                                                                      data.repost || 0;

                                                                          document.getElementById(
                                                                                `like-${postId}`
                                                                                    ).textContent = likes;

                                                                                        document.getElementById(
                                                                                              `comment-${postId}`
                                                                                                  ).textContent = comments;

                                                                                                      document.getElementById(
                                                                                                            `share-${postId}`
                                                                                                                ).textContent = shares;

                                                                                                                    document.getElementById(
                                                                                                                          `save-${postId}`
                                                                                                                              ).textContent = saves;

                                                                                                                                  document.getElementById(
                                                                                                                                        `repost-${postId}`
                                                                                                                                            ).textContent = reposts;

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

                                                                                                                                                                                                          if (total < 25) {
                                                                                                                                                                                                                badge.textContent =
                                                                                                                                                                                                                        "🔥 Needs engagement";
                                                                                                                                                                                                                            } else {
                                                                                                                                                                                                                                  badge.textContent =
                                                                                                                                                                                                                                          "✨ Active";
                                                                                                                                                                                                                                              }
                                                                                                                                                                                                                                                });
                                                                                                                                                                                                                                                }