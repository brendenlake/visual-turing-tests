var basic_super_task = function (spec,my) {
	
	// PRIVATE VARIABLES
	var that;
	my = my || {};
	
	// inherit
	that = super_task(spec,my);
	
	// print the trial by trial data
    my.print_trial_data = function () {
    	var list = tu.getSurveyText('main_txt');
    	my.txt = my.txt + tu.printFields(list);
    };
    
	return that;

};

var basic_sequential_task = function (spec,my) {
	
	// PRIVATE VARIABLES
	var that;
	my = my || {};
	
	// inherit
	that = sequential_task(spec,my);
	var super_display_trial = my.superior('display_trial');
	var super_show_trial_feedback = my.superior('show_trial_feedback');
	var super_clear_screen = my.superior('clear_screen');
	var super_display_break = my.superior('display_break');
	
	my.trial_type = make_trial_type(25);
	
	my.clear_screen = function () {
		$('#stimulus').text('');
		super_clear_screen();
	};
	
	my.display_trial_header = function () {
		$('#header').text('Trial ' + my.trial_num + ' of ' + my.num_trials);
	};

	my.display_trial = function () {		
		$('#stimulus').text(my.trial_type[my.trial_num-1]);		
		super_display_trial();
	};
	
	my.show_trial_feedback = function (correct) {
		super_show_trial_feedback(correct);
		$('#message').append('. RT was ' + my.trial_rt[my.trial_num-1] + ' ms.');
	};
	
	my.show_prompt = function () {
	    $('#prompt').text('Please press <space bar> to continue.');	
	};
	
	my.display_fixation = function () {
		$('#trial_num').text(my.trial_num);
    	$('#stimulus').text('XX Fixation XX');
    };	
    
    my.display_break = function () {
    	var sub_acc = super_display_break(); // creates a variable 
		$('#stimulus').text('Your accuracy since the last break was ' + sub_acc + ' percent correct.');
    };

	return that;

};

var make_trial_type = function (ntrials) {
	trial_type = new Array();
	for (var i=0; i<ntrials; i++) {
		var rand = Math.random();
		if (rand > 0.5) {
			trial_type[i] = 'A';	
		}
		else {
			trial_type[i] = 'B';	
		}		
	}
	return trial_type;	
};

// main
$(document).ready(function() {
	var spec = {};
	spec.list_condition = ['main'];	
	//task = basic_task(spec);
	
	spec.valid_keys = ['a','b'];
	spec.valid_types = ['A','B'];
	spec.continue_key = ' ';
	spec.has_fixation = true;
	task = basic_sequential_task(spec);
});