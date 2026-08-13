import {
  db,
  ref,
  get,
  set,
  onValue,
  getCurrentUser
} from "./firebase.js";

const modal =
  document.getElementById("modal");

const modalTitle =
  document.getElementById("modal-title");

const openPostBtn =
  document.getElementById("open-post-btn");

const closeModal =
  document.getElementById("close-modal");


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


const copyHashtagsBtn =
  document.getElementById("copy-hashtags-btn");

const hashtagsContainer =
  document.getElementById("hashtags");


const container =
  document.getElementById("posts-container");


let currentPost = null;


const fixedHashtags = [
  "#HAN",
  "#HANxTods",
  "@Tods"
];


if (hashtagsContainer) {

  hashtagsContainer.innerHTML =
    fixedHashtags
      .map(tag => `<span>${tag}</span>`)
      .join("");

}

const globalStats = {};


if (
  Array.isArray(window.posts) &&
  container
) {

  window.posts.forEach(post => {

    const card =
      document.createElement("div");


    card.classList.add(
      "post-card"
    );


    card.innerHTML = `
    
      <div class="post-info">

        <h3>${post.id}</h3>

        <p>${post.platform}</p>

        <div class="post-stats">

          ❤️
          <span id="like-${post.id}">
            0
          </span>

          💬
          <span id="comment-${post.id}">
            0
          </span>

          📤
          <span id="share-${post.id}">
            0
          </span>

          🔖
          <span id="save-${post.id}">
            0
          </span>

          🔁
          <span id="repost-${post.id}">
            0
          </span>

          <div
            class="engagement-badge"
            id="badge-${post.id}">
          </div>

        </div>

        <div class="rating">
          ⭐
        </div>

      </div>

    `;


    card.addEventListener(
      "click",
      () => {

        openModal(post);

      }
    );


    container.appendChild(card);


    watchPostStats(
      post.id
    );

  });

}


function openModal(post) {

  currentPost = post;


  if (modalTitle) {

    modalTitle.textContent =
      post.title || post.id;

  }


  if (openPostBtn) {

    openPostBtn.onclick = () => {

      window.open(
        post.link,
        "_blank"
      );

    };

  }


  document
    .querySelectorAll(
      "#modal .action-btn"
    )
    .forEach(btn => {

      const action =
        btn.dataset.action;


      const key =
        `post-${post.id}-${action}`;


      const completed =
        localStorage.getItem(key) === "true";


      btn.classList.toggle(
        "completed",
        completed
      );

    });


  if (modal) {

    modal.classList.add(
      "active"
    );

  }

}


