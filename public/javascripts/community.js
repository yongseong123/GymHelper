const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => Array.from(document.querySelectorAll(selector));

const showModal = (modal) => {
  if (modal) modal.style.display = "block";
};

const hideModal = (modal) => {
  if (modal) modal.style.display = "none";
};

const formatDateTime = (dateTime) => {
  const date = new Date(dateTime);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}`;
};

document.addEventListener("DOMContentLoaded", () => {
  const writePostBtn = $("#writePostBtn");
  const postModal = $("#postModal");
  const submitPostBtn = $("#submitPostBtn");
  const viewPostModal = $("#viewPostModal");
  const editPostModal = $("#editPostModal");
  const commentList = $("#commentList");
  const submitCommentBtn = $("#submitCommentBtn");
  const commentContent = $("#commentContent");
  const editPostBtn = $("#editPostBtn");
  const deletePostBtn = $("#deletePostBtn");
  const saveEditPostBtn = $("#saveEditPostBtn");

  let currentPostId = null;

  const closeButtons = [
    { btn: $(".close"), modal: postModal },
    { btn: $(".close-view"), modal: viewPostModal },
    { btn: $(".close-edit"), modal: editPostModal }
  ];

  closeButtons.forEach(({ btn, modal }) => {
    btn?.addEventListener("click", () => hideModal(modal));
  });

  window.addEventListener("click", (event) => {
    if (event.target === postModal) hideModal(postModal);
    if (event.target === viewPostModal) hideModal(viewPostModal);
    if (event.target === editPostModal) hideModal(editPostModal);
  });

  writePostBtn?.addEventListener("click", () => showModal(postModal));

  submitPostBtn?.addEventListener("click", async () => {
    const postTitle = $("#postTitle").value.trim();
    const postContent = $("#postContent").value.trim();

    if (!postTitle || !postContent) {
      alert("제목과 내용을 입력해주세요.");
      return;
    }

    try {
      const response = await fetch("/community/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: postTitle, content: postContent })
      });

      const data = await response.json();
      if (data.success) {
        alert("게시글이 성공적으로 등록되었습니다.");
        location.reload();
      } else {
        alert("게시글 등록이 실패했습니다. 다시 시도해주세요.");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  });

  const renderComments = (comments = []) => {
    if (!commentList) return;
    commentList.innerHTML = "";

    comments.forEach(comment => {
      const commentItem = document.createElement("div");
      commentItem.className = "comment-item grid grid-cols-[1fr_auto] gap-3 rounded-xl border border-zinc-200 bg-white p-3";
      commentItem.innerHTML = `
        <div class="comment-content text-sm text-zinc-700">
          <strong class="block text-zinc-900">${comment.writer}</strong>
          <div class="my-1 whitespace-pre-wrap break-words">${comment.content}</div>
          <div class="comment-date text-xs text-zinc-400">${formatDateTime(comment.regdate)}</div>
        </div>
        <button class="comment-delete-btn h-fit rounded-lg bg-rose-100 px-3 py-1.5 text-xs font-semibold text-rose-600 transition hover:bg-rose-200" data-id="${comment.reply_id}">삭제</button>
      `;
      commentList.appendChild(commentItem);

      commentItem.querySelector(".comment-delete-btn").addEventListener("click", () => {
        deleteComment(comment.reply_id);
      });
    });
  };

  const openPost = async (item) => {
    const postId = item.getAttribute("data-id");
    const postTitle = item.getAttribute("data-title");
    const postContent = item.getAttribute("data-content");
    const postDate = item.querySelector("td:nth-child(3)").innerText;
    const postWriter = item.querySelector("td:nth-child(4)").innerText;

    currentPostId = postId;

    $("#viewPostTitle").innerText = postTitle;
    $("#viewPostContent").innerText = postContent;
    $("#viewPostDate").innerText = postDate;
    $("#viewPostWriter").innerText = postWriter;

    if (commentList) commentList.innerHTML = "";

    try {
      const response = await fetch(`/community/getPostAndComments/${postId}`);
      const data = await response.json();
      if (data.success) {
        renderComments(data.comments);
      }
    } catch (error) {
      console.error("Error:", error);
    }

    showModal(viewPostModal);
  };

  $$(".post-item").forEach(item => {
    item.addEventListener("click", () => openPost(item));
  });

  submitCommentBtn?.addEventListener("click", async () => {
    const content = commentContent.value.trim();

    if (!content) {
      alert("댓글 내용을 입력해주세요.");
      return;
    }

    try {
      const response = await fetch(`/community/addComment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ board_id: currentPostId, content })
      });

      const data = await response.json();
      if (data.success) {
        alert("댓글이 성공적으로 등록되었습니다.");
        location.reload();
      } else {
        alert("댓글 등록이 실패했습니다. 다시 시도해주세요.");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  });

  const deleteComment = async (replyId) => {
    if (!confirm("정말로 댓글을 삭제하시겠습니까?")) return;

    try {
      const response = await fetch(`/community/deleteComment/${replyId}`, {
        method: "DELETE"
      });
      const data = await response.json();
      if (data.success) {
        alert("댓글이 성공적으로 삭제되었습니다.");
        location.reload();
      } else {
        alert("댓글 삭제가 실패했습니다. 다시 시도해주세요.");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  editPostBtn?.addEventListener("click", () => {
    const currentTitle = $("#viewPostTitle").innerText;
    const currentContent = $("#viewPostContent").innerText;

    $("#editPostTitle").value = currentTitle;
    $("#editPostContent").value = currentContent;

    hideModal(viewPostModal);
    showModal(editPostModal);
  });

  deletePostBtn?.addEventListener("click", async () => {
    if (!confirm("정말로 게시글을 삭제하시겠습니까?")) return;

    try {
      const response = await fetch(`/community/delete/${currentPostId}`, {
        method: "DELETE"
      });
      const data = await response.json();
      if (data.success) {
        alert("게시글이 성공적으로 삭제되었습니다.");
        location.reload();
      } else {
        alert("게시글 삭제가 실패했습니다. 다시 시도해주세요.");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  });

  saveEditPostBtn?.addEventListener("click", async () => {
    const updatedTitle = $("#editPostTitle").value.trim();
    const updatedContent = $("#editPostContent").value.trim();

    if (!updatedTitle || !updatedContent) {
      alert("제목과 내용을 입력해주세요.");
      return;
    }

    try {
      const response = await fetch(`/community/edit/${currentPostId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: updatedTitle, content: updatedContent })
      });
      const data = await response.json();
      if (data.success) {
        alert("게시글이 성공적으로 수정되었습니다.");
        location.reload();
      } else {
        alert("게시글 수정이 실패했습니다. 다시 시도해주세요.");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  });
});
