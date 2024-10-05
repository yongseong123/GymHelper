// public/javascripts/work.js

document.addEventListener("DOMContentLoaded", () => {
  // 로그아웃 버튼 이벤트 리스너
  const logoutButton = document.getElementById("logoutBtn");
  if (logoutButton) {
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
  }

  // 위쪽 그래프 초기화
  const topCtx = document.getElementById('topGraphCanvas').getContext('2d');
  new Chart(topCtx, {
    type: 'bar',
    data: {
      labels: ['월', '화', '수', '목', '금', '토', '일'],
      datasets: [{
        label: '운동 횟수',
        data: [5, 6, 7, 8, 3, 2, 1],
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });

  // 아래쪽 그래프 초기화
  const bottomCtx = document.getElementById('bottomGraphCanvas').getContext('2d');
  new Chart(bottomCtx, {
    type: 'line',
    data: {
      labels: ['월', '화', '수', '목', '금', '토', '일'],
      datasets: [{
        label: '운동 강도',
        data: [3, 4, 5, 6, 2, 3, 4],
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 2,
        fill: false
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });

  // FullCalendar 캘린더 초기화
  const calendarEl = document.getElementById('calendar');
  if (calendarEl) {
    const calendar = new FullCalendar.Calendar(calendarEl, {
      initialView: 'dayGridMonth', // 기본 보기: 월별 보기
      locale: 'ko', // 한국어 로케일 설정
      headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,dayGridWeek,dayGridDay'
      },
      editable: true, // 드래그&드롭 수정 가능
      events: [
        {
          title: '운동1',
          start: '2024-10-01'
        },
        {
          title: '운동2',
          start: '2024-10-07',
          end: '2024-10-10'
        },
        {
          title: '운동3',
          start: '2024-10-09T16:00:00'
        }
      ]
    });

    // 캘린더 렌더링
    calendar.render();
  }
});