document
  .querySelectorAll(
    "#modal .action-btn"
  )
  .forEach(btn => {

    btn.addEventListener(
      "click",
      async () => {

        if (!currentPost) {
          return;
        }


        const action =
          btn.dataset.action;


        if (action === "comment") {

          if (commentModal) {

            commentModal.classList.add(
              "active"
            );

          }

          return;

        }


        if (action === "share") {

  const wasCompleted =
    btn.classList.contains(
      "completed"
    );

  try {

    await navigator.clipboard.writeText(
      currentPost.link
    );

  } catch (error) {

    console.error(
      "Can't copy link:",
      error
    );

    return;

  }

  if (!wasCompleted) {

    btn.classList.add(
      "completed"
    );

    localStorage.setItem(
      `post-${currentPost.id}-share`,
      "true"
    );

    await updateFirebaseInteraction(
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
            btn.classList.contains(
              "completed"
            );


          const completed =
            !wasCompleted;


          btn.classList.toggle(
            "completed",
            completed
          );


          localStorage.setItem(
            `post-${currentPost.id}-${action}`,
            completed
              ? "true"
              : "false"
          );


          const change =
            completed
              ? 1
              : -1;


          await updateFirebaseInteraction(
            currentPost.id,
            action,
            change
          );


          return;

        }

      }
    );

  });


if (closeModal) {

  closeModal.addEventListener(
    "click",
    () => {

      if (modal) {

        modal.classList.remove(
          "active"
        );

      }

    }
  );

}

if (closeCommentModal) {

  closeCommentModal.addEventListener(
    "click",
    () => {

      if (commentModal) {

        commentModal.classList.remove(
          "active"
        );

      }

    }
  );

}


if (pickCommentBtn) {

  pickCommentBtn.addEventListener(
    "click",
    () => {

      if (
        !languageSelect ||
        !generatedComment
      ) {
        return;
      }


      const language =
        languageSelect.value;


      const comments =
        window.comments?.[language];


      if (
        !comments ||
        comments.length === 0
      ) {

        generatedComment.textContent =
          "No comments available for this language.";

        return;

      }


      const randomIndex =
        Math.floor(
          Math.random() *
          comments.length
        );


      generatedComment.textContent =
        comments[randomIndex];

    }
  );

}


if (copyCommentBtn) {

  copyCommentBtn.addEventListener(
    "click",
    async () => {

      if (!currentPost) {
        return;
      }

      if (!generatedComment) {
        return;
      }

      const text =
        generatedComment.textContent.trim();

      if (
        !text ||
        text === "Generate a comment"
      ) {
        return;
      }

      try {

        await navigator.clipboard.writeText(
          text
        );

      } catch (error) {

        console.error(
          "Error copying comment:",
          error
        );

        return;

      }

      const commentBtn =
        document.querySelector(
          '#modal .action-btn[data-action="comment"]'
        );

      if (!commentBtn) {
        return;
      }

      const wasCompleted =
        commentBtn.classList.contains(
          "completed"
        );

      // Marcar como completado
      commentBtn.classList.add(
        "completed"
      );

      localStorage.setItem(
        `post-${currentPost.id}-comment`,
        "true"
      );

      // Solo sumar una vez
      if (!wasCompleted) {

        await updateFirebaseInteraction(
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

      if (!currentPost) {
        return;
      }


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

        await navigator.clipboard.writeText(
          text
        );


        copyHashtagsBtn.textContent =
          "🌟 Hashtags copied";


        setTimeout(
          () => {

            copyHashtagsBtn.textContent =
              "📋 Copy hashtags";

          },
          1500
        );


      } catch (error) {

        console.error(
          "Couldn't load hashtags:",
          error
        );

      }

    }
  );

}


async function updateFirebaseInteraction(

  postId,

  action,

  change

) {

  const user = getCurrentUser();


  if (!user) {

    return null;

  }


  const interactionRef =
    ref(
      db,
      `posts/${postId}/${action}`
    );


  const userInteractionRef =
    ref(
      db,
      `posts/${postId}/interactions/${user.uid}/${action}`
    );


  try {


    const userSnapshot =
      await get(
        userInteractionRef
      );


    const userCompleted =
      userSnapshot.exists() &&
      userSnapshot.val() === true;




    if (
      change === 1 &&
      userCompleted
    ) {

      return null;

    }


    if (
      change === -1 &&
      !userCompleted
    ) {

      return null;

    }


    const snapshot =
      await get(
        interactionRef
      );


    let currentValue = 0;


    if (snapshot.exists()) {

      currentValue =
        Number(
          snapshot.val()
        );

    }


    let newValue =
      currentValue + change;


    if (newValue < 0) {

      newValue = 0;

    }



    const updates = {};


    updates[
      `posts/${postId}/${action}`
    ] = newValue;


    updates[
      `posts/${postId}/interactions/${user.uid}/${action}`
    ] = change === 1;


    await update(
      ref(db),
      updates
    );


    return newValue;


  } catch (error) {

    console.error(
      "Error saving interaction to Firebase:",
      error
    );

    return null;

  }

}


function watchPostStats(postId) {

  const postRef =
    ref(
      db,
      `posts/${postId}`
    );


  onValue(
    postRef,
    snapshot => {

      const data =
        snapshot.val() || {};


      const likes =
        Number(
          data.like || 0
        );


      const comments =
        Number(
          data.comment || 0
        );


      const shares =
        Number(
          data.share || 0
        );


      const saves =
        Number(
          data.save || 0
        );


      const reposts =
        Number(
          data.repost || 0
        );


      globalStats[postId] = {

        like: likes,

        comment: comments,

        share: shares,

        save: saves,

        repost: reposts

      };



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


      if (badge) {

        if (total < 250) {

          badge.textContent =
            "🔥 Needs engagement";

        } else {

          badge.textContent =
            "✨ Active";

        }

      }

      updateGlobalCounters();

    }
  );

}


function updateGlobalCounters() {

  const totalPosts =
    Array.isArray(window.posts)
      ? window.posts.length
      : 0;


  let likes = 0;

  let comments = 0;

  let shares = 0;

  let saves = 0;


  Object.values(
    globalStats
  ).forEach(stats => {

    likes +=
      Number(
        stats.like || 0
      );


    comments +=
      Number(
        stats.comment || 0
      );


    shares +=
      Number(
        stats.share || 0
      );


    saves +=
      Number(
        stats.save || 0
      );

  });


  const likeCounter =
    document.getElementById(
      "total-like"
    );


  const commentCounter =
    document.getElementById(
      "total-comment"
    );


  const shareCounter =
    document.getElementById(
      "total-share"
    );


  const saveCounter =
    document.getElementById(
      "total-save"
    );


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

}


updateGlobalCounters()