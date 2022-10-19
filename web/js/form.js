function registerForms() {
    $("form").off('submit');
    $("form").submit(function (e) {
        e.preventDefault();
        var form = $(this);
        $.ajax({
            type: form.attr('method') ? form.attr('method') : 'GET',
            url: form.attr('action'),
            data: form.serialize(),
            beforeSend: function() {
                $("button[type='submit']").width(parseFloat($("button[type='submit']").width()) + "px");
                $("button[type='submit']").html('<i class="fa fa-spinner animate-spin"></i>');
            },
            success: function (data) {
                render(data, form.attr('id'));
            }
        });
    });
}

function registerCheckboxes() {
    $('table tr').click(function (e) {
        if($(e.target).attr('type') !== 'checkbox') {
            $(this).find('input').prop('checked', !$(this).find('input').prop('checked'));
        }
    });
}