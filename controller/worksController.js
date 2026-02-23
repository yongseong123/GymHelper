const worksModel = require("../model/worksModel");

const hasValue = (value) => value !== undefined && value !== null && value !== "";
const normalizeOptional = (value) => (hasValue(value) ? value : null);
const toPositiveInteger = (value, fallback) => {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
};

exports.addWorkoutRecord = async (req, res) => {
  const {
    work_name,
    work_weight,
    work_count,
    work_part,
    work_target,
    work_type,
    work_day,
  } = req.body;

  if (!hasValue(work_name) || !hasValue(work_count) || !hasValue(work_part) || !hasValue(work_day)) {
    return res.fail("Missing required fields.", 400);
  }

  const work_id = req.user.id;

  try {
    const result = await worksModel.addWorkoutRecord({
      work_name,
      work_weight: normalizeOptional(work_weight),
      work_count,
      work_part,
      work_target: normalizeOptional(work_target),
      work_type: normalizeOptional(work_type),
      work_day,
      work_id,
    });

    return res.ok({ message: result.message });
  } catch (error) {
    return res.fail("Failed to add workout record.", 500);
  }
};

exports.getWorkoutsByDate = async (req, res) => {
  const userId = req.user.id;
  const date = normalizeOptional(req.body.date);

  try {
    const workouts = await worksModel.getWorkoutsByDate(userId, date);
    return res.ok({ workouts });
  } catch (error) {
    return res.fail("Failed to fetch workout records.", 500);
  }
};

exports.updateWorkoutRecord = async (req, res) => {
  const {
    work_num,
    work_day,
    work_name,
    work_weight,
    work_count,
    work_part,
    work_target,
    work_type,
  } = req.body;

  if (!hasValue(work_num) || !hasValue(work_day) || !hasValue(work_name) || !hasValue(work_count) || !hasValue(work_part)) {
    return res.fail("Missing required fields.", 400);
  }

  const work_id = req.user.id;

  try {
    const result = await worksModel.updateWorkoutRecord(work_num, work_day, work_id, {
      work_name,
      work_weight: normalizeOptional(work_weight),
      work_count,
      work_part,
      work_target: normalizeOptional(work_target),
      work_type: normalizeOptional(work_type),
    });

    return res.ok({ message: result.message });
  } catch (error) {
    return res.fail("Failed to update workout record.", 500);
  }
};

exports.deleteWorkoutRecord = async (req, res) => {
  const { work_num, work_day } = req.body;

  if (!hasValue(work_num) || !hasValue(work_day)) {
    return res.fail("Missing required fields.", 400);
  }

  const work_id = req.user.id;

  try {
    const result = await worksModel.deleteWorkoutRecord(work_num, work_day, work_id);
    return res.ok({ message: result.message });
  } catch (error) {
    return res.fail("Failed to delete workout record.", 500);
  }
};

exports.getAllWorkouts = async (req, res) => {
  const userId = req.user.id;

  try {
    const workouts = await worksModel.getAllWorkouts(userId);
    return res.ok({ workouts });
  } catch (error) {
    return res.fail("Failed to fetch workouts.", 500);
  }
};

exports.getMonthlyWorkoutStats = async (req, res) => {
  const userId = req.user.id;
  const today = new Date();
  const year = toPositiveInteger(req.body.year, today.getFullYear());
  const month = toPositiveInteger(req.body.month, today.getMonth() + 1);

  try {
    const workoutStats = await worksModel.getMonthlyWorkoutStats(userId, year, month);
    return res.ok({ workoutStats });
  } catch (error) {
    return res.fail("Failed to fetch monthly workout stats.", 500);
  }
};

exports.getPartStats = async (req, res) => {
  const part = typeof req.body.part === "string" ? req.body.part.trim() : "";
  if (!part) {
    return res.fail("Part is required.", 400);
  }

  const userId = req.user.id;
  const today = new Date();
  const year = toPositiveInteger(req.body.year, today.getFullYear());
  const month = toPositiveInteger(req.body.month, today.getMonth() + 1);

  try {
    const stats = await worksModel.getPartStats(userId, part, year, month);
    return res.ok({ stats });
  } catch (error) {
    return res.fail("Failed to fetch part stats.", 500);
  }
};
