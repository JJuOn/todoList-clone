function call_api(api, params, callback) {
	for(var idx in params) {
		if(params[idx] === null)
			delete params[idx];
	}

	$.ajax({
		url:"/api" + api,
		type:"POST",
		data:params,
		success:function(data) {
			data = JSON.parse(data);

			if(data['code'] == "unknown_error")
				handle_error();

			callback(data['result'], data['code'], data['data']);
		},
		error:function(e) {
			handle_error("연결상태가 고르지 않습니다.\n\n인터넷 환경을 확인해주세요.");
		}
	});
}

function get_todo_count() {
	call_api("/todo/count/", {}, function(result, code, data) {
		for(var category in data['count']) {
			$("#count_" + category).text(data['count'][category]);
		}
	});
}

function insert_todo(formData) {
	call_api("/todo/insert/", formData, function(result, code, data) {
		if(!result) {
			if(code == "empty_param") {
				switch(data['param']) {
					case "subject":
						handle_error("제목을 입력해주세요.");
						break;
					case "content":
						handle_error("내용을 입력해주세요.");
						break;
				}
			} else if(code == "invalid_param") {
				switch(data['param']) {
					case "subject":
						handle_error("제목을 1자 이상 60자 미만으로 작성해주세요.");
						break;
					case "content":
						handle_error("내용을 1자 이상 65535자 미만으로 작성해주세요.");
						break;
					case "deadline":
						handle_error("유효하지 않은 날짜입니다.");
						break;
					case "star":
						handle_error("올바르지 않은 우선순위 형식입니다.");
						break;
				}
			}
			return false;
		}

		$("#write input").each(function() {
			$(this).val("");
		});

		$("#write-content").val("");

		change_icon($("#write-star-icon"), "star0");

		$("#write").removeClass("focus");
		$("#write-subject").attr("placeholder", "할일을 입력해주세요.");

		get_todo_list("all");
		get_todo_count();
		get_notification_list();

		handle_message("작성을 완료했습니다.");
	});
}

function edit_todo(formData) {
	call_api("/todo/edit/", formData, function(result, code, data) {
		if(!result) {
			if(code == "empty_param") {
				handle_error("존재하지 않거나 삭제된 할일입니다.");
			} else if(code == "invalid_param") {
				switch(data['param']) {
					case "subject":
						handle_error("제목을 1자 이상 60자 미만으로 작성해주세요.");
						break;
					case "content":
						handle_error("내용을 1자 이상 65535자 미만으로 작성해주세요.");
						break;
					case "deadline":
						handle_error("유효하지 않은 날짜입니다.");
						break;
					case "star":
						handle_error("올바르지 않은 우선순위 형식입니다.");
						break;
				}
			} else if(code == "nonexistent_todo") {
				handle_error("존재하지 않거나 삭제된 할일입니다.");
			}
			return false;
		}

		$("#edit input").each(function() {
			$(this).val("");
		});

		$("#edit-content").val("");

		change_icon($("#edit-star-icon"), "star0");

		get_todo_list($("#left-menu ul li.active").attr("data-category"));
		get_todo_count();
		get_notification_list();
		
		handle_message("수정을 완료했습니다.");
	});
}

function edit_todo_is_done(no, is_done) {
	call_api("/todo/edit/", {no:no, is_done:is_done}, function(result, code, data) {
		if(!result) {
			if(code == "empty_param") {
				handle_error("존재하지 않거나 삭제된 할일입니다.");
			} else if(code == "invalid_param") {
				handle_error("달성 여부가 제대로 전달되지 않았습니다.");
			} else if(code == "nonexistent_todo") {
				handle_error("존재하지 않거나 삭제된 할일입니다.");
			}
			return false;
		}
		
		var category = $("#left-menu ul li.active").attr("data-category");

		if(["impending", "dead", "done", "undone"].includes(category))
			get_todo_list(category);

		get_todo_count();
		get_notification_list();
		
		if(is_done)
			handle_message("완료 처리되었습니다.");
		else
			handle_message("완료 처리가 해제되었습니다.");
	});
}

function edit_todo_star(no, star) {
	call_api("/todo/edit/", {no:no, star:star}, function(result, code, data) {
		if(!result) {
			if(code == "empty_param") {
				handle_error("존재하지 않거나 삭제된 할일입니다.");
			} else if(code == "invalid_param") {
				handle_error("올바르지 않은 우선순위입니다.");
			} else if(code == "nonexistent_todo") {
				handle_error("존재하지 않거나 삭제된 할일입니다.");
			}
			return false;
		}
		
		get_todo_count();
		get_notification_list();
		
		handle_message("우선순위가 조정되었습니다.");
	});
}

function remove_todo(no) {
	call_api("/todo/remove/", {no:no}, function(result, code, data) {
		if(!result) {
			if(code == "empty_param") {
				switch(data['param']) {
					case "no":
						handle_error("존재하지 않거나 이미 삭제된 할일입니다.");
						break;
				}
			} else if(code == "nonexistent_todo") {
				handle_error("존재하지 않거나 이미 삭제된 할일입니다.");
			}
			return false;
		}

		get_todo_list($("#left-menu ul li.active").attr("data-category"));
		get_todo_count();
		get_notification_list();

		handle_message("삭제를 완료했습니다.");
	});
}

