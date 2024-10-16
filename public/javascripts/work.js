document.addEventListener("DOMContentLoaded", async () => {
  const calendarEl = document.getElementById('calendar');
  const workoutDetailsModal = document.getElementById('workoutDetailsModal'); // 모달 창 요소
  const workoutDetailsList = document.getElementById('workoutDetailsList'); // 운동 기록을 표시할 테이블 리스트 요소
  const logoutButton = document.getElementById("logoutBtn");

  if (logoutButton) {
    logoutButton.addEventListener("click", async () => {
      try {
        const response = await fetch('/api/users/logOut', {
          method: 'POST',
          credentials: 'include'
        });

        if (response.ok) {
          alert('로그아웃 성공!');
          window.location.href = '/logIn';
        } else {
          alert('로그아웃에 실패했습니다.');
        }
      } catch (error) {
        console.error("Logout Error: ", error);
        alert('로그아웃 도중 오류가 발생했습니다.');
      }
    });
  }

  // 위쪽 그래프 초기화 - "월간 부위별 운동 통계"
  const topCtx = document.getElementById('topGraphCanvas').getContext('2d');
  const monthSelector = document.getElementById('monthSelector');
  
  // 전역 차트 객체 변수 선언
  let topChart;

  // API를 통해 월간 운동 통계 데이터 불러오기
  async function loadMonthlyStats(year, month) {
    try {
      const response = await fetch('/api/works/monthlyStats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ year, month }),
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && Array.isArray(data.workoutStats)) {
          const labels = ["가슴", "등", "어깨", "이두", "삼두", "하체", "복근", "유산소"];
          const workoutCounts = labels.map(label => {
            const stat = data.workoutStats.find(stat => stat.work_part === label);
            return stat ? stat.count : 0;
          });

          // 기존 차트가 있으면 업데이트, 없으면 새로 생성
          if (topChart) {
            topChart.data.datasets[0].data = workoutCounts;
            topChart.update();
          } else {
            // 차트 생성
            topChart = new Chart(topCtx, {
              type: 'bar',
              data: {
                labels: labels,
                datasets: [{
                  label: '운동 횟수',
                  data: workoutCounts,
                  backgroundColor: 'rgba(75, 192, 192, 0.5)',
                  borderColor: 'rgba(75, 192, 192, 1)',
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
                },
                plugins: {
                  title: {
                    display: true,
                    text: `월간 부위별 운동 통계`
                  }
                }
              }
            });
          }
        }
      } else {
        console.error("월간 운동 통계 조회 실패:", response.statusText);
      }
    } catch (error) {
      console.error("월간 운동 통계 로드 오류:", error);
    }
  }

  // 초기 현재 년, 월 기준으로 그래프 로드
  const today = new Date();
  const initialYear = today.getFullYear();
  const initialMonth = today.getMonth() + 1; // 0부터 시작하므로 +1
  await loadMonthlyStats(initialYear, initialMonth);

  // 월 선택 시 그래프 업데이트
  monthSelector.addEventListener("change", async (event) => {
    const selectedMonth = event.target.value;
    await loadMonthlyStats(initialYear, selectedMonth);
  });

  // 아래쪽 그래프 초기화 및 수정된 코드
  const bottomCtx = document.getElementById('bottomGraphCanvas').getContext('2d');
  let bottomChart;

  // 각 부위에 맞는 타겟 설정
  const partTargets = {
    "가슴": ["인클라인", "플랫", "디클라인"],
    "등": ["광배", "승모"],
    "어깨": ["전면", "측면", "후면"],
    "하체": ["앞", "뒤"]
  };

  // 버튼 클릭 시 서버에서 데이터를 받아와 그래프를 업데이트하는 함수
  async function loadPartStats(part) {
    try {
      const response = await fetch('/api/works/partStats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ part }),
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && Array.isArray(data.stats)) {
          const targetLabels = partTargets[part];
          const workoutCounts = targetLabels.map(target => {
            const stat = data.stats.find(stat => stat.work_target === target);
            return stat ? stat.count : 0;
          });

          if (bottomChart) {
            bottomChart.data.labels = targetLabels;
            bottomChart.data.datasets[0].data = workoutCounts;
            bottomChart.update();
          } else {
            bottomChart = new Chart(bottomCtx, {
              type: 'line',
              data: {
                labels: targetLabels,
                datasets: [{
                  label: `타겟별 운동 통계`,
                  data: workoutCounts,
                  backgroundColor: 'rgba(54, 162, 235, 0.2)',
                  borderColor: 'rgba(54, 162, 235, 1)',
                  borderWidth: 1,
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
          }
        }
      } else {
        console.error("데이터를 불러오지 못했습니다.", response.statusText);
      }
    } catch (error) {
      console.error("데이터 로드 중 오류:", error);
    }
  }

  // 버튼 클릭 이벤트 핸들러 추가
  document.getElementById("chestButton").addEventListener("click", () => loadPartStats("가슴"));
  document.getElementById("backButton").addEventListener("click", () => loadPartStats("등"));
  document.getElementById("shoulderButton").addEventListener("click", () => loadPartStats("어깨"));
  document.getElementById("legButton").addEventListener("click", () => loadPartStats("하체"));

  // 기본적으로 페이지 로드 시 가슴 부위 데이터를 로드
  loadPartStats("가슴");

  if (calendarEl) {
    let calendarEvents = [];

    try {
      // 전체 운동 기록 조회 API 호출
      const response = await fetch('/api/works/allWorkouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && Array.isArray(data.workouts)) {
          const uniqueDates = new Set(data.workouts.map(workout => workout.work_day)); // 중복 날짜 제거
          calendarEvents = Array.from(uniqueDates).map((date) => ({
            title: "운동 기록", // 텍스트 없이 점만 표시
            start: date,
            color: 'blue'
          }));
        }
      } else {
        console.error("전체 운동 기록 조회에 실패했습니다:", response.statusText);
      }
    } catch (error) {
      console.error("전체 운동 기록 로드 오류:", error);
    }

    // FullCalendar 초기화
    const calendar = new FullCalendar.Calendar(calendarEl, {
      initialView: 'dayGridMonth',
      locale: 'ko',
      headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,dayGridWeek,dayGridDay'
      },
      editable: true,
      displayEventTime: false, // 이벤트 시간 숨기기
      events: calendarEvents,
      eventClick: async function(info) {
        console.log("이벤트 클릭됨:", info.event); // 클릭 이벤트 확인용 로그
        const clickedDate = info.event.startStr;
        
        await loadWorkoutsForDate(clickedDate);
        workoutDetailsModal.style.display = 'block'; // 모달 창 열기
      },
      eventMouseEnter: function(info) {
        info.el.style.cursor = 'pointer'; // 마우스를 올렸을 때 포인터 커서 표시
      }
    });

    calendar.render();
  }

  // 특정 날짜의 운동 기록 로드 함수
  async function loadWorkoutsForDate(date) {
    workoutDetailsList.innerHTML = ''; // 기존 리스트 초기화

    try {
      const formattedDate = formatDate(date);
      const response = await fetch('/api/works/myWorkouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: formattedDate })
      });

      const data = await response.json();
      if (data.success) {
        if (data.workouts.length > 0) {
          data.workouts.forEach(workout => {
            const row = document.createElement('tr');
            row.innerHTML = `
              <td>${workout.work_name}</td>
              <td>${workout.work_weight || '-'}</td>
              <td>${workout.work_count}</td>
              <td>${workout.work_part}</td>
              <td>${workout.work_target || '-'}</td>
              <td>${workout.work_type || '-'}</td>
              <td>${formatDate(workout.work_day)}</td>
            `;
            workoutDetailsList.appendChild(row);
          });
        } else {
          const emptyRow = document.createElement('tr');
          emptyRow.innerHTML = `<td colspan="7">해당 날짜에 운동 기록이 없습니다.</td>`;
          workoutDetailsList.appendChild(emptyRow);
        }
      } else {
        console.error("해당 날짜의 운동 기록 조회에 실패했습니다.");
      }
    } catch (error) {
      console.error("해당 날짜의 운동 기록 로드 오류:", error);
    }
  }

  // 날짜 포맷 변경 함수 (YYYY-MM-DD 형식으로 변환)
  function formatDate(dateStr) {
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  const closeModalBtn = document.getElementById('closeModalBtn');
  if (closeModalBtn) {
    closeModalBtn.addEventListener('click', () => {
      workoutDetailsModal.style.display = 'none'; // 모달 창 닫기
    });
  }
});

// 운동 기록 및 모아보기 기능 JavaScript
document.addEventListener("DOMContentLoaded", () => {
  const addWorkoutBtn = document.getElementById("addWorkoutBtn");
  const myWorkoutsBtn = document.getElementById("myWorkoutsBtn");
  const workoutModal = document.getElementById("workoutModal");
  const myWorkoutsModal = document.getElementById("myWorkoutsModal");
  const closeModal = document.querySelectorAll(".close");
  const submitWorkoutBtn = document.getElementById("submitWorkoutBtn");
  const filterDateBtn = document.getElementById("filterDateBtn");
  const myWorkoutsList = document.getElementById("myWorkoutsList");

  // 운동 부위 선택에 따라 운동 타겟 옵션 설정
  const workPartSelect = document.getElementById("work_part");
  const workTargetSelect = document.getElementById("work_target");
  workPartSelect.addEventListener("change", () => {
      const part = workPartSelect.value;
      workTargetSelect.innerHTML = "<option value=''>선택해주세요</option>"; // 초기화

      let options = [];
      switch (part) {
          case "가슴":
              options = ["인클라인", "플랫", "디클라인"];
              break;
          case "등":
              options = ["광배", "승모"];
              break;
          case "어깨":
              options = ["전면", "측면", "후면"];
              break;
          case "하체":
              options = ["앞", "뒤"];
              break;
      }

      options.forEach(option => {
          const optElement = document.createElement("option");
          optElement.value = option;
          optElement.textContent = option;
          workTargetSelect.appendChild(optElement);
      });
  });

  // 운동 기록 모달 열기
  addWorkoutBtn.addEventListener("click", () => {
      workoutModal.style.display = "block";
  });

  // 내 운동 모아보기 모달 열기
  myWorkoutsBtn.addEventListener("click", async () => {
      myWorkoutsModal.style.display = "block";
      await loadMyWorkouts(); // 현재 날짜 기준으로 운동 기록 로드
  });

  // 모달 닫기
  closeModal.forEach((btn) => {
      btn.addEventListener("click", () => {
          workoutModal.style.display = "none";
          myWorkoutsModal.style.display = "none";
      });
  });

  // 모달 외부 클릭 시 닫기
  window.addEventListener("click", (event) => {
      if (event.target === workoutModal) {
          workoutModal.style.display = "none";
      }
      if (event.target === myWorkoutsModal) {
          myWorkoutsModal.style.display = "none";
      }
  });

  // 운동 기록 등록 버튼 클릭 시
  submitWorkoutBtn.addEventListener("click", async () => {
      const work_name = document.getElementById("work_name").value;
      const work_weight = document.getElementById("work_weight").value;
      const work_count = document.getElementById("work_count").value;
      const work_part = document.getElementById("work_part").value;
      const work_target = document.getElementById("work_target").value;
      const work_type = document.getElementById("work_type").value;
      const work_day = document.getElementById("work_day").value;

      // 필수 값 체크
      if (!work_name || !work_count || !work_part || !work_day) {
          alert("필수 항목을 입력해주세요.");
          return;
      }

      try {
          const response = await fetch('/api/works/add', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                  work_name, work_weight, work_count, work_part, work_target, work_type, work_day
              })
          });

          if (response.ok) {
              alert('운동 기록이 성공적으로 추가되었습니다.');
              workoutModal.style.display = "none"; // 모달 닫기
              location.reload(); // 페이지 새로고침
          } else {
              alert('운동 기록 추가에 실패했습니다. 다시 시도해주세요.');
          }
      } catch (error) {
          console.error("Error:", error);
      }
  });

  // 날짜 필터 버튼 클릭 시 운동 기록 로드
  filterDateBtn.addEventListener("click", async () => {
      const selectedDate = document.getElementById("filterDate").value;
      if (selectedDate) {
          await loadMyWorkouts(selectedDate);
      }
  });

  // 내 운동 기록 로드 함수
  async function loadMyWorkouts(date = null) {
      myWorkoutsList.innerHTML = ""; // 기존 리스트 초기화

      try {
          const response = await fetch('/api/works/myWorkouts', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ date }) // 선택된 날짜를 전송 (없으면 null)
          });

          const data = await response.json();
          if (data.success) {
              data.workouts.forEach(workout => {
                  const row = document.createElement("tr");

                  row.innerHTML = `
                      <td>${workout.work_num}</td> <!-- work_num 추가하여 출력 -->
                      <td>${workout.work_name}</td>
                      <td>${workout.work_weight || '-'}</td>
                      <td>${workout.work_count}</td>
                      <td>${workout.work_part}</td>
                      <td>${workout.work_target || '-'}</td>
                      <td>${workout.work_type || '-'}</td>
                      <td>${formatDate(workout.work_day)}</td> <!-- YYYY-MM-DD 형식으로 표시 -->
                      <td><button class="edit-btn" data-id="${workout.id}">수정</button></td>
                      <td><button class="delete-btn" data-id="${workout.id}">삭제</button></td>
                  `;

                  myWorkoutsList.appendChild(row);

                  // 수정 버튼 클릭 이벤트 추가
                  row.querySelector(".edit-btn").addEventListener("click", () => {
                      openEditModal(workout);
                  });

                  // 삭제 버튼 클릭 이벤트 추가
                  row.querySelector(".delete-btn").addEventListener("click", async () => {
                      await deleteWorkout(workout.id);
                  });
              });
          }
      } catch (error) {
          console.error("운동 기록 로드 오류:", error);
      }
  }

  // 날짜 포맷 변경 함수
  const formatDate = (dateStr) => {
      const date = new Date(dateStr);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`; // YYYY-MM-DD 형식으로 변환
  };

  // 운동 수정 모달 열기
  function openEditModal(workout) {
      workoutModal.style.display = "block";
      document.getElementById("work_name").value = workout.work_name;
      document.getElementById("work_weight").value = workout.work_weight;
      document.getElementById("work_count").value = workout.work_count;
      document.getElementById("work_part").value = workout.work_part;
      document.getElementById("work_target").value = workout.work_target || "";
      document.getElementById("work_type").value = workout.work_type || "";
      document.getElementById("work_day").value = workout.work_day;

      // 운동 수정 시 submit 버튼을 등록이 아닌 수정으로 변경
      submitWorkoutBtn.textContent = "수정";
      submitWorkoutBtn.classList.add('edit-btn');
      submitWorkoutBtn.removeEventListener("click", addWorkoutHandler);
      submitWorkoutBtn.addEventListener("click", () => updateWorkout(workout.id));
  }

  // 운동 수정 함수
  async function updateWorkout(id) {
      const work_name = document.getElementById("work_name").value;
      const work_weight = document.getElementById("work_weight").value;
      const work_count = document.getElementById("work_count").value;
      const work_part = document.getElementById("work_part").value;
      const work_target = document.getElementById("work_target").value;
      const work_type = document.getElementById("work_type").value;
      const work_day = document.getElementById("work_day").value;

      try {
          const response = await fetch(`/api/works/update/${id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                  work_name, work_weight, work_count, work_part, work_target, work_type, work_day
              })
          });

          if (response.ok) {
              alert('운동 기록이 성공적으로 수정되었습니다.');
              workoutModal.style.display = "none";
              location.reload();
          } else {
              alert('운동 기록 수정에 실패했습니다. 다시 시도해주세요.');
          }
      } catch (error) {
          console.error("Error:", error);
      }
  }

  // 운동 삭제 함수
  async function deleteWorkout(work_num, work_day) {
    if (!confirm("정말로 이 운동 기록을 삭제하시겠습니까?")) return;

    try {
        const response = await fetch(`/api/works/delete`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                work_num: work_num,
                work_day: work_day
            })
        });

        if (response.ok) {
            alert('운동 기록이 성공적으로 삭제되었습니다.');
            location.reload();
        } else {
            alert('운동 기록 삭제에 실패했습니다. 다시 시도해주세요.');
        }
    } catch (error) {
        console.error("운동 기록 삭제 오류:", error);
    }
}

