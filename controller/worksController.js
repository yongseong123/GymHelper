const worksModel = require('../model/worksModel');

exports.addWorkoutRecord = async (req, res) => {
  const { work_name, work_weight, work_count, work_part, work_target, work_type, work_day } = req.body;
  const work_id = req.user.id;

  try {
    const workoutData = {
      work_name,
      work_weight: work_weight || null,
      work_count,
      work_part,
      work_target: work_target || null,
      work_type: work_type || null,
      work_day,
      work_id
    };

    const result = await worksModel.addWorkoutRecord(workoutData);
    res.ok({ message: result.message });
  } catch (error) {
    res.fail("Failed to add workout record.", 500);
  }
};

exports.getWorkoutsByDate = async (req, res) => {
  const userId = req.user.id;
  const { date } = req.body;

  try {
    const workouts = await worksModel.getWorkoutsByDate(userId, date);
    res.ok({ workouts });
  } catch (error) {
    res.fail("Failed to fetch workout records.", 500);
  }
};

exports.updateWorkoutRecord = async (req, res) => {
  const { work_num, work_day, work_name, work_weight, work_count, work_part, work_target, work_type } = req.body;
  const work_id = req.user.id;

  try {
    const result = await worksModel.updateWorkoutRecord(work_num, work_day, work_id, {
      work_name,
      work_weight,
      work_count,
      work_part,
      work_target,
      work_type
    });
    res.ok({ message: result.message });
  } catch (error) {
    res.fail("Failed to update workout record.", 500);
  }
};

exports.deleteWorkoutRecord = async (req, res) => {
  const { work_num, work_day } = req.body;
  const work_id = req.user.id;

  try {
    const result = await worksModel.deleteWorkoutRecord(work_num, work_day, work_id);
    res.ok({ message: result.message });
  } catch (error) {
    res.fail("Failed to delete workout record.", 500);
  }
};

exports.getAllWorkouts = async (req, res) => {
  const userId = req.user.id;

  try {
    const workouts = await worksModel.getAllWorkouts(userId);
    res.ok({ workouts });
  } catch (error) {
    res.fail("Failed to fetch workouts.", 500);
  }
};

exports.getMonthlyWorkoutStats = async (req, res) => {
  const userId = req.user.id;
  const { year, month } = req.body;

  try {
    const workoutStats = await worksModel.getMonthlyWorkoutStats(userId, year, month);
    res.ok({ workoutStats });
  } catch (error) {
    res.fail("Failed to fetch monthly workout stats.", 500);
  }
};

exports.getPartStats = async (req, res) => {
  const { part, year, month } = req.body;
  const userId = req.user.id;
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth() + 1;
  const requestedYear = Number(year);
  const requestedMonth = Number(month);
  const resolvedYear = Number.isInteger(requestedYear) && requestedYear > 0 ? requestedYear : currentYear;
  const resolvedMonth = Number.isInteger(requestedMonth) && requestedMonth > 0 ? requestedMonth : currentMonth;

  try {
    const stats = await worksModel.getPartStats(userId, part, resolvedYear, resolvedMonth);
    res.ok({ stats });
  } catch (error) {
    res.fail("Failed to fetch part stats.", 500);
  }
};
