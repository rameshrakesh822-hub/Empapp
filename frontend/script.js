
const API_URL = "/api/employees";

const form = document.getElementById("employeeForm");
const table = document.getElementById("employeeTable");
const message = document.getElementById("message");

let employees = [];

async function loadEmployees() {
    try {
        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error("Unable to load employees");
        }

        employees = await response.json();
        displayEmployees(employees);

    } catch (error) {
        message.textContent = error.message;
    }
}

function displayEmployees(data) {
    table.innerHTML = "";

    if (data.length === 0) {
        table.innerHTML =
            '<tr><td colspan="8">No employees found</td></tr>';
        return;
    }

    data.forEach(emp => {
        const tr = document.createElement("tr");

        const values = [
            emp.id,
            emp.name,
            emp.email,
            emp.phone || "-",
            emp.department,
            emp.designation,
            emp.salary
        ];

        values.forEach(value => {
            const td = document.createElement("td");
            td.textContent = value;
            tr.appendChild(td);
        });

        const action = document.createElement("td");

        const editBtn = document.createElement("button");
        editBtn.textContent = "Edit";
        editBtn.className = "edit-btn";
        editBtn.onclick = () => editEmployee(emp.id);

        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "Delete";
        deleteBtn.className = "delete-btn";
        deleteBtn.onclick = () => deleteEmployee(emp.id);

        action.append(editBtn, deleteBtn);
        tr.appendChild(action);

        table.appendChild(tr);
    });
}

form.addEventListener("submit", async function(e) {
    e.preventDefault();

    const id = document.getElementById("employeeId").value;

    const employee = {
        name: document.getElementById("name").value.trim(),
        email: document.getElementById("email").value.trim(),
        phone: document.getElementById("phone").value.trim(),
        department: document.getElementById("department").value.trim(),
        designation: document.getElementById("designation").value.trim(),
        salary: document.getElementById("salary").value
    };

    try {
        const response = await fetch(
            id ? `${API_URL}/${id}` : API_URL,
            {
                method: id ? "PUT" : "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(employee)
            }
        );

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || "Operation failed");
        }

        message.textContent = result.message;
        form.reset();
        resetForm();
        await loadEmployees();

    } catch (error) {
        message.textContent = error.message;
    }
});

function editEmployee(id) {
    const emp = employees.find(e => e.id === id);

    if (!emp) return;

    document.getElementById("employeeId").value = emp.id;
    document.getElementById("name").value = emp.name;
    document.getElementById("email").value = emp.email;
    document.getElementById("phone").value = emp.phone || "";
    document.getElementById("department").value = emp.department;
    document.getElementById("designation").value = emp.designation;
    document.getElementById("salary").value = emp.salary;

    document.getElementById("formTitle").textContent = "Edit Employee";
    document.getElementById("submitBtn").textContent = "Update Employee";
    document.getElementById("cancelBtn").hidden = false;

    window.scrollTo({ top: 0, behavior: "smooth" });
}

async function deleteEmployee(id) {
    if (!confirm("Are you sure you want to delete this employee?")) {
        return;
    }

    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: "DELETE"
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || "Delete failed");
        }

        message.textContent = result.message;
        await loadEmployees();

    } catch (error) {
        message.textContent = error.message;
    }
}

function resetForm() {
    document.getElementById("employeeId").value = "";
    document.getElementById("formTitle").textContent = "Add Employee";
    document.getElementById("submitBtn").textContent = "Add Employee";
    document.getElementById("cancelBtn").hidden = true;
}

document.getElementById("cancelBtn").addEventListener("click", () => {
    form.reset();
    resetForm();
});

document.getElementById("searchInput").addEventListener("input", function() {
    const search = this.value.toLowerCase();

    const filtered = employees.filter(emp =>
        String(emp.id).includes(search) ||
        emp.name.toLowerCase().includes(search) ||
        emp.email.toLowerCase().includes(search) ||
        emp.department.toLowerCase().includes(search)
    );

    displayEmployees(filtered);
});

loadEmployees();
