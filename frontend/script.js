const API_BASE_URL = "http://127.0.0.1:8000";

const form = document.querySelector("#expense-form");
const messageBox = document.querySelector("#form-message");
const submitButton = document.querySelector("#submit-button");
const applyFiltersButton = document.querySelector("#apply-filters-button");
const clearFiltersButton = document.querySelector("#clear-filters-button");
const dateInput = document.querySelector("#date");
const filterAmountInput = document.querySelector("#filter-amount");
const filterSearchInput = document.querySelector("#filter-search");
const filterCategoryInput = document.querySelector("#filter-category");
const filterStartDateInput = document.querySelector("#filter-start-date");
const filterEndDateInput = document.querySelector("#filter-end-date");
const scrollTriggerElements = document.querySelectorAll("[data-scroll-target]");
const refreshDashboardButton = document.querySelector("#refresh-dashboard-button");
const refreshButton = document.querySelector("#refresh-expenses-button");
const expensesFeedback = document.querySelector("#expenses-feedback");
const expensesLoading = document.querySelector("#expenses-loading");
const expensesEmpty = document.querySelector("#expenses-empty");
const expensesTableWrapper = document.querySelector("#expenses-table-wrapper");
const expensesTableBody = document.querySelector("#expenses-table-body");
const expensesCards = document.querySelector("#expenses-cards");
const summaryLoading = document.querySelector("#summary-loading");
const summaryFeedback = document.querySelector("#summary-feedback");
const summaryContent = document.querySelector("#summary-content");
const summaryTotalAmount = document.querySelector("#summary-total-amount");
const summaryTotalExpenses = document.querySelector("#summary-total-expenses");
const summaryMonthlyList = document.querySelector("#summary-monthly-list");
const summaryCategoryList = document.querySelector("#summary-category-list");

const hasSummaryView = Boolean(
	summaryContent
	&& summaryTotalAmount
	&& summaryTotalExpenses
	&& summaryMonthlyList
	&& summaryCategoryList,
);
const hasExpensesView = Boolean(expensesTableBody || expensesCards);

if (dateInput) {
	dateInput.value = new Date().toISOString().split("T")[0];
}

if (form) {
	form.addEventListener("submit", handleExpenseSubmit);
}

if (clearFiltersButton) {
	clearFiltersButton.addEventListener("click", handleFiltersClear);
}

if (applyFiltersButton) {
	applyFiltersButton.addEventListener("click", loadExpenses);
}

if (refreshDashboardButton) {
	refreshDashboardButton.addEventListener("click", handleRefresh);
}

if (refreshButton) {
	refreshButton.addEventListener("click", handleRefresh);
}

for (const triggerElement of scrollTriggerElements) {
	triggerElement.addEventListener("click", handleScrollTrigger);
}

for (const filterInput of [
	filterAmountInput,
	filterSearchInput,
	filterCategoryInput,
	filterStartDateInput,
	filterEndDateInput,
]) {
	if (!filterInput) {
		continue;
	}

	filterInput.addEventListener("keydown", (event) => {
		if (event.key === "Enter") {
			event.preventDefault();
			loadExpenses();
		}
	});
}

loadDashboardData();

function handleFiltersClear() {
	if (filterAmountInput) {
		filterAmountInput.value = "";
	}

	if (filterSearchInput) {
		filterSearchInput.value = "";
	}

	if (filterCategoryInput) {
		filterCategoryInput.value = "";
	}

	if (filterStartDateInput) {
		filterStartDateInput.value = "";
	}

	if (filterEndDateInput) {
		filterEndDateInput.value = "";
	}

	loadDashboardData();
}

