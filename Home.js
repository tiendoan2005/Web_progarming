// Thêm sự kiện cho tất cả các mục collapsible
document.querySelectorAll('.collapsible, .collapsible-profile').forEach(collapsible => {
    collapsible.addEventListener('click', function () {
        const submenu = this.nextElementSibling; // Tìm submenu liền kề
        const toggleIcon = this.querySelector('.menu-toggle'); // Biểu tượng toggle

        // Hiển thị hoặc ẩn submenu
        if (submenu.style.display === 'block') {
            submenu.style.display = 'none';
            toggleIcon.textContent = '▼';
        } else {
            submenu.style.display = 'block';
            toggleIcon.textContent = '▲';
        }
    });
});
 
// Hiển thị popup AddStudent
function showPopup() {
    document.getElementById('overlay').style.display = 'block';
    document.getElementById('addStudentPopup').style.display = 'block';
}
// Hiển thị popup DeleteStudent
function showDeleteStudent() {
    document.getElementById('overlayDelete').style.display = 'block';
    document.getElementById('deleteStudentPopup').style.display = 'block';
}
// Đóng popup
function closePopup() {
    document.getElementById('overlay').style.display = 'none';
    document.getElementById('addStudentPopup').style.display = 'none';
    
    document.getElementById('overlayDelete').style.display = 'none';
    document.getElementById('addStudentPopup').style.display = 'none';
}

function showStudentManagement() {
    // Hiển thị bảng và các nút quản lý
    const buttonContainer = document.querySelector('.button');
    const buttonFind = document.querySelector('.find');
    const studentTable = document.getElementById('student-table');

    buttonContainer.style.display = 'flex';
    buttonFind.style.display = 'none';
    studentTable.style.display = 'block';
}

function showPopupAlert(message, type) {
    // Xóa alert cũ nếu có
    const oldAlert = document.querySelector('.popup-alert');
    if (oldAlert) {
        oldAlert.remove();
    }

    // Tạo alert mới
    const alert = document.createElement('div');
    alert.className = `popup-alert ${type}`;
    alert.textContent = message;

    // Chèn alert vào đầu form
    const form = document.getElementById('addStudentForm');
    form.insertBefore(alert, form.firstChild);

    // Tự động xóa alert sau 3 giây
    setTimeout(() => {
        alert.style.animation = 'slideOutUp 0.3s ease forwards';
        setTimeout(() => {
            alert.remove();
        }, 300);
    }, 3000);
}

// Hàm thêm sinh viên
function addStudent(event) {
    event.preventDefault();

    const studentCode = document.getElementById("code").value;
    const name = document.getElementById("name").value;
    const birthDay = document.getElementById("birthDay").value;
    const classs = document.getElementById("class").value;
    const fieldOfStudy = document.getElementById("fos").value;

    fetch('addStudent.php', {
        method: "POST",
        body: JSON.stringify({
            code: studentCode,
            name: name,
            birthDay: birthDay,
            classs: classs,
            fos: fieldOfStudy
        }),
        headers: {'Content-Type': 'application/json'}
    })
    .then(response => response.json())
    .then(res => {
        showPopupAlert(res.message, res.success ? 'success' : 'error');
        if (res.success) {
            setTimeout(() => {
                closePopup();
                loadStudents(); // Tải lại danh sách sinh viên
            }, 1500);
        }
    })
    .catch(error => {
        console.log("Error: ", error);
        swal({
            title: "Thông báo!",
            text: "Lỗi tải trang!",
            icon: "error",
            button: "Ok",
          });
    });
}

// Hàm hiển thị sinh viên
function loadStudents() {
    const tableStudents = document.getElementById("student-list");

    fetch("getStudents.php")
        .then(response => response.json())
        .then(result => {
            if (!result.success) {
                throw new Error(result.message);
            }

            const students = result.data;
            tableStudents.innerHTML = "";
            
            if (students.length === 0) {
                tableStudents.innerHTML = "<tr><td colspan='6'>Không có sinh viên nào</td></tr>";
            } else {
                students.forEach((student, index) => {
                    let row = `
                        <tr>
                            <td style="text-align: center;">${index + 1}</td>
                            <td style="text-align: center;">${student.MaSV}</td>
                            <td>${student.HoTen}</td>
                            <td style="text-align: center;">${student.NgaySinh}</td>
                            <td style="text-align: center;">${student.Lop}</td>
                            <td style="text-align: center;">${student.Khoa}</td>
                        </tr>`;
                    tableStudents.innerHTML += row;
                });
            }
        })
        .catch(error => {
            console.error("Error:", error);
            tableStudents.innerHTML = "<tr><td colspan='6'>Lỗi khi tải dữ liệu</td></tr>";
        });
}

// Tải danh sách sinh viên khi trang được load
window.onload = loadStudents;

function editStudent() {
    alert('Chỉnh sửa thông tin sinh viên!');
}

function showDeleteStudent() {
    const table = document.getElementById('student-list');
    const selectedRow = table.querySelector('tr.selected');
    
    if (!selectedRow) {
        alert('Vui lòng chọn sinh viên cần xóa!');
        return;
    }

    if (confirm('Bạn có chắc chắn muốn xóa sinh viên này?')) {
        const studentId = selectedRow.children[1].textContent; // Lấy mã sinh viên từ cột thứ 2

        fetch('deleteStudent.php', {
            method: 'POST',
            body: JSON.stringify({ studentId: studentId }),
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert(data.message);
                loadStudents(); // Tải lại danh sách sinh viên
            } else {
                alert(data.message);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Có lỗi xảy ra khi xóa sinh viên!');
        });
    }
}

// Thêm sự kiện click cho các hàng trong bảng
function addTableRowSelection() {
    const table = document.getElementById('student-list');
    table.addEventListener('click', function(e) {
        const row = e.target.closest('tr');
        if (!row) return;
        
        // Bỏ chọn tất cả các hàng khác
        table.querySelectorAll('tr').forEach(r => r.classList.remove('selected'));
        // Chọn hàng được click
        row.classList.add('selected');
    });
}

// Thêm vào window.onload
window.onload = function() {
    loadStudents();
    addTableRowSelection();
};

function searchStudent() {
    const searchValue = document.getElementById('textSearch').value;
    alert(`Tìm kiếm sinh viên với từ khóa: ${searchValue}`);
}

function toggleDarkMode() {
    // Chuyển đổi lớp "dark-mode" cho thẻ body
    document.body.classList.toggle('dark-mode');

    // Chuyển đổi Dark Mode cho các phần tử khác nếu cần
    const sidebar = document.querySelector('.sidebar');
    const table = document.querySelector('.table');

    sidebar.classList.toggle('dark-mode');
    table.classList.toggle('dark-mode');
}

