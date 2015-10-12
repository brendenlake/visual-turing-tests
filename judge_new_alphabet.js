var task;
$(document).ready(function() {
	
	// Parameters
	var num_alpha = 10;      // number of alphabets
    var num_per_alpha = 9; // number of characters per alphabet
    var num_ex_people = 9; // number of human drawn examples
    var num_ex_model  = 9; // number of model drawn examples

	var spec = {};
	spec.ISI = 200;
	spec.size_opts = 100;
    // spec.list_condition = ['full_perm'];
	spec.list_condition = ['full','noLTL','full_perm','affine'];
	spec.valid_keys = ['left','right'];
	spec.valid_types = ['L','R'];
	spec.continue_key = ' ';
	spec.has_fixation = false;
    spec.border_opts = false;
    spec.break_interval = num_alpha;
    spec.keep_order = true; // do not permute trials
    spec.size_target = [Math.ceil(spec.size_opts*2.5), spec.size_opts];

	task = judge_task(spec);
	var condition = task.getCondition();
		
	var data = {};
    
    // list of alphabet permutations, one for each block, so we
    // can present the alphabets in a random (but sychronized) order
    var list_aperm = new Array();
    for (var i=0; i<num_per_alpha; i++){
        list_aperm[i] = tu.randperm(1,num_alpha);
    }

	data.imglist_target = targetlist(num_alpha,num_per_alpha,list_aperm);
    data.imglist_model  = modellist(condition,num_per_alpha,num_ex_people,num_alpha,list_aperm); 
    data.imglist_people = peoplelist(num_per_alpha,num_ex_people,num_alpha,list_aperm);
	task.load_images(data);

});

// 
// Input
//   nchar_sel : number of characters we want to select from each alphabet
//   nchar_total : number of characters total
var peoplelist = function (nchar_sel,nchar_total,num_alpha,list_aperm) {
    var list = new Array();
    var count = 0;
    var dname = 'judge_new_alphabets/grid_people/';

    // permute/select exemplars
    var cperm = tu.randperm(1,nchar_total);
    // var cperm = new Array(); for (var i=0; i<nchar_total; i++) {cperm[i]=i+1;}
    cperm = cperm.slice(0,nchar_sel);

    // for each character (aka block)
    for (var citer=0; citer < nchar_sel; citer += 1) {
        c = cperm[citer];
        var aperm = list_aperm[citer];

        // for each alphabet
        for (var aiter=0; aiter < num_alpha; aiter += 1) {
                        
            a = aperm[aiter];
            var bname = dname + 'img_alpha' + a  + '_group' + c  + '.png';
            list[count] = bname;
            count++;

        }
    }
    return list;
};

// 
// Input
//   nchar_sel : number of characters we want to select from each alphabet
//   nchar_total : number of characters total
var modellist = function (condition,nchar_sel,nchar_total,num_alpha,list_aperm) {
    var dname = 'judge_new_alphabets/';
    if (condition === 'full') {
        dname += 'grid_full/';
    }    
    else if (condition === 'noLTL') {
        dname += 'grid_noLTL/';
    }
    else if (condition === 'full_perm') {
        dname += 'grid_full/';
    }
    else if (condition === 'affine') {
        dname += 'grid_affine/';
    }    
    else {
        throw new Error("invalid image type.");
    }
    
    var list = new Array();
    var count = 0;

    // permute/select exemplars
    var cperm = tu.randperm(1,nchar_total);
    // var cperm = new Array(); for (var i=0; i<nchar_total; i++) {cperm[i]=i+1;}
    cperm = cperm.slice(0,nchar_sel);

    // for each character (aka block)
    for (var citer=0; citer < nchar_sel; citer += 1) {
        c = cperm[citer];
        var aperm = list_aperm[citer];

        // make sure none of the alphabets align
        if (condition === 'full_perm') {
            var aperm = specialperm(1,num_alpha,aperm);                    
        }

        // for each alphabet         
        for (var aiter=0; aiter < num_alpha; aiter += 1) {
            var a = aperm[aiter];
            var bname = dname + 'img_alpha' + a  + '_group' + c  + '.png';
            list[count] = bname;
            count++;
        }
    }
    return list;
};

//
// 
var targetlist = function (num_alpha,nchar_sel,list_aperm) {
    var list = new Array();
    var dname = 'judge_new_alphabets/image_references/';
    var bname = 'ref_alpha';
    var count = 0;

    // for each character
    for (var citer=0; citer < nchar_sel; citer += 1) {

        var aperm = list_aperm[citer];

        // for each alphabet
        for (var aiter=0; aiter < num_alpha; aiter += 1) {
            var a = aperm[aiter];
            var str = dname + bname + a + '.png';
            list[count] = str;
            count++;   
        }

    }
    return list;
};

// permutation vector from start to end
// that does not share any elements in common
var specialperm = function (start,end,baseline_perm) {
    
    // whether two permutations match in an element
    var has_match = function(a1,a2) {
        for (var i=0; i<a1.length; i++) {
            if (a1[i]===a2[i]) {
                return true;
            }
        }
        return false;
    }

    var perm = tu.randperm(start,end);
    while (has_match(perm,baseline_perm)) {
        perm = tu.randperm(start,end);
    }
    return perm;
};