async function handleExpenseSubmit(event) {
	event.preventDefault();
	hideMessage();
	showExpensesFeedback("");

	if (!form.reportValidity()) {
		return;
	}

	const formData = new FormData(form);
	const payload = {
		amount: Number(formData.get("amount")),
		category: String(formData.get("category") || "").trim(),
		description: String(formData.get("description") || "").trim() || null,
		date: String(formData.get("date") || ""),
	};

	setSubmittingState(true);

	try {
		const response = await fetch(`${API_BASE_URL}/expenses`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(payload),
		});

		const data = await parseJsonResponse(response);

		if (!response.ok) {
			showMessage(buildErrorMessage(data), "danger");
			return;
		}

		form.reset();
		if (dateInput) {
			dateInput.value = new Date().toISOString().split("T")[0];
		}

		showMessage("Gasto guardado correctamente.", "success");
		await loadDashboardData();
	} catch (error) {
		showMessage(
			"No fue posible conectar con el servidor. Verifica que el backend este en ejecucion.",
			"danger",
		);
	} finally {
		setSubmittingState(false);
	}
}

async function handleRefresh() {
	await loadDashboardData();
}

function handleScrollTrigger(event) {
	const triggerElement = event.currentTarget;
	if (!(triggerElement instanceof HTMLElement)) {
		return;
	}

	const targetId = triggerElement.dataset.scrollTarget;
	if (!targetId) {
		return;
	}

	const targetElement = document.getElementById(targetId);
	if (!targetElement) {
		return;
	}

	event.preventDefault();
	targetElement.scrollIntoView({ behavior: "smooth", block: "start" });
}

async function loadDashboardData() {
	const tasks = [];

	if (hasSummaryView) {
		tasks.push(loadSummary());
	}

	if (hasExpensesView) {
		tasks.push(loadExpenses());
	}

	await Promise.all(tasks);
}

async function loadExpenses() {
	if (!hasExpensesView) {
		return;
	}

	setExpensesLoadingState(true);
	showExpensesFeedback("");

	try {
		const response = await fetch(buildExpensesUrl());
		const data = await parseJsonResponse(response);

		if (!response.ok) {
			throw new Error(buildErrorMessage(data));
		}

		const expenses = Array.isArray(data) ? data : [];
		renderExpenses(applyClientSideFilters(expenses));
	} catch (error) {
		renderExpenses([]);
		showExpensesFeedback(
			error instanceof Error && error.message
				? error.message
				: "No fue posible cargar la lista de gastos.",
			"danger",
		);
	} finally {
		setExpensesLoadingState(false);
	}
}

async function loadSummary() {
	if (!hasSummaryView) {
		return;
	}

	setSummaryLoadingState(true);
	showSummaryFeedback("");

	try {
		const response = await fetch(`${API_BASE_URL}/expenses/summary`);
		const data = await parseJsonResponse(response);

		if (!response.ok) {
			throw new Error(buildErrorMessage(data));
		}

		renderSummary(data);
	} catch (error) {
		renderSummary(null);
		showSummaryFeedback(
			error instanceof Error && error.message
				? error.message
				: "No fue posible cargar el resumen de gastos.",
			"danger",
		);
	} finally {
		setSummaryLoadingState(false);
	}
}

function buildExpensesUrl() {
	const params = new URLSearchParams();
	const filters = getActiveFilters();

	for (const [key, value] of Object.entries(filters)) {
		if (value) {
			params.set(key, value);
		}
	}

	const queryString = params.toString();
	return queryString ? `${API_BASE_URL}/expenses?${queryString}` : `${API_BASE_URL}/expenses`;
}

function getActiveFilters() {
	return {
		search: String(filterSearchInput?.value || "").trim(),
		category: String(filterCategoryInput?.value || "").trim(),
		start_date: String(filterStartDateInput?.value || "").trim(),
		end_date: String(filterEndDateInput?.value || "").trim(),
	};
}

function applyClientSideFilters(expenses) {
	const amountFilter = Number.parseFloat(String(filterAmountInput?.value || "").trim());

	if (Number.isNaN(amountFilter)) {
		return expenses;
	}

	return expenses.filter((expense) => Number(expense.amount) === amountFilter);
}

