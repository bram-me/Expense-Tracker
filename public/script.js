document.addEventListener('DOMContentLoaded', () => {
  // Initialize Chart.js
  const ctx = document.getElementById('incomeExpenseChart').getContext('2d');
  let incomeExpenseChart;

  // Function to initialize the chart
  const initializeChart = (incomeTotal, expenseTotal) => {
    if (incomeExpenseChart) {
      incomeExpenseChart.destroy(); // Destroy the previous chart if it exists
    }
    
    incomeExpenseChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Income', 'Expenses'],
        datasets: [{
          label: 'Amount ($)',
          data: [incomeTotal, expenseTotal],
          backgroundColor: [
            'rgba(75, 192, 192, 0.2)', // Income color
            'rgba(255, 99, 132, 0.2)'  // Expenses color
          ],
          borderColor: [
            'rgba(75, 192, 192, 1)',   // Income border
            'rgba(255, 99, 132, 1)'    // Expenses border
          ],
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  };

  // Expense Form Submission
  document.getElementById('expenseForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    const category = document.getElementById('expenseCategory').value;
    const name = document.getElementById('expenseName').value;
    const amount = parseFloat(document.getElementById('expenseAmount').value); 
    const date = document.getElementById('expenseDate').value;

    try {
      const response = await fetch('/routes/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ Category_ID: category, Description: name, Amount: amount, Date: date })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error adding expense');
      }

      alert('Expense added successfully');
      fetchData(); // Refresh data

    } catch (error) {
      console.error('Error adding expense:', error);
      alert(`Failed to add expense: ${error.message}`);
    }
  });

  // Income Form Submission
  document.getElementById('incomeForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    const amount = parseFloat(document.getElementById('incomeAmount').value); 
    const date = document.getElementById('incomeDate').value;
    const source = document.getElementById('incomeSource').value;

    try {
      const response = await fetch('/routes/incomes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ Amount: amount, Date: date, Source: source })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error adding income');
      }

      alert('Income added successfully');
      fetchData(); // Refresh data
      
    } catch (error) {
      console.error('Error adding income:', error);
      alert(`Failed to add income: ${error.message}`);
    }
  });

  // Financial Goal Form Submission
  document.getElementById('financialGoalForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    const description = document.getElementById('goalDescription').value;
    const amount = parseFloat(document.getElementById('goalAmount').value); 
    const deadline = document.getElementById('goalDeadline').value;

    try {
      const response = await fetch('/routes/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ Description: description, TargetAmount: amount, EndDate: deadline })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error adding financial goal');
      }

      alert('Financial goal added successfully');
      fetchData(); // Refresh data
    
    } catch (error) {
      console.error('Error adding financial goal:', error);
      alert(`Failed to add financial goal: ${error.message}`);
    }
  });

  // Category Form Submission
  document.getElementById('categoryForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    const categoryName = document.getElementById('categoryName').value;

    try {
      const response = await fetch('/routes/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ Name: categoryName })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error adding category');
      }

      alert('Category added successfully');
      fetchData(); // Refresh data
      
    } catch (error) {
      console.error('Error adding category:', error);
      alert(`Failed to add category: ${error.message}`);
    }
  });

  // Fetch and display expenses, incomes, goals, and categories
  const fetchData = async () => {
    try {
      const [expensesResponse, incomesResponse, goalsResponse, categoriesResponse] = await Promise.all([
        fetch('/routes/expenses'),
        fetch('/routes/incomes'),
        fetch('/routes/goals'),
        fetch('/routes/categories')
      ]);

      if (!expensesResponse.ok || !incomesResponse.ok || !goalsResponse.ok || !categoriesResponse.ok) {
        throw new Error('Failed to fetch data');
      }

      const expenses = await expensesResponse.json();
      const incomes = await incomesResponse.json();
      const goals = await goalsResponse.json();
      const categories = await categoriesResponse.json();

      // Displaying expenses
      const transactionList = document.getElementById('transactionList');
      transactionList.innerHTML = '';
      expenses.forEach(expense => {
        const li = document.createElement('li');
        li.textContent = `Expense: ${expense.Amount} on ${expense.Date}`;
        transactionList.appendChild(li);
      });

      // Displaying incomes
      const incomeList = document.getElementById('incomeList');
      incomeList.innerHTML = '';
      incomes.forEach(income => {
        const li = document.createElement('li');
        li.textContent = `Income: ${income.Amount} from ${income.Source} on ${income.Date}`;
        incomeList.appendChild(li);
      });

      // Displaying goals
      const goalsList = document.getElementById('goalsList');
      goalsList.innerHTML = '';
      goals.forEach(goal => {
        const li = document.createElement('li');
        li.textContent = `Goal: ${goal.Description}, Target: ${goal.TargetAmount}, Deadline: ${goal.EndDate}`;
        goalsList.appendChild(li);
      });

      // Displaying categories
      const categoriesList = document.getElementById('categoriesList');
      categoriesList.innerHTML = '';
      categories.forEach(category => {
        const li = document.createElement('li');
        li.textContent = `Category: ${category.Name}`;
        categoriesList.appendChild(li);
      });

      // Calculate totals for chart
      const totalIncome = incomes.reduce((acc, income) => acc + income.Amount, 0);
      const totalExpenses = expenses.reduce((acc, expense) => acc + expense.Amount, 0);

      // Initialize chart with updated data
      initializeChart(totalIncome, totalExpenses);

    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  fetchData();
});
