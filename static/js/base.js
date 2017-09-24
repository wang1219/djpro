;$(function () {
    //定义一些全局变量
    var $form_add_task = $('.add-task'),
        $body = $('body'),
        $window = $(window),
        $task_delete_trigger = null,
        $task_detail_trigger = null,
        $task_detail = $('.task-detail'),
        $task_detail_mask = $('.task-detail-mask'),
        task_list = [],
        current_index,
        $task_detail_content,
        $task_detail_content_input,
        $update_form,
        $checkbox_complete,
        $msg = $('.msg'),
        $msg_content = $msg.find('.msg-content'),
        $msg_confirm = $msg.find('.confirmed'),
        $alerter = $('.alerter');


    //初始化app
    init();


    // 监听 添加新task
    $form_add_task.on('submit', on_add_task_form_submit);
    // 监听 隐藏详情全局覆盖框
    $task_detail_mask.on('click', hide_task_detail);

    function listen_msg_event() {
        $msg_confirm.on('click', function () {
            hide_msg();
        })
    }


    function pop(arg) {
        if (!arg) {
            console.error('Pop title is required.');
        }

        var conf = {},
            $box,
            $mask,
            $title,
            $content,
            $confirm,
            $cancel,
            dfd,
            confirmed,
            timer;

        if (typeof arg == 'string') {
            conf.title = arg;
        } else {
            conf = $.extend(conf, arg)
        }

        dfd = $.Deferred();

        $box = $('<div>' +
            '<div class="pop-title">' + conf.title + '</div>' +
            '<div class="pop-content">' +
            '<div>' +
            '<button style="margin-right: 5px;" class="primary confirm">确定</button>' +
            '<button class="cancel">取消</button>' +
            '</div></div>' +
            '</div>').css({
            width: 300,
            color: '#444',
            height: 'auto',
            padding: '15px 10px',
            background: '#fff',
            position: 'fixed',
            'border-radius': 3,
            'box-shadow': '0, 1px, 2px, rgba(0, 0, 0, .5)'
        });

        $title = $box.find('.pop-title').css({
            padding: '5px 10px',
            'font-weight': 900,
            'font-size': 20,
            'text-align': 'center'
        });

        $content = $box.find('.pop-content').css({
            padding: '5px 10px',
            'text-align': 'center'
        });

        $confirm = $content.find('button.confirm');
        $cancel = $content.find('button.cancel');

        $mask = $('<div></div>').css({
            position: 'fixed',
            background: 'rgba(0, 0, 0, .5)',
            top: 0,
            bottom: 0,
            left: 0,
            right: 0
        });

        timer = setInterval(function () {

            if (confirmed !== undefined) {
                dfd.resolve(confirmed);
                clearInterval(timer);
                dismiss_pop();
            }
        }, 50);

        $confirm.on('click', on_confirm);
        $cancel.on('click', on_cancel);
        $mask.on('click', on_cancel);

        function on_cancel() {
            confirmed = false;
        }

        function on_confirm() {
            confirmed = true;
        }

        function dismiss_pop() {
            $mask.remove();
            $box.remove();
        }

        function adjust_box_position() {
            var window_width = $window.width(),
                window_height = $window.height(),
                box_weight = $box.width(),
                box_height = $box.height(),
                move_x,
                move_y;

            move_x = (window_width - box_weight) / 2;
            move_y = (window_height - box_height) / 2 - 30;

            $box.css({
                left: move_x,
                top: move_y
            })
        }

        $window.on('resize', function () {
            adjust_box_position();
        });


        $mask.appendTo($body);
        $box.appendTo($body);
        $window.resize();
        return dfd.promise();
    }

    function on_add_task_form_submit(e) {
        // 禁用浏览器默认行为
        e.preventDefault();

        var new_task = {};

        // 获取新Task的值，为空则直接返回
        var $input = $(this).find('input[name=content]');
        new_task.content = $input.val();
        if (!new_task.content) {
            return;
        }

        // 存储新值成功更新页面列表
        if (add_task(new_task)) {
            $input.val(null);
        }
    }


    function listen_task_detail() {
        var $index;

        $('.task-item').on('dblclick', function () {
            $index = $(this).data('index');
            show_task_detail($index);
        });

        $task_detail_trigger.on('click', function () {
            var $this = $(this);
            var $item = $this.parent().parent();
            $index = $item.data('index');
            show_task_detail($index);
        })
    }

    // 展示task详情
    function show_task_detail(index) {
        current_index = index;
        render_task_detail(index);
        $task_detail.show();
        $task_detail_mask.show();
    }

    function hide_task_detail() {
        $task_detail.hide();
        $task_detail_mask.hide();
    }

    function update_task(index, data) {
        if (index === undefined || !task_list[index]) return;

        // $.extend() 相当于Python dict.update()
        task_list[index] = $.extend({}, task_list[index], data);
        refresh_task_list();
    }

    //渲染指定task的详细信息
    function render_task_detail(index) {
        if (index === undefined || !task_list[index]) return;

        var item = task_list[index];
        var tpl = '<form>' +
            '<div class="content">' +
            (item.content || '') +
            '</div>' +
            '<div class="input-item"><input style="display: none;" type="text" name="content" value="' + item.content + '"></div>' +
            '<div>' +
            '<div class="desc input-item">' +
            '<textarea name="desc">' + (item.desc || '') + '</textarea>' +
            '</div>' +
            '</div>' +
            '<div class="remind input-item">' +
            '<label>提醒时间</label>' +
            '<input class="datetime" name="remind_date" type="text" value="' + (item.remind_date || '') + '">' +
            '</div>' +
            '<div class="input-item"><button type="submit">更新</button></div>' +
            '</form>';

        $task_detail.html(tpl);

        // jQuery时间插件
        $('.datetime').datetimepicker();

        $update_form = $task_detail.find('form');
        $task_detail_content = $update_form.find('.content');
        $task_detail_content_input = $update_form.find('[name=content]');

        $task_detail_content.on('dblclick', function () {
            $task_detail_content_input.show();
            $task_detail_content.hide();
        });


        $update_form.on('submit', function (e) {
            e.preventDefault();
            var data = {};
            data.content = $(this).find('[name=content]').val();
            data.desc = $(this).find('[name=desc]').val();
            data.remind_date = $(this).find('[name=remind_date]').val();
            update_task(index, data);
            hide_task_detail();
        });

    }


    function listen_task_delete() {
        $task_delete_trigger.on('click', function () {
            var $this = $(this);
            var $item = $this.parent().parent();

            pop('确定要删除吗？').then(function (result) {
                result ? delete_task($item.data('index')) : null;
            });

        });
    }


    // 监听完成task事件
    function listen_checkbox_complete() {
        $checkbox_complete.on('click', function () {
            var $this = $(this);
            var index = $this.parent().parent().data('index');

            var item = get(index);
            if (item.complete) {
                update_task(index, {complete: false});
            } else {
                update_task(index, {complete: true});
            }

        })

    }


    function get(index) {
        return store.get('task_list')[index];
    }


    function add_task(new_task) {
        task_list.push(new_task);
        refresh_task_list();
        return true;
    }

    function refresh_task_list() {
        store.set('task_list', task_list);
        render_task_list();
    }

    function delete_task(index) {
        if (index === undefined || !task_list[index]) return;

        delete task_list[index];
        refresh_task_list();
    }

    function init() {
        task_list = store.get('task_list') || [];
        if (task_list.length) {
            render_task_list();
        }

        // 定时提醒
        task_remind_check();

        listen_msg_event();
    }

    function task_remind_check() {
        var current_timestamp;

        var itl = setInterval(function () {
            for (var i = 0; i < task_list.length; i++) {
                var item = get(i), task_timestamp;

                if (!item || !item.remind_date || item.inforemd)
                    continue;

                current_timestamp = (new Date()).getDate();
                task_timestamp = (new Date(item.remind_date)).getDate();

                if (current_timestamp >= task_timestamp) {
                    update_task(i, {inforemd: true});
                    show_msg(item.content);
                }
            }
        }, 500)


    }

    function show_msg(content) {
        if (!content) return;
        $msg_content.html(content);

        // 播放背景音乐
        $alerter.get(0).play();

        $msg.show();
    }

    function hide_msg() {
        $msg.hide();

        // 暂停背景音乐
        $alerter.get(0).pause();
    }

    function render_task_list() {
        var $task_list = $('.task-list');
        $task_list.html('');
        var complete_item = [];
        for (var i = 0; i < task_list.length; i++) {
            var item = task_list[i];
            if (item && item.complete) {
                complete_item[i] = item;
            } else {
                var $task = render_task_tpl(item, i);
                $task_list.prepend($task);
            }
        }

        for (var j = 0; j < complete_item.length; j++) {
            $task = render_task_tpl(complete_item[j], j);
            if (!$task) continue;

            $task.addClass('completed');
            $task_list.append($task);
        }

        $task_delete_trigger = $('.action.delete');
        $task_detail_trigger = $('.action.detail');
        $checkbox_complete = $('.task-list .complete');
        listen_task_delete();
        listen_task_detail();
        listen_checkbox_complete();
    }

    function render_task_tpl(data, index) {
        if (!data || !index) return;
        var list_item_tpl =
            '<div class="task-item" data-index="' + index + '">' +
            '<span><input type="checkbox"' + (data.complete ? 'checked' : '') + ' class="complete"></span>' +
            '<span class="task-content">' + data.content + '</span>' +
            '<span class="fr">' +
            '<span class="action delete"> 删除</span>' +
            '<span class="action detail"> 详情</span>' +
            '</span>' +
            '</div>';
        return $(list_item_tpl);

    }
});
