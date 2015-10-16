//
// Super-class for the most basic type of Turk experiment
// 
// Runs through a control structure with four phases:
//   instructions, quiz on instructions, main experiment, survey
//
// HTML parameters accepted:
//   exclude: (string) aaa,bbb,ccc,...   a list if comma-separated strings of workerIds to exclude as subjects
//   workerId: (string) workedId (as supplied by turk)
//   condition: (string) manually set condition of experiment (otherwise random)
//   debug: (true/false) if true, print data to the browser rather than to turk
//   skip_quiz: (true/false) if true, skip the quiz of the instructions
//   skip_survey: (true/false) if true, skip the survey at the end
//
// Input must include:
//   spec.list_condition: must be an array of strings naming the possible conditions
//
var super_task = function (spec,my) {

	// PRIVATE VARIABLES
	var that;
	my = my || {};
	
	var global_start_time = tu.getTime(); // get the start time of whole TURK hit
	var exp_start_time, exp_end_time; // get start/end time of the main experiment
	var quiz_repeat = 0; // number of times the quiz was repeated
	var ready_submit_TURK = false; // program is ready to submit to turk
	var review_instruct = 0;
	var useExclude = true; // use the exclude list in "exclude.js"

	// ADD SHARED VARIABLES AND FUNCTIONS TO "my"
	my.url = $.url(); // page url
	my.txt = ''; // store all of the output variables in matlab format    
	my.list_survey_radio, my.list_survey_txt; // store survey data
	
	// special ids and classes in the main HTML file
	my.quiz_class = 'qq'; // class name for all quiz questions
	my.div_class = 'task_section'; // class of all of the task sections (divs)
	my.survey_radio_class = 'survey_radio'; // class of all radio questions in survey
	my.survey_txt_class = 'survey_txt'; // class of all text questions in survey 
	my.pre = 'pre'; // division at top of file to display error messages
	my.div_instruct = 'instruct'; // division (that we can display with style property) for instructions
	my.div_instruct_test = 'instruct_test'; // division for testing the instructions
	my.div_exp = 'exp'; // division for the main experiment
	my.div_survey = 'survey'; // division for the post-experiment survey
	my.div_discalimer = 'disclaimer'; // division "id" for the disclaimer text
	my.div_button_to_quiz = 'to_quiz'; // division "id" for moving to the instructions quiz
	my.div_button_return_exp = 'return_exp'; // division "id" for button returning from instructions to the experiment
	my.div_check_survey = 'check_survey'; // division "id" surrounding the submit survey button
	my.div_turk_form = 'turk_form'; // division "id" surrounding the turk form
	
    // SHARED FUNCTIONS
    my.throw_error = function (msg) {
		tu.changeDisplay('',my.div_class);
		$('#'+my.pre).html(msg);
		throw new Error('Message on screen displays error');
	};
    
    // make sure a string, if defined, is "true" or "false"
    my.check_bin_param = function (input_string) {
 		if (input_string !== undefined) {
 			if (input_string !== "true" && input_string !== "false") {
 				var msg = "a URL parameter has an invalid value (should be 'true' or 'false')";
 				my.throw_error(msg);
 			} 					
 		}
 	};
    
    // general constructor for task object. 
    // throws an error if we should not proceed with task
    (function () {
 			
 			// check to see if the current worker is on the "exclude" list.
			// return "false" if the experiment should not proceed
			if (my.url.param('use_exclude') !== undefined) {
				my.check_bin_param(my.url.param('use_exclude'));
				useExclude = (my.url.param('use_exclude') === "true");
			}		
			var invalid = false;
			if (useExclude) {
				invalid = tu.flagRepeatWorker();
			}
			if (invalid) {
				var msg = 'I am sorry, you cannot complete this HIT. You have already completed a related experiment ';
				msg = msg + "<br><br>";
				my.throw_error(msg);
			}
			
			// Check to make sure Chrome is not the browser.
			if (tu.flagChrome()) {
				msg = 'I am sorry, this HIT does not work with the Chrome web browser. Please try the Firefox or Safari browsers. ';
				my.throw_error(msg);	
			}

			// Check to make sure IE is not the browser.
			if (tu.flagIE()) {
				msg = 'I am sorry, this HIT does not work with Internet Explorer. Please try the Firefox or Safari browsers. ';
				my.throw_error(msg);
			}
						
			// check to see if we entered a valid condition. If the
			// condition is unknown, choose one at random
			if (my.url.param('condition') !== undefined) {
				my.condition = (my.url.param('condition'));
			}
			if (my.condition === undefined) {
				var r = tu.randint(0,spec.list_condition.length-1);
				my.condition = spec.list_condition[r];
			}
			else {
				var same = false;
				for (var i=0; i<spec.list_condition.length; i++) {
					if (my.condition === spec.list_condition[i]) {
						same = true;
					}
				}
				if (!same) {
					var msg = 'Invalid URL parameter ("condition" is not a valid condition)';
					my.throw_error(msg);
				}
			}
			
			// process the remaining URL parameters
			tu.setPostURL();
			var idebug = my.url.param('debug');
			var iskip_quiz = my.url.param('skip_quiz');
			var iskip_survey = my.url.param('skip_survey');
			my.check_bin_param(idebug);
			my.check_bin_param(iskip_quiz);
			my.check_bin_param(iskip_survey);			
			my.debug_mode = (my.url.param('debug') === "true");
			my.skip_quiz = (my.url.param('skip_quiz') === "true");
			my.skip_survey = (my.url.param('skip_survey') === "true");			
	})();
    
    // start main experiment
    my.start_main_exp = function () {
    	$('#'+my.div_button_to_quiz).attr('style','display:none;');
    	$('#'+my.div_button_return_exp).attr('style','');
    	exp_start_time = tu.getTime();
    	// run code that starts the beginning of the main experiment
    };
    
    // print the trial by trial data
    my.print_trial_data = function () {
        // run code that prints the main experiment data to "my.txt" in matlab format       
    };
    
    // print the results of the experiment
	my.print_data_to_form = function () {
		// INSERT CODE FOR ADDITIONAL RECORDING		
		var global_end_time = tu.getTime();;
		var global_time_elapsed = Math.round(global_end_time - global_start_time);
		var exp_time_elapsed = Math.round(exp_end_time - exp_start_time);
		if (useExclude) {
			my.txt = my.txt + "s.exclude = '" + exclude + "'; ";
		}
		else {
			my.txt = my.txt + "s.exclude = []; ";
		}
		my.txt = my.txt + "s.var_condition = '" + my.condition + "'; ";
		my.txt = my.txt + "s.quiz_repeat = " + quiz_repeat + "; ";
		my.txt = my.txt + "s.review_instruct = " + review_instruct + "; ";
		my.txt = my.txt + "s.global_elapsed_time_sec = " + global_time_elapsed + "; ";
		my.txt = my.txt + "s.exp_elapsed_time_sec = " + exp_time_elapsed + "; ";
        my.txt = my.txt + tu.printUrlParams();        
		my.txt = my.txt + tu.printFields(my.list_survey_txt);
		my.txt = my.txt + tu.printFields(my.list_survey_radio);		
		my.print_trial_data();
		my.txt = my.txt + "subj{count} = s; count = count + 1; ";
		// necessay html parameters
		var aID = my.url.param('assignmentId');		
		$('#data').attr('value',my.txt);
        $('#myid').attr('value',aID);
	};
        
    // check survery for completion
    my.check_survey = function () {
    	// INSERT CODE FOR ADDITIONAL CHECKS
		if ( tu.emptyField('survey_radio_trouble',my.list_survey_radio) ) {
			alert('A required field is still empty.');
			return false;
		}
		if (tu.getValue('survey_radio_trouble',my.list_survey_radio) === 'yes' && tu.emptyField('survey_txt_trouble',my.list_survey_txt) ) {
			alert('If there was technical trouble, please write about the problem in the designated box.');
			return false;
		}
		return true;		
	};
         
    // public methods
    that = {    	
        
        // return the condition we are in
    	getCondition : function () {
    		return my.condition;
    	},
    
        // start quiz
    	start_quiz : function () {
    		$('#'+my.div_discalimer).attr('style','display:none;');
    		if (my.skip_quiz) {
    			tu.changeDisplay(my.div_exp,my.div_class);
    			my.start_main_exp();
    		}
    		else {
    			if (tu.inPreviewMode()) {
	    			tu.changeDisplay('',my.div_class);
	    			$('#'+my.pre).html('<b>Preview mode. Please accept HIT to proceed with task.</b>');
	    		}
	    		else { 
	    			tu.changeDisplay(my.div_instruct_test,my.div_class);
	    		}
    		}    		
    	},
    	
       	// check to see if the quiz is correct.
    	// if not, return to instructions
    	check_quiz : function () {
    		var list_quizq = $('.'+my.quiz_class).get_attr('name');
    		list_quizq = list_quizq.unique();
    		var nmiss = tu.checkQuiz(list_quizq);
    		if (nmiss > 0) {
    			var str = 'You answered ' + nmiss + ' questions incorrectly. Please re-read the instructions.';
                alert(str);
                tu.changeDisplay(my.div_instruct,my.div_class);
                quiz_repeat++;
    		}
    		else {
    			tu.changeDisplay(my.div_exp,my.div_class);
    			my.start_main_exp();
    		}
    	},
    	
    	// review instructions
    	review_instructions : function () {
    		review_instruct++;
    		tu.changeDisplay(my.div_instruct,my.div_class);
    	},
    	
    	// return from instructions page to experiment
    	return_to_exp : function () {
    		tu.changeDisplay(my.div_exp,my.div_class);
    	},
        
        // bring up the survey
        load_survey : function () {
        	exp_end_time = tu.getTime();
        	tu.changeDisplay(my.div_survey,my.div_class);
        },
        
        // see if enough of the survey has been answered.
    	// if so, submit the survey and continue.
    	survey_finished : function () {   		
    		my.list_survey_radio = tu.getSurveyRadios(my.survey_radio_class);
    		my.list_survey_txt = tu.getSurveyText(my.survey_txt_class);
    	    if (my.skip_survey || my.check_survey()) {
    	    	my.print_data_to_form();
    	    	if (my.debug_mode) { // debug mode..print the data
    	    		$('#'+my.pre).html('Paste the following in to Matlab to analyze your data: <br><br>' + 'count=1; ' +  my.txt + '<br><br>');
    	    	}
    	    	else { // normal Mturk submission
    	    		alert('Survey is complete. Please press "Submit".');    	    		
    	    		$('#'+my.div_turk_form).attr('style','');
    	    	}
    	    	$('#'+my.div_check_survey).attr('style','display:none;');    	    	
    	    }    	    
    	},
    };
    
    return that;
};