async function login() {
  const id = document.getElementById('username').value; // id로 변경
  const password = document.getElementById('password').value;

  // ID와 비밀번호 유효성 검사
  if (!id || !password) {
    alert('ID와 비밀번호를 입력하세요.');
    return;
  }

  try {
    const response = await fetch('http://localhost:3000/api/users/logIn', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id, password }), // id와 password를 전송
    });

    if (!response.ok) {
      const errorData = await response.json();
      return alert(errorData.message || '로그인에 실패했습니다.');
    }

    // 로그인 성공 시 메인 페이지로 이동
    window.location.href = '/work'; // 로그인 성공 시 /work 경로로 이동
  } catch (error) {
    console.error("Error during login:", error);
    alert('로그인 도중 오류가 발생했습니다.');
  }
}