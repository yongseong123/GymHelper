function goBack() {
    window.history.back();
}

async function signUp() {
    var id = document.getElementById('id').value;
    var username = document.getElementById('username').value;
    var password = document.getElementById('password').value;
    var checkedPassword = document.getElementById('checkedPassword').value;
    
    // 학번인지 확인
    if (id.length !== 10) {
        alert('학번을 확인해주세요.')
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
                id,
                password,
                checkedPassword,
                username
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
