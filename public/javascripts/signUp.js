async function signUp() {
  const id = document.getElementById("id").value;
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;
  const checkedPassword = document.getElementById("checkedPassword").value;

  const idRegex = /^[a-zA-Z0-9]+$/;
  if (!idRegex.test(id)) {
    alert("ID는 영문과 숫자만 가능합니다.");
    return;
  }

  if (id.length < 5 || id.length > 20) {
    alert("ID는 5자 이상 20자 이하입니다.");
    return;
  }

  if (password !== checkedPassword) {
    alert("비밀번호가 일치하지 않습니다.");
    return;
  }

  try {
    await window.GymApi.requestJson("/api/users/signUp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id,
        username,
        password,
        checkedPassword,
      }),
    });

    alert("회원가입이 완료되었습니다.");
    window.location.href = "/logIn";
  } catch (error) {
    alert(error.message || "회원가입 중 오류가 발생했습니다.");
  }
}
