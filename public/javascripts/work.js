// public/javascripts/work.js
document.addEventListener("DOMContentLoaded", () => {
    const logoutButton = document.getElementById("logoutBtn");
  
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
  });
  