const { sql, getPoolPromise } = require("./index");

const createTransaction = async () => {
  const pool = await getPoolPromise();
  const transaction = new sql.Transaction(pool);
  await transaction.begin();
  return transaction;
};

exports.addWorkoutRecord = async (workoutData) => {
  const {
    work_name,
    work_weight,
    work_count,
    work_part,
    work_target,
    work_type,
    work_day,
    work_id,
  } = workoutData;

  const transaction = await createTransaction();

  try {
    const maxNumberRequest = new sql.Request(transaction);
    maxNumberRequest.input("work_day", work_day);
    maxNumberRequest.input("work_id", work_id);

    const maxNumberResult = await maxNumberRequest.query(`
      SELECT ISNULL(MAX(work_num), 0) AS max_work_num
      FROM workout
      WHERE work_day = @work_day AND work_id = @work_id;
    `);

    const nextWorkNum = maxNumberResult.recordset[0].max_work_num + 1;

    const insertRequest = new sql.Request(transaction);
    insertRequest
      .input("work_name", work_name)
      .input("work_weight", work_weight)
      .input("work_count", work_count)
      .input("work_part", work_part)
      .input("work_target", work_target)
      .input("work_type", work_type)
      .input("work_day", work_day)
      .input("work_id", work_id)
      .input("work_num", nextWorkNum);

    await insertRequest.query(`
      INSERT INTO workout (work_name, work_weight, work_count, work_part, work_target, work_type, work_day, work_id, work_num)
      VALUES (@work_name, @work_weight, @work_count, @work_part, @work_target, @work_type, @work_day, @work_id, @work_num);
    `);

    await transaction.commit();
    return { success: true, message: "Workout record created." };
  } catch (error) {
    try {
      await transaction.rollback();
    } catch (_rollbackError) {
      // Ignore rollback errors and rethrow original error.
    }

    throw error;
  }
};

exports.getWorkoutsByDate = async (userId, date) => {
  const pool = await getPoolPromise();
  const request = pool.request().input("userId", userId);
  const hasDateFilter = Boolean(date);

  if (hasDateFilter) {
    request.input("date", date);
  }

  const query = `
    SELECT *
    FROM workout
    WHERE work_id = @userId
    ${hasDateFilter ? "AND work_day = @date" : ""}
    ORDER BY work_day DESC, work_num ASC;
  `;

  const result = await request.query(query);
  return result.recordset;
};

exports.updateWorkoutRecord = async (work_num, work_day, work_id, updateData) => {
  const pool = await getPoolPromise();
  const { work_name, work_weight, work_count, work_part, work_target, work_type } = updateData;

  await pool.request()
    .input("work_num", work_num)
    .input("work_day", work_day)
    .input("work_id", work_id)
    .input("work_name", work_name)
    .input("work_weight", work_weight)
    .input("work_count", work_count)
    .input("work_part", work_part)
    .input("work_target", work_target)
    .input("work_type", work_type)
    .query(`
      UPDATE workout
      SET work_name = @work_name,
          work_weight = @work_weight,
          work_count = @work_count,
          work_part = @work_part,
          work_target = @work_target,
          work_type = @work_type
      WHERE work_num = @work_num AND work_day = @work_day AND work_id = @work_id;
    `);

  return { success: true, message: "Workout record updated." };
};

exports.deleteWorkoutRecord = async (work_num, work_day, work_id) => {
  const pool = await getPoolPromise();

  await pool.request()
    .input("work_num", work_num)
    .input("work_day", work_day)
    .input("work_id", work_id)
    .query(`
      DELETE FROM workout
      WHERE work_num = @work_num AND work_day = @work_day AND work_id = @work_id;
    `);

  return { success: true, message: "Workout record deleted." };
};

exports.getAllWorkouts = async (userId) => {
  const pool = await getPoolPromise();
  const result = await pool.request()
    .input("userId", userId)
    .query(`
      SELECT work_name, work_day
      FROM workout
      WHERE work_id = @userId;
    `);

  return result.recordset;
};

exports.getMonthlyWorkoutStats = async (userId, year, month) => {
  const pool = await getPoolPromise();
  const result = await pool.request()
    .input("userId", userId)
    .input("year", year)
    .input("month", month)
    .query(`
      SELECT work_part, COUNT(*) AS count
      FROM workout
      WHERE work_id = @userId AND YEAR(work_day) = @year AND MONTH(work_day) = @month
      GROUP BY work_part;
    `);

  return result.recordset;
};

exports.getPartStats = async (userId, part, year, month) => {
  const pool = await getPoolPromise();
  const result = await pool.request()
    .input("userId", userId)
    .input("part", part)
    .input("year", year)
    .input("month", month)
    .query(`
      SELECT work_target, COUNT(*) AS count
      FROM workout
      WHERE work_id = @userId
        AND work_part = @part
        AND YEAR(work_day) = @year
        AND MONTH(work_day) = @month
      GROUP BY work_target;
    `);

  return result.recordset;
};
