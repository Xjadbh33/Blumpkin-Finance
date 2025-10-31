document.addEventListener('DOMContentLoaded', function() {
    const toggleBtn = document.getElementById('toggle-btn');
    const body = document.body;
    let isNightMode = true;

    toggleBtn.addEventListener('click', function() {
        isNightMode = !isNightMode;
        body.classList.toggle('day-mode');
        toggleBtn.textContent = isNightMode ? '🌙' : '☀️';
    });

    const menuLinks = document.querySelectorAll('#main-menu a');
    const pages = document.querySelectorAll('.page');

    menuLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            pages.forEach(page => {
                page.classList.remove('active');
            });
            document.getElementById(targetId).classList.add('active');
            menuLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
        });
    });

    const incomeCategories = document.getElementById('income-categories');
    const expenseCategories = document.getElementById('expense-categories');
    const addIncomeBtn = document.getElementById('add-income-category');
    const addExpenseBtn = document.getElementById('add-expense-category');

    function createCategory(container, type) {
        const categoryDiv = document.createElement('div');
        categoryDiv.className = 'category';
        categoryDiv.innerHTML = `
            <input type="text" placeholder="Category Name">
            <input type="number" placeholder="Amount" step="0.01">
            <button class="remove-btn">Remove</button>
        `;
        container.appendChild(categoryDiv);

        const removeBtn = categoryDiv.querySelector('.remove-btn');
        removeBtn.addEventListener('click', function() {
            container.removeChild(categoryDiv);
            updateChart();
        });

        categoryDiv.querySelectorAll('input').forEach(input => {
            input.addEventListener('input', updateChart);
        });
    }

    addIncomeBtn.addEventListener('click', () => createCategory(incomeCategories, 'income'));
    addExpenseBtn.addEventListener('click', () => createCategory(expenseCategories, 'expense'));

    // Charts
    const ctx = document.getElementById('finance-chart').getContext('2d');
    let chart = null;

    function updateChart() {
        const incomeData = Array.from(incomeCategories.querySelectorAll('.category')).map(cat => ({
            label: cat.querySelector('input[type="text"]').value || 'Unnamed',
            value: parseFloat(cat.querySelector('input[type="number"]').value) || 0
        }));

        const expenseData = Array.from(expenseCategories.querySelectorAll('.category')).map(cat => ({
            label: cat.querySelector('input[type="text"]').value || 'Unnamed',
            value: parseFloat(cat.querySelector('input[type="number"]').value) || 0
        }));

        const totalIncome = incomeData.reduce((sum, item) => sum + item.value, 0);
        const totalExpenses = expenseData.reduce((sum, item) => sum + item.value, 0);

        if (chart) chart.destroy();

        const chartType = document.getElementById('pie-chart-btn').classList.contains('active') ? 'pie' : 'bar';

        if (chartType === 'pie') {
            chart = new Chart(ctx, {
                type: 'pie',
                data: {
                    labels: ['Income', 'Expenses'],
                    datasets: [{
                        data: [totalIncome, totalExpenses],
                        backgroundColor: ['#00d4aa', '#ff4d4d']
                    }]
                }
            });
        } else {
            chart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: ['Income', 'Expenses'],
                    datasets: [{
                        label: 'Amount',
                        data: [totalIncome, totalExpenses],
                        backgroundColor: ['#00d4aa', '#ff4d4d']
                    }]
                }
            });
        }
    }

    document.getElementById('pie-chart-btn').addEventListener('click', function() {
        document.getElementById('bar-chart-btn').classList.remove('active');
        this.classList.add('active');
        updateChart();
    });

    document.getElementById('bar-chart-btn').addEventListener('click', function() {
        document.getElementById('pie-chart-btn').classList.remove('active');
        this.classList.add('active');
        updateChart();
    });

    const savingsGoals = document.querySelector('.savings-goals');
    const addSavingsBtn = document.getElementById('add-savings-goal');

    function createSavingsGoal() {
        const goalDiv = document.createElement('div');
        goalDiv.className = 'savings-goal';
        goalDiv.innerHTML = `
            <input type="text" placeholder="Goal Name">
            <input type="number" placeholder="Current Amount" step="0.01">
            <input type="number" placeholder="Target Amount" step="0.01">
            <button class="remove-btn">Remove</button>
        `;
        savingsGoals.appendChild(goalDiv);

        const removeBtn = goalDiv.querySelector('.remove-btn');
        removeBtn.addEventListener('click', () => savingsGoals.removeChild(goalDiv));
    }

    addSavingsBtn.addEventListener('click', createSavingsGoal);

    const reportDisplay = document.getElementById('report-display');
    const monthlyReportBtn = document.getElementById('monthly-report');
    const yearlyReportBtn = document.getElementById('yearly-report');

    function generateReport(type) {
        const incomeData = Array.from(incomeCategories.querySelectorAll('.category')).map(cat => ({
            label: cat.querySelector('input[type="text"]').value || 'Unnamed',
            value: parseFloat(cat.querySelector('input[type="number"]').value) || 0
        }));

        const expenseData = Array.from(expenseCategories.querySelectorAll('.category')).map(cat => ({
            label: cat.querySelector('input[type="text"]').value || 'Unnamed',
            value: parseFloat(cat.querySelector('input[type="number"]').value) || 0
        }));

        const totalIncome = incomeData.reduce((sum, item) => sum + item.value, 0);
        const totalExpenses = expenseData.reduce((sum, item) => sum + item.value, 0);
        const netSavings = totalIncome - totalExpenses;

        const savingsGoalsData = Array.from(savingsGoals.querySelectorAll('.savings-goal')).map(goal => {
            const name = goal.querySelector('input[type="text"]').value || 'Unnamed';
            const current = parseFloat(goal.querySelectorAll('input[type="number"]')[0].value) || 0;
            const target = parseFloat(goal.querySelectorAll('input[type="number"]')[1].value) || 0;
            const needed = target - current;
            return { name, current, target, needed };
        });

        reportDisplay.innerHTML = `
            <h3>${type} Report</h3>
            <div class="report-item"><strong>Total Income:</strong> $${totalIncome.toFixed(2)}</div>
            <div class="report-item"><strong>Total Expenses:</strong> $${totalExpenses.toFixed(2)}</div>
            <div class="report-item"><strong>Net Savings:</strong> $${netSavings.toFixed(2)}</div>
            <h4>Savings Goals</h4>
            ${savingsGoalsData.map(goal => `
                <div class="report-item">
                    <strong>${goal.name}:</strong> Current: $${goal.current.toFixed(2)}, Target: $${goal.target.toFixed(2)}, Needed: $${goal.needed.toFixed(2)}
                </div>
            `).join('')}
        `;
    }

    monthlyReportBtn.addEventListener('click', () => generateReport('Monthly'));
    yearlyReportBtn.addEventListener('click', () => generateReport('Yearly'));

    const mobileViewBtn = document.getElementById('mobile-view-btn');
    const desktopViewBtn = document.getElementById('desktop-view-btn');
    const bodyElement = document.body;

    mobileViewBtn.addEventListener('click', function() {
        bodyElement.classList.add('mobile-view');
        desktopViewBtn.classList.remove('active');
        this.classList.add('active');
    });

    desktopViewBtn.addEventListener('click', function() {
        bodyElement.classList.remove('mobile-view');
        mobileViewBtn.classList.remove('active');
        this.classList.add('active');
    });

    updateChart();
});
