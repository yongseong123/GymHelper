async function login() {
  const id = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  if (!id || !password) {
    alert('아이디와 비밀번호를 입력하세요.');
    return;
  }

  try {
    const response = await fetch('/api/users/logIn', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id, password }),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      alert(data.message || '로그인에 실패했습니다.');
      return;
    }

    window.location.href = '/work';
  } catch (error) {
    console.error("Error during login:", error);
    alert('로그인 중 오류가 발생했습니다.');
  }
}
