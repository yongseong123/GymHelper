(function () {
  const requestJson = async (url, options = {}) => {
    const response = await fetch(url, options);
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const error = new Error(data.message || "요청이 실패했습니다.");
      error.status = response.status;
      error.payload = data;
      throw error;
    }

    return data;
  };

  window.GymApi = {
    requestJson,
  };
})();