function renderExpenses(expenses) {
	if (!expensesTableBody || !expensesCards) {
		return;
	}

	expensesTableBody.innerHTML = "";
	expensesCards.innerHTML = "";

	if (!expenses.length) {
		expensesEmpty.classList.remove("d-none");
		expensesTableWrapper.classList.add("d-none");
		return;
	}

	expensesEmpty.classList.add("d-none");
	expensesTableWrapper.classList.remove("d-none");

	for (const expense of expenses) {
		const tableRow = document.createElement("tr");
		tableRow.innerHTML = `
			<td>${formatDate(expense.date)}</td>
			<td class="fw-semibold">${formatAmount(expense.amount)}</td>
			<td>${escapeHtml(expense.category)}</td>
			<td>${escapeHtml(expense.description || "Sin descripcion")}</td>
		`;
		expensesTableBody.appendChild(tableRow);

		const card = document.createElement("article");
		card.className = "expense-card p-3 shadow-sm";
		card.innerHTML = `
			<div class="d-flex justify-content-between align-items-start gap-3 mb-3">
				<div>
					<p class="expense-meta-label mb-1">Categoria</p>
					<p class="mb-0 fw-semibold">${escapeHtml(expense.category)}</p>
				</div>
				<div class="text-end">
					<p class="expense-meta-label mb-1">Monto</p>
					<p class="mb-0 fw-semibold">${formatAmount(expense.amount)}</p>
				</div>
			</div>
			<div class="mb-3">
				<p class="expense-meta-label mb-1">Fecha</p>
				<p class="mb-0">${formatDate(expense.date)}</p>
			</div>
			<div>
				<p class="expense-meta-label mb-1">Descripcion</p>
				<p class="mb-0 expense-description">${escapeHtml(expense.description || "Sin descripcion")}</p>
			</div>
		`;
		expensesCards.appendChild(card);
	}
}

function renderSummary(summary) {
	if (
		!summaryContent
		|| !summaryTotalAmount
		|| !summaryTotalExpenses
		|| !summaryMonthlyList
		|| !summaryCategoryList
	) {
		return;
	}

	if (!summary) {
		summaryContent.classList.add("d-none");
		summaryMonthlyList.innerHTML = "";
		summaryCategoryList.innerHTML = "";
		return;
	}

	summaryContent.classList.remove("d-none");
	summaryTotalAmount.textContent = formatAmount(summary.total_amount);
	summaryTotalExpenses.textContent = String(summary.total_expenses ?? 0);

	summaryMonthlyList.innerHTML = "";
	const monthlyTotals = Array.isArray(summary.monthly_totals) ? summary.monthly_totals : [];
	if (!monthlyTotals.length) {
		summaryMonthlyList.innerHTML = `
			<div class="rounded-4 border p-3 bg-light-subtle text-secondary small">
				No hay datos mensuales disponibles.
			</div>
		`;
	} else {
		for (const item of monthlyTotals) {
			const monthCard = document.createElement("div");
			monthCard.className = "rounded-4 border p-3 bg-light-subtle";
			monthCard.innerHTML = `
				<div class="d-flex justify-content-between align-items-center gap-3">
					<div>
						<p class="text-secondary text-uppercase fw-bold small mb-1">Mes</p>
						<p class="mb-0 fw-semibold">${escapeHtml(formatMonth(item.month))}</p>
					</div>
					<p class="mb-0 fw-bold">${formatAmount(item.total_amount)}</p>
				</div>
			`;
			summaryMonthlyList.appendChild(monthCard);
		}
	}

	summaryCategoryList.innerHTML = "";
	const categoryTotals = Array.isArray(summary.category_totals) ? summary.category_totals : [];
	if (!categoryTotals.length) {
		summaryCategoryList.innerHTML = `
			<div class="rounded-4 border p-3 bg-light-subtle text-secondary small">
				No hay datos por categoría disponibles.
			</div>
		`;
	} else {
		for (const item of categoryTotals) {
			const categoryCard = document.createElement("div");
			const percentage = Number(item.percentage) || 0;
			const safePercentage = Math.min(Math.max(percentage, 0), 100);
			categoryCard.className = "rounded-4 border p-3 bg-light-subtle";
			categoryCard.innerHTML = `
				<div class="d-flex justify-content-between align-items-center gap-3 mb-2">
					<div>
						<p class="text-secondary text-uppercase fw-bold small mb-1">Categoría</p>
						<p class="mb-0 fw-semibold">${escapeHtml(item.category || "Sin categoría")}</p>
					</div>
					<div class="text-end">
						<p class="mb-0 fw-bold">${formatAmount(item.total_amount)}</p>
						<p class="text-secondary small mb-0">${safePercentage.toFixed(2)}%</p>
					</div>
				</div>
				<div class="progress" role="progressbar" aria-valuenow="${safePercentage.toFixed(2)}" aria-valuemin="0" aria-valuemax="100" style="height: 0.5rem;">
					<div class="progress-bar bg-dark" style="width: ${safePercentage}%;"></div>
				</div>
			`;
			summaryCategoryList.appendChild(categoryCard);
		}
	}
}

