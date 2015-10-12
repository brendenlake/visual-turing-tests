// make list of all anchor images
var from_alphabets_list = function () {
    var n = 40;
	var dname = 'draw_totally_new/from_alphabets/';
	var bname = 'image';
	var list = new Array();
    for (var i=0; i<n; i++) {
    	var str = dname + bname + (i+1) + '.png';
        list[i] = str;
    }
    return list;
}();