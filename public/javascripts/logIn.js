async function login() {
    //입력한 값 가져오기
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
      //서버에 로그인 요청 보내기
      const response = await fetch('http://localhost:3000/api/users/logIn', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        //이름과 비밀번호를 json 형식으로 변환하여 전송
        body: JSON.stringify({
          username,
          password
        }),
      });
      //응답이 성공적이지 않으면 오류 메시지 표시
    if (!response.ok) {
        const errorData = await response;
        return alert(errorData.message || '로그인에 실패했습니다.');
    }
      //로그인 성공 시 페이지 이동
      window.location.href = '/'; 
      //에러처리
    } catch (error) {
      alert(error.message);
    }
  }