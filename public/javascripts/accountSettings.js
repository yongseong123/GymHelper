// accountSettings.js

async function accountSet() {
  try {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    const response = await fetch('http://localhost:3000/api/users/modifyUserInfo', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username,
        password,
        confirmPassword
      }),
    });
    if (!response.ok) {
      const errorData = await response;
      return alert(errorData.message || '수정에 실패했습니다.');
    }
    window.location.href = '/'; 
  } catch (error) {
    alert(error.message);
  }
}

async function deleteAccount() {
  if (!confirm('정말로 탈퇴하시겠습니까?')) return;
  try {
    const response = await fetch('http://localhost:3000/api/users/deleteUser', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ }),
    });
    if (!response.ok) {
      const errorData = await response;
      return alert(errorData.message || '회원탈퇴에 실패했습니다.');
    }
    alert('회원탈퇴가 완료되었습니다.');
    window.location.href = '/';
  } catch (error) {
    alert(error.message);
  }
}

// 로그아웃 버튼 이벤트 리스너 추가
const logoutButton = document.getElementById("logoutBtn");
if (logoutButton) {
  logoutButton.addEventListener("click", async () => {
    try {
      const response = await fetch('http://localhost:3000/api/users/logOut', {
        method: 'POST',
        credentials: 'include' // 세션 쿠키를 포함하여 로그아웃 요청
      });

      if (response.ok) {
        alert('로그아웃 성공!');
        window.location.href = '/logIn'; // 로그아웃 후 로그인 페이지로 이동
      } else {
        alert('로그아웃에 실패했습니다.');
      }
    } catch (error) {
      console.error("Logout Error: ", error);
      alert('로그아웃 도중 오류가 발생했습니다.');
    }
  });
}

// 로고 클릭 시 메인 페이지로 이동
const logo = document.querySelector(".logo");
if (logo) {
  logo.addEventListener("click", () => {
    window.location.href = "/work";
  });
}
