const postJson = async (url, payload) => {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || '요청이 실패했습니다.');
  }
  return data;
};

async function accountSet() {
  try {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    await postJson('/api/users/modifyUserInfo', {
      username,
      password,
      confirmPassword
    });

    window.location.href = '/';
  } catch (error) {
    alert(error.message || '설정에 실패했습니다.');
  }
}

async function deleteAccount() {
  if (!confirm('정말로 탈퇴하시겠습니까?')) return;

  try {
    await postJson('/api/users/deleteUser', {});
    alert('회원 탈퇴가 완료되었습니다.');
    window.location.href = '/';
  } catch (error) {
    alert(error.message || '회원 탈퇴에 실패했습니다.');
  }
}

const logoutButton = document.getElementById("logoutBtn");
if (logoutButton) {
  logoutButton.addEventListener("click", async () => {
    try {
      const response = await fetch('/api/users/logOut', {
        method: 'POST',
        credentials: 'include'
      });

      if (response.ok) {
        alert('로그아웃 성공!');
        window.location.href = '/logIn';
      } else {
        alert('로그아웃에 실패했습니다.');
      }
    } catch (error) {
      console.error("Logout Error: ", error);
      alert('로그아웃 중 오류가 발생했습니다.');
    }
  });
}

const logo = document.querySelector(".logo");
if (logo) {
  logo.addEventListener("click", () => {
    window.location.href = "/work";
  });
}
