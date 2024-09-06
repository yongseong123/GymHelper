async function logout() {
    console.log('logout');
    try {
        const response = await fetch('http://localhost:3000/api/users/logOut', {
            method: 'POST',
        });

        if (!response.ok) {
            const errorData = await response.json();
            return alert(errorData.message || '로그아웃에 실패했습니다.');
        }

        // 로그아웃 성공 시 페이지 리로딩
        window.location.reload();
    } catch (error) {
        alert(error.message);
    }
}
