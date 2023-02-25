$(function() {
    let isSubmit = false;
    let phoneNumberMin = 5;

	$('form.main-order-form').submit(function(e) {
        if (isSubmit){
            return false;
        }

        let btn = $("button, input[type=submit]", $(this));

        let form = $(this);
        let name = $("[name=name]:visible", form);
        let phone = $("[name=phone]:visible", form);
        let phoneNumber = $.trim(phone.val());
        let phoneNumberClear = phoneNumber.replace(/[^0-9]+/g, '');

        if (name.length && name.val() == '') {
            return alert(nameError);
        }

        if (phone.length) {
            e.preventDefault();

            let phoneMinLength = (phonePrefix.length - 1) + phoneNumberMin;

            if (phoneNumber.length < phoneMinLength){
                return alert(phoneError5);
            }

            if (phonePrefix == '+7' && phoneNumberClear.length == 11 && phoneNumberClear.charAt(1) != 9 && phoneNumberClear.charAt(1) != 7) {
                return alert('Введите мобильный номер');
            }

            btn.prop("disabled", true);
            isSubmit = true;

            // Для формы редактирования данных заказа проверяем, изменился ли номер телефона
            if (form.hasClass('order-success-reorder-form')) {
                let formName = form.find('[name="name"]');
                let formPhone = form.find('[name="phone"]');
                let thankInfoName = $('.thank-info__name');

                // Если номер телефона изменился - отправляем заказ со специальным флагом
                if (formPhone.val() != formPhone.data('initVal')) {
                    form.append('<input type="hidden" name="reorder" value="1">');
                } else {
                    // Если номер не изменился - визуально изменяем имя
                    M1.modalHide($('#m1-form'));
                    isSubmit = false;

                    if (thankInfoName.length) {
                        thankInfoName.text(formName.val());
                    }

                    return false;
                }
            }

            Lib.request('/Order/Create', $(this).serialize(), function(result, data) {
                if (!result && data){
                    isSubmit = false;
                    btn.prop("disabled", false);
                    return alert(data);
                }
                if (data.redirect)
                    return document.location.href = data.redirect;
            });
        }
	});
});
