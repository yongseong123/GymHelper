const postJson = async (url, payload) => {
  return window.GymApi.requestJson(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
};

async function accountSet() {
  try {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    await postJson("/api/users/modifyUserInfo", {
      username,
      password,
      confirmPassword,
    });

    window.location.href = "/";
  } catch (error) {
    alert(error.message || "설정에 실패했습니다.");
  }
}

async function deleteAccount() {
  if (!confirm("정말로 탈퇴하시겠습니까?")) return;

  try {
    await postJson("/api/users/deleteUser", {});
    alert("회원 탈퇴가 완료되었습니다.");
    window.location.href = "/";
  } catch (error) {
    alert(error.message || "회원 탈퇴에 실패했습니다.");
  }
}
