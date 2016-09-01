	function* createID(startVal) {
	    let c = startVal; 
	    while(true){
	    	yield c; 
	    	c+=1; 
	    }
	}

	let data = [{id: 0, message: 'eat icecream'},{id: 1, message: 'party hard'}];
	let ids = createID(data.length);

	//server mock-up using promises

	esf.HTTPRequest = function({type: type, id: id, message: message}){

		switch(type){
			case('GET'): {
				return new Promise(
			        function (resolve, reject) {
			            setTimeout(()=> {
							resolve(data);
						},1000);
			        }
	        	);
			};
			case ('DELETE'): {
				return new Promise(
			        function (resolve, reject) {
			            setTimeout(()=>	 {	
								data = data.filter((d)=>{return d.id != id;});
								resolve(data);
						},1000);
			        }
	        	);


			};
			case ('POST'): {
				return new Promise(
			        function (resolve, reject) {
			            setTimeout(()=>	 {	
			            		var newData  = {message: message};
			            		newData.id = ids.next().value;
			            		//ids.next() doesn't return value
								data.push(newData);
								resolve(data);
						},1000);
			        }
	        	);

			}		
		}
	}	
