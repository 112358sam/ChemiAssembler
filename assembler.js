//Compiles code written in an assembly-like language into chemfuck for spacestation13 goonstation

//Version 1: No input code and only simple for-loop, no while-loop or true for, this allows variables to be completely hidden

////Notes: 
//	Number inputs are indicated with # followed by a number. So in code you should replace #s with just the number of the source 
//	The code ignores letter case and white space excluding the print command.
//	new lines are used to indicate the next command
//	comments begin with # just like python, however they must be on their own line
//	The current version only checks for some syntax errors
//  values must be separated by commas

////commands
//mov #a, #s, #t      moves #a amount from #s source container number to #t target container
//movall #s, #t       moves all the contents of #s source container number to #t target container
//temp #s, #v         sets the temperature of #s source to #v value
//iso #a, #r, #s, #t  isolates #a amount of #r reagent from #s source to #t target
//pill #s             makes the contents of #s into pills. Identical to movall-ing the contents to 11
//vial #s             makes the contents of #s into vials. Identical to movall-ing the contents to 12
//dump #s             dumps the contents of #s. Identical to movall-ing the contents to 13
//compile             this line anywhere in the code indicates that the resulting program should have ~ appended
//print <text>        prints text. Ignores starting and ending whitespace

////loops
//sfor #i             simple for loop, iterates the code below until end #i times. If #i <= 0 the code is skipped
//end                 markes the end of a loop

//setup globals
var ram = new Uint16Array(1024);
var regs = new Uint16Array(4);
var loopinds = [];

//begin processing
function assembler(intext) {

	ram = new Uint16Array(1024);
    regs = new Uint16Array(4);
    loopinds = [];
	
	let fck = '';
	let compile = 0;
	let origlines = intext.split("\n");
	
	//List of known commands
	let vncoms = ['mov','movall','temp','iso','pill','vial','dump','sfor'];
	let vcoms = ['compile','end'];
	
	let lines = new Array(origlines.length);
	
	for (let iter = 0; iter < origlines.length; iter++){
		let line = origlines[iter];
		line = line.replace(/\s+/g, '');
		line = line.toLowerCase();
		lines[iter] = line;
	}
	
	for (let iter = 1; iter <= lines.length; iter++) {
		let line = lines[iter-1];
		
		//Ignore lines with no text or comments
		if (!line || line.charAt(0)=='#'){ continue; }
		
		//Commands with numbers
		else if (vncoms.some(v => line.startsWith(v))) {
			
			
			//MOVALL command
			if (line.substring(0,6) == 'movall'){
				let vals = line.substring(6).split(',');
				
				let tx = Number(vals[1]);
				app = settx(tx);
				fck += app;

				let sx = Number(vals[0]);
				app = setsx(sx);
				regs[3] = -1;
				app += prepnum(sx)
				fck += app+',@';
			}

			//MOV command
			else if (line.substring(0,3) == 'mov'){
				let vals = line.substring(3).split(',');
				
				let ax = Number(vals[0]);
				let app = setax(ax);
				fck += app;
				
				let sx = Number(vals[1]);
				app = setsx(sx);
				fck += app;
				
				let tx = Number(vals[2]);
				app = settx(tx);
				fck += app+'@';
			}

			//TEMP command
			else if (line.substring(0,4) == 'temp'){
				let vals = line.substring(4).split(',');
				
				let sx = Number(vals[0]);
				let app = setsx(sx);
				fck += app;
				
				let temp = Number(vals[1]);
				if (temp >= 273){
					app = settx(0);
					fck += app;
					
					app = setax(temp-273);
					fck += app;
				} else {
					app = setax(0);
					fck += app;
					
					app = settx(273-temp);
					fck += app;
				}
				fck += '$'
			}
			
			//ISO command
			else if (line.substring(0,3) == 'iso'){
				let vals = line.substring(3).split(',');
				
				let ax = Number(vals[0]);
				let app = setax(ax);
				fck += app;
				
				let sx = Number(vals[2]);
				app = setsx(sx);
				fck += app;
				
				let tx = Number(vals[3]);
				app = settx(tx);
				fck += app;
				
				let pnt = Number(vals[1]);
				app = prepnum(pnt);
				fck += app+'#';
			}
			
			//PILL command
			else if (line.substring(0,4) == 'pill'){
				let app = settx(11);
				fck += app;
				
				let sx = Number(line.substring(4));
				app = setsx(sx);
				regs[3] = -1;
				app += prepnum(sx)
				fck += app+',@';
			}
			
			//VIAL command
			else if (line.substring(0,4) == 'vial'){
				let app = settx(12);
				fck += app;
				
				let sx = Number(line.substring(4));
				app = setsx(sx);
				regs[3] = -1;
				app += prepnum(sx)
				fck += app+',@';
			}
			
			//DUMP command
			else if (line.substring(0,4) == 'dump'){
				let app = settx(13);
				fck += app;
				
				let sx = Number(line.substring(4));
				app = setsx(sx);
				regs[3] = -1;
				app += prepnum(sx)
				fck += app+',@';
			}
			
			//SFOR loop
			else if (line.substring(0,4) == 'sfor'){
				
				//Get all numbers in the loop before the loop
				let endind = lines.indexOf('end',iter);
				let numblist = [];
				for (let subind = iter; subind<endind; subind++){
					if (lines[subind].substring(0,4) == 'temp'){
						let temp = Number(lines[subind].substring(4));
						numblist.push(Math.abs(273-temp));
					} else {
						numblist = numblist.concat(lines[subind].match(/\d+/g));
					}
				}
				numblist = [...new Set(numblist)];
				console.log(numblist);

				for (let nmi = 0; nmi < numblist.length; nmi++){
					let nm = numblist[nmi];
					let app = prepnum_nomove(Number(nm));
					fck += app;
				}
				
				//Set iterator and begin loop
				let idx = ram.indexOf(0);
				let app = setptr(idx,Number(line.substring(4)));
				fck += app+'[';
				loopinds.push(regs[0]);
			}
		}
		
		//Commands without numbers
		else if (vcoms.includes(line)) {
			//COMPILE command
			if (line == 'compile') {compile = 1}
			
			//END (sfor) command
			else if (line == 'end'){
				let app = goTo(loopinds.pop());
				fck += app+'-]';
			}
		}
		
		//Print statement
		else if (line.length>5 && line.substring(0,5)=='print') {
			let text = origlines[iter-1].substring(5)
			text = text.trim();
			let out = printtxt(text);
			fck += out;
		}
		
		//No known command
		else {
			return 'Error: Unknown command >'+line+' on line '+iter
		}
	}
	//Add compile character if requested
	if (compile){fck+='~'}
	
	return fck
}

