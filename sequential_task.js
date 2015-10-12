//
// Basic sequential judgements with keyboard response
//
// URL parameters for sequence-level task:
//   feedback : (true/false) is there trial by trial feedback?
//   ntrials: (number) can specify the number of trials

// URL parameters from super-level task:
//   exclude: (string) aaa,bbb,ccc,...   a list if comma-separated strings of workerIds to exclude as subjects
//   workerId: (string) workedId (as supplied by turk)
//   condition: (string) manually set condition of experiment (otherwise random)
//   debug: (true/false) if true, print data to the browser rather than to turk
//   skip_quiz: (true/false) if true, skip the quiz of the instructions
//   skip_survey: (true/false) if true, skip the survey at the end
//
// spec contains:
//   valid_keys - array of valid key presses as trial response
//	 valid_types - array of same length, showing what that keypress means in terms of response
//   continue_key - key to press for continuing trial
//   continue_prompt - string like "press space bar to continue"
//   trial_prompt - string like "press left or right to make response"
//   
//   (optional)
//	 ms_response_deadline, ms_until_response_period, break_interval (see below for values)
var sequential_task = function (spec,my) {

	// PRIVATE VARIABLES
	my = my || {};
	
	// INHERIT FROM THE BASIC TASK
	var that = super_task(spec,my);
	var super_start_main_exp = my.superior('start_main_exp');
	var super_print_data_to_form = my.superior('print_data_to_form');
	var super_review_instructions = that.superior('review_instructions');
	var super_return_to_exp = that.superior('return_to_exp');
	
	// ADD SHARED VARIABLES AND FUNCTIONS TO "my"
	
	// can be specified in the "spec" input variable
	my.ISI = spec.ISI || 1000; // inter-trial stimulus interval
	my.has_fixation = spec.has_fixation || false;
	my.ms_fixation = spec.ms_fixation || 500; // duration between fixation and stimulus
	my.ms_until_response_period = spec.ms_until_response_period || 0; // wait this many ms. before starting response period
	my.ms_response_deadline = spec.ms_response_deadline || -1; // response deadline (in ms.)
	my.break_interval = spec.break_interval || 10; // have a break after this many trials
	
	// other variables
	my.has_response_deadline = (my.ms_response_deadline > 0); // is there a response deadline?
	my.ms_restart_trial = 2000; // how long to wait before restarting a trial 
	my.trial_num = 0;  // current trial number
    my.trial_type = new Array(); // ground truth type of each trial
    my.trial_resp = new Array(); // subject's guess about the trial type
    my.trial_key = new Array(); // key the subject pressed
    my.trial_correct = new Array(); // was the response correct?
    my.trial_rt = new Array(); // reaction time
    my.trial_reviewed_instruct = new Array(); // reaction time
    my.trial_early_thus_repeated = new Array(); // did the subject respond too early, thus, we needed to repeat trial?
    my.trial_restart = new Array();    
    my.time_start_trial; // time we start the trial
    my.total_break_time = 0;  // total time spend on break
    my.break_start_time; // time we started the most recent break
    my.last_break_after = 0; // trial number after which the last break occured
	my.ntrials_override = -1;; // override the number of trials
	my.continue_prompt; // string which is the prompt to continue
	my.give_feedback = false; // default that we should not give feedback
    my.num_trials; // total number of trials
    my.trialTimeoutId; // store the output of the "timeout" function that is waiting to display the new trial
    my.fixationTimeoutId; // same thing for the fixation event
    my.startTimerId; // store "timeout" function for starting the response period
    my.STATE = {
    	NULL : -1, 
    	TRIAL_BEFORE_RESP : 0,
    	TRIAL_WAITING_RESP : 1,
    	FEEDBACK : 2,
    	BREAK : 3,
    	REVIEW_INSTRUCT : 4,
        RESTART : 5
    };
	my.curr_state = my.STATE.NULL; // current state in program
	my.save_state; // variable that allows you to save a state
	
	// various display parameters
	my.div_show_correct = 'message'; // div "id" where you show correct/incorrect
	my.div_general_message = 'message'; // div "id" to display general messages
	my.div_show_prompt = 'prompt';
	my.div_screen = 'screen'; // div "id" for screen that displays trials
	my.trial_prompt = spec.trial_prompt || 'Press a key'; // default prompt
	
	// constructor
	(function () {		
		// process URL parameters
		if (my.url.param('ntrials') !== undefined) {
   			my.ntrials_override = parseInt(my.url.param('ntrials')); // override for how many trials
		}
		my.check_bin_param(my.url.param('feedback'));
		my.give_feedback = (my.url.param('feedback') === "true"); // should we give feedback?
		
		var cc = spec.continue_key;
		if (cc === ' ') {
			cc = 'space bar';
		}
		my.continue_prompt = 'Press <' + cc + '> to continue.';
		my.trial_prompt = spec.trial_pompt || my.trial_prompt;
	})();	
	
    // SHARED FUNCTIONS
    
    // is this a valid keypress?
    var valid_key = function(key) {
    	var indx = $.inArray(key,spec.valid_keys);
    	return (indx >= 0);
    };
    
    // is this a continue key?
    var is_continue_key = function(key) {
    	return (key === spec.continue_key)
    };
    
    // returns the trial type associated with a keypress
    var key_to_type = function(key) {
    	var indx = $.inArray(key,spec.valid_keys);
    	return spec.valid_types[indx];
    };
    
    // initialize arrays
    my.init_arrays = function () {
    	for (var i=0; i<my.num_trials; i++) {
    		my.trial_reviewed_instruct[i] = 0;
    		my.trial_early_thus_repeated[i] = 0; 
    		my.trial_restart[i] = 0; 
    	}
    };    
    
    // start experiment
    my.start_main_exp = function () {
    	super_start_main_exp();
    	my.num_trials = my.num_trials || my.trial_type.length;
    	if (my.ntrials_override > 0) {
    		if (my.ntrials_override > my.num_trials) {    			
    			var str = 'URL parameter ntrials: the maximum number of trials is ' + my.num_trials;
    			my.throw_error(str);
    		}
    		my.num_trials = my.ntrials_override;		
    	}
    	my.init_arrays();
    	my.advance_trial();
    };
    
    // break in the experiment
    my.display_break = function () {
    	$('#'+my.div_screen).attr('style','display:none;');
    	var sub_acc = my.compute_accuracy(my.last_break_after+1,my.trial_num);    	
    	my.curr_state = my.STATE.BREAK;
    	my.break_start_time = tu.getTime();
    	$('#'+my.div_header).text('Please take a break. ');
    	my.show_prompt();
    	my.last_break_after = my.trial_num; // record trial number that we just had
    	return sub_acc;
    	// INSERT OTHER CODE TO DISPLAY ON A BREAK    	
    };
    
    // experiemnt is done, so we should load the survey
    my.experiment_done = function () { 
    	my.curr_state = my.STATE.NULL;
        my.acc = my.compute_accuracy();
        that.load_survey();
    };
    
    // compute accuracy, starting at trial ("trial_start")
    // and ending at ("trial_end")
    my.compute_accuracy = function (trial_start,trial_end) {
    	var indx_start = trial_start-1 || 0;
    	var indx_end = trial_end-1 || my.num_trials-1;
    	var num_correct = 0, num = 0;
    	for (var i=indx_start; i<=indx_end; i++) {
    		if (my.trial_correct[i] === undefined) {
    			throw new Error('accuracy computation went out of range');
    		}
    		if (my.trial_correct[i]) {
    			num_correct++;
    		}
    		num++;
    	}
    	return Math.round(num_correct / num * 100);
    };
    
	// show the trial
    my.display_trial = function () {
        
        // INSERT CODE TO DISPLAY THE TRIAL
        $('#'+my.div_screen).attr('style','');       
        var start_timer = function () {
        	$('#'+my.div_show_prompt).html(my.trial_prompt);
        	my.time_start_trial = tu.getTimeMilli();
        	my.curr_state = my.STATE.TRIAL_WAITING_RESP;
        };
        
        if (my.ms_until_response_period === 0) {
        	start_timer();
        }
        else {
        	my.startTimerId = setTimeout(start_timer,my.ms_until_response_period);
        }
    };
    
    // record the subjet's response
    my.record_trial = function (resp_key,time_keypress) {
        my.curr_state = my.STATE.NULL; // no longer awaiting a response
        var resp_type = key_to_type(resp_key);   
        var RT = time_keypress - my.time_start_trial;
        my.trial_key[my.trial_num-1] = resp_key;            
        my.trial_resp[my.trial_num-1] = resp_type;
        my.trial_rt[my.trial_num-1] = RT;
        var correct = (resp_type === my.trial_type[my.trial_num-1]);
        my.trial_correct[my.trial_num-1] = correct;
        if (my.has_response_deadline && RT > my.ms_response_deadline) {
        	alert('Please respond faster.');
        }
        if (!my.give_feedback) { // if there is no feedback
            my.advance_trial();
        }
        else {
        	my.show_trial_feedback(correct);
        }
    };
    
    my.show_trial_feedback = function (correct) {
    	if (correct) {
        	$('#'+my.div_show_correct).html('<b>Correct</b>');
        }
        else {
        	$('#'+my.div_show_correct).html('<b>Incorrect</b>');
        }
        my.show_prompt();
    	my.curr_state = my.STATE.FEEDBACK;
    	// INSERT CODE TO EXTEND FEEDBACK
    };
    
    // prompt the user to press a key to continue
    my.show_prompt = function () {
    	$('#'+my.div_show_prompt).text(my.continue_prompt);
    };

	// function that should write "Trial X of N" at the top of the screen
	my.display_trial_header = function () {
		// INSERT CODE HERE
	};

    // Advance to the next trial. Since we don't directly call display_trial()
    my.advance_trial = function () {
    	my.clear_screen();
    	if (my.trial_num === my.num_trials) {
            my.experiment_done();
            return;
        }
    	if (my.curr_state !== my.STATE.BREAK && my.curr_state !== my.STATE.RESTART && my.trial_num > 0 && (my.trial_num % my.break_interval)===0) {
        	my.display_break();
        	return;
        }
    	my.curr_state = my.STATE.TRIAL_BEFORE_RESP;       
        my.trial_num++;
        my.display_trial_header();       
        if (my.has_fixation) { // set timer for fixation and trial
        	my.fixationTimeoutId = setTimeout(my.display_fixation,my.ISI);
        	my.trialTimeoutId = setTimeout(my.display_trial,my.ISI+my.ms_fixation);
        }
        else if (my.ISI === 0) { // display trial immediately
        	my.display_trial();
        }
        else { // just display trial after the ISI
        	my.trialTimeoutId = setTimeout(my.display_trial,my.ISI);
        }
    };
    
    // clear all timer events
    my.clear_all_timers = function () {
    	clearTimeout(my.startTimerId);
		clearTimeout(my.fixationTimeoutId);
        clearTimeout(my.trialTimeoutId);
    };
    
    // display fixation
    my.display_fixation = function () {
    	// INSERT CODE TO DISPLAY FIXATION
    };
    
    // clear everything to begin a new trial
    my.clear_screen = function () {
        $('#'+my.div_show_correct).text('');
        $('#'+my.div_general_message).text('');
        $('#'+my.div_show_prompt).text('');
    };
    
    // print all of the experiment data
    my.print_data_to_form = function () {
    	my.txt = my.txt + "s.acc = " + my.compute_accuracy() + "; ";
    	my.txt = my.txt + "s.total_break_time = " + my.total_break_time + "; ";
    	super_print_data_to_form();
    };
    
    // print all the trial by trial data
    my.print_trial_data = function () {
        for (var i = 0; i < my.num_trials; i ++) {
           	my.print_single_trial(i);
        }
    };
    
    // print the response of a single trial in matlab format
    my.print_single_trial = function (jsi) {
    	var mati = jsi+1;
    	my.txt = my.txt + 's.key{' + mati + "} = '" + my.trial_key[jsi]+ "';"; 
    	my.txt = my.txt + 's.type(' + mati + ") = '" + my.trial_type[jsi] + "';";
        my.txt = my.txt + 's.resp(' + mati + ") = '"+ my.trial_resp[jsi] + "';";
        my.txt = my.txt + 's.rt(' + mati + ") = "+ my.trial_rt[jsi] + ";";
        my.txt = my.txt + 's.correct(' + mati + ') = ' + my.trial_correct[jsi]+ ';';
        my.txt = my.txt + 's.reviewed_instruct(' + mati + ') = ' + my.trial_reviewed_instruct[jsi]+ ';';
       	my.txt = my.txt + 's.early_thus_repeated(' + mati + ') = ' + my.trial_early_thus_repeated[jsi]+ ';';
       	my.txt = my.txt + 's.restarted(' + mati + ') = ' + my.trial_restart[jsi]+ ';';	     
    };
    
    // function called when the response was too early
    my.response_too_early = function () {
    	if (my.ms_until_response_period > 0) {
    		my.trial_early_thus_repeated[my.trial_num-1]++;
    		$('#'+my.div_screen).attr('style','display:none;');   		
    		my.restart_trial();
    		$('#'+my.div_general_message).text('Your response was too early! Restarting trial...');
    		// INCLUDE CODE HERE
    	}
    };
    
    // restart the current trial after a delay of "my.ms_restart_trial"
    my.restart_trial = function () {    	
    	// INSERT OTHER CODE HERE
    	my.clear_all_timers();
    	my.clear_screen();
		my.trial_restart[my.trial_num-1]++;
		my.trial_num--;
        // my.curr_state = my.STATE.RESTART; // so we don't trigger a break by mistake...		
		setTimeout(my.advance_trial,my.ms_restart_trial);
    };
    
    // handle a keypress
    my.handle_keypress = function (resp_key) {
    	
    	var time_keypress = tu.getTimeMilli();
    	if (my.curr_state === undefined) {
	    	throw new Error('my.curr_state should not be undefined.');
	    }
    	
    	var val_resp_key = valid_key(resp_key); // was it a trial response?
    	var val_cont_key = is_continue_key(resp_key); // was it a continue key?
    	if (val_resp_key && val_cont_key) {
    		throw new Error('a keypress should not be both a continue and a response key');	
    	}

		// response key
    	if (val_resp_key) {
    		switch (my.curr_state) {
    			case my.STATE.TRIAL_WAITING_RESP :
    				my.record_trial(resp_key,time_keypress);
    				break;
    			case my.STATE.TRIAL_BEFORE_RESP :
    				my.response_too_early();
    				break;
    		}
    	}
    	
    	// continue key    	
    	if (val_cont_key) {
    		switch (my.curr_state) {
    			case my.STATE.BREAK :
    				my.total_break_time += Math.round(time_keypress/1000 - my.break_start_time);
    				my.advance_trial();
    				break;
    			case my.STATE.FEEDBACK :
    				my.advance_trial();
    				break;
    		}
   		}
    };
        
    // direct key presses to the function we want
	document.onkeypress = function(e) {
       	tu.keyPress(e,my.handle_keypress);
    };
    document.onkeydown = function(e) {
       	tu.keyArrows(e,my.handle_keypress);
    };
    
    // PUBLIC METHODS

	// review instructions during task
    that.review_instructions = function () {
    	my.save_state = my.curr_state;
    	my.curr_state = my.STATE.REVIEW_INSTRUCT;
    	super_review_instructions();
    };
    
    that.return_to_exp = function () {
    	super_return_to_exp();
    	my.curr_state = my.save_state;
    	if (my.curr_state !== my.STATE.BREAK) { // record that we reviewed the instructions during the trial,
    		// unless the trial was on a break
    		my.trial_reviewed_instruct[my.trial_num-1]++;
    	}
    };
    
    that.isManualN = function() {
    	return ntrials_override;
    };

	// RETURN STRUCTURE    
    return that;    
};