/**
 * Script trang Dự thảo hợp đồng & Cam kết ký hợp đồng (HUY-02) bằng jQuery
 */
$(document).ready(function() {
    $('#signContractForm').on('submit', function(e) {
        var allChecked = true;
        $('.confirm-consent-checkbox').each(function() {
            if (!$(this).is(':checked')) {
                allChecked = false;
            }
        });

        if (!allChecked) {
            e.preventDefault();
            $('#consent-warning').slideDown(200);
            var consentCard = $('#consent-title');
            if (consentCard.length) {
                $('html, body').animate({
                    scrollTop: consentCard.offset().top - 100
                }, 300);
            }
        } else {
            $('#consent-warning').hide();
        }
    });

    $('.confirm-consent-checkbox').on('change', function() {
        var allChecked = true;
        $('.confirm-consent-checkbox').each(function() {
            if (!$(this).is(':checked')) {
                allChecked = false;
            }
        });
        if (allChecked) {
            $('#consent-warning').slideUp(200);
        }
    });
});