function printtxt(text){
	let fck = '';
	for(var ci = 0; ci < text.length; ci++){
		let ascii = text.charCodeAt(ci);
		let app = prepnum(ascii);
		fck +=  app+'.';
	}
	return fck
}

function setsx(val){
	if (regs[1] == val) {
		return '';
	}
	let fck = prepnum(val);
	fck += '}';
	regs[1] = val;
	return fck
}

function settx(val){
	if (regs[2] == val) {
		return '';
	}
	let fck = prepnum(val);
	fck += ')';
	regs[2] = val;
	return fck
}

function setax(val){
	if (regs[3] == val) {
		return '';
	}
	let fck = prepnum(val);
	fck += '\'';
	regs[3] = val;
	return fck
}

//sets the pointer to the requested value, this finds it if it exists 
//already or sets a new value in ram	
function prepnum(val){
	let inds = allInds(ram,val)
	inds = inds.filter(x => !loopinds.includes(x));
	let fck = '';
	if (inds.length > 0) {
		fck = goTo(inds[0]);
	} else {
		let idx = ram.indexOf(0);
		fck = setptr(idx,val);
	}
	return fck
}

function prepnum_nomove(val){
	let inds = allInds(ram,val)
	inds = inds.filter(x => !loopinds.includes(x));
	let fck = '';
	if (inds.length > 0) {
		fck = '';
	} else {
		let idx = ram.indexOf(0);
		fck = setptr(idx,val);
	}
	return fck
}

function goTo(idx) {
	let fck = '';
	let ptr = regs[0];
	let diff = idx-ptr;
	if (diff > 0){
		fck = '>'.repeat(diff);
	} else if (diff < 0) {
		fck = '<'.repeat(-diff);
	}
	regs[0] = idx;
	return fck
}

function setptr(idx,val){
	let fck = goTo(idx);
	let diff = val-ram[idx];
	if (diff > 0){
		fck += '+'.repeat(diff);
	} else if (diff < 0) {
		fck += '-'.repeat(-diff);
	}
	ram[idx] = val;
	return fck
}

//Found of stackexchange by user nnnnnn
function allInds(arr, val) {
    var indexes = [], i = -1;
    while ((i = arr.indexOf(val, i+1)) != -1){
        indexes.push(i);
    }
    return indexes;
}
