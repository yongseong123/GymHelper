const worksModel = require('../model/worksModel');

// ?´ë™ ?°ì´??ì¶”ê?
exports.addWorkoutRecord = async (req, res) => {
  const { work_name, work_weight, work_count, work_part, work_target, work_type, work_day } = req.body;
  const work_id = req.user.id; // ë¡œê·¸?¸ëœ ?¬ìš©?ì˜ IDë¥?ê°€?¸ì˜´

  try {
      const workoutData = {
          work_name,
          work_weight: work_weight || null, // ë¬´ê²Œê°€ ?…ë ¥?˜ì? ?Šì? ê²½ìš° null ì²˜ë¦¬
          work_count,
          work_part,
          work_target: work_target || null, // ?€ê²Ÿì´ ? íƒ?˜ì? ?Šì? ê²½ìš° null ì²˜ë¦¬
          work_type: work_type || null, // ?´ë™ ?€?…ì´ ? íƒ?˜ì? ?Šì? ê²½ìš° null ì²˜ë¦¬
          work_day,
          work_id
      };

      const result = await worksModel.addWorkoutRecord(workoutData);

      res.status(200).json(result); // ?±ê³µ ?‘ë‹µ ë°˜í™˜
  } catch (error) {
      console.error("?´ë™ ê¸°ë¡ ì¶”ê? ì»¨íŠ¸ë¡¤ëŸ¬ ?¤ë¥˜:", error);
      res.status(500).json({ success: false, message: "?´ë™ ê¸°ë¡ ì¶”ê????¤íŒ¨?ˆìŠµ?ˆë‹¤." });
  }
};

// ?¹ì • ? ì§œ???¬ìš©???´ë™ ê¸°ë¡ ì¡°íšŒ ì»¨íŠ¸ë¡¤ëŸ¬
exports.getWorkoutsByDate = async (req, res) => {
  const userId = req.user.id;
  const { date } = req.body; // ? ì§œ???´ë¼?´ì–¸?¸ë¡œë¶€???„ë‹¬ë°›ìŒ

  try {
      const workouts = await worksModel.getWorkoutsByDate(userId, date);
      res.status(200).json({ success: true, workouts });
  } catch (error) {
      console.error("?´ë™ ê¸°ë¡ ì¡°íšŒ ì»¨íŠ¸ë¡¤ëŸ¬ ?¤ë¥˜:", error);
      res.status(500).json({ success: false, message: "?´ë™ ê¸°ë¡ ì¡°íšŒ???¤íŒ¨?ˆìŠµ?ˆë‹¤." });
  }
};

// ?´ë™ ê¸°ë¡ ?˜ì • ì»¨íŠ¸ë¡¤ëŸ¬
exports.updateWorkoutRecord = async (req, res) => {
  const { work_num, work_day, work_name, work_weight, work_count, work_part, work_target, work_type } = req.body;
  const work_id = req.user.id; // ë¡œê·¸?¸ëœ ?¬ìš©?ì˜ IDë¥?ê°€?¸ì˜´

  try {
      // ëª¨ë¸ ?¨ìˆ˜ ?¸ì¶œ?˜ì—¬ ?´ë™ ê¸°ë¡ ?˜ì •
      const result = await worksModel.updateWorkoutRecord(work_num, work_day, work_id, {
          work_name, work_weight, work_count, work_part, work_target, work_type
      });
      res.status(200).json(result); // ?±ê³µ ?‘ë‹µ ë°˜í™˜
  } catch (error) {
      console.error("?´ë™ ê¸°ë¡ ?˜ì • ì»¨íŠ¸ë¡¤ëŸ¬ ?¤ë¥˜:", error);
      res.status(500).json({ success: false, message: "?´ë™ ê¸°ë¡ ?˜ì •???¤íŒ¨?ˆìŠµ?ˆë‹¤." });
  }
};

// ?´ë™ ê¸°ë¡ ?? œ ì»¨íŠ¸ë¡¤ëŸ¬
exports.deleteWorkoutRecord = async (req, res) => {
  const { work_num, work_day } = req.body;
  const work_id = req.user.id; // ë¡œê·¸?¸ëœ ?¬ìš©?ì˜ IDë¥?ê°€?¸ì˜´

  try {
      // ëª¨ë¸ ?¨ìˆ˜ ?¸ì¶œ?˜ì—¬ ?´ë™ ê¸°ë¡ ?? œ
      const result = await worksModel.deleteWorkoutRecord(work_num, work_day, work_id);
      res.status(200).json(result); // ?±ê³µ ?‘ë‹µ ë°˜í™˜
  } catch (error) {
      console.error("?´ë™ ê¸°ë¡ ?? œ ì»¨íŠ¸ë¡¤ëŸ¬ ?¤ë¥˜:", error);
      res.status(500).json({ success: false, message: "?´ë™ ê¸°ë¡ ?? œ???¤íŒ¨?ˆìŠµ?ˆë‹¤." });
  }
};

exports.getAllWorkouts = async (req, res) => {
    const userId = req.user.id;
  
    try {
      const workouts = await worksModel.getAllWorkouts(userId);
      res.status(200).json({ success: true, workouts });
    } catch (error) {
      console.error("?„ì²´ ?´ë™ ê¸°ë¡ ì¡°íšŒ ì»¨íŠ¸ë¡¤ëŸ¬ ?¤ë¥˜:", error);
      res.status(500).json({ success: false, message: "?„ì²´ ?´ë™ ê¸°ë¡ ì¡°íšŒ???¤íŒ¨?ˆìŠµ?ˆë‹¤." });
    }
  };

  // ?”ê°„ ?´ë™ ?µê³„ ì¡°íšŒ ì»¨íŠ¸ë¡¤ëŸ¬
exports.getMonthlyWorkoutStats = async (req, res) => {
  const userId = req.user.id; // ë¡œê·¸?¸ëœ ?¬ìš©?ì˜ ID
  const { year, month } = req.body; // ?´ë¼?´ì–¸?¸ì—???„ë„?€ ???•ë³´ë¥??„ë‹¬ë°›ìŒ

  try {
    const workoutStats = await worksModel.getMonthlyWorkoutStats(userId, year, month);
    res.status(200).json({ success: true, workoutStats });
  } catch (error) {
    console.error("?”ê°„ ?´ë™ ?µê³„ ì¡°íšŒ ?¤ë¥˜:", error);
    res.status(500).json({ success: false, message: "?”ê°„ ?´ë™ ?µê³„ ì¡°íšŒ???¤íŒ¨?ˆìŠµ?ˆë‹¤." });
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
    res.status(200).json({ success: true, stats });
  } catch (error) {
    console.error("ë¶€?„ë³„ ?µê³„ ì¡°íšŒ ?¤ë¥˜:", error);
    res.status(500).json({ success: false, message: "ë¶€?„ë³„ ?µê³„ ì¡°íšŒ???¤íŒ¨?ˆìŠµ?ˆë‹¤." });
  }
};