async function parseJsonResponse(response) {
	const contentType = response.headers.get("content-type") || "";
	if (!contentType.includes("application/json")) {
		return null;
	}

	return response.json();
}

function buildErrorMessage(payload) {
	if (!payload) {
		return "Ocurrio un error inesperado.";
	}

	if (Array.isArray(payload.details)) {
		const messages = payload.details.map((item) => `${item.field}: ${item.message}`);
		return messages.join(" ");
	}

	if (payload.details && typeof payload.details.message === "string") {
		return payload.details.message;
	}

	if (typeof payload.detail === "string") {
		return payload.detail;
	}

	if (typeof payload.error === "string") {
		return payload.error;
	}

	return "Ocurrio un error inesperado.";
}

function showMessage(message, type) {
	if (!messageBox) {
		return;
	}

	messageBox.textContent = message;
	messageBox.className = `alert alert-${type}`;
}

function hideMessage() {
	if (!messageBox) {
		return;
	}

	messageBox.textContent = "";
	messageBox.className = "alert d-none";
}

function showExpensesFeedback(message, type) {
	if (!expensesFeedback) {
		return;
	}

	if (!message) {
		expensesFeedback.textContent = "";
		expensesFeedback.className = "alert d-none mb-4";
		return;
	}

	expensesFeedback.textContent = message;
	expensesFeedback.className = `alert alert-${type} mb-4`;
}

function showSummaryFeedback(message, type) {
	if (!summaryFeedback) {
		return;
	}

	if (!message) {
		summaryFeedback.textContent = "";
		summaryFeedback.className = "alert d-none mb-4";
		return;
	}

	summaryFeedback.textContent = message;
	summaryFeedback.className = `alert alert-${type} mb-4`;
}

function setSubmittingState(isSubmitting) {
	if (!submitButton) {
		return;
	}

	submitButton.disabled = isSubmitting;
	submitButton.textContent = isSubmitting ? "Guardando..." : "Guardar gasto";
}

function setExpensesLoadingState(isLoading) {
	if (expensesLoading) {
		expensesLoading.classList.toggle("d-none", !isLoading);
	}

	if (refreshButton) {
		refreshButton.disabled = isLoading;
	}

	if (applyFiltersButton) {
		applyFiltersButton.disabled = isLoading;
	}

	if (clearFiltersButton) {
		clearFiltersButton.disabled = isLoading;
	}
}

function setSummaryLoadingState(isLoading) {
	if (summaryLoading) {
		summaryLoading.classList.toggle("d-none", !isLoading);
	}
}

function formatAmount(amount) {
	return new Intl.NumberFormat("es-ES", {
		style: "currency",
		currency: "EUR",
		minimumFractionDigits: 2,
	}).format(Number(amount) || 0);
}

function formatDate(value) {
	if (!value) {
		return "Sin fecha";
	}

	const date = new Date(`${value}T00:00:00`);
	return new Intl.DateTimeFormat("es-ES", {
		day: "2-digit",
		month: "short",
		year: "numeric",
	}).format(date);
}

function formatMonth(value) {
	if (!value) {
		return "Sin datos";
	}

	const date = new Date(`${value}-01T00:00:00`);
	return new Intl.DateTimeFormat("es-ES", {
		month: "long",
		year: "numeric",
	}).format(date);
}

function escapeHtml(value) {
	return String(value)
		.replaceAll("&", "&amp;")
		.replaceAll("<", "&lt;")
		.replaceAll(">", "&gt;")
		.replaceAll('"', "&quot;")
		.replaceAll("'", "&#39;");
}
