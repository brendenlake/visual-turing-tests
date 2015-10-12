var task;
$(document).ready(function() {
	
	// Parameters
	var n = 50;      // number of stimuli
    
	var spec = {};
	spec.ISI = 200;
	spec.size_opts = 100;
    // spec.list_condition = ['full_mem','noLTL'];
	spec.list_condition = ['full','full_mem','noLTL','full_noIS','noLTL_noIS','1spline'];
	spec.valid_keys = ['left','right'];
	spec.valid_types = ['L','R'];
	spec.continue_key = ' ';
	spec.has_fixation = false;
    spec.border_opts = true;

	task = judge_task(spec);
	var condition = task.getCondition();
		
	var data = {};
	data.imglist_target = targetlist(n);
    data.imglist_model  = modellist(condition,n);
    data.imglist_people = peoplelist(n);
	task.load_images(data);

});

// 
var peoplelist = function (n) {
    var list = new Array();
    var dname = 'judge_totally_new/grid_people/';
    for (var c=1; c <= n; c += 1) {
        var bname = dname + 'group' + c  + '.png';
        list[c-1] = bname;
    }
    return list;
};

// 
var modellist = function (condition,n) {
    var dname = 'judge_totally_new/';
    if (condition === 'full') {
        dname += 'grid_full/';
    }
    else if (condition === 'full_mem') {
        dname += 'grid_full_mem/';
    }    
    else if (condition === 'noLTL') {
        dname += 'grid_noLTL/';
    }
    else if (condition === 'full_noIS') {
        dname += 'grid_full_noIS/';
    }
    else if (condition === 'noLTL_noIS') {
        dname += 'grid_noLTL_noIS/';
    }
    else if (condition === '1spline') {
        dname += 'grid_onespline/';
    }    
    else {
        throw new Error("invalid image type.")
    }
    var list = new Array();
    for (var c=1; c <= n; c += 1) {
        var bname = dname + 'group' + c  + '.png';
        list[c-1] = bname;
    }

    // create an arbitrary pairing
    list = tu.shuffle(list);
    return list;
};

//
var targetlist = function (n) {
    var list = new Array();
    var dname = 'images/';
    var bname = 'white';
    for (var c=1; c <= n; c += 1) {
        var str = dname + bname + '.jpg';
        list[c-1] = str;
    }
    return list;
};