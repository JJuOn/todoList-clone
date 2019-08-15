$(function() {
	M.AutoInit();
	$("#menu-button").click(function() {
		$("#left-menu").toggleClass("active");
		$("#body").toggleClass("left-active");
		$("#notification").removeClass("active");
		$("#body").removeClass("noti-active");
	});
	$("#left-menu").on("mouseover", function() {
		$("#body").addClass("left-hover");
	});
	$("#left-menu").on("mouseout", function() {
		$("#body").removeClass("left-hover");
	});
	$("#noti-button").click(function() {
		$("#notification").toggleClass("active");
		$("#body").toggleClass("noti-active");
		$("#left-menu").removeClass("active");
		$("#body").removeClass("left-active");
	});

	$("#left-menu ul li").click(function() {
		get_todo_list($(this).attr("data-category"));
	});

	$("#write-subject").on("focus", function() {
		$("#write").addClass("focus");
		$("#write-subject").removeAttr("placeholder");
	});
	
	$('.datepicker').datepicker({
		container:'body',
		format:"yyyy-mm-dd",
		i18n:{
			cancel:'취소',
			clear:'초기화',
			done:'확인',
			months:['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'],
			monthsShort:['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'],
			weekdays:['일요일','월요일','화요일','수요일','목요일','금요일','토요일'],
			weekdaysShort:['일','월','화','수','목','금','토'],
			weekdaysAbbrev:['일','월','화','수','목','금','토']
		}
	});

	$("#write-star-icon").click(function() {
		$("#write-star").val(change_star($(this)));
	});

	$("#write form").on("submit", function() {
		if($("#write-subject").val() == "") {
			handle_error("제목을 입력해주세요.");
			return false;
		}

		if($("#write-content").val() == "") {
			handle_error("내용을 입력해주세요.");
			return false;
		}

		insert_todo(toObject($(this).serializeArray()));

		return false;
	});

	$("#edit-form").on("submit", function() {
		if($("#edit-subject").val() == "") {
			handle_error("제목을 입력해주세요.");
			return false;
		}

		if($("#edit-content").val() == "") {
			handle_error("내용을 입력해주세요.");
			return false;
		}

		edit_todo(toObject($(this).serializeArray()));

		return false;
	});


	$("#edit-star-icon").click(function() {
		$("#edit-star").val(change_star($(this)));
	});

	$("#remove-ok").click(function() {
		remove_todo(remove_no);
		remove_no = null;
	});

	$(".btn-edit").click(set_edit_form);
	$(".list-check").click(change_list_done);
	$(".list-star").click(change_list_star);
});

var remove_no;

function toObject(arr) {
	var result = new Object;

	for(var idx in arr) {
		result[arr[idx]['name']] = arr[idx]['value'];
	}

	return result;
}

function handle_message(message) {
	M.toast({html: message});
}

function handle_error(message="알 수 없는 오류가 발생했습니다.\n\n관리자에게 문의해주세요.") {
	M.toast({html: message});
}

function change_star($el) {
	var star = $el.text();
	var result;

	switch(star) {
		case "star_border":
			result = "1";
			break;
		case "star_half":
			result = "2";
			break;
		case "star":
			result = "0";
			break;
		default:
			return;
	}

	change_icon($el, "star" + result);
	return result;
}

function change_done($el) {
	var check = $el.text();
	var result;

	if(check == "check_box")
		result = "undone";
	else if(check == "check_box_outline_blank")
		result = "done";
	else
		return;

	change_icon($el, result);
	return result;
}

function set_edit_form() {
	$("#edit-no").val($(this).parents("li").attr("data-no"));
	$("#edit-subject").val($(".subject", $(this).parents("li")).text());
	$("#edit-content").val($(this).parents(".button").siblings("p").text());

	
	$("label[for=edit-subject]").addClass("active");
	$("label[for=edit-content]").addClass("active");

	var deadline = $(this).parents("li").attr("data-deadline");
	if(deadline != undefined) {
		$("#edit-deadline").val(deadline);
		$("label[for=edit-deadline]").addClass("active");
	} else {
		$("#edit-deadline").val("");
		$("label[for=edit-deadline]").removeClass("active");
	}
	
	var star;

	switch($(".list-star", $(this).parents("li")).text()) {
		case "star_border":
			star = 0;
			break;
		case "star_half":
			star = 1;
			break;
		case "star":
			star = 2;
			break;
	}

	$("#edit-star").val(star);
	change_icon($("#edit-star-icon"), "star" + star);
}

function remove_confirm() {
	remove_no = $(this).parents("li").attr("data-no");
}

function change_list_star(e) {
	e.stopPropagation();
	change_star($(this));

	var star;

	switch($(this).text()) {
		case "star_border":
			star = 0;
			break;
		case "star_half":
			star = 1;
			break;
		case "star":
			star = 2;
			break;
	}

	if(star != undefined) {
		var no = $(this).parents("li").attr("data-no");
		edit_todo_star(no, star);
	}
}

function change_list_done(e) {
	e.stopPropagation();
	change_done($(this));

	var is_done;
	var done_text = $(this).text();

	if(done_text == "check_box")
		is_done = 1;
	else if(done_text == "check_box_outline_blank")
		is_done = 0;

	if(is_done != undefined) {
		var no = $(this).parents("li").attr("data-no");
		edit_todo_is_done(no, is_done);
	}
}

function change_icon($el, icon_name) {
	if(change_icon.icons[icon_name] == undefined)
		return;
	
	$el.attr("class").split(" ").forEach(function(item) {
		if(item.substring(0, 5) == "text-" || item.substring(item.length - 5, item.length) == "-text")
			$el.removeClass(item);
	});
	
	$el.addClass(change_icon.icons[icon_name][0]);
	$el.text(change_icon.icons[icon_name][1]);
}

change_icon.icons = new Object;
change_icon.icons['star0'] = new Array("grey-text text-lighten-1", "star_border");
change_icon.icons['star1'] = new Array("amber-text text-accent-4", "star_half");
change_icon.icons['star2'] = new Array("deep-orange-text text-lighten-1", "star");
change_icon.icons['done'] = new Array("red-text text-accent-2", "check_box");
change_icon.icons['undone'] = new Array("pink-text text-lighten-2", "check_box_outline_blank");