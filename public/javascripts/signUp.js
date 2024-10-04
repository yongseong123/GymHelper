function goBack() {
    window.history.back();
}

async function signUp() {
  var id = document.getElementById('id').value;
  var username = document.getElementById('username').value;
  var password = document.getElementById('password').value;
  var checkedPassword = document.getElementById('checkedPassword').value;

  // ID 유효성 검사: 영문자와 숫자로만 구성되었는지 확인
  var idRegex = /^[a-zA-Z0-9]+$/;
  if (!idRegex.test(id)) {
      alert('ID는 영문자와 숫자만 포함해야 합니다.');
      return;
  }

  // ID 길이 검사 (10자 제한은 필요시 수정 가능)
  if (id.length < 5 || id.length > 20) {
      alert('ID는 5자 이상 20자 이하이어야 합니다.');
      return;
  }

  // 비밀번호 확인
  if (password !== checkedPassword) {
      alert('비밀번호와 비밀번호 확인이 일치하지 않습니다.');
      return;
  }

  try {
      const response = await fetch('http://localhost:3000/api/users/signUp', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify({
              id, // id 추가
              username,
              password,
              checkedPassword
          }),
      });

      if (!response.ok) {
          const errorData = await response.json();
          return alert(errorData.message || '회원가입에 실패했습니다.');
      }

      alert('회원가입이 완료되었습니다.');
      window.location.href = '/logIn'; // 로그인 페이지 URL로 변경
  } catch (error) {
      alert(error.message);
  }
}