// 운동 기록 로드 시 삭제 버튼에 이벤트 추가
async function loadMyWorkouts(date = null) {
    myWorkoutsList.innerHTML = ""; // 기존 리스트 초기화

    try {
        const response = await fetch('/api/works/myWorkouts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ date })
        });

        const data = await response.json();
        if (data.success) {
            data.workouts.forEach(workout => {
                const row = document.createElement("tr");

                row.innerHTML = `
                    <td>${workout.work_num}</td>
                    <td>${workout.work_name}</td>
                    <td>${workout.work_weight || '-'}</td>
                    <td>${workout.work_count}</td>
                    <td>${workout.work_part}</td>
                    <td>${workout.work_target || '-'}</td>
                    <td>${workout.work_type || '-'}</td>
                    <td>${formatDate(workout.work_day)}</td>
                    <td><button class="edit-btn" data-id="${workout.id}">수정</button></td>
                    <td><button class="delete-btn" data-work-num="${workout.work_num}" data-work-day="${workout.work_day}">삭제</button></td>
                `;

                myWorkoutsList.appendChild(row);

                // 삭제 버튼 클릭 이벤트 추가
                row.querySelector(".delete-btn").addEventListener("click", () => {
                    deleteWorkout(workout.work_num, workout.work_day);
                });
            });
        }
    } catch (error) {
        console.error("운동 기록 로드 오류:", error);
    }
}
});
