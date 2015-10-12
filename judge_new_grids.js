var task;
$(document).ready(function() {
	
	// Parameters
	var nchar = 50; // number of unique characters
	var exclude = 14; // exclude this character, due to optimization failure

	var spec = {};
	spec.ISI = 200; 
	spec.size_opts = 325;
    spec.list_condition = ['full','affine','noLTL','1spline','hightokenvar','full_5alpha','full_5alphaB'];
	spec.valid_keys = ['left','right'];
	spec.valid_types = ['L','R'];
	spec.continue_key = ' ';
	spec.has_fixation = false;
	task = judge_task(spec);	
	var condition = task.getCondition();
		
	var data = {};	
	data.imglist_target = targetlist(nchar,exclude);
    data.imglist_model = getlist(condition,nchar,exclude);
	data.imglist_people = getlist("people",nchar,exclude);	
	task.load_images(data);
});

var getlist = function (type,nchar,exclude) {    
    var list = new Array();
    var dname = 'judge_new_instances/';
    if (type === 'full') {
    	dname += 'grid_model_full/';
    }
    else if (type === 'hightokenvar') {
        dname += 'grid_model_hightokenvar/';
    }
    else if (type === 'affine') {
    	dname += 'grid_affine/';	
    }
    else if (type === 'people') {
        dname += 'grid_people/';
    }
    else if (type === 'noLTL') {
    	dname += 'grid_model_noLTL/';
    }
    else if (type === '1spline') {
        dname += 'grid_1spline/';
    }
    else if (type === 'full_5alpha') {
        dname += 'grid_model_full_5alpha/';
    }
    else if (type === 'full_5alphaB') {
        dname += 'grid_model_full_5alphaB/';
    }
    else {
        throw new Error("invalid image type.")
    }   
    var count = 0;
    for (var c=1; c <= nchar; c += 1) {
        if (c !== exclude) {
            var bname = 'grid' + c + '.png';
            str = dname + bname;
            list[count] = str;
            count++;
        }    		
    }
    return list;
};

var targetlist = function (nchar,exclude) {
	var list = new Array();
    var dname = 'judge_new_instances/target_images/';
    var bname = 'handwritten';
    var count = 0;
	for (var c=1; c <= nchar; c++) {
        if (c !== exclude) {
            str = dname + bname + c + '.png';
            list[count] = str;
            count ++;    
        }        
    }
    return list;
};