function get_todo_list(category) {
	call_api("/todo/list/", get_todo_list.condition[category], function(result, code, data) {
		if(!result) {
			if(code == "invalid_column")
				handle_error();
			return;
		}

		$("#todo-list ul li").remove();
		$("#left-menu ul li").removeClass("active");
		$("#left-menu ul li[data-category=" + category + "]").addClass("active");
		
		data['list'].forEach(function(row) {
			$li = $("<li data-no=\"" + row['no'] + "\"></li>");
			if(row['deadline'])
				$li.attr("data-deadline", row['deadline']);

			$li_header = $("<div class=\"collapsible-header\"></div>");
			$li_body = $("<div class=\"collapsible-body white\"></div>");
			$li_body_button = $("<div class=\"button\"></div>");

			$li_header.append("<i class=\"list-check material-icons\"></i>");
			$li_header.append("<span class=\"subject\">" + row['subject'] + "</span>");
			$li_header.append("<span class=\"date light-blue-text text-lighten-1\">" + row['remainder'] + "</span>");
			$li_header.append("<i class=\"list-star material-icons\"></i>");

			if(row['is_done'] == 1)
				change_icon($(".list-check", $li_header), "done");
			else
				change_icon($(".list-check", $li_header), "undone");

			change_icon($(".list-star", $li_header), "star" + row['star']);

			$(".list-check", $li_header).click(change_list_done);
			$(".list-star", $li_header).click(change_list_star);

			$li_body_button.append("<a class=\"btn-small btn-edit waves-effect waves-light cyan darken-2 modal-trigger\" href=\"#edit\"><i class=\"material-icons text-white\">edit</i></a> ");
			$li_body_button.append("<a class=\"btn-small btn-remove waves-effect waves-light red accent-2 modal-trigger\" href=\"#remove-confirm\"><i class=\"material-icons text-white\">delete</i></a>");

			$(".btn-edit", $li_body_button).click(set_edit_form);
			$(".btn-remove", $li_body_button).click(remove_confirm);

			$li_body.append("<p>" + row['content'] + "</p>");
			$li_body.append($li_body_button);

			$li.append($li_header);
			$li.append($li_body);

			$("#todo-list ul").append($li);
		});
		
		if($("#todo-list ul li").length < 1) {
			$li = $("<li><div class=\"collapsible-header\">등록된 할일이 없습니다.</div></li>");
			$("#todo-list ul").append($li);
		}
	});
}

get_todo_list.condition = new Object;
get_todo_list.condition['all'] = {star:null, is_impending:null, is_done:null};
get_todo_list.condition['star2'] = {star:"2", is_impending:null, is_done:null};
get_todo_list.condition['star1'] = {star:"1", is_impending:null, is_done:null};
get_todo_list.condition['star0'] = {star:"0", is_impending:null, is_done:null};
get_todo_list.condition['impending'] = {star:null, is_impending:'impending', is_done:"0"};
get_todo_list.condition['dead'] = {star:null, is_impending:'dead', is_done:"0"};
get_todo_list.condition['done'] = {star:null, is_impending:null, is_done:"1"};
get_todo_list.condition['undone'] = {star:null, is_impending:null, is_done:"0"};

function get_notification_list() {
	call_api("/notification/list/", {}, function(result, code, data) {
		$("#notification ul li").remove();

		data['list'].forEach(function(row) {
			$li = $("<li class=\"collection-item avatar grey lighten-5\"></li>");

			$li.append(get_notification_list.detail[row['type']]['icon'].clone());
			$li.append("<span class=\"title pink-text text-darken-3\">" + get_notification_list.detail[row['type']]['title'] + "</span>");
			$li.append("<p>" + row['subject'] + "</p>");
			$li.append("<i class=\"star-icon material-icons\"></i>");

			change_icon($(".star-icon", $li), "star" + row['star']);

			$("#notification ul").append($li);
		});
	});
}

get_notification_list.detail = new Object;
get_notification_list.detail['insert']		= {title:'추가', icon:$("<i class=\"noti-icon material-icons green-text text-accent-4\">note_add</i>")};
get_notification_list.detail['impending']	= {title:'마감임박', icon:$("<i class=\"noti-icon material-icons purple-text text-lighten-1\">alarm</i>")};
get_notification_list.detail['dead']		= {title:'마감', icon:$("<i class=\"noti-icon material-icons red-text text-darken-4\">alarm_on</i>")};
get_notification_list.detail['done']		= {title:'완료', icon:$("<i class=\"noti-icon material-icons red-text text-accent-2\">check_box</i>")};
get_notification_list.detail['edit']		= {title:'수정', icon:$("<i class=\"noti-icon material-icons cyan-text text-darken-2\">edit</i>")};
get_notification_list.detail['star']		= {title:'우선순위 조정', icon:$("<i class=\"noti-icon material-icons deep-orange-text text-darken-1\">stars</i>")};
get_notification_list.detail['hello']		= {title:'안내', icon:$("<i class=\"noti-icon material-icons purple-text text-lighten-1\">info</i>")};


$(function() {
	get_todo_count();
	get_todo_list("all");
	get_notification_list();
});