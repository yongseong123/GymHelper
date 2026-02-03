const $ = (id) => document.getElementById(id);

const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

document.addEventListener("DOMContentLoaded", () => {
  initLogout();
  initCharts();
  initCalendar();
  initWorkouts();
});

function initLogout() {
  const logoutButton = $("logoutBtn");
  if (!logoutButton) return;

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
      alert('로그아웃 중 오류가 발생했습니다.');
    }
  });
}

function initCharts() {
  const topCanvas = $("topGraphCanvas");
  const bottomCanvas = $("bottomGraphCanvas");
  const monthSelector = $("monthSelector");
  const yearSelector = $("yearSelector");

  if (!topCanvas || !bottomCanvas || !monthSelector) return;

  const topCtx = topCanvas.getContext('2d');
  const bottomCtx = bottomCanvas.getContext('2d');

  const labels = ["가슴", "등", "어깨", "이두", "삼두", "하체", "복근", "유산소"];
  const partTargets = {
    "가슴": ["인클라인", "플랫", "디클라인"],
    "등": ["광배", "능모"],
    "어깨": ["전면", "측면", "후면"],
    "하체": ["대퇴", "둔부"]
  };

  let topChart;
  let bottomChart;
  let currentPart = null;

  const today = new Date();
  const initialYear = today.getFullYear();
  const initialMonth = today.getMonth() + 1;

  const getSelectedYearMonth = () => {
    const selectedYear = yearSelector ? Number(yearSelector.value) || initialYear : initialYear;
    const selectedMonth = Number(monthSelector.value) || initialMonth;
    return { selectedYear, selectedMonth };
  };

  const updateTopChartTitle = (year, month) => {
    if (topChart?.options?.plugins?.title) {
      topChart.options.plugins.title.text = `${year}-${month} stats`;
    }
  };

  const loadMonthlyStats = async (year, month) => {
    try {
      const response = await fetch('/api/works/monthlyStats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ year, month }),
        credentials: 'include'
      });

      if (!response.ok) {
        console.error("월간 운동 통계 조회 실패:", response.statusText);
        return;
      }

      const data = await response.json();
      if (!data.success || !Array.isArray(data.workoutStats)) return;

      const workoutCounts = labels.map(label => {
        const stat = data.workoutStats.find(stat => stat.work_part === label);
        return stat ? stat.count : 0;
      });

      if (topChart) {
        topChart.data.datasets[0].data = workoutCounts;
        updateTopChartTitle(year, month);
        topChart.update();
        return;
      }

      topChart = new Chart(topCtx, {
        type: 'bar',
        data: {
          labels,
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
              text: `${year}-${month} stats`
            }
          }
        }
      });
    } catch (error) {
      console.error("월간 운동 통계 로드 오류:", error);
    }
  };

  const loadPartStats = async (part) => {
    currentPart = part;
    const { selectedYear, selectedMonth } = getSelectedYearMonth();

    try {
      const response = await fetch('/api/works/partStats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ part, year: selectedYear, month: selectedMonth }),
        credentials: 'include'
      });

      if (!response.ok) {
        console.error("부위별 통계 조회 실패:", response.statusText);
        return;
      }

      const data = await response.json();
      if (!data.success || !Array.isArray(data.stats)) return;

      const targetLabels = partTargets[part] || [];
      const workoutCounts = targetLabels.map(target => {
        const stat = data.stats.find(stat => stat.work_target === target);
        return stat ? stat.count : 0;
      });

      if (bottomChart) {
        bottomChart.data.labels = targetLabels;
        bottomChart.data.datasets[0].data = workoutCounts;
        bottomChart.update();
        return;
      }

      bottomChart = new Chart(bottomCtx, {
        type: 'line',
        data: {
          labels: targetLabels,
          datasets: [{
            label: '타겟별 운동 통계',
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
    } catch (error) {
      console.error("부위별 통계 로드 오류:", error);
    }
  };

  if (yearSelector) {
    const startYear = initialYear - 3;
    const endYear = initialYear + 1;
    for (let y = startYear; y <= endYear; y += 1) {
      const option = document.createElement('option');
      option.value = String(y);
      option.textContent = String(y);
      yearSelector.appendChild(option);
    }
    yearSelector.value = String(initialYear);
    yearSelector.addEventListener("change", async () => {
      const { selectedYear, selectedMonth } = getSelectedYearMonth();
      await loadMonthlyStats(selectedYear, selectedMonth);
      if (currentPart) {
        await loadPartStats(currentPart);
      }
    });
  }

  loadMonthlyStats(initialYear, initialMonth);

  monthSelector.addEventListener("change", async (event) => {
    const selectedMonth = event.target.value;
    const selectedYear = yearSelector ? Number(yearSelector.value) || initialYear : initialYear;
    await loadMonthlyStats(selectedYear, selectedMonth);
    if (currentPart) {
      await loadPartStats(currentPart);
    }
  });

  const chestButton = $("chestButton");
  const backButton = $("backButton");
  const shoulderButton = $("shoulderButton");
  const legButton = $("legButton");

  chestButton?.addEventListener("click", () => loadPartStats("가슴"));
  backButton?.addEventListener("click", () => loadPartStats("등"));
  shoulderButton?.addEventListener("click", () => loadPartStats("어깨"));
  legButton?.addEventListener("click", () => loadPartStats("하체"));

  loadPartStats("가슴");
}

function initCalendar() {
  const calendarEl = $("calendar");
  if (!calendarEl) return;

  const initCalendarEvents = async () => {
    try {
      const response = await fetch('/api/works/allWorkouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });

      if (!response.ok) {
        console.error("전체 운동 기록 조회 실패:", response.statusText);
        return [];
      }

      const data = await response.json();
      if (!data.success || !Array.isArray(data.workouts)) return [];

      const uniqueDates = new Set(data.workouts.map(workout => workout.work_day));
      return Array.from(uniqueDates).map((date) => ({
        title: "운동 기록",
        start: date,
        color: 'blue'
      }));
    } catch (error) {
      console.error("전체 운동 기록 로드 오류:", error);
      return [];
    }
  };

  initCalendarEvents().then((calendarEvents) => {
    const calendar = new FullCalendar.Calendar(calendarEl, {
      initialView: 'dayGridMonth',
      locale: 'ko',
      headerToolbar: {
        left: 'prevYear,prev,next,nextYear today',
        center: 'title',
        right: 'dayGridMonth,dayGridWeek,dayGridDay'
      },
      editable: true,
      displayEventTime: false,
      events: calendarEvents,
      eventMouseEnter: function(info) {
        info.el.style.cursor = 'pointer';
      }
    });

    calendar.render();
  });
}

function initWorkouts() {
  const addWorkoutBtn = $("addWorkoutBtn");
  const myWorkoutsBtn = $("myWorkoutsBtn");
  const workoutModal = $("workoutModal");
  const myWorkoutsModal = $("myWorkoutsModal");
  const closeModal = document.querySelectorAll(".close");
  const submitWorkoutBtn = $("submitWorkoutBtn");
  const filterDateBtn = $("filterDateBtn");
  const myWorkoutsList = $("myWorkoutsList");

  if (!workoutModal || !myWorkoutsModal || !submitWorkoutBtn || !myWorkoutsList) return;

  const workPartSelect = $("work_part");
  const workTargetSelect = $("work_target");

  const getFormValues = () => ({
    work_name: $("work_name").value,
    work_weight: $("work_weight").value,
    work_count: $("work_count").value,
    work_part: $("work_part").value,
    work_target: $("work_target").value,
    work_type: $("work_type").value,
    work_day: $("work_day").value
  });

  const addWorkoutHandler = async () => {
    const values = getFormValues();
    if (!values.work_name || !values.work_count || !values.work_part || !values.work_day) {
      alert("필수 항목을 입력해주세요.");
      return;
    }

    try {
      const response = await fetch('/api/works/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values)
      });

      if (response.ok) {
        alert('운동 기록이 성공적으로 추가되었습니다.');
        workoutModal.style.display = "none";
        location.reload();
      } else {
        alert('운동 기록 추가가 실패했습니다. 다시 시도해주세요.');
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const updateWorkout = async (workout) => {
    const values = getFormValues();
    if (!values.work_name || !values.work_count || !values.work_part || !values.work_day) {
      alert("필수 항목을 입력해주세요.");
      return;
    }

    try {
      const response = await fetch(`/api/works/update`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          work_num: workout.work_num,
          work_day: workout.work_day,
          ...values
        })
      });

      if (response.ok) {
        alert('운동 기록이 성공적으로 수정되었습니다.');
        workoutModal.style.display = "none";
        location.reload();
      } else {
        alert('운동 기록 수정이 실패했습니다. 다시 시도해주세요.');
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const deleteWorkout = async (workout) => {
    if (!confirm("정말로 해당 운동 기록을 삭제하시겠습니까?")) return;

    try {
      const response = await fetch(`/api/works/delete`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          work_num: workout.work_num,
          work_day: workout.work_day
        })
      });

      if (response.ok) {
        alert('운동 기록이 성공적으로 삭제되었습니다.');
        location.reload();
      } else {
        alert('운동 기록 삭제가 실패했습니다. 다시 시도해주세요.');
      }
    } catch (error) {
      console.error("운동 기록 삭제 오류:", error);
    }
  };

  const openEditModal = (workout) => {
    workoutModal.style.display = "block";
    $("work_name").value = workout.work_name;
    $("work_weight").value = workout.work_weight;
    $("work_count").value = workout.work_count;
    $("work_part").value = workout.work_part;
    $("work_target").value = workout.work_target || "";
    $("work_type").value = workout.work_type || "";
    $("work_day").value = workout.work_day;

    submitWorkoutBtn.textContent = "수정";
    submitWorkoutBtn.classList.remove('bg-zinc-900', 'hover:bg-zinc-800');
    submitWorkoutBtn.classList.add('bg-emerald-500', 'hover:bg-emerald-600');
    submitWorkoutBtn.removeEventListener("click", addWorkoutHandler);
    submitWorkoutBtn.onclick = () => updateWorkout(workout);
  };

  const resetSubmitButton = () => {
    submitWorkoutBtn.textContent = "등록";
    submitWorkoutBtn.classList.remove('bg-emerald-500', 'hover:bg-emerald-600');
    submitWorkoutBtn.classList.add('bg-zinc-900', 'hover:bg-zinc-800');
    submitWorkoutBtn.onclick = addWorkoutHandler;
  };

  const loadMyWorkouts = async (date = null) => {
    myWorkoutsList.innerHTML = "";

    try {
      const response = await fetch('/api/works/myWorkouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date })
      });

      const data = await response.json();
      if (!data.success) return;

      data.workouts.forEach(workout => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td class="px-3 py-3 text-center">${workout.work_num}</td>
          <td class="px-3 py-3">${workout.work_name}</td>
          <td class="px-3 py-3 text-center">${workout.work_weight || '-'}</td>
          <td class="px-3 py-3 text-center">${workout.work_count}</td>
          <td class="px-3 py-3 text-center">${workout.work_part}</td>
          <td class="px-3 py-3 text-center">${workout.work_target || '-'}</td>
          <td class="px-3 py-3 text-center">${workout.work_type || '-'}</td>
          <td class="px-3 py-3 text-center">${formatDate(workout.work_day)}</td>
          <td class="px-3 py-3 text-center"><button class="edit-btn rounded-lg bg-emerald-500 px-3 py-2 text-xs font-semibold text-white transition hover:bg-emerald-600">수정</button></td>
          <td class="px-3 py-3 text-center"><button class="delete-btn rounded-lg bg-rose-500 px-3 py-2 text-xs font-semibold text-white transition hover:bg-rose-600">삭제</button></td>
        `;

        row.querySelector(".edit-btn").addEventListener("click", () => openEditModal(workout));
        row.querySelector(".delete-btn").addEventListener("click", () => deleteWorkout(workout));
        myWorkoutsList.appendChild(row);
      });
    } catch (error) {
      console.error("운동 기록 로드 오류:", error);
    }
  };

  workPartSelect?.addEventListener("change", () => {
    const part = workPartSelect.value;
    workTargetSelect.innerHTML = "<option value=''>선택해주세요</option>";

    let options = [];
    switch (part) {
      case "가슴":
        options = ["인클라인", "플랫", "디클라인"];
        break;
      case "등":
        options = ["광배", "능모"];
        break;
      case "어깨":
        options = ["전면", "측면", "후면"];
        break;
      case "하체":
        options = ["대퇴", "둔부"];
        break;
    }

    options.forEach(option => {
      const optElement = document.createElement("option");
      optElement.value = option;
      optElement.textContent = option;
      workTargetSelect.appendChild(optElement);
    });
  });

  addWorkoutBtn?.addEventListener("click", () => {
    resetSubmitButton();
    workoutModal.style.display = "block";
  });

  myWorkoutsBtn?.addEventListener("click", async () => {
    myWorkoutsModal.style.display = "block";
    await loadMyWorkouts();
  });

  closeModal.forEach((btn) => {
    btn.addEventListener("click", () => {
      workoutModal.style.display = "none";
      myWorkoutsModal.style.display = "none";
      resetSubmitButton();
    });
  });

  window.addEventListener("click", (event) => {
    if (event.target === workoutModal) {
      workoutModal.style.display = "none";
      resetSubmitButton();
    }
    if (event.target === myWorkoutsModal) {
      myWorkoutsModal.style.display = "none";
    }
  });

  submitWorkoutBtn.addEventListener("click", addWorkoutHandler);

  filterDateBtn?.addEventListener("click", async () => {
    const selectedDate = $("filterDate").value;
    if (selectedDate) {
      await loadMyWorkouts(selectedDate);
    }
  });
}
