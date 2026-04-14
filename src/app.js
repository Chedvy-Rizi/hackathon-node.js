const express = require('express');
const cors = require('cors');
// כאן תוכלי לייבא נתיבים (Routes) בהמשך
// const reportRoutes = require('./routes/reportRoutes');

const app = express();

// הגדרות בסיסיות
app.use(cors()); // מאפשר ל-React להתחבר
app.use(express.json()); // מאפשר לשרת לקרוא JSON בגוף הבקשה

// נתיב בדיקה פשוט כדי לראות שהשרת חי
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', message: 'VocalMaster Server is healthy' });
});

// כאן תרשמי את הנתיבים שלך בהמשך
// app.use('/api/reports', reportRoutes);

module.exports = app; // מייצאים את האפליקציה כדי ש-index.js יוכל להריץ אותה