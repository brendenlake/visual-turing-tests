# visual-turing-tests

*If you want to try the Turing tests, they are hosted and available here:*

http://cims.nyu.edu/~brenden/supplemental/turingtests/turingtests.html

*What is in this repository?*

This repo. has the Javascript code and stimuli for the "visual Turing test" experiments described in the paper "Human-level concept learning through probabilistic program induction." 

This repo. is only necessary if you want to download the full set of human and model produced images, or if you want to rerun the results reported in the paper on Mechanical Turk or elsewhere.

The main file that shows you how to run each experiment is "turingtests.html" For instance, the "generating new exemplars" experiment is driven by the following hierarchy of javascript files : "judge_new_grids.js" > "judge_task.js" > "sequential_task.js" > "super_task.js"