<?php
header('Content-Type: application/json; charset=utf-8');

// Hàm kiểm tra mã sinh viên tồn tại
function checkStudentExists($conn, $studentId) {
    $stmt = $conn->prepare("SELECT COUNT(*) FROM sinhvien WHERE MaSV = ?");
    $stmt->execute([$studentId]);
    return $stmt->fetchColumn() > 0;
}

try {
    // Kết nối database
    $host = "localhost";
    $dbname = "quanlysinhvien";
    $username = "root";
    $password = "";

    $conn = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $conn->exec("SET NAMES utf8");

    // Lấy và kiểm tra dữ liệu đầu vào
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($data['studentId']) || empty($data['studentId'])) {
        throw new Exception('Mã sinh viên không được để trống');
    }

    $studentId = trim($data['studentId']);

    // Kiểm tra sinh viên có tồn tại không
    if (!checkStudentExists($conn, $studentId)) {
        echo json_encode([
            'success' => false,
            'message' => 'Không tìm thấy sinh viên với mã ' . htmlspecialchars($studentId)
        ]);
        exit;
    }

    // Thực hiện xóa sinh viên
    $stmt = $conn->prepare("DELETE FROM sinhvien WHERE MaSV = ?");
    $stmt->execute([$studentId]);

    if ($stmt->rowCount() > 0) {
        echo json_encode([
            'success' => true,
            'message' => 'Đã xóa sinh viên thành công'
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'Không thể xóa sinh viên'
        ]);
    }

} catch(PDOException $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Lỗi database: ' . $e->getMessage()
    ]);
} catch(Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
} finally {
    if (isset($conn)) {
        $conn = null;
    }
}
?>
