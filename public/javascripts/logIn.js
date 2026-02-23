async function login() {
  const id = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  if (!id || !password) {
    alert("아이디와 비밀번호를 입력하세요.");
    return;
  }

  try {
    await window.GymApi.requestJson("/api/users/logIn", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id, password }),
    });

    window.location.href = "/work";
  } catch (error) {
    alert(error.message || "로그인 중 오류가 발생했습니다.");
  }
}
