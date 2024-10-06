document.addEventListener("DOMContentLoaded", () => {
    const writePostBtn = document.getElementById("writePostBtn");
    const postModal = document.getElementById("postModal");
    const closeModal = document.querySelector(".close");
    const submitPostBtn = document.getElementById("submitPostBtn");
    const viewPostModal = document.getElementById("viewPostModal");
    const closeViewModal = document.querySelector(".close-view");
    const editPostModal = document.getElementById("editPostModal");
    const closeEditModal = document.querySelector(".close-edit");
    const commentList = document.getElementById("commentList");
    const submitCommentBtn = document.getElementById("submitCommentBtn");
    const commentContent = document.getElementById("commentContent");

    let currentPostId = null; // 현재 선택된 게시글 ID 저장

    // 게시글 작성 모달 창 열기
    writePostBtn.addEventListener("click", () => {
        postModal.style.display = "block";
    });

    // 게시글 작성 모달 창 닫기
    closeModal.addEventListener("click", () => {
        postModal.style.display = "none";
    });

    // 게시글 보기 모달 창 닫기
    closeViewModal.addEventListener("click", () => {
        viewPostModal.style.display = "none";
    });

    // 게시글 수정 모달 창 닫기
    closeEditModal.addEventListener("click", () => {
        editPostModal.style.display = "none";
    });

    // 외부 영역 클릭 시 모달 창 닫기
    window.addEventListener("click", (event) => {
        if (event.target === postModal) {
            postModal.style.display = "none";
        } else if (event.target === viewPostModal) {
            viewPostModal.style.display = "none";
        } else if (event.target === editPostModal) {
            editPostModal.style.display = "none";
        }
    });

    // 게시글 등록 버튼 클릭 시
    submitPostBtn.addEventListener("click", () => {
        const postTitle = document.getElementById("postTitle").value;
        const postContent = document.getElementById("postContent").value;

        if (postTitle.trim() === "" || postContent.trim() === "") {
            alert("제목과 내용을 입력해주세요.");
            return;
        }

        // 게시글 데이터를 서버로 전송
        fetch("/community/create", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                title: postTitle,
                content: postContent,
            }),
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert("게시글이 성공적으로 등록되었습니다.");
                location.reload(); // 페이지 새로고침
            } else {
                alert("게시글 등록에 실패했습니다. 다시 시도해주세요.");
            }
        })
        .catch(error => {
            console.error("Error:", error);
        });
    });

    // 댓글 시간 포맷 변환 함수
    const formatDateTime = (dateTime) => {
        const date = new Date(dateTime);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day}-${hours}:${minutes}`;
    };

    // 게시글 리스트 클릭 시 본문 보기 모달 창 열기
    const postItems = document.querySelectorAll(".post-item");
    postItems.forEach(item => {
        item.addEventListener("click", () => {
            const postId = item.getAttribute("data-id");
            const postTitle = item.getAttribute("data-title");
            const postContent = item.getAttribute("data-content");
            const postDate = item.querySelector("td:nth-child(3)").innerText;
            const postWriter = item.querySelector("td:nth-child(4)").innerText;

            currentPostId = postId; // 현재 선택된 게시글 ID 저장

            // 모달 창에 데이터 설정
            document.getElementById("viewPostTitle").innerText = postTitle;
            document.getElementById("viewPostContent").innerText = postContent;
            document.getElementById("viewPostDate").innerText = postDate;
            document.getElementById("viewPostWriter").innerText = postWriter;

            // 댓글 목록 초기화 및 가져오기
            commentList.innerHTML = ""; // 기존 댓글 목록 초기화
            fetch(`/community/getPostAndComments/${postId}`)
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        data.comments.forEach(comment => {
                            const commentItem = document.createElement("div");
                            commentItem.className = "comment-item";
                            commentItem.innerHTML = `
                                <div class="comment-content">
                                    <strong>${comment.writer}</strong>: ${comment.content}
                                    <div class="comment-date">${formatDateTime(comment.regdate)}</div>
                                </div>
                                <button class="comment-delete-btn" data-id="${comment.reply_id}">삭제</button>
                            `;
                            commentList.appendChild(commentItem);

                            // 댓글 삭제 버튼 이벤트 연결
                            commentItem.querySelector(".comment-delete-btn").addEventListener("click", () => {
                                deleteComment(comment.reply_id);
                            });
                        });
                    }
                })
                .catch(error => {
                    console.error("Error:", error);
                });

            // 게시글 보기 모달 창 표시
            viewPostModal.style.display = "block";
        });
    });

    // 댓글 작성 버튼 클릭 시
    submitCommentBtn.addEventListener("click", () => {
        const content = commentContent.value;

        if (content.trim() === "") {
            alert("댓글 내용을 입력해주세요.");
            return;
        }

        // 댓글 작성 데이터 서버로 전송
        fetch(`/community/addComment`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                board_id: currentPostId,
                content: content,
            }),
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert("댓글이 성공적으로 등록되었습니다.");
                location.reload(); // 페이지 새로고침
            } else {
                alert("댓글 등록에 실패했습니다. 다시 시도해주세요.");
            }
        })
        .catch(error => {
            console.error("Error:", error);
        });
    });

    // 댓글 삭제 함수
    const deleteComment = (replyId) => {
        if (confirm("정말로 이 댓글을 삭제하시겠습니까?")) {
            fetch(`/community/deleteComment/${replyId}`, {
                method: "DELETE",
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert("댓글이 성공적으로 삭제되었습니다.");
                    location.reload(); // 페이지 새로고침
                } else {
                    alert("댓글 삭제에 실패했습니다. 다시 시도해주세요.");
                }
            })
            .catch(error => {
                console.error("Error:", error);
            });
        }
    };

    // 게시글 수정 버튼 클릭 시 수정 모달 창 열기
    const editPostBtn = document.getElementById("editPostBtn");
    editPostBtn.addEventListener("click", () => {
        const currentTitle = document.getElementById("viewPostTitle").innerText;
        const currentContent = document.getElementById("viewPostContent").innerText;

        // 현재 게시글 제목 및 내용으로 수정 모달 창을 채우기
        document.getElementById("editPostTitle").value = currentTitle;
        document.getElementById("editPostContent").value = currentContent;

        // 게시글 보기 모달 닫기 및 수정 모달 열기
        viewPostModal.style.display = "none";
        editPostModal.style.display = "block";
    });

    // 게시글 삭제 버튼 클릭 시
    const deletePostBtn = document.getElementById("deletePostBtn");
    deletePostBtn.addEventListener("click", () => {
        if (confirm("정말로 이 게시글을 삭제하시겠습니까?")) {
            fetch(`/community/delete/${currentPostId}`, {
                method: "DELETE",
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert("게시글이 성공적으로 삭제되었습니다.");
                    location.reload(); // 페이지 새로고침
                } else {
                    alert("게시글 삭제에 실패했습니다. 다시 시도해주세요.");
                }
            })
            .catch(error => {
                console.error("Error:", error);
            });
        }
    });

    // 게시글 수정 저장 버튼 클릭 시
    const saveEditPostBtn = document.getElementById("saveEditPostBtn");
    saveEditPostBtn.addEventListener("click", () => {
        const updatedTitle = document.getElementById("editPostTitle").value;
        const updatedContent = document.getElementById("editPostContent").value;

        if (updatedTitle.trim() === "" || updatedContent.trim() === "") {
            alert("제목과 내용을 입력해주세요.");
            return;
        }

        // 게시글 수정 데이터 전송
        fetch(`/community/edit/${currentPostId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                title: updatedTitle,
                content: updatedContent,
            }),
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert("게시글이 성공적으로 수정되었습니다.");
                location.reload(); // 페이지 새로고침
            } else {
                alert("게시글 수정에 실패했습니다. 다시 시도해주세요.");
            }
        })
        .catch(error => {
            console.error("Error:", error);
        });
    });
});
