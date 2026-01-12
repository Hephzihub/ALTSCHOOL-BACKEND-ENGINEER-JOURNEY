// State
let birthdays = [];
const API_BASE = "http://localhost:3006/api"; // TODO: Set your API base URL, e.g., 'http://localhost:3000/api'

// DOM Elements
const birthdayForm = document.getElementById("birthday-form");
const birthdayList = document.getElementById("birthday-list");
const birthdayCount = document.getElementById("birthday-count");
const searchInput = document.getElementById("search-input");
const fileInput = document.getElementById("file-input");
const dropZone = document.getElementById("drop-zone");
const uploadResults = document.getElementById("upload-results");

// Toast notification
function showToast(message, type = "success") {
  const container = document.getElementById("toast-container");
  const toast = document.createElement("div");
  const bgColor =
    type === "success"
      ? "bg-success"
      : type === "error"
      ? "bg-destructive"
      : "bg-primary";
  toast.className = `${bgColor} text-white px-4 py-3 rounded-lg shadow-lg animate-fade-in flex items-center gap-2 min-w-64`;
  const icon =
    type === "success"
      ? '<svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>'
      : '<svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>';
  toast.innerHTML = `${icon}<span class="text-sm">${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = "0";
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// Tab switching
function switchTab(tab) {
  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.classList.remove("bg-background", "text-foreground", "shadow-sm");
  });
  document
    .getElementById(`tab-${tab}`)
    .classList.add("bg-background", "text-foreground", "shadow-sm");
  document
    .getElementById("content-manage")
    .classList.toggle("hidden", tab !== "manage");
  document
    .getElementById("content-status")
    .classList.toggle("hidden", tab !== "status");
  if (tab === "status") fetchStatus();
}

// Format date
function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// Get birthday status badge
function getBirthdayBadge(dateStr) {
  const today = new Date();
  const dob = new Date(dateStr);
  const isToday =
    dob.getMonth() === today.getMonth() && dob.getDate() === today.getDate();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const isTomorrow =
    dob.getMonth() === tomorrow.getMonth() &&
    dob.getDate() === tomorrow.getDate();
  if (isToday)
    return '<span class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-success/10 text-success">Today</span>';
  if (isTomorrow)
    return '<span class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-primary/10 text-primary">Tomorrow</span>';
  return "";
}

async function getAllBirthdays() {
  fetch(`${API_BASE}/birthdays/all`)
    .then((res) => res.json())
    .then((data) => {
      birthdays = data;
      renderBirthdays();
    })
    .catch((err) => {
      console.error("Error fetching birthdays:", err);
      showToast("Failed to fetch birthdays", "error");
    });
}

// Initial fetch of birthdays
getAllBirthdays();

// Render birthday list
function renderBirthdays() {
  const query = searchInput.value.toLowerCase();
  const filtered = birthdays.filter(
    (b) =>
      b.username.toLowerCase().includes(query) ||
      b.email.toLowerCase().includes(query)
  );
  birthdayCount.textContent = birthdays.length;

  if (filtered.length === 0) {
    birthdayList.innerHTML = `
          <div class="flex flex-col items-center justify-center py-8 text-center">
            <div class="flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-3">
              <svg class="h-6 w-6 text-muted-foreground" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            </div>
            <p class="text-sm font-medium text-muted-foreground">${
              birthdays.length === 0 ? "No birthdays yet" : "No results found"
            }</p>
            <p class="text-xs text-muted-foreground mt-1">${
              birthdays.length === 0
                ? "Add your first birthday above"
                : "Try a different search term"
            }</p>
          </div>`;
    return;
  }

  birthdayList.innerHTML = filtered
    .map(
      (b) => `
        <div class="flex items-center justify-between rounded-lg border border-border/50 p-3 transition-colors hover:bg-muted/30 animate-fade-in" data-id="${
          b._id || b.id
        }">
          <div class="flex items-center gap-3 min-w-0">
            <div class="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-medium shrink-0">
              ${b.username.charAt(0).toUpperCase()}
            </div>
            <div class="min-w-0">
              <div class="flex items-center gap-2">
                <p class="font-medium text-sm truncate">${b.username}</p>
                ${getBirthdayBadge(b.dateOfBirth)}
              </div>
              <p class="text-xs text-muted-foreground truncate">${b.email}</p>
              <p class="text-xs text-muted-foreground">${formatDate(
                b.dateOfBirth
              )}</p>
            </div>
          </div>
          <button onclick="deleteBirthday('${
            b._id || b.id
          }')" class="inline-flex items-center justify-center rounded-md h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors">
            <svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
          </button>
        </div>
      `
    )
    .join("");
}

// Add birthday
birthdayForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const username = document.getElementById("username").value.trim();
  const email = document.getElementById("email").value.trim().toLowerCase();
  const dateOfBirth = document.getElementById("dob").value;

  if (birthdays.some((b) => b.email.toLowerCase() === email)) {
    showToast("This email is already registered", "error");
    return;
  }

  const newBirthday = {
    id: crypto.randomUUID(),
    username,
    email,
    dateOfBirth,
    createdAt: new Date().toISOString(),
  };

  const submitBtn = birthdayForm.querySelector('button[type="submit"]');
  submitBtn.disabled = true;
  const oldText = submitBtn.innerHTML;
  submitBtn.innerHTML = "Adding...";

  try {
    const res = await fetch(`${API_BASE}/birthdays`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, dateOfBirth }),
    });

    if (res.ok) {
      const data = await res.json();
      console.log("API Response:", data, res);
      birthdays.unshift(data);
      renderBirthdays();
      birthdayForm.reset();
      showToast(`Birthday added for ${username}`);
    } else {
      const errData = await res.json();
      showToast(errData.error || "Failed to add birthday", "error");
    }
  } catch (error) {
    console.error("Error:", error);
    showToast("Failed to add birthday", "error");
  }
  submitBtn.disabled = false;

  submitBtn.innerHTML = oldText;
});

// Delete birthday
async function deleteBirthday(id) {
  try {
    // Select the delete button and disable it
    const deleteBtn = document.querySelector(`div[data-id="${id}"] button`);
    if (deleteBtn) {
      deleteBtn.disabled = true;
    }

    const res = await fetch(`${API_BASE}/birthdays/${id}`, {
      method: "DELETE",
    });

    console.log("Delete API Response:", res);

    // if status is 204 No Content, consider it successful

    if (res.ok) {
      birthdays = birthdays.filter((b) => b._id !== id);
      renderBirthdays();
      showToast("Birthday removed");
    } else {
      const errData = await res.json();
      showToast(errData.error || "Failed to delete birthday", "error");
      // Re-enable the button on failure
      if (deleteBtn) {
        deleteBtn.disabled = false;
      }
    }
  } catch (error) {
    console.error("Error:", error);
    showToast("Failed to delete birthday", "error");
    if (deleteBtn) {
      deleteBtn.disabled = false;
    }
  }
}

// Search
searchInput.addEventListener("input", renderBirthdays);

// Excel upload - Process file locally and send as array to bulk endpoint
async function processExcelFile(file) {
  const reader = new FileReader();
  reader.onload = async (e) => {
    try {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(sheet);

      let html = "";

      const validData = [];
      let duplicates = 0;
      let errors = 0;
      const existingEmails = birthdays.map((b) => b.email.toLowerCase());

      rows.forEach((row) => {
        const username =
          row.name ||
          row.Name ||
          row.NAME ||
          row.username ||
          row.Username ||
          row.USERNAME;
        const email = (row.email || row.Email || "").toLowerCase();
        const dob =
          row.dateOfBirth ||
          row.dob ||
          row.birthday ||
          row.DateOfBirth ||
          row.DOB ||
          row.Birthday;

        if (!username || !email || !dob) {
          errors++;
          return;
        }
        if (existingEmails.includes(email)) {
          duplicates++;
          return;
        }

        let dateStr = dob;
        if (typeof dob === "number") {
          const excelDate = new Date((dob - 25569) * 86400 * 1000);
          dateStr = excelDate.toISOString().split("T")[0];
        } else {
          dateStr = new Date(dob).toISOString().split("T")[0];
        }

        validData.push({
          username,
          email,
          dateOfBirth: dateStr,
        });
        existingEmails.push(email);
      });

      if (validData.length === 0) {
        if (duplicates > 0 || errors > 0) {
          uploadResults.classList.remove("hidden");
          html += `<div class="flex items-center gap-2 text-sm text-muted-foreground">
            <svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
            ${duplicates} duplicate${duplicates !== 1 ? "s" : ""} skipped, ${errors} row${errors !== 1 ? "s" : ""} with missing data
          </div>`;
          uploadResults.innerHTML = html;
          showToast(`Import completed with ${duplicates} duplicates and ${errors} errors`, "error");
        } else {
          showToast("No valid data found in file", "error");
        }
        return;
      }

      // Send valid data to bulk endpoint
      const res = await fetch(`${API_BASE}/birthdays/bulk`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validData),
      });

      const responseData = await res.json();

      if (!res.ok) {
        showToast(responseData.error || "Failed to import birthdays", "error");
        return;
      }

      // Refresh birthdays list
      await getAllBirthdays();

      const successCount = responseData.success?.length || 0;
      const failedCount = responseData.failed?.length || 0;

      uploadResults.classList.remove("hidden");
      html = "";

      if (successCount > 0) {
        html += `
          <div class="flex items-center gap-2 text-sm text-success">
            <svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            ${successCount} birthday${successCount !== 1 ? "s" : ""} added
          </div>`;
      }

      if (duplicates > 0) {
        html += `
          <div class="flex items-center gap-2 text-sm text-muted-foreground">
            <svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
            ${duplicates} duplicate${duplicates !== 1 ? "s" : ""} skipped
          </div>`;
      }

      if (errors > 0) {
        html += `
          <div class="flex items-center gap-2 text-sm text-destructive">
            <svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" x2="9" y1="9" y2="15"/><line x1="9" x2="15" y1="9" y2="15"/></svg>
            ${errors} row${errors !== 1 ? "s" : ""} with missing data
          </div>`;
      }

      if (failedCount > 0) {
        html += `
          <div class="flex items-center gap-2 text-sm text-destructive">
            <svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" x2="9" y1="9" y2="15"/><line x1="9" x2="15" y1="9" y2="15"/></svg>
            ${failedCount} record${failedCount !== 1 ? "s" : ""} failed to save
          </div>`;
      }

      uploadResults.innerHTML = html;

      if (successCount > 0) {
        showToast(
          `Successfully imported ${successCount} birthday${
            successCount !== 1 ? "s" : ""
          }`
        );
      }
    } catch (err) {
      console.error("Error:", err);
      showToast("Error processing file", "error");
    }
  };
  reader.readAsArrayBuffer(file);
}

fileInput.addEventListener("change", (e) => {
  // Reset file input value to allow re-uploading the same file
  if (e.target.files[0]) processExcelFile(e.target.files[0]);
  fileInput.value = "";
});

dropZone.addEventListener("dragover", (e) => {
  e.preventDefault();
  dropZone.classList.add("drag-over");
});
dropZone.addEventListener("dragleave", () =>
  dropZone.classList.remove("drag-over")
);
dropZone.addEventListener("drop", (e) => {
  e.preventDefault();
  dropZone.classList.remove("drag-over");
  if (e.dataTransfer.files[0]) processExcelFile(e.dataTransfer.files[0]);
});

// Download template
function downloadTemplate() {
  const templateData = [
    {
      username: "John Doe",
      email: "john@example.com",
      dateOfBirth: "1990-05-15",
    },
    {
      username: "Jane Smith",
      email: "jane@example.com",
      dateOfBirth: "1985-12-25",
    },
    {
      username: "Bob Wilson",
      email: "bob@example.com",
      dateOfBirth: "1992-03-08",
    },
  ];
  const ws = XLSX.utils.json_to_sheet(templateData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Birthdays");
  XLSX.writeFile(wb, "birthday_template.xlsx");
}

// Fetch status from API
async function fetchStatus() {
  // TODO: Uncomment to fetch from API
  const res = await fetch(`${API_BASE}/birthdays/status`);
  const data = await res.json();

  document.getElementById("cron-status-value").textContent =
    data.cronStatus ? 'Active' : 'Inactive';
  document.getElementById("emails-today").textContent = data.todayEmailSent;
  document.getElementById("total-emails").textContent = data.totalEmailSent;
  document.getElementById("total-users").textContent = data.totalBirthdays;
  document.getElementById("last-run").textContent = data.lastEmailRunTime
    ? formatDate(data.lastEmailRunTime)
    : "Never";
  document.getElementById("next-run").textContent = "N/A";
}

// Initial render
// renderBirthdays();
