/**
 * Script xử lý Giỏ hàng (HUY-01) bằng jQuery
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
                let msg = 'Có lỗi xảy ra trong quá trình xử lý.';
                if (xhr.responseJSON && xhr.responseJSON.message) {
                    msg = xhr.responseJSON.message;
                }
                alert(msg);
            }
        });
    }

    // Thêm nhanh khóa học vào giỏ để kiểm thử
    $(document).on('click', '.btn-quick-add', function() {
        const offeringId = $(this).data('id');
        if (!offeringId) return;

        sendAjax('/cart/add', { offeringId: offeringId, seats: 1 }, function(res) {
            if (res.success) {
                window.location.reload();
            } else {
                alert(res.message || 'Chưa thể thêm vào giỏ.');
            }
        });
    });

    // Xóa từng khóa học khỏi giỏ
    $(document).on('click', '.btn-remove-item', function() {
        const itemId = $(this).data('id');
        if (!itemId) return;

        if (confirm('Bạn có chắc chắn muốn xóa khóa học này khỏi giỏ?')) {
            sendAjax('/cart/remove', { itemId: itemId }, function(res) {
                if (res.success) {
                    window.location.reload();
                } else {
                    alert(res.message || 'Không thể xóa sản phẩm này.');
                }
            });
        }
    });

    // Xóa toàn bộ giỏ
    $(document).on('click', '.btn-clear-cart', function() {
        if (confirm('Bạn có chắc chắn muốn xóa toàn bộ khóa học trong giỏ đăng ký?')) {
            sendAjax('/cart/clear', {}, function(res) {
                if (res.success) {
                    window.location.reload();
                } else {
                    alert(res.message || 'Không thể xóa giỏ hàng.');
                }
            });
        }
    });
});
