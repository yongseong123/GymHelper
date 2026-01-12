async function logout() {
  try {
    const response = await fetch('/api/users/logOut', {
      method: 'POST',
      credentials: 'include'
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      alert(data.message || '로그아웃에 실패했습니다.');
      return;
    }

    window.location.reload();
  } catch (error) {
    alert(error.message || '로그아웃 중 오류가 발생했습니다.');
  }
}
