;
$().ready(function() {
    var $form_add_task = $('.add-task');
    var new_task = {};

    console.log('new_task', $form_add_task);
    console.log('new_task', 1);

    $form_add_task.on('submit', function (e) {
        // e.preventDefault();
        console.log('new_task', 2);
        new_task.content = $(this).find('input[name=content]').val();
        console.log('new_task', new_task);
    });
})