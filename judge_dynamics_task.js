var judge_dynamics_task = function (spec,my) {
	
	// PRIVATE VARIABLES
	var that;
	my = my || {};
	
	// inherit from sequential task
	that = judge_task(spec,my);
	
	// super-methods
	var super_clear_screen = my.superior('clear_screen');
	var super_restart_trial = my.superior('restart_trial');
	var super_return_to_exp = that.superior('return_to_exp');
	
	// timing parameters
	my.gif_length_ms = spec.gif_length_ms || 6000; // how long are the gifs?
	my.ms_until_left = spec.ms_until_left || 500; // pause before starting the movie sequence?
	my.ms_until_right = spec.ms_until_right || (my.gif_length_ms + my.ms_until_left);
	my.ms_until_response_period = spec.ms_until_response_period || (my.ms_until_right + my.gif_length_ms - 500);
	
	var demo_prompt = 'Press &ltleft&gt or &ltright&gt using your arrow keys.';
	var div_demo_prompt = 'demo_prompt';
	var pause_after_demo = 3000; // how long should we pause before restarting demo?
	
	// spacers
	var spacer1 = $('<img/>').attr('src','images/white.jpg');
	spacer1 = my.resize_and_protect(spacer1,my.size_img,false);
	var spacer2 = $('<img/>').attr('src','images/white.jpg');
	spacer2 = my.resize_and_protect(spacer2,my.size_img,false);
	
	my.dynamicEventLeft;
	my.dynamicEventRight;
	
	my.display_images = function (itarget,ileft,iright,dtarget,dleft,dright) {		
		$(dtarget).html(itarget);
		my.dynamicEventLeft  = setTimeout(function () {$(dleft).html(ileft);}, my.ms_until_left);
        my.dynamicEventRight = setTimeout(function () {$(dright).html(iright);}, my.ms_until_right);     		
	};
	
	// function called when the response was too early
	// default was to restart the trial. Now, we want nothing to happen
    my.response_too_early = function () {
    };	
	
	my.clear_screen = function () {
		super_clear_screen();
		$('#'+my.div_image_left).html(spacer1);
		$('#'+my.div_image_right).html(spacer2);
	};
	
	my.restart_trial = function () {
		clearTimeout(my.dynamicEventLeft);
		clearTimeout(my.dynamicEventRight);		
		my.imgs_model[my.trial_num-1] = my.refresh_image(my.imgs_model[my.trial_num-1]);
		my.imgs_people[my.trial_num-1] = my.refresh_image(my.imgs_people[my.trial_num-1]);
		// must go last, since we decrement the trial number	
		super_restart_trial();		
	};
	
	// causse image to be reloaded
	my.refresh_image = function (imgobj) {
		var oldsrc = $(imgobj).attr('src');
		$(imgobj).attr('src',oldsrc + '?' + new Date().getTime());
		imgobj.onload = undefined;	
		return imgobj;	
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
		demo_images[1] = my.resize_and_protect(demo_images[1],my.size_opts,false);
		demo_images[2] = my.resize_and_protect(demo_images[2],my.size_opts,false);
		var dtarget = '#' + my.demo_tag + my.div_image_target;
		var dmodel = '#' + my.demo_tag + my.div_image_left;
		var dpeople = '#' + my.demo_tag + my.div_image_right;
		
		// create spacer between images
		var spacer = $('<img/>').attr('src','images/white.jpg');
		spacer = my.resize_and_protect(spacer,my.size_img,false);
		$('#' + my.demo_tag+my.div_image_spacer).html(spacer);
		
		// demo sp
		var dspacer1 = $('<img/>').attr('src','images/white.jpg');
		dspacer1 = my.resize_and_protect(dspacer1,my.size_img,false);
		var dspacer2 = $('<img/>').attr('src','images/white.jpg');
		dspacer2 = my.resize_and_protect(dspacer2,my.size_img,false);		
	
		var dtimer1;
		var dtimer2;	
		var display_demo_images = function (itarget,ileft,iright,dtarget,dleft,dright) {		
			$(dtarget).html(itarget);
			dtimer1=setTimeout(function () {$(dleft).html(ileft);}, my.ms_until_left);
        	dtimer2=setTimeout(function () {$(dright).html(iright);}, my.ms_until_right);     		
		};
	
		// play demo on repeat indefinitely
		var refresh_demo = function () {
			clearTimeout(dtimer1);
			clearTimeout(dtimer2);
			demo_images[1] = my.refresh_image(demo_images[1]);
			demo_images[2] = my.refresh_image(demo_images[2]);
			$('#'+div_demo_prompt).html('');
			$(dmodel).html(dspacer1);
			$(dpeople).html(dspacer2);
			display_demo_images(demo_images[0],demo_images[1],demo_images[2],dtarget,dmodel,dpeople);
			setTimeout(function () {$('#'+div_demo_prompt).html(demo_prompt);},my.ms_until_response_period);
		};
		
		refresh_demo();
		var demoInterval = setInterval(refresh_demo,my.ms_until_response_period+pause_after_demo);		
	};
	
	// restart trial if we return
	that.return_to_exp = function () {
    	super_return_to_exp();
    	if ((my.curr_state !== my.STATE.BREAK) && (my.curr_state !== my.STATE.FEEDBACK)) {
    		my.restart_trial();
    	}
    };
    
    that.button_restart_trial = function () {
    	if ((my.curr_state !== my.STATE.BREAK) && (my.curr_state !== my.STATE.FEEDBACK)) {
    		my.restart_trial();
    	}
    };
	
	// RETURN STRUCTURE 
	return that;   	    
};