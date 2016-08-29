{ //no need for IIFE, let vars inside block are local

	
{
	function* createID(startVal) {
	    let c = startVal; 
	    while(true){
	    	yield c; 
	    	c+=1; 
	    }
	}

	let data = [{id: 0, message: 'eat icecream'},{id: 1, message: 'party hard'}];
	let ids = createID(data.length);

	function HTTPRequest({type: type, id: id, message: message}){

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
}

	const APIpassword = '42';

	app = {

		selectedTodo: null,

		select(){
			debugger;
			app.selectedTodo? app.selectedTodo.toggleHighlight() : null; 
			app.selectedTodo = this;
			app.selectedTodo.toggleHighlight();
		},

		delete(){
			HTTPRequest({type: 'DELETE', id: app.selected.id}).then((result)=>{
				app.t.update(result);
			});
		},

		add(){
			debugger;
			var input = document.getElementsByTagName('input')[0];
			HTTPRequest({type: 'POST', message: input.value}).then((result)=>{
				input.value = "";
				app.update();
			});
		},

		update(){
			HTTPRequest({type: 'GET'}).then((result)=>{
				this.t.update(result);
			});
		},

		start(){
			this.c = new Controls().render();
			this.t = new TodoList(); 
			this.update();
		},

	}; 

	
	
	//let app = {} creates global, but not global property of window


	/*function HTTPRequest(next){
		setTimeout(()=> {
			next([{message: 'first'},{message: 'second'}]); 
		},1000);
	}	*/

	class Controls {

		render(){
			var body = document.getElementsByTagName('body')[0];
			var input = document.createElement('input');
			input.setAttribute('type','text');
			input.setAttribute('class','form-control');
			input.setAttribute('style','width: 50%; border: 1px solid blue');
			body.appendChild(input);

			var addButton = document.createElement('button');
			addButton.setAttribute('class','btn btn-primary btn-lg');
			addButton.setAttribute('style','width: 25%;');
			addButton.innerHTML = 'Add';
			body.appendChild(addButton);
			addButton.addEventListener('click',app.add);

			var deleteButton = document.createElement('button');
			deleteButton.setAttribute('class','btn btn-warning btn-lg');
			deleteButton.setAttribute('style','width: 25%;');
			deleteButton.innerHTML = 'Remove';
			body.appendChild(deleteButton);
			deleteButton.addEventListener('click',app.delete);
		}
		//no commas between members of class
	}

	class TodoList {

		constructor(data){
			this.collection = [];
			let body = document.getElementsByTagName('body')[0];
			let UL = document.createElement('UL');
			UL.setAttribute('class','list-group');
			body.appendChild(UL);

			this.el = UL; 
		/*	data.forEach(function(d){
				this.collection.push(new Todo(d)); //this binding is function scoped
			})*/

			Object.assign(this,{}); //add instance methods here
		}

		update(data){
			this.clear();
			this.collection = [];
			this.data = data; 
			/*const iter = data[Symbol.iterator]();
			while(iter.next().done != true){
				this.collection.push(new Todo(iter.next().value));
			}*/
			for(let m of data){
				this.collection.push(new Todo(m));
			}

			this.render();
		}

		clear(){
			while (this.el.firstChild) {
    			this.el.removeChild(this.el.firstChild);
			}
			return this.el; 
		}

		render(){
			var UL = this.el;
			
			for(var i = 0; i<this.collection.length;i++){
				UL.appendChild(this.collection[i].render());
			}

		}

	}


	class Todo {

		constructor(data){
			this.model =data;
			this.el = null;
		}
		//message: null,

		/*this.render = function(){  <-- invalid code
			console.log(this);

		}*/

		//this.message = null
		
		render(){
			this.el = document.createElement('LI');
			this.el.setAttribute('class','list-group-item');
			this.el.innerHTML = this.model.message; 
			this.el.addEventListener('click',app.select.bind(this));
			return this.el; 
		}

		toggleHighlight(){
			this.el.classList.toggle("active");
		}

	}

	//let blankTodo = new Todo({message:'a blank todo'}); //must occur after class, because class not hoisted
	//let todolist = new TodoList(HTTPRequest()); //needs promise
	//todolist.render();

	app.start();

	
}



