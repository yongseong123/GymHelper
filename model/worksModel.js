const { poolPromise } = require('./index');

exports.addWorkoutRecord = async (workoutData) => {
  try {
    const pool = await poolPromise;
    const {
      work_name, work_weight, work_count, work_part,
      work_target, work_type, work_day, work_id
    } = workoutData;

    const queryForMaxWorkNum = `
      SELECT ISNULL(MAX(work_num), 0) AS max_work_num
      FROM workout
      WHERE work_day = @work_day AND work_id = @work_id;
    `;

    const result = await pool.request()
      .input('work_day', work_day)
      .input('work_id', work_id)
      .query(queryForMaxWorkNum);

    const nextWorkNum = result.recordset[0].max_work_num + 1;

    const query = `
      INSERT INTO workout (work_name, work_weight, work_count, work_part, work_target, work_type, work_day, work_id, work_num)
      VALUES (@work_name, @work_weight, @work_count, @work_part, @work_target, @work_type, @work_day, @work_id, @work_num);
    `;

    await pool.request()
      .input('work_name', work_name)
      .input('work_weight', work_weight)
      .input('work_count', work_count)
      .input('work_part', work_part)
      .input('work_target', work_target)
      .input('work_type', work_type)
      .input('work_day', work_day)
      .input('work_id', work_id)
      .input('work_num', nextWorkNum)
      .query(query);

    return { success: true, message: "Workout record created." };
  } catch (error) {
    console.error("Add workout record error:", error);
    throw error;
  }
};

exports.getWorkoutsByDate = async (userId, date) => {
  try {
    const pool = await poolPromise;
    const query = `
      SELECT * FROM workout WHERE work_id = @userId AND work_day = @date ORDER BY work_num;
    `;
    const result = await pool.request()
      .input('userId', userId)
      .input('date', date)
      .query(query);

    return result.recordset;
  } catch (error) {
    console.error("Get workouts by date error:", error);
    throw error;
  }
};

exports.updateWorkoutRecord = async (work_num, work_day, work_id, updateData) => {
  try {
    const pool = await poolPromise;
    const { work_name, work_weight, work_count, work_part, work_target, work_type } = updateData;

    const query = `
      UPDATE workout 
      SET work_name = @work_name, work_weight = @work_weight, work_count = @work_count, 
          work_part = @work_part, work_target = @work_target, work_type = @work_type
      WHERE work_num = @work_num AND work_day = @work_day AND work_id = @work_id;
    `;

    await pool.request()
      .input('work_num', work_num)
      .input('work_day', work_day)
      .input('work_id', work_id)
      .input('work_name', work_name)
      .input('work_weight', work_weight)
      .input('work_count', work_count)
      .input('work_part', work_part)
      .input('work_target', work_target)
      .input('work_type', work_type)
      .query(query);

    return { success: true, message: "Workout record updated." };
  } catch (error) {
    console.error("Update workout record error:", error);
    throw error;
  }
};

exports.deleteWorkoutRecord = async (work_num, work_day, work_id) => {
  try {
    const pool = await poolPromise;

    const query = `
      DELETE FROM workout 
      WHERE work_num = @work_num AND work_day = @work_day AND work_id = @work_id;
    `;

    await pool.request()
      .input('work_num', work_num)
      .input('work_day', work_day)
      .input('work_id', work_id)
      .query(query);

    return { success: true, message: "Workout record deleted." };
  } catch (error) {
    console.error("Delete workout record error:", error);
    throw error;
  }
};

exports.getAllWorkouts = async (userId) => {
  try {
    const pool = await poolPromise;
    const query = `
      SELECT work_name, work_day 
      FROM workout 
      WHERE work_id = @userId;
    `;
    const result = await pool.request()
      .input('userId', userId)
      .query(query);

    return result.recordset;
  } catch (error) {
    console.error("Get all workouts error:", error);
    throw error;
  }
};

exports.getMonthlyWorkoutStats = async (userId, year, month) => {
  try {
    const pool = await poolPromise;
    const query = `
      SELECT work_part, COUNT(*) AS count
      FROM workout
      WHERE work_id = @userId AND YEAR(work_day) = @year AND MONTH(work_day) = @month
      GROUP BY work_part;
    `;
    const result = await pool.request()
      .input('userId', userId)
      .input('year', year)
      .input('month', month)
      .query(query);

    return result.recordset;
  } catch (error) {
    console.error("Get monthly workout stats error:", error);
    throw error;
  }
};

exports.getPartStats = async (userId, part, year, month) => {
  try {
    const pool = await poolPromise;
    const query = `
      SELECT work_target, COUNT(*) AS count
      FROM workout
      WHERE work_id = @userId
        AND work_part = @part
        AND YEAR(work_day) = @year
        AND MONTH(work_day) = @month
      GROUP BY work_target;
    `;
    const result = await pool.request()
      .input('userId', userId)
      .input('part', part)
      .input('year', year)
      .input('month', month)
      .query(query);

    return result.recordset;
  } catch (error) {
    console.error("Get part stats error:", error);
    throw error;
  }
};