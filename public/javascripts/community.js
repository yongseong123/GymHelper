const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => Array.from(document.querySelectorAll(selector));

const openAppModal = (modal, triggerEl = null) => {
  if (!modal) return;

  if (window.ModalManager) {
    window.ModalManager.open(modal, { triggerEl });
    return;
  }

  modal.classList.remove("hidden");
  modal.setAttribute("aria-hidden", "false");
};

const closeAppModal = (modal, options = {}) => {
  if (!modal) return;

  if (window.ModalManager) {
    window.ModalManager.close(modal, options);
    return;
  }

  modal.classList.add("hidden");
  modal.setAttribute("aria-hidden", "true");
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

const notify = (message, type = "info") => {
  if (window.GymFeedback?.notify) {
    window.GymFeedback.notify(message, { type });
    return;
  }

  alert(message);
};

const flash = (message, type = "info") => {
  if (window.GymFeedback?.flash) {
    window.GymFeedback.flash(message, type);
  }
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
  const postForm = $("#postForm");
  const postTitleInput = $("#postTitle");
  const postContentInput = $("#postContent");
  const editPostTitleInput = $("#editPostTitle");
  const editPostContentInput = $("#editPostContent");

  if (window.ModalManager) {
    window.ModalManager.register(postModal, {
      panelSelector: "[data-modal-panel]",
      closeSelectors: [".close"],
      initialFocusSelector: "#postTitle",
      onClose: () => {
        postForm?.reset();
      }
    });

    window.ModalManager.register(viewPostModal, {
      panelSelector: "[data-modal-panel]",
      closeSelectors: [".close-view"],
      initialFocusSelector: "#commentContent"
    });

    window.ModalManager.register(editPostModal, {
      panelSelector: "[data-modal-panel]",
      closeSelectors: [".close-edit"],
      initialFocusSelector: "#editPostTitle"
    });
  }

  let currentPostId = null;

  writePostBtn?.addEventListener("click", () => {
    postForm?.reset();
    openAppModal(postModal, writePostBtn);
  });

  submitPostBtn?.addEventListener("click", async () => {
    const postTitle = postTitleInput?.value.trim() || "";
    const postContent = postContentInput?.value.trim() || "";

    if (!postTitle || !postContent) {
      notify("제목과 내용을 입력해주세요.", "warning");
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
        flash("게시글이 등록되었습니다.", "success");
        location.reload();
      } else {
        notify("게시글 등록이 실패했습니다. 다시 시도해주세요.", "error");
      }
    } catch (error) {
      notify("게시글 등록 중 오류가 발생했습니다.", "error");
    }
  });

  const renderComments = (comments = []) => {
    if (!commentList) return;
    commentList.innerHTML = "";

    if (!Array.isArray(comments) || comments.length === 0) {
      const emptyState = document.createElement("div");
      emptyState.className = "rounded-box border border-dashed border-base-300 bg-base-200/45 p-4 text-sm text-base-content/70";
      emptyState.textContent = "아직 댓글이 없습니다. 첫 댓글을 남겨보세요.";
      commentList.appendChild(emptyState);
      return;
    }

    comments.forEach((comment) => {
      const commentItem = document.createElement("article");
      commentItem.className = "comment-item";

      const commentHead = document.createElement("div");
      commentHead.className = "comment-head";

      const commentMeta = document.createElement("div");
      commentMeta.className = "space-y-0.5";
      const commentAuthor = document.createElement("strong");
      commentAuthor.className = "comment-author";
      commentAuthor.textContent = comment.writer;
      const commentDate = document.createElement("p");
      commentDate.className = "comment-date";
      commentDate.textContent = formatDateTime(comment.regdate);

      commentMeta.append(commentAuthor, commentDate);

      const deleteButton = document.createElement("button");
      deleteButton.className = "comment-delete-btn";
      deleteButton.type = "button";
      deleteButton.dataset.id = String(comment.reply_id);
      deleteButton.textContent = "댓글 삭제";
      deleteButton.setAttribute("aria-label", "댓글 삭제");

      const commentBody = document.createElement("p");
      commentBody.className = "comment-body";
      commentBody.textContent = comment.content;

      commentHead.append(commentMeta, deleteButton);
      commentItem.append(commentHead, commentBody);
      commentList.appendChild(commentItem);

      deleteButton.addEventListener("click", () => {
        deleteComment(comment.reply_id);
      });
    });
  };

  const refreshComments = async (postId) => {
    if (!postId) return false;

    try {
      const response = await fetch(`/community/getPostAndComments/${postId}`);
      const data = await response.json();
      if (!data.success) return false;

      renderComments(data.comments);
      return true;
    } catch (error) {
      notify("댓글 목록을 불러오지 못했습니다.", "error");
      return false;
    }
  };

  const deleteComment = async (replyId) => {
    if (!confirm("정말로 댓글을 삭제하시겠습니까?")) return;

    try {
      const response = await fetch(`/community/deleteComment/${replyId}`, {
        method: "DELETE"
      });
      const data = await response.json();
      if (data.success) {
        notify("댓글이 삭제되었습니다.", "success");
        await refreshComments(currentPostId);
      } else {
        notify("댓글 삭제가 실패했습니다. 다시 시도해주세요.", "error");
      }
    } catch (error) {
      notify("댓글 삭제 중 오류가 발생했습니다.", "error");
    }
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
    if (commentContent) {
      commentContent.value = "";
    }

    if (commentList) commentList.innerHTML = "";

    await refreshComments(postId);

    openAppModal(viewPostModal, item);
  };

  $$(".post-item").forEach((item) => {
    item.addEventListener("click", () => openPost(item));
  });

  submitCommentBtn?.addEventListener("click", async () => {
    const content = commentContent.value.trim();

    if (!content) {
      notify("댓글 내용을 입력해주세요.", "warning");
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
        notify("댓글이 등록되었습니다.", "success");
        commentContent.value = "";
        await refreshComments(currentPostId);
      } else {
        notify("댓글 등록이 실패했습니다. 다시 시도해주세요.", "error");
      }
    } catch (error) {
      notify("댓글 등록 중 오류가 발생했습니다.", "error");
    }
  });

  editPostBtn?.addEventListener("click", () => {
    const currentTitle = $("#viewPostTitle").innerText;
    const currentContent = $("#viewPostContent").innerText;

    if (editPostTitleInput) {
      editPostTitleInput.value = currentTitle;
    }
    if (editPostContentInput) {
      editPostContentInput.value = currentContent;
    }

    closeAppModal(viewPostModal, { restoreFocus: false });

    window.setTimeout(() => {
      openAppModal(editPostModal, editPostBtn);
    }, 80);
  });

  deletePostBtn?.addEventListener("click", async () => {
    if (!confirm("정말로 게시글을 삭제하시겠습니까?")) return;

    try {
      const response = await fetch(`/community/delete/${currentPostId}`, {
        method: "DELETE"
      });
      const data = await response.json();
      if (data.success) {
        flash("게시글이 삭제되었습니다.", "success");
        location.reload();
      } else {
        notify("게시글 삭제가 실패했습니다. 다시 시도해주세요.", "error");
      }
    } catch (error) {
      notify("게시글 삭제 중 오류가 발생했습니다.", "error");
    }
  });

  saveEditPostBtn?.addEventListener("click", async () => {
    const updatedTitle = editPostTitleInput?.value.trim() || "";
    const updatedContent = editPostContentInput?.value.trim() || "";

    if (!updatedTitle || !updatedContent) {
      notify("제목과 내용을 입력해주세요.", "warning");
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
        notify("게시글이 수정되었습니다.", "success");

        const postItem = document.querySelector(`.post-item[data-id="${currentPostId}"]`);
        if (postItem) {
          postItem.setAttribute("data-title", updatedTitle);
          postItem.setAttribute("data-content", updatedContent);

          const titleCell = postItem.querySelector("td:nth-child(2) .line-clamp-1");
          if (titleCell) {
            titleCell.textContent = updatedTitle;
          } else {
            const fallbackTitleCell = postItem.querySelector("td:nth-child(2)");
            if (fallbackTitleCell) {
              fallbackTitleCell.textContent = updatedTitle;
            }
          }
        }

        const viewPostTitle = $("#viewPostTitle");
        const viewPostContent = $("#viewPostContent");
        if (viewPostTitle) {
          viewPostTitle.innerText = updatedTitle;
        }
        if (viewPostContent) {
          viewPostContent.innerText = updatedContent;
        }
      } else {
        notify("게시글 수정이 실패했습니다. 다시 시도해주세요.", "error");
      }
    } catch (error) {
      notify("게시글 수정 중 오류가 발생했습니다.", "error");
    }
  });
});

