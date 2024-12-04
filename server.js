const express = require('express');
const bodyParser = require('body-parser');
const cron = require('node-cron');

const app = express();
app.use(bodyParser.json());

const PORT = process.env.PORT || 3000;

// In-memory storage for expenses
let expenses = [];

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

app.post('/expenses', (req, res) => {
    const { category, amount, date } = req.body;
    if (!category || !amount || !date || amount <= 0) {
        return res.status(400).json({ status: 'error', error: 'Invalid input' });
    }
    expenses.push({ category, amount, date });
    res.status(201).json({ status: 'success', data: expenses });
});

app.get('/expenses', (req, res) => {
    const { category, startDate, endDate } = req.query;
    let filteredExpenses = expenses;

    if (category) {
        filteredExpenses = filteredExpenses.filter(exp => exp.category === category);
    }
    if (startDate || endDate) {
        filteredExpenses = filteredExpenses.filter(exp => {
            const expDate = new Date(exp.date);
            return (!startDate || expDate >= new Date(startDate)) &&
                   (!endDate || expDate <= new Date(endDate));
        });
    }

    res.json({ status: 'success', data: filteredExpenses });
});
app.get('/expenses/analysis', (req, res) => {
    const analysis = expenses.reduce((acc, exp) => {
        acc.total += exp.amount;
        acc.categories[exp.category] = (acc.categories[exp.category] || 0) + exp.amount;
        return acc;
    }, { total: 0, categories: {} });

    res.json({ status: 'success', data: analysis });
});
cron.schedule('0 0 * * *', () => {
    // This will run every day at midnight
    console.log('Generating daily summary report...');
    // Logic to generate summary can be added here.
});