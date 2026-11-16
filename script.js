const form = document.getElementById("transaction-form");
const descInput = document.getElementById("desc-input");
const amountInput = document.getElementById("amount-input");
const typeSelect = document.getElementById("type-select");
const categorySelect = document.getElementById("category-select");
const transactionList = document.getElementById("transaction-list");
const exportBtn = document.getElementById("export-btn");

let transactions = JSON.parse(localStorage.getItem("finsight_tx")) || [
  { id: 1, desc: "Internship Stipend", amount: 12000, type: "income", category: "Salary / Stipend", date: "2026-11-15" },
  { id: 2, desc: "Cloud Domain & Hosting", amount: 850, type: "expense", category: "Tech & Software", date: "2026-11-16" },
  { id: 3, desc: "Metro Card Recharge", amount: 500, type: "expense", category: "Travel & Commute", date: "2026-11-16" }
];

let expenseChart = null;

function updateDashboard() {
  localStorage.setItem("finsight_tx", JSON.stringify(transactions));

  const income = transactions
    .filter((t) => t.type === "income")
    .reduce((acc, t) => acc + t.amount, 0);

  const expense = transactions
    .filter((t) => t.type === "expense")
    .reduce((acc, t) => acc + t.amount, 0);

  const balance = income - expense;

  document.getElementById("total-balance").textContent = `₹${balance.toFixed(2)}`;
  document.getElementById("total-income").textContent = `+₹${income.toFixed(2)}`;
  document.getElementById("total-expense").textContent = `-₹${expense.toFixed(2)}`;

  renderList();
  renderChart();
}

function renderList() {
  transactionList.innerHTML = "";
  transactions.forEach((tx) => {
    const li = document.createElement("li");
    if (tx.type === "expense") li.classList.add("expense-item");

    const sign = tx.type === "income" ? "+" : "-";
    const color = tx.type === "income" ? "#10b981" : "#ef4444";

    li.innerHTML = `
      <div class="tx-info">
        <strong>${tx.desc}</strong>
        <small>${tx.category} • ${tx.date}</small>
      </div>
      <div class="tx-right">
        <span style="color: ${color}">${sign}₹${tx.amount.toFixed(2)}</span>
        <button class="del-btn" onclick="deleteTransaction(${tx.id})">✕</button>
      </div>
    `;
    transactionList.appendChild(li);
  });
}

function renderChart() {
  const expensesOnly = transactions.filter((t) => t.type === "expense");
  const categoryTotals = {};

  expensesOnly.forEach((t) => {
    categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
  });

  const labels = Object.keys(categoryTotals);
  const data = Object.values(categoryTotals);

  const ctx = document.getElementById("expense-chart").getContext("2d");
  if (expenseChart) expenseChart.destroy();

  expenseChart = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: labels.length ? labels : ["No Expenses"],
      datasets: [{
        data: data.length ? data : [1],
        backgroundColor: data.length
          ? ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"]
          : ["#1e293b"],
        borderWidth: 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "right",
          labels: { color: "#cbd5e1", font: { size: 11 } }
        }
      }
    }
  });
}

window.deleteTransaction = function (id) {
  transactions = transactions.filter((t) => t.id !== id);
  updateDashboard();
};

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const newTx = {
    id: Date.now(),
    desc: descInput.value.trim(),
    amount: parseFloat(amountInput.value),
    type: typeSelect.value,
    category: categorySelect.value,
    date: new Date().toISOString().split("T")[0]
  };

  transactions.unshift(newTx);
  descInput.value = "";
  amountInput.value = "";
  updateDashboard();
});

// CSV Export Functionality
exportBtn.addEventListener("click", () => {
  const headers = ["Date,Description,Category,Type,Amount"];
  const rows = transactions.map((t) => `${t.date},"${t.desc}",${t.category},${t.type},${t.amount}`);
  const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");

  const link = document.createElement("a");
  link.setAttribute("href", encodeURI(csvContent));
  link.setAttribute("download", "finsight_transactions.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
});

updateDashboard();