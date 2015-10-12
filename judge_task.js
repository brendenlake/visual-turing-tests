//
// Turing test judgements with keyboard response
//
// URL parameters for judgement task:
//   blocked_feedback : (true/false) display accuracy during each break?
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
//   size_target, size_opts, size_extra : image sizes
//   
//   (optional)
//	 ms_response_deadline, ms_until_response_period, break_interval (see below for values)
var judge_task = function (spec,my) {
	
	// PRIVATE VARIABLES
	var that;
	my = my || {};
	
	var style_feedback = 'border: 3px solid red;';
	var has_extra_imgs = false;
	
	// inherit from sequential task
	that = sequential_task(spec,my);
	
	var super_display_trial = my.superior('display_trial');
	var super_show_trial_feedback = my.superior('show_trial_feedback');
	var super_experiment_done = my.superior('experiment_done');
	var super_display_break = my.superior('display_break');
	var super_check_survey = my.superior('check_survey');
	var super_print_single_trial = my.superior('print_single_trial');
	var super_clear_screen = my.superior('clear_screen');
	
	my.blocked_feedback = true; // show accuracy after each block	
	my.size_img = 105; // width/height of a single image
	
	my.demo_tag = 'demo_'; // demo image slots have this prefix in front	
	my.div_image_left = 'ileft'; // div for left image
	my.div_image_right = 'iright'; // div for right image
	my.div_image_target = 'itarget'; // div for target image
	my.div_button_to_quiz = 'toquiz'; // div that hides button that goes to quiz
	my.div_image_spacer = 'ispacer';
	my.div_header = 'header';
	my.div_pload = 'pload'; // display percent of images loaded here
	my.div_acc = 'acc'; // div "id" to display final accuracy results
	my.class_ntrials = 'ntrials'; // replace these divisions with the number of trials
	my.div_instruct_feedback = 'instruct_feedback'; // div "id" in instructions where we describe what feedback regime we are in
	my.trial_prompt = spec.trial_prompt || 'Press &ltleft&gt or &ltright&gt using your arrow keys.'; // default prompt for trial
	
	my.imgs_model = new Array();
	my.imgs_people = new Array();
	my.imgs_target = new Array();
	my.imgs_extra = new Array();	
	my.size_target = spec.size_target || my.size_img; // size of target image
	my.size_extra = spec.size_extra || my.size_img; // size of extras
	my.size_opts = spec.size_opts || my.size_img; // size of options (left or right)
	my.border_opts = spec.border_opts || false; // should the option images have a border?
	my.keep_order = spec.keep_order || false; // should we randomize the order of trials?
	
	// this is automatically called at the end of the main function
	(function () {		
		var istr = '';
		if (my.give_feedback) {
			istr += 'You will see the correct answer after each display';
		}
		else {
			istr += 'You will NOT see the correct answer after each display';
		}
		
		// is feedback blocked or not
		my.check_bin_param(my.url.param('blocked_feedback'));
		if (my.url.param('blocked_feedback') !== undefined) {
			my.blocked_feedback = (my.url.param('blocked_feedback') === "true");	
		}				
		if (my.blocked_feedback) {
			istr += ', but your accuracy will be shown after every ' + my.break_interval + ' displays';
		}
		$('#'+my.div_instruct_feedback).text(istr);
	})();
	
	my.experiment_done = function () {
		$('#'+my.div_acc).text(my.compute_accuracy());
		super_experiment_done(); 
	};
	
	my.clear_screen = function () {
		super_clear_screen();
		$('#'+my.div_image_left).attr('style','');
		$('#'+my.div_image_right).attr('style','');
	};

	my.display_images = function (itarget,ileft,iright,dtarget,dleft,dright) {
		$(dtarget).html(itarget);
        $(dleft).html(ileft);
        $(dright).html(iright);		
	};

    my.display_trial = function () {
        var tt = my.trial_type[my.trial_num-1];
        var itarget = my.imgs_target[my.trial_num-1];
        var imodel = my.imgs_model[my.trial_num-1];
        var ipeople = my.imgs_people[my.trial_num-1];
        if (tt==='L') {
            ileft = imodel;
            iright = ipeople
        }
        else if (tt==='R') {
            iright = imodel;
            ileft = ipeople;
        }
        else {
        	throw new Error('invalid trial type');
        }
        var dtarget = '#'+my.div_image_target;
        var dleft = '#'+my.div_image_left;
        var dright = '#'+my.div_image_right;        
        my.display_images(itarget,ileft,iright,dtarget,dleft,dright);
        super_display_trial();
    };	
	
	my.display_trial_header = function () {
		$('#'+my.div_header).text('Display ' + my.trial_num + ' of ' + my.num_trials);
	};
	
	my.show_trial_feedback = function (correct) {		
		super_show_trial_feedback(correct);
	 	if (my.trial_type[my.trial_num-1] == 'L') {	 		
           	$('#'+my.div_image_left).attr('style',style_feedback);
           	$('#'+my.div_show_correct).append('<br>The computer program is on the LEFT.<br>');
        }
        else {
           	$('#'+my.div_image_right).attr('style',style_feedback);
           	$('#'+my.div_show_correct).append('<br>The computer program is on the RIGHT.<br>');
        }
	};
	
	my.show_prompt = function () {
	    $('#'+my.div_show_prompt).text('Please press <space bar> to continue.');	
	};
    
    my.display_break = function () {
    	var sub_acc = super_display_break(); // creates a variable
    	if (my.blocked_feedback){
			$('#'+my.div_header).append('<br><br>Your accuracy since the last break was ' + sub_acc + ' percent correct.');
		}
    };
        
    // check survery for completion
    my.check_survey = function () {
    	if ( tu.emptyField('survey_radio_handed',my.list_survey_radio) || tu.emptyField('survey_txt_native_lang',my.list_survey_txt)
    	  || tu.emptyField('survey_txt_strategy',my.list_survey_txt) || tu.emptyField('survey_txt_country',my.list_survey_txt) ) {
			alert('A required field is still empty.');
			return false;
		}
		return super_check_survey();		
	};
	
	// input has_border: (boolean) should image has a border? (default=false)
	my.resize_and_protect = function (image_objects,size_img,has_border) {
		// image_objects = tu.protectImages(image_objects);
		if (size_img instanceof Array) {
			$(image_objects).attr('width',size_img[0]).attr('height',size_img[1]);
		}
		else {
			$(image_objects).attr('width',size_img).attr('height',size_img);	
		}
		if (has_border) {
			$(image_objects).attr('class','image_border');	
		}
		else {
			$(image_objects).attr('class','image_no_border');	
		}
		return image_objects;		
	};

    // the demo images have now loaded so we should display them
	my.demo_on = function () {
		var demo_images = my.preloader_demo.get_images();
		demo_images = tu.protectImages(demo_images);
		if (tu.inPreviewMode()) { // don't show demo
			demo_images[0] = $('<img/>').attr('src','images/preview-replace.gif');
			demo_images[1] = $('<img/>').attr('src','images/preview-replace.gif');
			demo_images[2] = $('<img/>').attr('src','images/preview-replace.gif');
		}		
		demo_images[0] = my.resize_and_protect(demo_images[0],my.size_target,true);
		demo_images[1] = my.resize_and_protect(demo_images[1],my.size_opts,my.border_opts);
		demo_images[2] = my.resize_and_protect(demo_images[2],my.size_opts,my.border_opts);
		var dtarget = '#' + my.demo_tag + my.div_image_target;
		var dmodel = '#' + my.demo_tag + my.div_image_left;
		var dpeople = '#' + my.demo_tag + my.div_image_right;
		my.display_images(demo_images[0],demo_images[1],demo_images[2],dtarget,dmodel,dpeople);
		
		// create spacer
		var spacer = $('<img/>').attr('src','images/white.jpg');
		spacer = my.resize_and_protect(spacer,my.size_img,false);
		spacer.attr('class','');
		$('#' + my.demo_tag+my.div_image_spacer).html(spacer);
		return demo_images;
	};
	
	// display the percent of images loaded
	my.display_perc_loaded = function (perc) {
		$('#'+my.div_pload).html(perc);
	};
	
	// display failure in loading
	my.display_load_error = function () {
		var str = 'I am very sorry, there was an error loading the images.';
		$('#'+my.pre).html(str);
		tu.changeDisplay('',my.div_class);
	};
	
	// turn on the "to quiz" button
	my.quiz_button_on = function () {
		var grandimgs = my.preloader.get_images();		
		my.imgs_target = my.resize_and_protect(grandimgs[0],my.size_target,true);
		my.imgs_model  = my.resize_and_protect(grandimgs[1],my.size_opts,my.border_opts);
		my.imgs_people = my.resize_and_protect(grandimgs[2],my.size_opts,my.border_opts);
		if (grandimgs[3].length > 0) {
			my.imgs_extra = my.resize_and_protect(grandimgs[3],my.size_extra,true);			
		}
		
		// create spacer
		var spacer = $('<img/>').attr('src','images/white.jpg');
		spacer = my.resize_and_protect(spacer,my.size_img,false);
		spacer.attr('class','');
		$('#'+my.div_image_spacer).html(spacer);
			
		// randomize the correct answer
		for (var i = 0; i < my.num_trials; i++) {
            if (Math.random() > 0.5) {
                my.trial_type[i] = 'L';
            }
            else {
                my.trial_type[i] = 'R';
            }
        }		
		$('#'+my.div_button_to_quiz).attr('style',''); // unhide the button to proceed
	};
	
	// print the response of a single trial in matlab format
    my.print_single_trial = function (jsi) {
    	super_print_single_trial(jsi);
    	var mati = jsi+1;
    	my.txt = my.txt + 's.itarget{' + mati + "} = '" + $(my.imgs_target[jsi]).attr('src') + "';";
        my.txt = my.txt + 's.imodel{' + mati + "} = '"  + $(my.imgs_model[jsi]).attr('src') + "';";
        my.txt = my.txt + 's.ipeople{' + mati + "} = '" + $(my.imgs_people[jsi]).attr('src') + "';";
    	if (my.imgs_extra.length > 0) {
    		my.txt = my.txt + 's.iextra{' + mati + "} = '" + $(my.imgs_extra[jsi]).attr('src') + "';";	
    	} 
    };

	// public method
	that.load_images = function (data) {
		var has_extra_imgs = false;
		if (data.imglist_extra) {
			has_extra_imgs = true;	
		}		
		else {
			data.imglist_extra = [];	
		}
		var len = data.imglist_target.length;
		my.num_trials = len;
		if (my.ntrials_override > 0) {
			if (my.ntrials_override > my.num_trials) {    			
    			var str = 'URL parameter ntrials: the maximum number of trials is ' + my.num_trials;
    			my.throw_error(str);
    		}
    		my.num_trials = my.ntrials_override;		
    	}
		$('.'+my.class_ntrials).html(my.num_trials);
		
		// preload the images		
		if ( (has_extra_imgs && (len !== data.imglist_extra.length)) || len !== data.imglist_model.length 
		     || len !== data.imglist_people.length) {
			throw new Error('The image lists are different lengths.');
		}
		
		// apply permutation
		if (!my.keep_order) {
			var perm = tu.randperm(0,len-1);
			data.imglist_target = tu.apply_perm(data.imglist_target,perm);
			data.imglist_model = tu.apply_perm(data.imglist_model,perm);
			data.imglist_people = tu.apply_perm(data.imglist_people,perm);
			if (has_extra_imgs) {
				data.imglist_extra = tu.apply_perm(data.imglist_extra,perm);
			}
		}
		
		// select subset of trials
		if (my.ntrials_override > 0) {			
			data.imglist_target = data.imglist_target.slice(0,my.num_trials);
			data.imglist_model = data.imglist_model.slice(0,my.num_trials);
			data.imglist_people = data.imglist_people.slice(0,my.num_trials);
			if (has_extra_imgs) {
				data.imglist_extra = data.imglist_extra.slice(0,my.num_trials);
			}
		}
								
		var grandlist = [data.imglist_target,data.imglist_model,data.imglist_people,data.imglist_extra];
		if (has_extra_imgs) {
			var demolist = [grandlist[0][0], grandlist[1][0], grandlist[2][0], grandlist[3][0]];
		}
		else {
			var demolist = [grandlist[0][0], grandlist[1][0], grandlist[2][0]];
		}
		my.preloader_demo = image_preloader(demolist,my.demo_on);
		my.preloader = image_preloader(grandlist,my.quiz_button_on,my.display_load_error,my.display_perc_loaded);		
	};
	
	// RETURN STRUCTURE 
	return that;   	    
};