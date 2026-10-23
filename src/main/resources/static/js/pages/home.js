/**
 * Script xử lý trang chủ (HomePage) bằng jQuery.
 * Tương tác thêm khóa học vào giỏ hàng qua AJAX trực tiếp từ các thẻ khóa học.
 */
$(document).ready(function() {
    const csrfToken = $('meta[name="_csrf"]').attr('content');
    const csrfHeader = $('meta[name="_csrf_header"]').attr('content');

    function sendAjax(url, data, callback) {
        $.ajax({
            url: url,
            type: 'POST',
            data: data,
            beforeSend: function(xhr) {
                if (csrfHeader && csrfToken) {
                    xhr.setRequestHeader(csrfHeader, csrfToken);
                }
            },
            success: function(response) {
                if (callback) callback(response);
            },
            error: function(xhr) {
                let msg = 'Có lỗi xảy ra khi thêm vào giỏ hàng.';
                if (xhr.status === 401 || xhr.status === 403) {
                    if (confirm('Vui lòng đăng nhập để thêm khóa học vào giỏ hàng.\nBạn có muốn chuyển tới trang đăng nhập không?')) {
                        window.location.href = '/auth/login';
                    }
                    return;
                }
                if (xhr.responseJSON && xhr.responseJSON.message) {
                    msg = xhr.responseJSON.message;
                }
                alert(msg);
            }
        });
    }

    // Bấm nút "+ Thêm vào giỏ" trên từng thẻ khóa học tại trang chủ
    $(document).on('click', '.btn-home-add-cart', function() {
        const offeringId = $(this).data('id');
        const offeringTitle = $(this).data('title') || 'Khóa học';
        if (!offeringId) return;

        sendAjax('/cart/add', { offeringId: offeringId, seats: 1 }, function(res) {
            if (res.success) {
                if (confirm('Đã thêm "' + offeringTitle + '" vào giỏ hàng thành công!\nBạn có muốn chuyển tới Giỏ hàng để xem ngay không?')) {
                    window.location.href = '/cart/index';
                }
            } else {
                alert(res.message || 'Chưa thể thêm vào giỏ.');
            }
        });
    });
});
