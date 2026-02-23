const $ = (id) => document.getElementById(id);

const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const notify = (message, type = "info") => {
  if (window.GymFeedback?.notify) {
    window.GymFeedback.notify(message, { type });
    return;
  }

  alert(message);
};

const flash = (message, type = "info") => {
  if (window.GymFeedback?.flash) {
    window.GymFeedback.flash(message, type);
  }
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
        flash('로그아웃되었습니다.', 'success');
        window.location.href = '/logIn';
      } else {
        notify('로그아웃에 실패했습니다.', 'error');
      }
    } catch (error) {
      notify('로그아웃 중 오류가 발생했습니다.', 'error');
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
  const cssVar = (name, fallback) => {
    const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    return value || fallback;
  };
  const chartColors = () => ({
    primary: cssVar('--color-primary', '#f97316'),
    secondary: cssVar('--color-secondary', '#84cc16'),
    accent: cssVar('--color-accent', '#06b6d4')
  });

  let topChart;
  let bottomChart;
  let currentPart = null;

  const today = new Date();
  const initialYear = today.getFullYear();
  const initialMonth = today.getMonth() + 1;
  monthSelector.value = String(initialMonth);

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
        return;
      }

      const data = await response.json();
      if (!data.success || !Array.isArray(data.workoutStats)) return;

      const workoutCounts = labels.map((label) => {
        const stat = data.workoutStats.find((item) => item.work_part === label);
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
            backgroundColor: chartColors().primary,
            borderColor: chartColors().secondary,
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
        return;
      }

      const data = await response.json();
      if (!data.success || !Array.isArray(data.stats)) return;

      const targetLabels = partTargets[part] || [];
      const workoutCounts = targetLabels.map((target) => {
        const stat = data.stats.find((item) => item.work_target === target);
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
            backgroundColor: chartColors().accent,
            borderColor: chartColors().accent,
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
    }
  };

  if (yearSelector) {
    const startYear = initialYear - 3;
    const endYear = initialYear + 1;
    for (let year = startYear; year <= endYear; year += 1) {
      const option = document.createElement('option');
      option.value = String(year);
      option.textContent = String(year);
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
  const partButtons = {
    "가슴": chestButton,
    "등": backButton,
    "어깨": shoulderButton,
    "하체": legButton
  };

  const setActivePartButton = (part) => {
    Object.entries(partButtons).forEach(([name, button]) => {
      if (!button) return;
      button.classList.remove('btn-primary');
      button.classList.add('btn-outline');

      if (name === part) {
        button.classList.add('btn-primary');
        button.classList.remove('btn-outline');
      }
    });
  };

  chestButton?.addEventListener("click", () => {
    setActivePartButton("가슴");
    loadPartStats("가슴");
  });
  backButton?.addEventListener("click", () => {
    setActivePartButton("등");
    loadPartStats("등");
  });
  shoulderButton?.addEventListener("click", () => {
    setActivePartButton("어깨");
    loadPartStats("어깨");
  });
  legButton?.addEventListener("click", () => {
    setActivePartButton("하체");
    loadPartStats("하체");
  });

  setActivePartButton("가슴");
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
        return [];
      }

      const data = await response.json();
      if (!data.success || !Array.isArray(data.workouts)) return [];

      const uniqueDates = new Set(data.workouts.map((workout) => workout.work_day));
      return Array.from(uniqueDates).map((date) => ({
        title: "운동 기록",
        start: date,
        color: 'blue'
      }));
    } catch (error) {
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
      eventMouseEnter(info) {
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
  const submitWorkoutBtn = $("submitWorkoutBtn");
  const filterDateBtn = $("filterDateBtn");
  const myWorkoutsList = $("myWorkoutsList");
  const workoutModalTitle = $("workoutModalTitle");
  const workoutModalDesc = $("workoutModalDesc");
  const workoutForm = $("workoutForm");

  if (!workoutModal || !myWorkoutsModal || !submitWorkoutBtn || !myWorkoutsList) return;

  const openAppModal = (modal, triggerEl = null) => {
    if (!modal) return;

    if (window.ModalManager) {
      window.ModalManager.open(modal, { triggerEl });
      return;
    }

    modal.classList.remove("hidden");
    modal.setAttribute("aria-hidden", "false");
  };

  const closeAppModal = (modal, options = {}) => {
    if (!modal) return;

    if (window.ModalManager) {
      window.ModalManager.close(modal, options);
      return;
    }

    modal.classList.add("hidden");
    modal.setAttribute("aria-hidden", "true");
  };

  const workPartSelect = $("work_part");
  const workTargetSelect = $("work_target");
  const targetOptionsByPart = {
    "가슴": ["인클라인", "플랫", "디클라인"],
    "등": ["광배", "능모"],
    "어깨": ["전면", "측면", "후면"],
    "하체": ["대퇴", "둔부"]
  };

  const syncTargetOptions = (part, selectedTarget = "") => {
    if (!workTargetSelect) return;

    workTargetSelect.innerHTML = "<option value=''>선택해주세요</option>";
    const options = targetOptionsByPart[part] || [];

    options.forEach((option) => {
      const optElement = document.createElement("option");
      optElement.value = option;
      optElement.textContent = option;
      if (selectedTarget && option === selectedTarget) {
        optElement.selected = true;
      }
      workTargetSelect.appendChild(optElement);
    });
  };

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
      notify("필수 항목을 입력해주세요.", "warning");
      return;
    }

    try {
      const response = await fetch('/api/works/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values)
      });

      if (response.ok) {
        flash('운동 기록이 추가되었습니다.', 'success');
        closeAppModal(workoutModal);
        location.reload();
      } else {
        notify('운동 기록 추가가 실패했습니다. 다시 시도해주세요.', 'error');
      }
    } catch (error) {
      notify('운동 기록 추가 중 오류가 발생했습니다.', 'error');
    }
  };

  const updateWorkout = async (workout) => {
    const values = getFormValues();
    if (!values.work_name || !values.work_count || !values.work_part || !values.work_day) {
      notify("필수 항목을 입력해주세요.", "warning");
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
        flash('운동 기록이 수정되었습니다.', 'success');
        closeAppModal(workoutModal);
        location.reload();
      } else {
        notify('운동 기록 수정이 실패했습니다. 다시 시도해주세요.', 'error');
      }
    } catch (error) {
      notify('운동 기록 수정 중 오류가 발생했습니다.', 'error');
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
        flash('운동 기록이 삭제되었습니다.', 'success');
        location.reload();
      } else {
        notify('운동 기록 삭제가 실패했습니다. 다시 시도해주세요.', 'error');
      }
    } catch (error) {
      notify('운동 기록 삭제 중 오류가 발생했습니다.', 'error');
    }
  };

  const resetSubmitButton = () => {
    submitWorkoutBtn.textContent = "등록";
    submitWorkoutBtn.classList.remove('btn-success');
    submitWorkoutBtn.classList.add('btn-primary');
    submitWorkoutBtn.onclick = addWorkoutHandler;
    workoutForm?.reset();
    syncTargetOptions("");

    if (workoutModalTitle) {
      workoutModalTitle.textContent = "운동 기록 작성";
    }
    if (workoutModalDesc) {
      workoutModalDesc.textContent = "운동 기록을 입력해 대시보드에 반영하세요.";
    }
  };

  const openEditModal = (workout, triggerEl) => {
    const openEditor = () => {
      const workDay = workout.work_day ? formatDate(workout.work_day) : "";

      $("work_name").value = workout.work_name;
      $("work_weight").value = workout.work_weight ?? "";
      $("work_count").value = workout.work_count;
      $("work_part").value = workout.work_part;
      syncTargetOptions(workout.work_part, workout.work_target || "");
      $("work_type").value = workout.work_type || "";
      $("work_day").value = workDay;

      submitWorkoutBtn.textContent = "수정";
      submitWorkoutBtn.classList.remove('btn-primary');
      submitWorkoutBtn.classList.add('btn-success');
      submitWorkoutBtn.onclick = () => updateWorkout(workout);

      if (workoutModalTitle) {
        workoutModalTitle.textContent = "운동 기록 수정";
      }
      if (workoutModalDesc) {
        workoutModalDesc.textContent = "선택한 운동 기록을 수정한 뒤 저장하세요.";
      }

      openAppModal(workoutModal, triggerEl || document.activeElement);
    };

    if (window.ModalManager?.isOpen(myWorkoutsModal)) {
      closeAppModal(myWorkoutsModal, { restoreFocus: false });
      window.setTimeout(openEditor, 80);
      return;
    }

    openEditor();
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

      if (!Array.isArray(data.workouts) || data.workouts.length === 0) {
        const emptyRow = document.createElement("tr");
        emptyRow.innerHTML = `
          <td colspan=\"10\">
            <div class=\"py-8 text-center text-sm text-base-content/70\">
              조회된 운동 기록이 없습니다.
            </div>
          </td>
        `;
        myWorkoutsList.appendChild(emptyRow);
        return;
      }

      data.workouts.forEach((workout) => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td class=\"font-medium text-base-content/80\">${workout.work_num}</td>
          <td class=\"font-semibold\">${workout.work_name}</td>
          <td class=\"text-right tabular-nums\">${workout.work_weight || '-'}</td>
          <td class=\"text-right tabular-nums\">${workout.work_count}</td>
          <td>${workout.work_part}</td>
          <td>${workout.work_target || '-'}</td>
          <td>${workout.work_type || '-'}</td>
          <td class=\"tabular-nums\">${formatDate(workout.work_day)}</td>
          <td class=\"text-center\"><button class=\"edit-btn btn btn-xs btn-accent\" aria-label=\"운동 기록 수정\">수정</button></td>
          <td class=\"text-center\"><button class=\"delete-btn btn btn-xs btn-error btn-outline\" aria-label=\"운동 기록 삭제\">삭제</button></td>
        `;

        const editBtn = row.querySelector(".edit-btn");
        editBtn?.addEventListener("click", (event) => openEditModal(workout, event.currentTarget));
        row.querySelector(".delete-btn")?.addEventListener("click", () => deleteWorkout(workout));
        myWorkoutsList.appendChild(row);
      });
    } catch (error) {
    }
  };

  workPartSelect?.addEventListener("change", () => {
    syncTargetOptions(workPartSelect.value);
  });

  if (window.ModalManager) {
    window.ModalManager.register(workoutModal, {
      panelSelector: "[data-modal-panel]",
      closeSelectors: [".close"],
      initialFocusSelector: "#work_name",
      onClose: () => {
        resetSubmitButton();
      }
    });

    window.ModalManager.register(myWorkoutsModal, {
      panelSelector: "[data-modal-panel]",
      closeSelectors: [".close"],
      initialFocusSelector: "#filterDate"
    });
  }

  addWorkoutBtn?.addEventListener("click", () => {
    resetSubmitButton();
    openAppModal(workoutModal, addWorkoutBtn);
  });

  myWorkoutsBtn?.addEventListener("click", async () => {
    openAppModal(myWorkoutsModal, myWorkoutsBtn);
    await loadMyWorkouts();
  });

  resetSubmitButton();

  filterDateBtn?.addEventListener("click", async () => {
    const selectedDate = $("filterDate").value;
    await loadMyWorkouts(selectedDate || null);
  });
}

