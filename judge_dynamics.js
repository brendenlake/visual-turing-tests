var task;
$(document).ready(function() {
	
	// Parameters
	var nchar = 50; // number of unique characters
	var nrep = 1; // number of drawn replications of each character
	var nuse = 1; // how many replications of each should we display?
	
	var spec = {};
	spec.ISI = 200; 
	spec.list_condition = ['full','full_reverse','full_randomize','noLTL','noLTL_directed'];
	spec.valid_keys = ['left','right'];
	spec.valid_types = ['L','R'];
	spec.continue_key = ' ';
	spec.has_fixation = false;
    
    //DEBUGGING
    // spec.break_interval = 3; 

	task = judge_dynamics_task(spec);	
	var condition = task.getCondition();
		
	var data = {};	
	data.imglist_target = targetlist(nchar,nrep,nuse);
	data.imglist_model = getlist(condition,nchar,nrep,nuse);
	data.imglist_people = getlist("people",nchar,nrep,nuse);	
	task.load_images(data);
});

var getlist = function (type,nchar,nrep,nuse) {    
    var list = new Array();
    var dname = 'judge_parsing/';
    if (type === 'full') {
    	dname += 'mov_full_model/';
    }
    else if (type === 'full_reverse') {
    	dname += 'mov_reverse_full_model/';
    }
    else if (type === 'full_randomize') {
        dname += 'mov_randomize_full_model/';
    }
    else if (type === 'noLTL') {
        dname += 'mov_noLTL_model/';
    }
    else if (type === 'noLTL_directed') {
        dname += 'mov_noLTL_directed_model/';
    }
    else if (type === 'people') {
        dname += 'mov_people/';
    } 
    else {
        throw new Error("invalid image type.")
    }   
    var count = 0;
    for (var c=1; c <= nchar; c += 1) {
    	var perm = tu.randperm(1,nrep);
    	for (var j=1; j<=nuse; j++) {
    		var r = perm[j-1];
    		var bname = 'mov_c' + c + '_r' + r + '.gif';
        	str = dname + bname;
        	list[count] = str;
        	count ++;
    	}    	
    }
    return list;
};

var targetlist = function (nchar,nrep,nuse) {
	var list = new Array();
    var dname = 'judge_parsing/target_images/';
    var bname = 'handwritten';
    var count = 0;
	for (var c=1; c <= nchar; c++) {
    	 for (var r=1; r<=nuse; r++) {
        	str = dname + bname + c + '.png';
        	list[count] = str;
        	count ++;
    	}
    }
    return list;
};